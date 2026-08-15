-- find_league_by_code, create_new_league, and join_league are SECURITY
-- DEFINER but never had their PUBLIC execute grant explicitly revoked,
-- unlike every other SECURITY DEFINER function in this codebase. Postgres
-- grants EXECUTE to PUBLIC (and therefore anon) by default, so:
--
--   - find_league_by_code has no internal auth.uid() check at all, so an
--     unauthenticated caller could enumerate league name / competition /
--     member count / owner nickname for any guessed join code.
--   - create_new_league / join_league both raise on auth.uid() is null, so
--     they were not actually exploitable by anon, but leaving PUBLIC able
--     to invoke them at all is an inconsistent gap versus this codebase's
--     own revoke-then-grant convention.
--
-- Close all three the same way every other membership RPC already is.
revoke all on function public.find_league_by_code(text) from public, anon;
grant execute on function public.find_league_by_code(text) to authenticated;

revoke all on function public.create_new_league(text, integer, integer, text, text) from public, anon;
grant execute on function public.create_new_league(text, integer, integer, text, text) to authenticated;

revoke all on function public.join_league(text, text, text) from public, anon;
grant execute on function public.join_league(text, text, text) to authenticated;
;
