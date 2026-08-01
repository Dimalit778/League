// supabase/functions/generate-match-analysis/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import { errorResponse, jsonResponse, requireSyncAuth } from '../_shared/sync.ts';
import { captureException, logStructured } from '../_shared/monitoring.ts';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GEMINI_API_KEY = Deno.env.get('GEMINI_KEY') ?? '';
const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY') ?? '';
if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}
if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_KEY');
}
if (!TAVILY_API_KEY) {
  throw new Error('Missing TAVILY_API_KEY');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];
const MAX_MATCHES_PER_RUN = 20;
const DELAY_BETWEEN_MATCHES_MS = 5_000;
const GEMINI_MAX_RETRIES = 2;
function sleep(ms) {
  return new Promise((resolve)=>setTimeout(resolve, ms));
}
function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}
function isRetryableGeminiError(message) {
  const lower = message.toLowerCase();
  return lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('503') || lower.includes('500') || lower.includes('502') || lower.includes('504') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('abort') || lower.includes('timeout') || lower.includes('timed out');
}
function safeTeamName(team, fallback) {
  const name = team?.name?.trim();
  return name || fallback;
}
function safeCompetitionName(match) {
  const name = match.competition?.name?.trim();
  return name || 'Unknown Competition';
}
function cleanText(value, maxLength) {
  return value.trim().slice(0, maxLength);
}
function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 10) return 10;
  return rounded;
}
function isRetryableStatus(status, body) {
  const lower = body.toLowerCase();
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504 || lower.includes('quota') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('rate limit');
}
function getRetryDelayMs(attempt, response) {
  const retryAfter = response?.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1000;
    }
  }
  const baseDelay = 3_000 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 1_000);
  return baseDelay + jitter;
}
function isAnalysisResult(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value;
  return typeof record.summary_en === 'string' && typeof record.summary_he === 'string' && typeof record.predicted_home_score === 'number' && typeof record.predicted_away_score === 'number';
}
function buildMatchSearchQuery(match) {
  const home = safeTeamName(match.home_team, 'Home Team');
  const away = safeTeamName(match.away_team, 'Away Team');
  const competition = safeCompetitionName(match);
  return `${home} vs ${away} ${competition} team news injuries suspensions recent form expected lineups match preview`;
}
async function searchTavily(query) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), 20_000);
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        topic: 'news',
        search_depth: 'basic',
        max_results: 3,
        include_answer: false,
        include_raw_content: false,
        time_range: 'week',
        exclude_domains: [
          'bet365.com',
          'oddschecker.com',
          'paddypower.com',
          'williamhill.com',
          'draftkings.com',
          'fanduel.com'
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Tavily API error ${response.status}: ${err}`);
    }
    const data = await response.json();
    return (data.results ?? []).map((item)=>({
        title: String(item.title ?? ''),
        url: String(item.url ?? ''),
        content: String(item.content ?? '')
      }));
  } finally{
    clearTimeout(timer);
  }
}
function buildGeminiPromptFromSearch(match, searchResults) {
  const home = safeTeamName(match.home_team, 'Home Team');
  const away = safeTeamName(match.away_team, 'Away Team');
  const competition = safeCompetitionName(match);
  const compactSearchResults = searchResults.map((result)=>({
      title: result.title.slice(0, 100),
      content: result.content.slice(0, 250)
    }));
  return `
You are a professional football analyst.

Current date and time: ${new Date().toISOString()}.

Upcoming match:
{
  "match_id": ${match.id},
  "kick_off": "${match.kick_off}",
  "competition": "${competition}",
  "home_team": "${home}",
  "away_team": "${away}"
}

Use ONLY the search results below.
Do not browse the web.
Do not use any information that is not in the search results.
Do not invent injuries, suspensions, expected lineups, recent form, or team news.

Search results:
${JSON.stringify(compactSearchResults, null, 2)}

Rules:
- This is a sports preview, not betting advice.
- Focus on team news, injuries, suspensions, recent form, and match context.
- If the search results do not contain reliable injury/team-news information, say that reliable information was not found.
- Do not mention betting odds.
- Do not promise or guarantee a result.
- Keep the English summary up to 2 short sentences.
- Keep the Hebrew summary up to 2 short sentences in natural Hebrew.
- Each summary must be under 350 characters.
- Return ONLY valid JSON.
- Do not wrap the JSON in markdown.
- Do not add explanations before or after the JSON.

Required JSON format:
{
  "summary_en": "Up to 2 short sentences in English.",
  "summary_he": "Up to 2 short sentences in Hebrew.",
  "predicted_home_score": 1,
  "predicted_away_score": 1
}
`;
}
function extractJsonText(rawText) {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(`No JSON found in Gemini response: ${trimmed.slice(0, 500)}`);
  }
  return trimmed.slice(firstBrace, lastBrace + 1);
}
async function callGemini(prompt) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          summary_en: {
            type: 'STRING'
          },
          summary_he: {
            type: 'STRING'
          },
          predicted_home_score: {
            type: 'INTEGER'
          },
          predicted_away_score: {
            type: 'INTEGER'
          }
        },
        required: [
          'summary_en',
          'summary_he',
          'predicted_home_score',
          'predicted_away_score'
        ]
      }
    }
  };
  let lastError;
  for (const model of GEMINI_MODELS){
    for(let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt++){
      const controller = new AbortController();
      const timer = setTimeout(()=>controller.abort(), 30_000);
      try {
        const response = await fetch(getGeminiUrl(model), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        if (!response.ok) {
          const err = await response.text();
          const message = `Gemini API error ${response.status}: ${err}`;
          if (isRetryableStatus(response.status, err) && attempt < GEMINI_MAX_RETRIES) {
            const delayMs = getRetryDelayMs(attempt, response);
            console.error(`Gemini temporary error on ${model}. Retrying in ${delayMs}ms...`);
            await sleep(delayMs);
            continue;
          }
          lastError = new Error(message);
          break;
        }
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        const rawText = parts.map((part)=>part.text ?? '').join('');
        if (!rawText.trim()) {
          lastError = new Error(`Empty Gemini response from ${model}`);
          break;
        }
        const jsonText = extractJsonText(rawText);
        return JSON.parse(jsonText);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (isRetryableGeminiError(message) && attempt < GEMINI_MAX_RETRIES) {
          const delayMs = getRetryDelayMs(attempt);
          console.error(`Gemini retryable error on ${model}, attempt ${attempt}. Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
          continue;
        }
        console.error(`Gemini model ${model} failed: ${message}`);
        break;
      } finally{
        clearTimeout(timer);
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Gemini failed on all fallback models');
}
async function analyzeMatch(match) {
  const query = buildMatchSearchQuery(match);
  const searchResults = await searchTavily(query);
  const prompt = buildGeminiPromptFromSearch(match, searchResults);
  const parsed = await callGemini(prompt);
  if (!isAnalysisResult(parsed)) {
    throw new Error(`Unexpected Gemini response shape: ${JSON.stringify(parsed).slice(0, 500)}`);
  }
  return parsed;
}
async function fetchMatchesToAnalyze() {
  const now = new Date().toISOString();
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('matches').select(`
      id,
      competition_id,
      kick_off,
      competition:competitions!matches_competition_id_fkey(name),
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name)
    `).gte('kick_off', now).lte('kick_off', in24h).is('ai_generated_at', null).order('kick_off', {
    ascending: true
  }).limit(MAX_MATCHES_PER_RUN);
  if (error) {
    throw error;
  }
  return data ?? [];
}
async function updateMatchSuccess(matchId, analysis) {
  const { error } = await supabase.from('matches').update({
    ai_summary_en: cleanText(analysis.summary_en, 2000),
    ai_summary_he: cleanText(analysis.summary_he, 2000),
    ai_predicted_home_score: clampScore(analysis.predicted_home_score),
    ai_predicted_away_score: clampScore(analysis.predicted_away_score),
    ai_generated_at: new Date().toISOString()
  }).eq('id', matchId);
  if (error) {
    throw error;
  }
}
async function processMatch(match) {
  const home = safeTeamName(match.home_team, 'Home Team');
  const away = safeTeamName(match.away_team, 'Away Team');
  try {
    const analysis = await analyzeMatch(match);
    await updateMatchSuccess(match.id, analysis);
    return {
      matchId: match.id,
      homeTeam: home,
      awayTeam: away,
      status: 'ok'
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logStructured('error', 'match_analysis.failed', { matchId: match.id, message });
    await captureException('generate-match-analysis', err, { matchId: match.id });
    return {
      matchId: match.id,
      homeTeam: home,
      awayTeam: away,
      status: 'error',
      error: 'Analysis failed'
    };
  }
}
Deno.serve(async (req)=>{
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed' }, 405);
  }
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const matches = await fetchMatchesToAnalyze();
    if (matches.length === 0) {
      return new Response(JSON.stringify({
        message: 'No matches to analyse',
        total: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const processed = [];
    for (const match of matches){
      const result = await processMatch(match);
      processed.push(result);
      await sleep(DELAY_BETWEEN_MATCHES_MS);
    }
    const ok = processed.filter((r)=>r.status === 'ok').length;
    const errors = processed.filter((r)=>r.status === 'error').length;
    return new Response(JSON.stringify({
      message: 'Match analysis generation completed',
      total: matches.length,
      ok,
      errors,
      processed
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return errorResponse('generate-match-analysis', err);
  }
});
