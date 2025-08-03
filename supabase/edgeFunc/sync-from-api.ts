{
    `name`: `sync-api-football`,
    `files`: [
      {
        `name`: `index.ts`,
        `content`: `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  
  // API-Football configuration
  const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io'
  const API_KEY = Deno.env.get('API_FOOTBALL_KEY')
  
  // Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Available competitions with their API-Football IDs
  const COMPETITIONS = {
    39: 'Premier League',     // England
    140: 'La Liga',          // Spain  
    135: 'Serie A',          // Italy
    78: 'Bundesliga',        // Germany
    61: 'Ligue 1',           // France
    2: 'Champions League',   // UEFA
    4: 'Euro Championship'   // UEFA
  }
  
  // Rate limiter class
  class RateLimiter {
    private requestCount = 0
    private windowStart = Date.now()
    private readonly maxRequests = 100 // Daily limit for free plan
    private readonly windowMs = 24 * 60 * 60 * 1000 // 24 hours
    private readonly minDelay = 1000 // 1 second between requests
    private lastRequest = 0
  
    async makeRequest(endpoint: string): Promise<any> {
      // Reset window if 24 hours passed
      if (Date.now() - this.windowStart >= this.windowMs) {
        this.requestCount = 0
        this.windowStart = Date.now()
      }
  
      // Check daily limit
      if (this.requestCount >= this.maxRequests) {
        throw new Error('Daily API limit reached')
      }
  
      // Rate limiting: wait if too soon
      const timeSinceLastRequest = Date.now() - this.lastRequest
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minDelay - timeSinceLastRequest)
        )
      }
  
      const response = await fetch(`${API_FOOTBALL_BASE_URL}${endpoint}`, {
        headers: {
          'X-RapidAPI-Key': API_KEY!,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })
  
      this.requestCount++
      this.lastRequest = Date.now()
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }
  
      return await response.json()
    }
  
    getUsage() {
      return {
        requests_made: this.requestCount,
        requests_remaining: this.maxRequests - this.requestCount,
        window_reset: new Date(this.windowStart + this.windowMs).toISOString()
      }
    }
  }
  
  const rateLimiter = new RateLimiter()
  
  // Helper function to chunk array
  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
  
  serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
  
    try {
      const { action, leagueId, season = 2024 } = await req.json()
  
      switch (action) {
        case 'sync_competitions':
          return await syncCompetitions()
          
        case 'sync_league_fixtures':
          if (!leagueId) {
            throw new Error('leagueId is required for sync_league_fixtures')
          }
          return await syncLeagueFixtures(leagueId, season)
          
        case 'sync_today_results':
          return await syncTodayResults()
          
        case 'sync_live_scores':
          return await syncLiveScores()
          
        case 'get_usage':
          return await getApiUsage()
          
        default:
          throw new Error('Invalid action')
      }
    } catch (error) {
      console.error('Sync error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  })
  
  // Get API usage stats
  async function getApiUsage() {
    return new Response(
      JSON.stringify({ 
        success: true,
        usage: rateLimiter.getUsage(),
        competitions: COMPETITIONS
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Sync competitions data
  async function syncCompetitions() {
    const competitionsData = await rateLimiter.makeRequest('/leagues')
    
    // Filter only our supported competitions
    const supportedComps = competitionsData.response.filter((comp: any) => 
      Object.keys(COMPETITIONS).includes(comp.league.id.toString())
    )
    
    for (const comp of supportedComps) {
      const { error } = await supabase.rpc('upsert_competition', {
        comp_id: comp.league.id,
        comp_name: comp.league.name,
        comp_country: comp.country.name,
        comp_logo: comp.league.logo,
        comp_flag: comp.country.flag,
        comp_season: comp.seasons[0]?.year || 2024,
        comp_round: comp.seasons[0]?.current ? 'Current' : 'Finished',
        comp_type: comp.league.type
      })
      
      if (error) {
        console.error('Error upserting competition:', error)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${supportedComps.length} competitions`,
        competitions: supportedComps.map((c: any) => c.league.name),
        usage: rateLimiter.getUsage()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Sync league fixtures (following the blog tutorial approach)
  async function syncLeagueFixtures(leagueId: number, season: number) {
    try {
      // Step 1: Get all fixture IDs for completed/ongoing matches
      const fixturesResponse = await rateLimiter.makeRequest(
        `/fixtures?league=${leagueId}&season=${season}&status=FT-AET-PEN-1H-HT-2H-ET-BT-P`
      )
      
      const fixtureIds: number[] = fixturesResponse.response.map(
        (fixture: any) => fixture.fixture.id
      )
      
      if (fixtureIds.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No fixtures to sync',
            usage: rateLimiter.getUsage()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Step 2: Chunk IDs into groups of 20 (API limit)
      const fixtureChunks = chunkArray(fixtureIds, 20)
      let totalSynced = 0
      
      // Step 3: Process each chunk
      for (const chunk of fixtureChunks) {
        const idsParam = chunk.join('-')
        const fixturesData = await rateLimiter.makeRequest(`/fixtures?ids=${idsParam}`)
        
        // Sync to database using our bulk function
        const { data: syncCount, error } = await supabase.rpc('sync_league_fixtures', {
          league_id: leagueId,
          season: season,
          fixtures_data: fixturesData
        })
        
        if (error) {
          console.error('Error syncing fixtures chunk:', error)
        } else {
          totalSynced += syncCount || 0
        }
        
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${totalSynced} fixtures for league ${leagueId}`,
          chunks_processed: fixtureChunks.length,
          total_fixtures: fixtureIds.length,
          usage: rateLimiter.getUsage()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } catch (error) {
      throw new Error(`Failed to sync league fixtures: ${error.message}`)
    }
  }
  
  // Sync today's results
  async function syncTodayResults() {
    const today = new Date().toISOString().split('T')[0]
    
    const todayFixtures = await rateLimiter.makeRequest(
      `/fixtures?date=${today}&status=FT`
    )
    
    if (todayFixtures.response.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No finished matches today',
          usage: rateLimiter.getUsage()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    let updatedCount = 0
    
    // Process each finished fixture
    for (const fixture of todayFixtures.response) {
      // Only process our supported competitions
      if (Object.keys(COMPETITIONS).includes(fixture.league.id.toString())) {
        // Upsert teams first
        await supabase.rpc('upsert_team', {
          team_id: fixture.teams.home.id,
          team_name: fixture.teams.home.name,
          team_logo: fixture.teams.home.logo
        })
        
        await supabase.rpc('upsert_team', {
          team_id: fixture.teams.away.id,
          team_name: fixture.teams.away.name,
          team_logo: fixture.teams.away.logo
        })
        
        // Then upsert fixture
        const { error } = await supabase.rpc('upsert_fixture', {
          fixture_id: fixture.fixture.id,
          league_id: fixture.league.id,
          season: fixture.league.season,
          round: fixture.league.round,
          fixture_date: fixture.fixture.date,
          timestamp_val: fixture.fixture.timestamp,
          referee: fixture.fixture.referee,
          timezone: fixture.fixture.timezone,
          status_long: fixture.fixture.status.long,
          venue_id: fixture.fixture.venue?.id,
          venue_name: fixture.fixture.venue?.name,
          venue_city: fixture.fixture.venue?.city,
          home_team_id: fixture.teams.home.id,
          away_team_id: fixture.teams.away.id,
          goals_home: fixture.goals.home,
          goals_away: fixture.goals.away,
          score_halftime_home: fixture.score.halftime.home,
          score_halftime_away: fixture.score.halftime.away,
          score_fulltime_home: fixture.score.fulltime.home,
          score_fulltime_away: fixture.score.fulltime.away,
          score_extratime_home: fixture.score.extratime.home,
          score_extratime_away: fixture.score.extratime.away,
          score_penalty_home: fixture.score.penalty.home,
          score_penalty_away: fixture.score.penalty.away
        })
        
        if (!error) updatedCount++
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} finished matches`,
        total_matches: todayFixtures.response.length,
        date: today,
        usage: rateLimiter.getUsage()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Sync live scores
  async function syncLiveScores() {
    const liveFixtures = await rateLimiter.makeRequest('/fixtures?live=all')
    
    if (liveFixtures.response.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No live matches currently',
          usage: rateLimiter.getUsage()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    let updatedCount = 0
    
    // Update only our supported competitions
    for (const fixture of liveFixtures.response) {
      if (Object.keys(COMPETITIONS).includes(fixture.league.id.toString())) {
        const { error } = await supabase.rpc('upsert_fixture', {
          fixture_id: fixture.fixture.id,
          league_id: fixture.league.id,
          season: fixture.league.season,
          round: fixture.league.round,
          fixture_date: fixture.fixture.date,
          timestamp_val: fixture.fixture.timestamp,
          referee: fixture.fixture.referee,
          timezone: fixture.fixture.timezone,
          status_long: fixture.fixture.status.long,
          venue_id: fixture.fixture.venue?.id,
          venue_name: fixture.fixture.venue?.name,
          venue_city: fixture.fixture.venue?.city,
          home_team_id: fixture.teams.home.id,
          away_team_id: fixture.teams.away.id,
          goals_home: fixture.goals.home,
          goals_away: fixture.goals.away,
          score_halftime_home: fixture.score.halftime.home,
          score_halftime_away: fixture.score.halftime.away,
          score_fulltime_home: fixture.score.fulltime.home,
          score_fulltime_away: fixture.score.fulltime.away,
          score_extratime_home: fixture.score.extratime.home,
          score_extratime_away: fixture.score.extratime.away,
          score_penalty_home: fixture.score.penalty.home,
          score_penalty_away: fixture.score.penalty.away
        })
        
        if (!error) updatedCount++
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} live matches`,
        total_live: liveFixtures.response.length,
        usage: rateLimiter.getUsage()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }`
      },
      {
        `name`: `README.md`,
        `content`: `# API-Football Sync Edge Function
  
  This edge function syncs football data from API-Football to your Supabase database.
  
  ## Setup
  
  1. Add your API-Football key to Supabase secrets:
  ```bash
  supabase secrets set API_FOOTBALL_KEY=your_api_key_here
  ```
  
  2. Deploy the function:
  ```bash
  supabase functions deploy sync-api-football
  ```
  
  ## Available Actions
  
  ### Sync Competitions
  ```javascript
  fetch('/functions/v1/sync-api-football', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sync_competitions' })
  })
  ```
  
  ### Sync League Fixtures
  ```javascript
  fetch('/functions/v1/sync-api-football', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'sync_league_fixtures',
      leagueId: 39, // Premier League
      season: 2024
    })
  })
  ```
  
  ### Sync Today's Results
  ```javascript
  fetch('/functions/v1/sync-api-football', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sync_today_results' })
  })
  ```
  
  ### Sync Live Scores
  ```javascript
  fetch('/functions/v1/sync-api-football', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sync_live_scores' })
  })
  ```
  
  ### Get API Usage
  ```javascript
  fetch('/functions/v1/sync-api-football', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_usage' })
  })
  ```
  
  ## Supported Competitions
  
  - Premier League (39)
  - La Liga (140)
  - Serie A (135)
  - Bundesliga (78)
  - Ligue 1 (61)
  - Champions League (2)
  - Euro Championship (4)
  
  ## Rate Limiting
  
  The function automatically handles the 100 requests/day limit for the free API-Football plan with intelligent rate limiting.
  `
      }
    ]
  }