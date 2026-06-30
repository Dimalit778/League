import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret"
};
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
const FD_BASE = "https://api.football-data.org/v4";
const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";
const TARGET_COMPETITION = [
  {
    name: "La Liga",
    code: "PD",
    isFree: true
  },
  {
    name: "Bundesliga",
    code: "BL1",
    isFree: true
  },
  {
    name: "Premier League",
    code: "PL",
    isFree: false
  },
  {
    name: "Serie A",
    code: "SA",
    isFree: false
  },
  {
    name: "Ligue 1",
    code: "FL1",
    isFree: false
  }
];
const nowIso = ()=>new Date().toISOString();
function inferExtFromContentType(ct) {
  if (!ct) return "png";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg")) return "jpg";
  if (ct.includes("png")) return "png";
  return "png";
}
function inferExtFromUrl(url) {
  const m = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);
  return m?.[1] ?? null;
}
async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image ${res.status} for ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || undefined;
  const ext = inferExtFromUrl(url) ?? inferExtFromContentType(ct);
  return {
    buf,
    contentType: ct ?? "application/octet-stream",
    ext
  };
}
async function uploadToBucket(bucket, pathNoExt, payload) {
  const path = `${pathNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}
async function getTotalFixturesForCompetition(code) {
  const res = await fetch(`${FD_BASE}/competitions/${code}/matches`, {
    headers: {
      "X-Auth-Token": FD_KEY,
      Accept: "application/json"
    }
  });
  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch matches for competition ${code}: ${res.status}`);
    return null;
  }
  const payload = await res.json();
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  const matchdays = new Set();
  for (const m of matches){
    const md = m?.matchday;
    if (typeof md === "number") matchdays.add(md);
  }
  const totalFixtures = matchdays.size;
  return totalFixtures > 0 ? totalFixtures : null;
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  const syncSecret = req.headers.get("x-sync-secret");
  const expectedSecret = Deno.env.get("SYNC_SECRET");
  if (!expectedSecret) {
    return new Response(JSON.stringify({
      success: false,
      error: "SYNC_SECRET is not set"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  if (syncSecret !== expectedSecret) {
    return new Response(JSON.stringify({
      success: false,
      error: "Unauthorized"
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    if (!FD_KEY) throw new Error("FOOTBALL_ORG_API_KEY is not set");
    const res = await fetch(`${FD_BASE}/competitions?areas=2072,2088,2114,2081,2224`, {
      headers: {
        "X-Auth-Token": FD_KEY,
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${await res.text()}`);
    }
    const list = await res.json();
    const targetByCode = new Map(TARGET_COMPETITION.map((c)=>[
        c.code,
        c
      ]));
    let synced = 0;
    for (const apiComp of list.competitions ?? []){
      if (!targetByCode.has(apiComp.code)) continue;
      const localTarget = targetByCode.get(apiComp.code);
      // get current total fixtures
      const { data: existingComp } = await supabase.from("competitions").select("total_fixtures, current_fixture").eq("id", apiComp.id).single();
      let flagUrlStored = null;
      let logoUrlStored = null;
      if (apiComp.area?.flag) {
        try {
          const file = await downloadImage(apiComp.area.flag);
          const areaName = (apiComp.area.name ?? "area").replace(/\s+/g, "_");
          flagUrlStored = await uploadToBucket("flags", areaName, file);
        } catch (e) {
          console.warn("⚠️ Failed to store area flag for", apiComp.code, e);
        }
      }
      if (apiComp.emblem) {
        try {
          const file = await downloadImage(apiComp.emblem);
          logoUrlStored = await uploadToBucket("competitions_logo", apiComp.code, file);
        } catch (e) {
          console.warn("⚠️ Failed to store competition emblem for", apiComp.code, e);
        }
      }
      const season = apiComp.currentSeason ?? null;
      let totalFixtures = null;
      try {
        totalFixtures = await getTotalFixturesForCompetition(apiComp.code);
      } catch (e) {
        console.warn("⚠️ Failed to compute total_fixtures for", apiComp.code, e);
      }
      const newComp = {
        id: apiComp.id,
        name: localTarget.name ?? apiComp.name,
        code: apiComp.code,
        type: apiComp.type,
        logo: logoUrlStored,
        area: apiComp.area?.name ?? null,
        flag: flagUrlStored,
        season_id: season?.id ?? null,
        season_start: season?.startDate ?? null,
        season_end: season?.endDate ?? null,
        current_fixture: season?.currentMatchday ?? existingComp?.current_fixture,
        total_fixtures: totalFixtures ?? existingComp?.total_fixtures ?? 0,
        created_at: nowIso(),
        updated_at: nowIso()
      };
      const { error: compError } = await supabase.from("competitions").upsert(newComp, {
        onConflict: "id"
      });
      if (compError) throw compError;
      synced++;
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${synced} competitions`,
      synced
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("❌ Competition sync failed:", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
