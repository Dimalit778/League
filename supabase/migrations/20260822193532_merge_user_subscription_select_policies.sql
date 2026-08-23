-- PostgreSQL ORs permissive policies for the same role and command. Keep the
-- same access semantics in one policy so the predicates are evaluated once.
alter policy "Users can read own subscription"
  on public.user_subscriptions
  using (
    (select auth.uid()) = user_id
    or (select is_admin())
  );

drop policy "Admins: Read all user subscriptions"
  on public.user_subscriptions;
