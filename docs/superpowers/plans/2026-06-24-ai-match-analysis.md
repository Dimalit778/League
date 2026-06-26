# AI Match Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and display bilingual AI pre-match analysis (via Gemini + Google Search Grounding) for upcoming matches, stored in the DB and shown in MatchDetailScreen.

**Architecture:** A Supabase Edge Function runs daily via pg_cron, queries matches kicking off in the next 24 hours, calls Gemini 2.0 Flash with Search Grounding to get a bilingual summary and predicted score, then saves results to new columns on the `matches` table. The app reads these columns from the existing `useGetMatchDetail` hook and renders an `AiAnalysisCard` component. The `PredictionForm` moves into `MatchHeader` so users can still enter predictions.

**Tech Stack:** Supabase Edge Functions (Deno), Gemini 2.0 Flash API (Search Grounding), pg_cron, React Native / NativeWind, TanStack Query, Zustand (LanguageStore)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/<timestamp>_add_ai_analysis_to_matches.sql` | Create | DB migration: 5 new columns on `matches` |
| `supabase/migrations/<timestamp>_schedule_ai_analysis_cron.sql` | Create | pg_cron schedule for daily Edge Function call |
| `supabase/functions/generate-match-analysis/index.ts` | Create | Edge Function: fetch matches → Gemini → save results |
| `src/types/database.types.ts` | Modify (auto) | Re-generated via `npm run sync-types` |
| `src/features/matches/components/match-details/AiAnalysisCard.tsx` | Create | Displays AI summary + predicted score |
| `src/features/matches/components/match-details/MatchHeader.tsx` | Modify | Add inline `PredictionForm` for scheduled matches |
| `src/features/matches/components/match-details/MatchContent.tsx` | Modify | Show `AiAnalysisCard` instead of standalone `PredictionForm` |

---

## Task 1: DB Migration — add AI columns to matches

**Files:**
- Create: `supabase/migrations/<timestamp>_add_ai_analysis_to_matches.sql`

- [ ] **Step 1: Create migration file**

```bash
npx supabase migration new add_ai_analysis_to_matches
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_add_ai_analysis_to_matches.sql`.

- [ ] **Step 2: Write migration SQL**

Open the newly created file and write:

```sql
alter table public.matches
  add column if not exists ai_summary_en text,
  add column if not exists ai_summary_he text,
  add column if not exists ai_predicted_home_score smallint,
  add column if not exists ai_predicted_away_score smallint,
  add column if not exists ai_generated_at timestamptz;
```

- [ ] **Step 3: Apply migration to remote DB**

```bash
npx supabase db push
```

Expected output: `Applying migration ... add_ai_analysis_to_matches`

- [ ] **Step 4: Regenerate TypeScript types**

```bash
npm run sync-types
```

Expected: `src/types/database.types.ts` updated. Verify by checking the file contains `ai_summary_en` in the `matches` Row type.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/ src/types/database.types.ts
git commit -m "feat: add AI analysis columns to matches table"
```

---

## Task 2: Edge Function — generate-match-analysis

**Files:**
- Create: `supabase/functions/generate-match-analysis/index.ts`

- [ ] **Step 1: Create Edge Function directory and file**

```bash
mkdir -p supabase/functions/generate-match-analysis
touch supabase/functions/generate-match-analysis/index.ts
```

- [ ] **Step 2: Write the Edge Function**

```typescript
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
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip potential markdown code fences
  const jsonText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
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
```

- [ ] **Step 3: Deploy the Edge Function**

```bash
npx supabase functions deploy generate-match-analysis
```

Expected: `Deployed generate-match-analysis`

- [ ] **Step 4: Verify the secret exists**

```bash
npx supabase secrets list
```

Expected: `GEMINI_API_KEY` appears in the list. If not, run:
```bash
npx supabase secrets set GEMINI_API_KEY=<your_key>
```

- [ ] **Step 5: Test the function manually**

```bash
npx supabase functions invoke generate-match-analysis --no-verify-jwt
```

