

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);


const FD_BASE = "https://api.football-data.org/v4";
const FD_KEY = Deno.env.get("FOOTBALL_API_KEY_ORG") ?? ""; 
const FD_HEADERS = {
  "X-Auth-Token": FD_KEY,
  "Accept": "application/json",
};

-- Football-Data IDs (not API-Football!)
-- PL=2021, PD=2014, SA=2019, BL1=2002, FL1=2015, IL=? (fill when known)
const TARGET_COMPETITION_IDS = [2021, 2014];




async function fetchJSON(url: string, init: RequestInit = {}, retries = 2): Promise<any> {
  const res = await fetch(url, { ...init, headers: { ...FD_HEADERS, ...(init.headers ?? {}) } });
  if (res.ok) return res.json();
  if (retries > 0 && (res.status === 429 || res.status >= 500)) {
    const waitMs = 800 * (3 - retries);
    await new Promise(r => setTimeout(r, waitMs));
    return fetchJSON(url, init, retries - 1);
  }
  const text = await res.text();
  throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url} :: ${text}`);
}



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FD_KEY) throw new Error("FOOTBALL_DATA_KEY is not set");
    const competitionsWithRounds = [];

    for (const compId of TARGET_COMPETITION_IDS) {
      try {
        const data = await fetchJSON(`${FD_BASE}/competitions/${compId}`);

  
        const competitionData = {
          id: data.id,
          name: data.name,
          code : data.code,
          type: data.type,
          logo: data.emblem,
          area_id : data.area.id,
          area_name : data.area.name,
          area_code : data.area.code,
          area_flag : data.area.flag,
          season_id : data.currentSeason.id,
          season : data.currentSeason.startDate.split('-')[0],
          season_start_date : data.currentSeason.startDate,
          season_end_date : data.currentSeason.endDate,
          current_matchday : data.currentSeason.currentMatchday,
          total_matchdays : 0,
          lastUpdated :lastUpdated,
          winner : data.currentSeason.winner,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

         const { data: competitionData, error: competitionError } = await supabase
      .from("competitions")
      .upsert(competitionData, { onConflict: "id", ignoreDuplicates: false })
      .select("*");
      if (competitionError) throw competitionError;

       
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error(`❌ Error syncing competition ${compId}:`, err);
        }

    }
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncedCount} competitions, ${withRounds} with rounds`,
        details: {
          competitions_synced: syncedCount,
          competitions_with_rounds: withRounds,
          rounds_errors: roundsErrors.length,
          errors: roundsErrors,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("❌ Competition sync failed:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
