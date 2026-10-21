-- Siblings are direct, symmetric relationships. They do not imply that a
-- particular parent is known, and keep the canonical UUID order like partners.
alter table public.family_relationships drop constraint relationship_shape;
alter table public.family_relationships add constraint relationship_shape check (
  (kind = 'parent' and parent_kind is not null)
  or (kind in ('partner', 'sibling') and parent_kind is null and person_a_id < person_b_id)
);

create or replace function public.create_connected_member(
  new_member jsonb, existing_member_id uuid, new_member_side text,
  relationship_kind public.relationship_kind, parentage public.parent_kind,
  relationship_confidence public.evidence_confidence,
  relationship_note text, relationship_status public.editorial_status
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare person public.family_members%rowtype; edge public.family_relationships%rowtype;
declare aid uuid; bid uuid; swap_id uuid;
begin
  if not public.is_admin() then raise exception 'Unauthorized' using errcode='42501'; end if;
  if new_member_side not in ('a','b') then raise exception 'Invalid side' using errcode='22023'; end if;
  if relationship_kind='parent' and parentage is null then raise exception 'Parent kind required' using errcode='22023'; end if;
  if relationship_kind in ('partner','sibling') and parentage is not null then
    raise exception 'A symmetric relationship cannot have a parent kind' using errcode='22023';
  end if;
  perform 1 from public.family_members where id=existing_member_id;
  if not found then raise exception 'Existing member not found' using errcode='23503'; end if;
  insert into public.family_members(
    preferred_name,birth_date_text,death_date_text,living_status,birthplace,places_lived,
    short_bio,biography,private_notes,portrait_media_id,status,visibility,created_by,updated_by
  ) values (
    new_member->>'preferred_name',new_member->>'birth_date_text',new_member->>'death_date_text',
    coalesce((new_member->>'living_status')::public.living_status,'unknown'),
    new_member->>'birthplace',
    array(select jsonb_array_elements_text(coalesce(new_member->'places_lived','[]'::jsonb))),
    new_member->>'short_bio',new_member->>'biography',new_member->>'private_notes',
    (new_member->>'portrait_media_id')::uuid,
    coalesce((new_member->>'status')::public.editorial_status,'draft'),
    coalesce(new_member->>'visibility','private'),auth.uid(),auth.uid()
  ) returning * into person;
  aid := case when new_member_side='a' then person.id else existing_member_id end;
  bid := case when new_member_side='b' then person.id else existing_member_id end;
  if relationship_kind in ('partner','sibling') and aid > bid then
    swap_id := aid; aid := bid; bid := swap_id;
  end if;
  insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind,confidence,note,status)
  values(aid,bid,relationship_kind,parentage,relationship_confidence,relationship_note,relationship_status)
  returning * into edge;
  return jsonb_build_object('member',to_jsonb(person),'relationship',to_jsonb(edge));
end $$;
