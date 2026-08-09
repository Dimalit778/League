-- matches.ai_summary_en/he are shipped to the client via the season/list
-- selects and the match-detail select, then hidden behind a client-side
-- blur based on isPro. RLS on matches is `to authenticated using (true)`
-- (row-level, not column-level), so simply changing the app's own select
-- strings does not actually stop a free user from reading these columns
-- directly via the Supabase REST API with their own authenticated session.
--
-- Fix at the actual enforcement boundary: revoke column-level SELECT on the
-- two summary columns from authenticated/anon, and expose them only through
-- a SECURITY DEFINER RPC that checks the caller's plan. The predicted score
-- (ai_predicted_home_score/away_score) is intentionally shown to everyone
-- today (the UI never blurs it) and stays column-public.
revoke select (ai_summary_en, ai_summary_he) on table public.matches from authenticated, anon;

create or replace function public.get_match_ai_summary(p_match_id integer)
returns table (ai_summary_en text, ai_summary_he text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  v_plan := public.get_user_plan(v_user_id);

  if v_plan <> 'pro' then
    raise exception 'This feature requires a PRO subscription';
  end if;

  return query
    select m.ai_summary_en, m.ai_summary_he
    from public.matches m
    where m.id = p_match_id;
end;
$$;

revoke all on function public.get_match_ai_summary(integer) from public, anon;
grant execute on function public.get_match_ai_summary(integer) to authenticated;