Expected: JSON response like `{"processed":[...]}` or `{"message":"No matches to analyse"}`.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/generate-match-analysis/
git commit -m "feat: add generate-match-analysis edge function with Gemini grounding"
```

---

## Task 3: pg_cron Schedule

**Files:**
- Create: `supabase/migrations/<timestamp>_schedule_ai_analysis_cron.sql`

- [ ] **Step 1: Create migration**

```bash
npx supabase migration new schedule_ai_analysis_cron
```

- [ ] **Step 2: Write cron SQL**

Replace `<YOUR_SUPABASE_PROJECT_URL>` and `<YOUR_SERVICE_ROLE_KEY>` with your actual values (found in Supabase Dashboard → Project Settings → API).

```sql
-- Enable pg_cron if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule daily at 08:00 UTC
select cron.schedule(
  'generate-match-analysis',
  '0 8 * * *',
  $$
  select net.http_post(
    url := '<YOUR_SUPABASE_PROJECT_URL>/functions/v1/generate-match-analysis',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  )
  $$
);
```

- [ ] **Step 3: Apply migration**

```bash
npx supabase db push
```

- [ ] **Step 4: Verify cron is scheduled (optional)**

In Supabase Dashboard → Database → Extensions, confirm `pg_cron` is enabled.
In SQL Editor run: `select * from cron.job;` — should show the `generate-match-analysis` job.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: schedule daily AI match analysis via pg_cron"
```

---

## Task 4: AiAnalysisCard component

**Files:**
- Create: `src/features/matches/components/match-details/AiAnalysisCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/matches/components/match-details/AiAnalysisCard.tsx
import { CText } from '@/components/ui';
import { useLanguageStore } from '@/store/LanguageStore';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

type AiAnalysisCardProps = {
  summaryEn: string;
  summaryHe: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeTeamName: string;
  awayTeamName: string;
};

export default function AiAnalysisCard({
  summaryEn,
  summaryHe,
  predictedHomeScore,
  predictedAwayScore,
  homeTeamName,
  awayTeamName,
}: AiAnalysisCardProps) {
  const language = useLanguageStore((s) => s.language);
  const summary = language === 'he' ? summaryHe : summaryEn;

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-surface border border-border p-4 gap-3">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles" size={18} color="#a78bfa" />
        <CText variant="bodyBold" className="text-primary">
          AI Preview
        </CText>
      </View>

      {/* Summary */}
      <CText variant="body" className="text-text leading-6">
        {summary}
      </CText>

      {/* Predicted score chip */}
      <View className="flex-row items-center gap-2 mt-1">
        <CText variant="caption" className="text-muted">
          Prediction:
        </CText>
        <View className="flex-row items-center bg-primary/10 rounded-lg px-3 py-1 gap-1">
          <CText variant="bodyBold" className="text-primary">
            {homeTeamName} {predictedHomeScore} – {predictedAwayScore} {awayTeamName}
          </CText>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/matches/components/match-details/AiAnalysisCard.tsx
git commit -m "feat: add AiAnalysisCard component"
```

---

## Task 5: Move PredictionForm into MatchHeader

The score input boxes move into the header so they appear inline under the team badges for scheduled matches.

**Files:**
- Modify: `src/features/matches/components/match-details/MatchHeader.tsx`

- [ ] **Step 1: Update MatchHeader to accept prediction props and render PredictionForm inline**

Replace the entire content of `src/features/matches/components/match-details/MatchHeader.tsx`:

