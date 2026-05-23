-- Seed the World Cup as a normal competition so league creation can use the
-- existing create_new_league RPC with a real competitions.id value.
insert into public.competitions (
  id,
  name,
  area,
  code,
  type,
  current_stage,
  flag,
  logo,
  current_fixture,
  total_fixtures
)
values (
  1,
  'World Cup',
  'World',
  'WC',
  'Cup',
  'GROUPS_KNOCKOUT',
  'https://flagcdn.com/w160/un.png',
  'https://media.api-sports.io/football/leagues/1.png',
  1,
  7
)
on conflict (id) do update
set
  name = excluded.name,
  area = excluded.area,
  code = excluded.code,
  type = excluded.type,
  current_stage = excluded.current_stage,
  flag = excluded.flag,
  logo = excluded.logo,
  current_fixture = excluded.current_fixture,
  total_fixtures = excluded.total_fixtures,
  updated_at = now();
