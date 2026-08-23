-- The application catalogs required at runtime are created and populated by
-- migrations. Keep an explicit, idempotent seed file so `supabase db reset`
-- remains reproducible without introducing test accounts or secrets.

begin;

-- Intentionally empty: production-like football data is synchronized through
-- authenticated Edge Functions and must not be duplicated in local seeds.

commit;