```tsx
import LeftJersey from '@/components/LeftJersey';
import { CText } from '@/components/ui';
import { MatchWithPredictions, PredictionMemberType, TeamType } from '@/features/matches/types';
import PredictionForm from '@/features/predictions/components/PredictionForm';
import { dateFormat, formatTime } from '@/utils/formats';
import { getTeamJersey } from '@/utils/teamColors';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TeamCard({ team, badgeSize }: { team: TeamType; badgeSize: number }) {
  const shortName = team.shortName || team.name;
  const teamName = team.tla ?? shortName ?? team.name;
  const jerseyData = getTeamJersey(team.name);
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40  max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <View className="relative">
        <View className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full items-center justify-center mb-3">
          <LeftJersey teamName={teamName} jerseyColors={jerseyData} size={200} />
        </View>
      </View>
      <CText variant="body" className="text-white text-center">
        {shortName}
      </CText>
    </View>
  );
}

function TBDCard({ badgeSize }: { badgeSize: number }) {
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40 max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <View
        className="bg-white/10 rounded-full items-center justify-center mb-3"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <Ionicons name="help" size={badgeSize * 0.45} color="rgba(255,255,255,0.4)" />
      </View>
      <CText variant="body" className="text-white/50 text-center">
        TBD
      </CText>
    </View>
  );
}

function ScoreCard({
  homeScore,
  awayScore,
  matchStatus,
  kick_off,
}: {
  homeScore: number;
  awayScore: number;
  matchStatus: string;
  kick_off: string;
}) {
  return (
    <View>
      {['SCHEDULED', 'TIMED'].includes(matchStatus) && (
        <View className="rounded-2xl p-4 md:p-6 items-center">
          <Ionicons name="time-outline" size={24} color="#fff" className="md:text-[32px]" />
          <CText variant="caption" className="text-white mt-2 text-center">
            {formatTime(kick_off)}
          </CText>
        </View>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <View className="items-center justify-center gap-2">
          <CText variant="bodyBold" className="text-green-500">
            LIVE
          </CText>
          <CText variant="h3" className="text-white">
            {homeScore} : {awayScore}
          </CText>
        </View>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center border-2 border-gray-500 rounded-lg p-2 md:p-3 gap-2">
          <CText variant="h3" className="text-white">
            {homeScore}
          </CText>
          <CText variant="h3" className="text-white">
            :
          </CText>
          <CText variant="h3" className="text-white">
            {awayScore}
          </CText>
        </View>
      )}
    </View>
  );
}

type MatchHeaderProps = {
  match: MatchWithPredictions;
  memberPrediction?: PredictionMemberType;
};

export default function MatchHeader({ match, memberPrediction }: MatchHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const badgeSize = width >= 1024 ? 96 : width >= 768 ? 80 : 64;

  const homeTeam = match.home_team ?? null;
  const awayTeam = match.away_team ?? null;
  const venue = homeTeam?.venue;

  const now = new Date();
  const kickOff = new Date(match.kick_off);
  const isScheduled = ['SCHEDULED', 'TIMED'].includes(match.status ?? '') && kickOff > now;

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Match Info Section */}
      <View className="p-4 mb-8">
        <View className="items-center justify-center">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <CText variant="caption" className="text-white">
              {dateFormat(match.kick_off)}
            </CText>
          </View>
          {venue ? (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={20} color="#fff" />
              <CText variant="caption" className="text-white">
                {venue}
              </CText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Teams and Score Section */}
      <View className="flex-row items-center justify-evenly w-full mx-auto">
        {homeTeam ? <TeamCard team={homeTeam} badgeSize={badgeSize} /> : <TBDCard badgeSize={badgeSize} />}
        <ScoreCard
          homeScore={match.score?.fullTime?.home || 0}
          awayScore={match.score?.fullTime?.away || 0}
          matchStatus={match.status || ''}
          kick_off={match.kick_off}
        />
        {awayTeam ? <TeamCard team={awayTeam} badgeSize={badgeSize} /> : <TBDCard badgeSize={badgeSize} />}
      </View>

      {/* Prediction input inline for scheduled matches */}
      {isScheduled && (
        <PredictionForm prediction={memberPrediction} matchId={match.id} />
      )}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/matches/components/match-details/MatchHeader.tsx
git commit -m "feat: move PredictionForm into MatchHeader for scheduled matches"
```

---

## Task 6: Update MatchContent and MatchDetailScreen

**Files:**
- Modify: `src/features/matches/components/match-details/MatchContent.tsx`
- Modify: `src/features/matches/screens/MatchDetailScreen.tsx` (pass `memberPrediction` to `MatchHeader`)

- [ ] **Step 1: Check how MatchHeader is used in MatchDetailScreen**

