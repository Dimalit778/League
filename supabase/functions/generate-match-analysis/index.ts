// supabase/functions/generate-match-analysis/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

type AnalysisResult = {
  summary_en: string;
  summary_he: string;
  predicted_home_score: number;
  predicted_away_score: number;
};

async function analyzeMatch(homeName: string, awayName: string): Promise<AnalysisResult> {
  const prompt = `You are a football analyst. The upcoming match is ${homeName} vs ${awayName}.
Search for: their recent form (last 5 games each), head-to-head record, key injuries or suspensions.
Respond ONLY with valid JSON in exactly this format, no markdown, no extra text:
{
  "summary_en": "3-4 sentence pre-match analysis in English",
  "summary_he": "same analysis translated to Hebrew",
  "predicted_home_score": <integer>,
  "predicted_away_score": <integer>
}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Collect all text parts (grounding may split into multiple parts)
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const rawText: string = parts.map((p) => p.text ?? '').join('');

  // Extract JSON object from anywhere in the text (handles grounding preamble/postamble)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in Gemini response. Raw text: ${rawText.slice(0, 500)}`);
  }
  const jsonText = jsonMatch[0];
  return JSON.parse(jsonText) as AnalysisResult;
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date().toISOString();
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: matches, error } = await supabase
      .from('matches')
      .select('id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
      .gte('kick_off', now)
      .lte('kick_off', in24h)
      .is('ai_generated_at', null);

    if (error) throw error;
    if (!matches || matches.length === 0) {
      return new Response(JSON.stringify({ message: 'No matches to analyse' }), { status: 200 });
    }

    const results: { matchId: number; status: string }[] = [];

    for (const match of matches) {
      const homeName = (match.home_team as { name: string } | null)?.name ?? 'Home Team';
      const awayName = (match.away_team as { name: string } | null)?.name ?? 'Away Team';

      try {
        const analysis = await analyzeMatch(homeName, awayName);

        const { error: updateError } = await supabase
          .from('matches')
          .update({
            ai_summary_en: analysis.summary_en,
            ai_summary_he: analysis.summary_he,
            ai_predicted_home_score: analysis.predicted_home_score,
            ai_predicted_away_score: analysis.predicted_away_score,
            ai_generated_at: new Date().toISOString(),
          })
          .eq('id', match.id);

        if (updateError) throw updateError;
        results.push({ matchId: match.id, status: 'ok' });
      } catch (err) {
        console.error(`Failed to analyse match ${match.id}:`, err);
        results.push({ matchId: match.id, status: 'error' });
      }

      // Small delay to avoid Gemini rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return new Response(JSON.stringify({ processed: results }), { status: 200 });
  } catch (err) {
    console.error('generate-match-analysis fatal error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
