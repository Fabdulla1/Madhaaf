begin;

do $$
declare first_id uuid; second_id uuid; private_id uuid; low_id uuid; high_id uuid; result jsonb;
begin
  insert into public.family_members(preferred_name,living_status,status,visibility)
    values ('Sibling one','deceased','published','public') returning id into first_id;
  insert into public.family_members(preferred_name,living_status,status,visibility)
    values ('Sibling two','deceased','published','public') returning id into second_id;
  insert into public.family_members(preferred_name,living_status,status,visibility)
    values ('Private sibling','deceased','published','private') returning id into private_id;
  low_id := least(first_id,second_id); high_id := greatest(first_id,second_id);
  insert into public.family_relationships(person_a_id,person_b_id,kind,status)
    values (low_id,high_id,'sibling','published');
  insert into public.family_relationships(person_a_id,person_b_id,kind,status)
    values (least(first_id,private_id),greatest(first_id,private_id),'sibling','published');
  begin
    insert into public.family_relationships(person_a_id,person_b_id,kind,status)
      values (high_id,low_id,'sibling','published');
    raise exception 'Reverse sibling direction was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind,status)
      values (low_id,high_id,'sibling','unknown','published');
    raise exception 'Sibling link accepted parentage';
  exception when check_violation then null;
  end;
  update public.family_tree_publication set enabled=true where singleton;
  result := public.get_public_family_tree();
  if jsonb_array_length(result->'members')<>2 or jsonb_array_length(result->'relationships')<>1 then
    raise exception 'Public sibling projection disclosed private data or hid the reviewed link';
  end if;
end $$;

rollback;
