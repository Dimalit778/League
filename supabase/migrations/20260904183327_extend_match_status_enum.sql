-- Keep the database enum aligned with every match status football-data.org can
-- return. These values are intentionally additive; removing enum labels later
-- is unsafe in Postgres.
alter type public.match_status add value if not exists 'EXTRA_TIME';
alter type public.match_status add value if not exists 'PENALTY_SHOOTOUT';
alter type public.match_status add value if not exists 'SUSPENDED';
alter type public.match_status add value if not exists 'CANCELLED';
alter type public.match_status add value if not exists 'AWARDED';
