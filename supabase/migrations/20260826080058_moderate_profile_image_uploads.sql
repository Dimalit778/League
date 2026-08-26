-- Route profile image writes through the moderate-profile-image Edge Function.
--
-- Previously the "Members manage their own profile images" policy granted
-- authenticated users INSERT/UPDATE/DELETE on their own images, which let the
-- client upload directly and bypass SafeSearch moderation. We now allow the
-- client only to DELETE its own images; INSERT/UPDATE happen exclusively from
-- the Edge Function via the service role (which bypasses RLS). Public read is
-- unchanged.

drop policy if exists "Members manage their own profile images" on "storage"."objects";

create policy "Members delete their own profile images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
  using (
    (bucket_id = 'profile_images'::text)
    and (
      public.is_admin()
      or public.rls_is_member_self(
        (split_part(split_part(name, '.'::text, 1), '_'::text, 1))::uuid
      )
    )
  );
