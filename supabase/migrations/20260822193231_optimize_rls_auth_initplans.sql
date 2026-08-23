-- Wrap auth.uid() in scalar subqueries so PostgreSQL evaluates it as an
-- initplan instead of once for every candidate row. Access semantics remain
-- unchanged.

alter policy "Users can read own subscription"
  on public.user_subscriptions
  using ((select auth.uid()) = user_id);

alter policy "Users read their blocks"
  on public.user_blocks
  using (
    blocker_user_id = (select auth.uid())
    or is_admin()
  );

alter policy "Reporters and admins read reports"
  on public.content_reports
  using (
    reporter_user_id = (select auth.uid())
    or is_admin()
  );

alter policy "Members read visible league members"
  on public.league_members
  using (
    is_admin()
    or (
      (
        is_league_member(league_id)
        or user_id = (select auth.uid())
      )
      and (
        user_id is null
        or user_id = (select auth.uid())
        or not has_blocked_user(user_id)
      )
    )
  );

alter policy "Users read visible league predictions"
  on public.predictions
  using (
    is_admin()
    or exists (
      select 1
      from public.league_members lm_self
      join public.league_members lm_pred
        on lm_self.league_id = lm_pred.league_id
      where lm_self.user_id = (select auth.uid())
        and lm_pred.id = predictions.league_member_id
        and (
          lm_pred.user_id is null
          or lm_pred.user_id = (select auth.uid())
          or not has_blocked_user(lm_pred.user_id)
        )
    )
  );
