// /supabase/functions/sync_teams/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";

/** ---------- Config ---------- */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
} as const;

const FD_BASE = "https://api.football-data.org/v4";

const WORLD_CUP_COMPETITION = {
  name: "FIFA World Cup",
  code: "WC",
};

const TEAMS_BUCKET = "teams_logo";
const BULK_CHUNK = 500;
const FETCH_TIMEOUT_MS = 15000;

/** ---------- Utils ---------- */

const must = (k: string) => {
  const v = Deno.env.get(k);

  if (!v) {
    throw new Error(`${k} is not set`);
  }

  return v;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retry<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelay = 300,
): Promise<T> {
  let i = 0;

  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (i++ >= retries) {
        throw e;
      }

      await sleep(baseDelay * 2 ** (i - 1));
    }
  }
}

async function timedFetch(
  url: string,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(to);
  }
}

/** Infer file extension from CT/URL */
function inferExtFromContentType(ct?: string | null) {
  if (!ct) return "png";

  const l = ct.toLowerCase();

  if (l.includes("svg")) return "svg";
  if (l.includes("webp")) return "webp";
  if (l.includes("jpeg")) return "jpg";
  if (l.includes("png")) return "png";

  return "png";
}

function inferExtFromUrl(url: string) {
  const m = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);

  return m?.[1] ?? null;
}

async function downloadImage(url: string) {
  const res = await timedFetch(url);

  if (!res.ok) {
    throw new Error(`Logo download ${res.status}: ${url}`);
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type") ?? undefined;
  const ext = inferExtFromUrl(url) ?? inferExtFromContentType(ct);

  return {
    buf,
    contentType: ct ?? "application/octet-stream",
    ext,
  };
}

async function uploadToBucket(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  keyNoExt: string,
  payload: { buf: Uint8Array; contentType: string; ext: string },
) {
  const path = `${keyNoExt}.${payload.ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

function mapTeam(t: any, logoUrl: string | null) {
  const now = new Date().toISOString();

  return {
    id: t.id,
    name: t.name ?? null,
    shortName: t.shortName ?? null,
    tla: t.tla ?? null,
    logo: logoUrl,
    venue: t.venue ?? null,
    updated_at: now,
  };
}

function dedupeTeamsById(teams: any[]) {
  const teamsById = new Map<number, any>();

  for (const team of teams) {
    if (team?.id && !teamsById.has(team.id)) {
      teamsById.set(team.id, team);
    }
  }

  return Array.from(teamsById.values());
}

async function fetchWorldCupTeams(fdKey: string) {
  const url = `${FD_BASE}/competitions/${WORLD_CUP_COMPETITION.code}/teams`;

  const res = await retry(async () => {
    const r = await timedFetch(url, {
      headers: {
        "X-Auth-Token": fdKey,
        Accept: "application/json",
      },
    });

    if (!r.ok) {
      throw new Error(`FD API ${r.status}: ${await r.text()}`);
    }

    return r.json();
  });

  const teams = Array.isArray(res?.teams) ? res.teams : [];

  console.info(`${WORLD_CUP_COMPETITION.code}: Found ${teams.length} teams`);

  return teams;
}

async function bulkUpsertTeams(
  supabase: ReturnType<typeof createClient>,
  teams: any[],
) {
  let synced = 0;
  const dbErrors: string[] = [];

  for (let i = 0; i < teams.length; i += BULK_CHUNK) {
    const slice = teams.slice(i, i + BULK_CHUNK);

    try {
      const resp: any = await supabase
        .from("teams")
        .upsert(slice, { onConflict: "id" })
        .select("id");

      if (resp && "error" in resp && resp.error) {
        console.error("Teams bulk upsert error:", resp.error);
        dbErrors.push(resp.error?.message ?? String(resp.error));
      } else {
        const count = Array.isArray(resp?.data) ? resp.data.length : slice.length;
        synced += count;
      }
    } catch (e) {
      dbErrors.push(e instanceof Error ? e.message : String(e));
      console.error("Teams bulk upsert threw:", e);
    }
  }

  return {
    synced,
    dbErrors,
  };
}

/** ---------- Main sync function ---------- */

async function syncWorldCupTeams(
  supabase: ReturnType<typeof createClient>,
  fdKey: string,
) {
  const rawTeams = await fetchWorldCupTeams(fdKey);
  const uniqueTeams = dedupeTeamsById(rawTeams);

  console.info(`Total unique World Cup teams collected: ${uniqueTeams.length}`);

  if (uniqueTeams.length === 0) {
    return {
      success: true,
      synced: 0,
      uploadedLogos: 0,
      totalCollected: 0,
    };
  }

  let uploadedLogos = 0;
  const mappedTeams: any[] = [];

  for (const team of uniqueTeams) {
    let logoUrl: string | null = null;

    try {
      if (team.crest) {
        const image = await downloadImage(team.crest);

        logoUrl = await uploadToBucket(
          supabase,
          TEAMS_BUCKET,
          String(team.id),
          image,
        );

        uploadedLogos++;
      }
    } catch (e) {
      console.error(
        `Logo upload failed for team ${team?.shortName ?? team?.name ?? team?.id}:`,
        e,
      );
    }

    mappedTeams.push(mapTeam(team, logoUrl));
  }

  const { synced, dbErrors } = await bulkUpsertTeams(supabase, mappedTeams);

  return {
    success: dbErrors.length === 0,
    synced,
    uploadedLogos,
    totalCollected: uniqueTeams.length,
    errors: dbErrors.length ? { db: dbErrors } : undefined,
  };
}

/** ---------- Main handler ---------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const result = await syncWorldCupTeams(supabase, FD_KEY);

    console.info(
      `✅ Synced ${result.synced} World Cup teams, uploaded ${result.uploadedLogos} logos`,
    );

    return new Response(JSON.stringify(result), {
      headers: CORS_HEADERS,
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();

    console.error("❌ World Cup teams sync failed:", {
      reqId,
      message: e.message,
      stack: e.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        reqId,
        message: e.message,
      }),
      {
        status: 500,
        headers: CORS_HEADERS,
      },
    );
  }
});