-- The family tree is private until an administrator enables the public view.
-- Individual people must also be explicitly published and marked public.
create table public.family_tree_publication (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.family_tree_publication(singleton, enabled) values (true, false);
alter table public.family_tree_publication enable row level security;
create policy admin_all on public.family_tree_publication for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, update on public.family_tree_publication to authenticated;

-- A security-definer function is necessary because granting anonymous SELECT
-- on the base family tables would reveal private notes and living people.
-- This function returns an explicit, minimal projection and no media URLs.
create function public.get_public_family_tree() returns jsonb
language sql stable security definer
set search_path = ''
as $$
  with setting as (
    select coalesce((select enabled from public.family_tree_publication where singleton), false) as enabled
  ), eligible as (
    select m.id, m.preferred_name, m.birth_date_text, m.death_date_text, m.short_bio
    from public.family_members m, setting s
    where s.enabled and m.status = 'published' and m.visibility = 'public'
      and m.living_status = 'deceased'
  )
  select pg_catalog.jsonb_build_object(
    'enabled', (select enabled from setting),
    'members', coalesce((select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(m) order by m.preferred_name, m.id) from eligible m), '[]'::jsonb),
    'relationships', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) order by r.id)
      from (
        select rel.id, rel.person_a_id, rel.person_b_id, rel.kind,
          rel.parent_kind, rel.confidence
        from public.family_relationships rel
        join eligible a on a.id = rel.person_a_id
        join eligible b on b.id = rel.person_b_id
        where rel.status = 'published'
      ) r
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.get_public_family_tree() from public;
grant execute on function public.get_public_family_tree() to anon, authenticated;
