-- Verify the anonymous projection without leaving any family records behind.
begin;

do $$
declare
  visible_parent uuid;
  visible_child uuid;
  living_person uuid;
  private_person uuid;
  draft_person uuid;
  result jsonb;
begin
  insert into public.family_members(preferred_name, living_status, status, visibility, short_bio, private_notes)
    values ('Visible ancestor', 'deceased', 'published', 'public', 'Reviewed biography', 'Never public') returning id into visible_parent;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Visible descendant', 'deceased', 'published', 'public') returning id into visible_child;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Living hidden', 'living', 'published', 'public') returning id into living_person;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Private hidden', 'deceased', 'published', 'private') returning id into private_person;
  insert into public.family_members(preferred_name, living_status, status, visibility)
    values ('Draft hidden', 'deceased', 'draft', 'public') returning id into draft_person;

  insert into public.family_relationships(person_a_id, person_b_id, kind, parent_kind, status)
    values
      (visible_parent, visible_child, 'parent', 'unknown', 'published'),
      (visible_parent, living_person, 'parent', 'unknown', 'published'),
      (visible_parent, private_person, 'parent', 'unknown', 'published'),
      (visible_parent, draft_person, 'parent', 'unknown', 'published');

  result := public.get_public_family_tree();
  if result->>'enabled' <> 'false' or jsonb_array_length(result->'members') <> 0 then
    raise exception 'The tree must start private';
  end if;

  update public.family_tree_publication set enabled = true where singleton;
end $$;

set local role anon;
do $$
declare result jsonb;
begin
  result := public.get_public_family_tree();
  if result->>'enabled' <> 'true' then raise exception 'Public setting was not observed'; end if;
  if jsonb_array_length(result->'members') <> 2 then raise exception 'Hidden member leaked into public tree'; end if;
  if jsonb_array_length(result->'relationships') <> 1 then raise exception 'Hidden relationship leaked into public tree'; end if;
  if result::text like '%Never public%' or result::text like '%private_notes%' or result::text like '%Living hidden%' then
    raise exception 'Private family information leaked';
  end if;
  if has_table_privilege('anon', 'public.family_members', 'SELECT') then
    raise exception 'Anonymous base-table access was granted';
  end if;
end $$;

rollback;
