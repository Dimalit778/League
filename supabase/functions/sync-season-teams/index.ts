// sync-season-teams
// Syncs teams for every app competition (PL, PD, BL1, SA, FL1, CL).
// Cron/admin-only. Run BEFORE sync-season-matches — matches.home/away_team_id
// are FK to teams.id, so the teams must exist first.
//
// One football-data call per competition (6 total), all routed through the
// shared budget-aware fdFetch so we never trip the 10-calls/minute limit.
// deno-lint-ignore-file no-explicit-any
import {
  createServiceClient,
  errorResponse,
  FD_BASE,
  fdFetch,
  jsonResponse,
  lockedResponse,
  must,
  nowIso,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";

const JOB = "sync-season-teams";
const COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "CL"];
const TEAMS_BUCKET = "teams_logo";
const CHUNK_SIZE = 500;

// ── Image upload helpers (plain fetch to the crest CDN — not the rate-limited
//    API host, so these do NOT consume the football-data budget) ─────────────
function inferExt(url: string, ct: string | null): string {
  const fromUrl = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/)?.[1];
  if (fromUrl) return fromUrl === "jpeg" ? "jpg" : fromUrl;
  if (ct?.includes("svg")) return "svg";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("jpeg")) return "jpg";
  return "png";
}

async function downloadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}: ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type");
  return { buf, contentType: ct ?? "application/octet-stream", ext: inferExt(url, ct) };
}

async function uploadToBucket(supabase: any, bucket: string, pathNoExt: string, payload: any): Promise<string> {
  const path = `${pathNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function tryUpload(supabase: any, bucket: string, path: string, imageUrl: string, label: string): Promise<string | null> {
  try {
    const file = await downloadImage(imageUrl);
    return await uploadToBucket(supabase, bucket, path, file);
  } catch (e) {
    console.warn(`⚠️ Failed to upload ${label}:`, e);
    return null;
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function bulkUpsert(supabase: any, table: string, rows: any[]) {
  let count = 0;
  const errors: string[] = [];
  for (const part of chunk(rows, CHUNK_SIZE)) {
    const { data, error } = await supabase.from(table).upsert(part, { onConflict: "id" }).select("id");
    if (error) {
      errors.push(error.message);
      console.error(`Upsert error (${table}):`, error.message);
    } else count += data?.length ?? part.length;
  }
  return { count, errors };
}

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);

    try {
      // Sequential — the shared fdFetch must run one call at a time.
      const teamsById = new Map<number, any>();
      const fetchErrors: string[] = [];

      for (const code of COMPETITION_CODES) {
        try {
          const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${code}/teams`, FD_KEY);
          const teams = Array.isArray(payload?.teams) ? payload.teams : [];
          for (const t of teams) {
            if (t?.id && !teamsById.has(t.id)) teamsById.set(t.id, t);
          }
        } catch (e) {
          fetchErrors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      const rawTeams = [...teamsById.values()];
      console.info(`Found ${rawTeams.length} unique teams`);

      // Logo uploads are plain image fetches — safe to parallelise.
      const mapped = await Promise.all(
        rawTeams.map(async (t) => ({
          id: t.id,
          name: t.name ?? null,
          shortName: t.shortName ?? null,
          tla: t.tla ?? null,
          logo: t.crest ? await tryUpload(supabase, TEAMS_BUCKET, String(t.id), t.crest, `team ${t.id}`) : null,
          venue: t.venue ?? null,
          clubColors: t.clubColors ?? null,
          updated_at: nowIso(),
        })),
      );

      const { count, errors } = await bulkUpsert(supabase, "teams", mapped);
      const allErrors = [...fetchErrors, ...errors];

      await releaseSyncLock(supabase, JOB, allErrors.length > 0 ? "error" : "success");

      return jsonResponse({
        success: allErrors.length === 0,
        teams: count,
        errors: allErrors.length > 0 ? allErrors : undefined,
      });
    } catch (e) {
      await releaseSyncLock(supabase, JOB, "error");
      throw e;
    }
  } catch (e) {
    return errorResponse(JOB, e);
  }
});
