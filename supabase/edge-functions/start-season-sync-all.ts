import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const FD_BASE = "https://api.football-data.org/v4";
const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";

const TARGET_COMPETITION = [
  { name: "Premier League", code: "PL" },
  // { name: "La Liga", code: "PD" },
  // { name: "Serie A", code: "SA" },
  // { name: "Bundesliga", code: "BL1" },
  // { name: "Ligue 1", code: "FL1" }
];

interface SyncStats {
  competitions: number;
  teams: number;
  matches: number;
  errors: string[];
}

function inferExtFromContentType(ct?: string): string {
  if (!ct) return "png";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg")) return "jpg";
  if (ct.includes("png")) return "png";
  return "png";
}

function inferExtFromUrl(url: string): string | null {
  const m = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);
  return m?.[1] ?? null;
}

async function downloadImage(url: string) {
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

async function uploadToBucket(bucket: string, pathNoExt: string, payload: any): Promise<string> {
  const path = `${pathNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true
  });
  
  if (error) throw error;
  
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}

async function syncCompetitions(stats: SyncStats): Promise<void> {
  console.log("🏆 Starting competition sync...");
  
  for (const comp of TARGET_COMPETITION) {
    try {
      const res = await fetch(`${FD_BASE}/competitions/${comp.code}`, {
        headers: {
          "X-Auth-Token": FD_KEY,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      
      const data = await res.json();
      
      let flagUrlStored = null;
      let logoUrlStored = null;
      
      if (data?.area?.flag) {
        try {
          const a = await downloadImage(data.area.flag);
          const areaName = data.area.name;
          flagUrlStored = await uploadToBucket("flags", areaName, a);
        } catch (err) {
          console.warn(`⚠️ Failed to upload flag for ${comp.name}:`, err);
        }
      }
      
      if (data?.emblem) {
        try {
          const e = await downloadImage(data.emblem);
          logoUrlStored = await uploadToBucket("competitions_logo", comp.code, e);
        } catch (err) {
          console.warn(`⚠️ Failed to upload logo for ${comp.name}:`, err);
        }
      }
      
      const newComp = {
        id: data.id,
        name: comp.name,
        code: data.code,
        type: data.type,
        logo: logoUrlStored,
        area: data.area.name,
        flag: flagUrlStored,
        season_id: data.currentSeason.id,
        season_year: data.currentSeason.startDate.split('-')[0],
        season_startDate: data.currentSeason.startDate,
        season_endDate: data.currentSeason.endDate,
        current_matchday: data.currentSeason.currentMatchday,
        total_matchdays: 0,
        last_updated: data.lastUpdated,
        winner: data.currentSeason.winner,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: compError } = await supabase
        .from("competitions")
        .upsert(newComp, { onConflict: "id" });
      
      if (compError) throw compError;
      
      stats.competitions++;
      console.log(`✅ Synced competition: ${comp.name}`);
    } catch (err) {
      const errMsg = `Error syncing competition ${comp.name}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`❌ ${errMsg}`);
      stats.errors.push(errMsg);
    }
  }
}

async function syncTeams(stats: SyncStats): Promise<void> {
  console.log("⚽ Starting teams sync...");
  
  for (const comp of TARGET_COMPETITION) {
    try {
      const res = await fetch(`${FD_BASE}/competitions/${comp.code}/teams`, {
        headers: {
          "X-Auth-Token": FD_KEY,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      
      const data = await res.json();
      
      for (const t of data.teams) {
        try {
          let logoUrl = null;
          
          if (t.crest) {
            try {
              const a = await downloadImage(t.crest);
              logoUrl = await uploadToBucket("teams_logo", String(t.id), a);
            } catch (err) {
              console.warn(`⚠️ Failed to upload logo for ${t.shortName}:`, err);
            }
          }
          
          const team = {
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            tla: t.tla,
            logo: logoUrl,
            venue: t.venue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: teamError } = await supabase
            .from("teams")
            .upsert(team, { onConflict: "id" });
          
          if (teamError) throw teamError;
          
          stats.teams++;
          console.log(`✅ Synced team: ${t.shortName}`);
        } catch (err) {
          const errMsg = `Error syncing team ${t.shortName}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(`❌ ${errMsg}`);
          stats.errors.push(errMsg);
        }
      }
    } catch (err) {
      const errMsg = `Error syncing teams for ${comp.name}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`❌ ${errMsg}`);
      stats.errors.push(errMsg);
    }
  }
}

async function syncMatches(stats: SyncStats): Promise<void> {
  console.log("🎯 Starting matches sync...");
  
  for (const comp of TARGET_COMPETITION) {
    try {
      const res = await fetch(`${FD_BASE}/competitions/${comp.code}/matches`, {
        headers: {
          "X-Auth-Token": FD_KEY,
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      
      const data = await res.json();
      const totalMatchdays = Math.max(...data.matches.map((match: any) => match.matchday || 0));
      
      const { error: compError } = await supabase
        .from("competitions")
        .update({
          total_matchdays: totalMatchdays,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.competition.id);
      
      if (compError) throw compError;
      
      for (const m of data.matches) {
        try {
          const match = {
            id: m.id,
            competition_id: m.competition.id,
            season_id: m.season.id,
            matchday: m.matchday,
            kick_off: m.utcDate,
            status: m.status,
            stage: m.stage ?? null,
            group_stage: m.group ?? null,
            home_team_id: m.homeTeam.id,
            away_team_id: m.awayTeam.id,
            duration: m.score?.duration ?? null,
            referee: m.referees?.[0]?.name ?? null,
            score_fulltime_home: m.score?.fullTime?.home ?? null,
            score_fulltime_away: m.score?.fullTime?.away ?? null,
            score_halftime_home: m.score?.halfTime?.home ?? null,
            score_halftime_away: m.score?.halfTime?.away ?? null,
            winner: m.score?.winner ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: matchError } = await supabase
            .from("matches")
            .upsert(match, { onConflict: "id" });
          
          if (matchError) throw matchError;
          
          stats.matches++;
        } catch (err) {
          const errMsg = `Error syncing match ${m.id}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(`❌ ${errMsg}`);
          stats.errors.push(errMsg);
        }
      }
      
      console.log(`✅ Synced ${data.matches.length} matches for ${comp.name}`);
    } catch (err) {
      const errMsg = `Error syncing matches for ${comp.name}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`❌ ${errMsg}`);
      stats.errors.push(errMsg);
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stats: SyncStats = {
    competitions: 0,
    teams: 0,
    matches: 0,
    errors: []
  };

  try {
    if (!FD_KEY) throw new Error("FOOTBALL_ORG_API_KEY is not set");

    console.log("🚀 Starting full season sync...");
    
    await syncCompetitions(stats);
    await syncTeams(stats);
    await syncMatches(stats);

    console.log("✅ Sync completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Full season sync completed",
        stats,
        errors: stats.errors.length > 0 ? stats.errors : null
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.error("❌ Full sync failed:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
        stats
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});