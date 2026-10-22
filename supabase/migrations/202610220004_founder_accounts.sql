-- Assign founder authority to the existing immutable Auth user ID, then
-- remove the client-side write path to account authorization.
alter table public.app_users
  add column is_founder boolean not null default false,
  add column must_change_password boolean not null default false;

do $$
declare founder_id uuid := 'a94c9aca-47eb-4335-bd40-48dfb9144871';
begin
  if exists (select 1 from public.app_users) and (
    not exists (select 1 from auth.users where id = founder_id and lower(email) = 'abdulla11099@gmail.com')
    or not exists (
    select 1 from public.app_users where user_id = founder_id and role = 'admin'
    )) then
    raise exception 'The existing Madhaaf founder administrator was not found';
  end if;
  update public.app_users set is_founder = true where user_id = founder_id;
end $$;

create unique index app_users_one_founder on public.app_users (is_founder)
  where is_founder;

drop policy if exists admin_all on public.app_users;
revoke insert, update, delete on public.app_users from authenticated;
create policy app_users_admin_read on public.app_users for select to authenticated
  using (user_id = (select auth.uid()) and role = 'admin');

-- The same gate protects direct PostgREST and Storage access while a newly
-- provisioned administrator still has their temporary password.
create or replace function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.app_users
    where user_id = (select auth.uid()) and role = 'admin' and not must_change_password);
$$;
