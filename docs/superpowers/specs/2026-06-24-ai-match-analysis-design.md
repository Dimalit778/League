# AI Match Analysis — Design Spec
**Date:** 2026-06-24  
**Status:** Approved

## Overview

For every match scheduled in the next 24 hours, a Supabase Edge Function (triggered by a daily cron at 08:00 UTC) calls Gemini 2.0 Flash with Google Search Grounding. Gemini searches for recent team form and head-to-head data, then returns a bilingual summary (EN + HE) and a predicted score. Results are stored directly on the `matches` row so all users see the same cached analysis without re-generating it.

---

## 1. Database Changes

Migration adds 5 columns to the `matches` table:

| Column | Type | Notes |
|---|---|---|
| `ai_summary_en` | `text` | English pre-match analysis |
| `ai_summary_he` | `text` | Hebrew pre-match analysis |
| `ai_predicted_home_score` | `int2` | AI predicted home goals |
| `ai_predicted_away_score` | `int2` | AI predicted away goals |
| `ai_generated_at` | `timestamptz` | Set when analysis is saved; used to skip already-analysed matches |

All columns are nullable. A match without analysis simply shows no AI card.

---

## 2. Edge Function — `generate-match-analysis`

**Location:** `supabase/functions/generate-match-analysis/index.ts`

### Flow

1. Query `matches` where `kick_off` is between `now()` and `now() + interval '24 hours'` AND `ai_generated_at IS NULL`.
2. For each match, build a Gemini prompt:
   ```
   You are a football analyst. The match is {home_team_name} vs {away_team_name}.
   Search for: recent form (last 5 games each), head-to-head record, key injuries or suspensions.
   Respond ONLY with valid JSON in this exact format:
   {
     "summary_en": "3-4 sentence analysis in English",
     "summary_he": "same analysis in Hebrew",
     "predicted_home_score": number,
     "predicted_away_score": number
   }
   ```
3. Call Gemini 2.0 Flash API with `tools: [{ googleSearch: {} }]` (Search Grounding).
4. Parse JSON from response.
5. `UPDATE matches SET ai_summary_en=..., ai_summary_he=..., ai_predicted_home_score=..., ai_predicted_away_score=..., ai_generated_at=now() WHERE id=...`.
6. Process matches sequentially with a small delay (500ms) to avoid rate limits.

### Error handling
- If Gemini fails for one match, log the error and continue to next match.
- If JSON parsing fails, skip that match (leave `ai_generated_at` null so next run retries).

### Environment secrets
- `GEMINI_API_KEY` — set via `npx supabase secrets set`

---

## 3. Cron Schedule

Use Supabase's built-in `pg_cron` via a scheduled Edge Function invocation:

```sql
select cron.schedule(
  'generate-match-analysis',
  '0 8 * * *',  -- 08:00 UTC daily
  $$
  select net.http_post(
    url := '<supabase-project-url>/functions/v1/generate-match-analysis',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  )
  $$
);
```

---

## 4. MatchDetailScreen Changes

### 4a. MatchHeader — prediction input moves up

The two score-input boxes (home/away goals) move from their current position into the `MatchHeader` component, displayed inline below the team names/badges. This keeps the prediction UI visible before the match without occupying the main content area.

Affected file: `src/features/matches/components/match-details/MatchHeader.tsx`

### 4b. Pre-match AI Analysis card

When `match.status` is `SCHEDULED` or `TIMED` and `ai_summary_en` is present, the area below the header shows an **AI Analysis card** instead of the old standalone prediction input block.

Card contents:
- Header: "AI Preview" with a small sparkle/robot icon
- Summary text — `ai_summary_he` if `language === 'he'`, else `ai_summary_en`
- Predicted score chip: e.g. **"Prediction: Arsenal 2 – 1 Chelsea"** styled distinctly from the real score

When `ai_summary_en` is null (analysis not yet generated or match too far away), the card is hidden — no skeleton, no placeholder.

For `FINISHED` matches: no change, existing layout remains.

Affected files:
- `src/features/matches/components/match-details/MatchContent.tsx`
- `src/features/matches/components/match-details/MatchHeader.tsx`

### 4c. Data fetching

The existing `useGetMatchDetail` hook already fetches the full match row, so the new columns are available automatically once the DB migration runs. No new API calls needed.

---

## 5. Type Updates

`src/types/database.types.ts` is auto-generated via `npm run sync-types` — run after migration is applied.

---

## 6. Out of Scope

- Admin UI to manually trigger analysis
- Per-language toggle on the card (always follows app language)
- Analysis for matches beyond 24h window
- Editing or overriding the AI analysis
