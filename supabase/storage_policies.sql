-- one-time: create the bucket (private)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Helper: check if user is the owner of a member_id
create or replace function is_owner_of_member(uid uuid, member_id text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from league_members
    where user_id = uid and id::text = member_id::text
  );
$$;

-- Helper: check league membership
create or replace function is_member_of_league(uid uuid, lg text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from league_members
    where user_id = uid and league_id::text = lg::text
  );
$$;

-- READ: allow users to read avatars only for leagues they are in
create policy "read avatars of my leagues"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and is_member_of_league(
        auth.uid(),
        (split_part(name, '/', 1))
      )
);

-- WRITE: users can upload/update only files for members they own
create policy "upload own avatar in league"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and is_owner_of_member(auth.uid(), (split_part(name, '/', 2)))
);

create policy "update own avatar in league"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and is_owner_of_member(auth.uid(), (split_part(name, '/', 2)))
)
with check (
  bucket_id = 'avatars'
  and is_owner_of_member(auth.uid(), (split_part(name, '/', 2)))
);

create policy "delete own avatar in league"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and is_owner_of_member(auth.uid(), (split_part(name, '/', 2)))
);