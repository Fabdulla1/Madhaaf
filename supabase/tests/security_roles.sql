-- Verify the trust boundary independently of the app's route guards.
-- This fixture rolls back every inserted row and publication change.
begin;

insert into auth.users(id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
insert into public.app_users(user_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'viewer');

do $$
declare
  public_member uuid;
  living_member uuid;
  private_member uuid;
  source_id uuid;
  draft_source_id uuid;
  article_id uuid;
  draft_article_id uuid;
begin
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Approved ancestor', 'deceased', 'published', 'public') returning id into public_member;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Private living person', 'living', 'published', 'public') returning id into living_member;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Private ancestor', 'deceased', 'published', 'private') returning id into private_member;
  insert into public.family_relationships(person_a_id, person_b_id, kind, parent_kind, status)
    values (public_member, living_member, 'parent', 'unknown', 'published'),
      (private_member, public_member, 'parent', 'unknown', 'published');
  insert into public.sources(title, notes)
    values ('Published citation', 'Editorial secret') returning id into source_id;
  insert into public.sources(title, notes)
    values ('Draft citation', 'Draft secret') returning id into draft_source_id;
  insert into public.articles(slug, title)
    values ('security-published', 'Published') returning id into article_id;
  insert into public.articles(slug, title)
    values ('security-draft', 'Draft') returning id into draft_article_id;
  insert into public.article_sources(article_id, source_id)
    values (article_id, source_id), (draft_article_id, draft_source_id);
  update public.articles set status = 'published', published_at = now() where id = article_id;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare result jsonb;
begin
  if public.is_admin() then raise exception 'Anonymous caller was accepted as admin'; end if;
  if has_table_privilege('anon', 'public.family_members', 'SELECT') or
     has_table_privilege('anon', 'public.family_relationships', 'SELECT') or
     has_table_privilege('anon', 'public.app_users', 'SELECT') then
    raise exception 'Anonymous caller has private base-table access';
  end if;
  result := public.get_public_family_tree();
  if result->>'enabled' <> 'false' or jsonb_array_length(result->'members') <> 0 then
    raise exception 'Anonymous tree bypassed disabled publication setting';
  end if;
  if (select count(*) from public.published_sources) <> 1 or
     exists(select 1 from public.published_sources where title = 'Draft citation') or
     exists(select 1 from public.published_sources s where to_jsonb(s)::text like '%Editorial secret%') then
    raise exception 'Published source view exposed private or draft data';
  end if;
end $$;

reset role;
update public.family_tree_publication set enabled = true where singleton;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);
do $$
declare result jsonb; affected integer;
begin
  if public.is_admin() then raise exception 'Viewer was accepted as admin'; end if;
  if (select count(*) from public.family_members) <> 0 or
     (select count(*) from public.family_relationships) <> 0 or
     (select count(*) from public.app_users) <> 0 then
    raise exception 'Viewer can read private rows';
  end if;
  begin
    update public.app_users set role = 'admin'
      where user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    get diagnostics affected = row_count;
  exception when insufficient_privilege then affected := 0;
  end;
  if affected <> 0 or public.is_admin() then raise exception 'Viewer promoted themselves'; end if;
  update public.family_tree_publication set enabled = false where singleton;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Viewer changed public tree setting'; end if;
  result := public.get_public_family_tree();
  if jsonb_array_length(result->'members') <> 1 or
     jsonb_array_length(result->'relationships') <> 0 or
     result::text like '%Private living person%' or
     result::text like '%Private ancestor%' then
    raise exception 'Viewer public projection leaked a protected family record';
  end if;
end $$;

select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
do $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Admin role was rejected'; end if;
  if (select count(*) from public.family_members) <> 3 then
    raise exception 'Admin cannot read family records';
  end if;
  result := public.get_public_family_tree();
  if jsonb_array_length(result->'members') <> 1 then
    raise exception 'Admin call to public projection changed its privacy rules';
  end if;
end $$;

reset role;
update public.app_users set must_change_password = true
  where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
do $$
begin
  if public.is_admin() then raise exception 'Temporary-password account has editorial access'; end if;
  if (select count(*) from public.family_members) <> 0 then
    raise exception 'Temporary-password account can read private records';
  end if;
  if (select count(*) from public.app_users where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'Temporary-password account cannot read its setup flag';
  end if;
end $$;

rollback;
