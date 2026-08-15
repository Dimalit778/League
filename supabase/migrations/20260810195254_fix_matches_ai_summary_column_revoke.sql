-- The previous migration (20260809234258_gate_match_ai_summary_behind_pro_plan)
-- did `revoke select (ai_summary_en, ai_summary_he) on table public.matches
-- from authenticated, anon`, expecting that to hide those two columns.
-- Verified post-apply that it had NO effect: authenticated/anon already hold
-- a blanket table-level `GRANT SELECT ON TABLE public.matches` (Supabase's
-- default), and in Postgres a table-level SELECT grant covers every column
-- regardless of any column-level REVOKE — column grants only matter when
-- there is no covering table-level grant. information_schema.column_privileges
-- confirmed authenticated/anon still had SELECT on both columns after that
-- migration ran successfully (no error, but no actual effect).
--
-- Fix: revoke the table-level SELECT and replace it with an explicit
-- column-level GRANT covering every column except the two AI summary
-- fields, which stay gated behind get_match_ai_summary.
revoke select on public.matches from authenticated, anon;

grant select (
  id,
  competition_id,
  fixture,
  kick_off,
  status,
  stage,
  "group",
  home_team_id,
  away_team_id,
  referee,
  score,
  created_at,
  updated_at,
  ai_predicted_home_score,
  ai_predicted_away_score,
  ai_generated_at,
  season_id
) on public.matches to authenticated, anon;
;
