-- Predictions could be inserted/updated/deleted after kickoff: the policies
-- only checked league membership. Add a time/status gate so authenticated
-- users can only write predictions while the match is still open.
-- Service-role writes (points awarding) bypass RLS and are unaffected.

drop policy if exists "Users: Insert predictions" on "public"."predictions";

create policy "Users: Insert predictions"
  on "public"."predictions"
  as permissive
  for insert
  to authenticated
with check (
  (EXISTS ( SELECT 1
     FROM public.league_members lm
    WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid)))))
  AND
  (EXISTS ( SELECT 1
     FROM public.matches m
    WHERE ((m.id = predictions.match_id)
      AND (m.kick_off > now())
      AND (m.status IN ('SCHEDULED'::public.match_status, 'TIMED'::public.match_status)))))
);


drop policy if exists "Users: Delete predictions" on "public"."predictions";

create policy "Users: Delete predictions"
  on "public"."predictions"
  as permissive
  for delete
  to authenticated
using (
  (EXISTS ( SELECT 1
     FROM public.league_members lm
    WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid)))))
  AND
  (EXISTS ( SELECT 1
     FROM public.matches m
    WHERE ((m.id = predictions.match_id)
      AND (m.kick_off > now())
      AND (m.status IN ('SCHEDULED'::public.match_status, 'TIMED'::public.match_status)))))
);


drop policy if exists "Users: Update predictions" on "public"."predictions";

create policy "Users: Update predictions"
  on "public"."predictions"
  as permissive
  for update
  to authenticated
using (
  (EXISTS ( SELECT 1
     FROM public.league_members lm
    WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid)))))
  AND
  (EXISTS ( SELECT 1
     FROM public.matches m
    WHERE ((m.id = predictions.match_id)
      AND (m.kick_off > now())
      AND (m.status IN ('SCHEDULED'::public.match_status, 'TIMED'::public.match_status)))))
)
with check (
  (EXISTS ( SELECT 1
     FROM public.league_members lm
    WHERE ((lm.id = predictions.league_member_id) AND (lm.user_id = ( SELECT auth.uid() AS uid)))))
  AND
  (EXISTS ( SELECT 1
     FROM public.matches m
    WHERE ((m.id = predictions.match_id)
      AND (m.kick_off > now())
      AND (m.status IN ('SCHEDULED'::public.match_status, 'TIMED'::public.match_status)))))
);
