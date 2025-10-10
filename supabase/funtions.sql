-- 1) RPC to finalize a fixture
create or replace function public.finalize_fixture_points(p_fixture_id int)
returns void
language plpgsql
security definer
as $$
declare
  r record;
  v_points int;
begin
  for r in
    select id, user_id, league_id, league_member_id, home_score, away_score
    from predictions
    where fixture_id = p_fixture_id and is_finished = false
  loop
    -- exact score = 3, correct result = 1, else 0 (your current logic)
    select case
      when r.home_score = f.home_score and r.away_score = f.away_score then 3
      when (r.home_score > r.away_score and f.home_score > f.away_score)
        or (r.home_score < r.away_score and f.home_score < f.away_score)
        or (r.home_score = r.away_score and f.home_score = f.away_score)
      then 1 else 0 end
    into v_points
    from fixtures f where f.id = p_fixture_id;

    update predictions
    set points = v_points, is_finished = true, updated_at = now()
    where id = r.id;
  end loop;
end$$;

-- 2) Trigger: when fixture becomes finished
create or replace function public.on_fixture_finished()
returns trigger
language plpgsql
security definer
as $$
begin
  if (NEW.status = 'finished'
      and NEW.home_score is not null
      and NEW.away_score is not null
      and (OLD.status is distinct from 'finished')) then
    perform public.finalize_fixture_points(NEW.id);
  end if;
  return NEW;
end$$;

drop trigger if exists trg_fixture_finished on public.fixtures;
create trigger trg_fixture_finished
after update of status, home_score, away_score on public.fixtures
for each row
when (pg_trigger_depth() = 0)
execute function public.on_fixture_finished();