```bash
cat src/features/matches/screens/MatchDetailScreen.tsx
```

- [ ] **Step 2: Update MatchContent**

Replace the entire content of `src/features/matches/components/match-details/MatchContent.tsx`:

```tsx
import AiAnalysisCard from '@/features/matches/components/match-details/AiAnalysisCard';
import { MatchWithPredictions } from '@/features/matches/types';
import TabsContent from './TabsContent';

interface MatchContentProps {
  match: MatchWithPredictions;
}

type MatchStatus = 'SCHEDULED' | 'LIVE' | 'TIMED' | 'IN_PLAY' | 'FINISHED';

export default function MatchContent({ match }: MatchContentProps) {
  const status = (match.status ?? 'SCHEDULED') as MatchStatus;

  const now = new Date();
  const kickOff = new Date(match.kick_off);
  const isScheduled = ['SCHEDULED', 'TIMED'].includes(status) && kickOff > now;

  if (isScheduled) {
    if (match.ai_summary_en && match.ai_summary_he) {
      return (
        <AiAnalysisCard
          summaryEn={match.ai_summary_en}
          summaryHe={match.ai_summary_he}
          predictedHomeScore={match.ai_predicted_home_score ?? 0}
          predictedAwayScore={match.ai_predicted_away_score ?? 0}
          homeTeamName={match.home_team?.shortName ?? match.home_team?.name ?? 'Home'}
          awayTeamName={match.away_team?.shortName ?? match.away_team?.name ?? 'Away'}
        />
      );
    }
    // No AI analysis yet — render nothing (analysis runs at 08:00 UTC)
    return null;
  }

  const predictions = match.predictions ?? [];
  return <TabsContent predictions={predictions} />;
}
```

- [ ] **Step 3: Update MatchDetailScreen to pass memberPrediction to MatchHeader**

Read the current file:
```bash
cat src/features/matches/screens/MatchDetailScreen.tsx
```

Find where `<MatchHeader match={match} />` is rendered and update it to also pass `memberPrediction`. The `memberPrediction` is the prediction belonging to the current member — find the pattern from the old `MatchContent`:

```tsx
// Add this derivation near the top of the component (after match data is available):
const memberId = useMemberStore(selectMemberId) ?? '';
const predictions = match.predictions ?? [];
const memberPrediction = predictions.find((p) => p.league_member?.id === memberId);

// Then pass to MatchHeader:
<MatchHeader match={match} memberPrediction={memberPrediction} />
```

Also add the import:
```tsx
import { selectMemberId, useMemberStore } from '@/store/MemberStore';
```

- [ ] **Step 4: Commit**

```bash
git add src/features/matches/components/match-details/MatchContent.tsx \
        src/features/matches/screens/MatchDetailScreen.tsx
git commit -m "feat: show AI analysis card in MatchContent for scheduled matches"
```

---

## Task 7: Smoke Test

- [ ] **Step 1: Start the dev server**

```bash
npm start
```

- [ ] **Step 2: Open a scheduled match in MatchDetailScreen**

Verify:
- The team jerseys and time still show in the header
- The score input (PredictionForm) appears below the teams in the header area
- If `ai_summary_en` is populated in the DB for this match, the AI card shows below
- If `ai_summary_en` is null, the area below is empty (no crash)

- [ ] **Step 3: Manually seed one match with AI data to test the card**

In Supabase Dashboard → SQL Editor:
```sql
update public.matches
set
  ai_summary_en = 'This is a test analysis in English. Both teams are in great form.',
  ai_summary_he = 'זהו ניתוח בדיקה בעברית. שתי הקבוצות במצב מצוין.',
  ai_predicted_home_score = 2,
  ai_predicted_away_score = 1,
  ai_generated_at = now()
where id = <a_scheduled_match_id>;
```

Replace `<a_scheduled_match_id>` with an actual ID from your DB.

- [ ] **Step 4: Verify the AI card renders correctly in both languages**

Toggle the app language (EN ↔ HE) and confirm the summary switches. The predicted score chip should always show team names with the score.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: AI match analysis complete"
```
