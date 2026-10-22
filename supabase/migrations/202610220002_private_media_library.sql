-- Private originals and editorial context are released only through an approved
-- article. Family attachments never participate in that public projection.
alter table public.media_assets drop constraint media_assets_bytes_check;
alter table public.media_assets drop constraint media_mime_check;
alter table public.media_assets add constraint media_type_size_check check (
  bytes > 0 and (
    (kind = 'image' and mime_type in ('image/jpeg','image/png','image/webp') and bytes <= 26214400) or
    (kind = 'audio' and mime_type in ('audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav') and bytes <= 26214400) or
    (kind = 'video' and mime_type in ('video/mp4','video/webm') and bytes <= 50000000)
  )
);
-- Preserve historically valid originals so consent can always be revoked.
-- The identity trigger applies today's stricter per-kind limits only on INSERT.
alter table public.media_upload_intents
  add column payload jsonb,
  add column finalized_media_id uuid references public.media_assets(id) on delete restrict;
-- Expire old tickets before installing stricter size limits: even a NOT VALID
-- CHECK applies to UPDATE and could otherwise reject a historically valid row.
update public.media_upload_intents set expires_at = least(expires_at, now())
where consumed_at is null;
alter table public.media_upload_intents drop constraint media_upload_intents_bytes_check;
alter table public.media_upload_intents add constraint media_intent_type_size_check check (
  bytes > 0 and (
    (mime_type in ('image/jpeg','image/png','image/webp') and bytes <= 10000000) or
    (mime_type in ('audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav') and bytes <= 25000000) or
    (mime_type in ('video/mp4','video/webm') and bytes <= 50000000)
  )
) not valid;

create table public.media_details (
  media_id uuid primary key references public.media_assets(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 200),
  subject_description text not null check (length(btrim(subject_description)) between 1 and 2000),
  captured_on date,
  location text check (location is null or length(location) <= 300)
);
alter table public.media_details enable row level security;
create policy admin_media_details on public.media_details for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, insert, update on public.media_details to authenticated;

create function public.validate_media_upload_intent() returns trigger
language plpgsql set search_path = '' as $$
declare field text; member_id_text text; target_article uuid;
begin
  if tg_op = 'UPDATE' then
    if row(new.storage_path,new.mime_type,new.bytes,new.original_name,new.created_by,new.created_at,new.expires_at,new.payload)
      is distinct from row(old.storage_path,old.mime_type,old.bytes,old.original_name,old.created_by,old.created_at,old.expires_at,old.payload) then
      raise exception 'Upload details are immutable; request a new upload' using errcode = '23514';
    end if;
    if current_user not in ('service_role','postgres') and
      row(new.consumed_at,new.finalized_media_id) is distinct from row(old.consumed_at,old.finalized_media_id) then
      raise exception 'Only verified uploads can be finalized' using errcode = '42501';
    end if;
    return new;
  end if;
  if not public.is_admin() or new.created_by is distinct from auth.uid() then
    raise exception 'Administrator upload owner required' using errcode = '42501';
  end if;
  if new.consumed_at is not null or new.finalized_media_id is not null then
    raise exception 'New upload must be unfinished' using errcode = '23514';
  end if;
  if new.storage_path !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|mp3|m4a|ogg|webm|wav|mp4)$'
    or length(btrim(new.original_name)) not between 1 and 255
    or new.expires_at > now() + interval '1 hour' then
    raise exception 'Invalid upload details' using errcode = '23514';
  end if;
  if jsonb_typeof(new.payload) is distinct from 'object'
    or jsonb_typeof(new.payload->'title') is distinct from 'string'
    or length(btrim(new.payload->>'title')) not between 1 and 200
    or jsonb_typeof(new.payload->'subject_description') is distinct from 'string'
    or length(btrim(new.payload->>'subject_description')) not between 1 and 2000
    or new.payload->'consent_confirmed' is distinct from 'true'::jsonb then
    raise exception 'Describe the media and confirm permission to store it before uploading' using errcode = '23514';
  end if;
  if exists(select 1 from jsonb_object_keys(new.payload) k where k not in
    ('title','subject_description','captured_on','location','alt_text','caption','speaker_name','attribution','consent_confirmed','member_ids','article_id')) then
    raise exception 'Unsupported upload metadata' using errcode = '23514';
  end if;
  foreach field in array array['captured_on','location','alt_text','caption','speaker_name','attribution','article_id'] loop
    if new.payload ? field and jsonb_typeof(new.payload->field) not in ('null','string') then
      raise exception 'Invalid metadata field: %', field using errcode = '23514';
    end if;
  end loop;
  if length(coalesce(new.payload->>'location','')) > 300
    or length(coalesce(new.payload->>'alt_text','')) > 500
    or length(coalesce(new.payload->>'caption','')) > 2000
    or length(coalesce(new.payload->>'speaker_name','')) > 200
    or length(coalesce(new.payload->>'attribution','')) > 1000 then
    raise exception 'Media metadata is too long' using errcode = '23514';
  end if;
  if new.payload->>'captured_on' is not null then
    if new.payload->>'captured_on' !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Use a calendar date for the capture date' using errcode = '23514';
    end if;
    perform (new.payload->>'captured_on')::date;
  end if;
  if jsonb_typeof(coalesce(new.payload->'member_ids','[]'::jsonb)) is distinct from 'array' then
    raise exception 'People must be a list' using errcode = '23514';
  end if;
  if jsonb_array_length(coalesce(new.payload->'member_ids','[]'::jsonb)) > 20 then
    raise exception 'Attach at most 20 people per upload' using errcode = '23514';
  end if;
  for member_id_text in select jsonb_array_elements_text(coalesce(new.payload->'member_ids','[]'::jsonb)) loop
    if not exists(select 1 from public.family_members where id = member_id_text::uuid and status <> 'archived') then
      raise exception 'Selected person is unavailable' using errcode = '23514';
    end if;
  end loop;
  target_article := nullif(new.payload->>'article_id','')::uuid;
  if target_article is not null and not exists(select 1 from public.articles where id=target_article and status in ('draft','review')) then
    raise exception 'Choose a draft or review article' using errcode = '23514';
  end if;
  if target_article is not null and jsonb_array_length(coalesce(new.payload->'member_ids','[]'::jsonb)) > 0 then
    raise exception 'Family media stays private; choose people or an article' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger validate_upload_intent before insert or update on public.media_upload_intents
  for each row execute function public.validate_media_upload_intent();

create function public.finalize_media_upload(upload_intent_id uuid, actor_id uuid) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare intent public.media_upload_intents; asset_id uuid; metadata jsonb; selected_person text; selected_article uuid;
begin
  if actor_id is null or not exists(select 1 from public.app_users where user_id=actor_id and role='admin') then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  select * into intent from public.media_upload_intents where id=upload_intent_id and created_by=actor_id for update;
  if not found then raise exception 'Upload unavailable' using errcode = '42501'; end if;
  if intent.finalized_media_id is not null then return intent.finalized_media_id; end if;
  if intent.consumed_at is not null or intent.expires_at <= now() or intent.payload is null then
    raise exception 'Upload request expired or unavailable' using errcode = '23514';
  end if;
  perform set_config('request.jwt.claim.sub', actor_id::text, true);
  metadata := intent.payload;
  selected_article := nullif(metadata->>'article_id','')::uuid;
  if selected_article is not null then
    perform 1 from public.articles where id=selected_article and status in ('draft','review') for update;
    if not found then raise exception 'Choose a draft or review article' using errcode = '23514'; end if;
  end if;
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,alt_text,caption,speaker_name,attribution,consent_confirmed,public_approved,created_by)
  values (split_part(intent.mime_type,'/',1)::public.media_kind,intent.storage_path,intent.mime_type,intent.bytes,intent.original_name,
    nullif(btrim(metadata->>'alt_text'),''),nullif(btrim(metadata->>'caption'),''),nullif(btrim(metadata->>'speaker_name'),''),
    nullif(btrim(metadata->>'attribution'),''),true,false,actor_id) returning id into asset_id;
  insert into public.media_details(media_id,title,subject_description,captured_on,location)
  values(asset_id,btrim(metadata->>'title'),btrim(metadata->>'subject_description'),nullif(metadata->>'captured_on','')::date,nullif(btrim(metadata->>'location'),''));
  for selected_person in select distinct jsonb_array_elements_text(coalesce(metadata->'member_ids','[]'::jsonb)) loop
    perform 1 from public.family_members where id=selected_person::uuid and status <> 'archived' for update;
    if not found then raise exception 'Selected person is unavailable' using errcode='23514'; end if;
    insert into public.member_media(member_id,media_id) values(selected_person::uuid,asset_id);
  end loop;
  if selected_article is not null then
    insert into public.article_media(article_id,media_id) values(selected_article,asset_id);
  end if;
  update public.media_upload_intents set consumed_at=now(),finalized_media_id=asset_id where id=intent.id;
  return asset_id;
end $$;
revoke all on function public.finalize_media_upload(uuid,uuid) from public, anon, authenticated;
grant execute on function public.finalize_media_upload(uuid,uuid) to service_role;
-- The server verifies actual bytes before invoking the service-only finalizer.
revoke insert on public.media_assets from authenticated;
grant usage on schema public, auth to service_role;
grant select on public.app_users to service_role;
grant select, update on public.family_members to service_role;
grant select, update on public.media_upload_intents, public.articles to service_role;
grant select, insert, update on public.media_assets to service_role;
grant select, insert on public.media_details, public.member_media, public.article_media to service_role;

create or replace function public.is_public_media(asset_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.media_assets m
    where m.id=asset_id and m.public_approved and m.consent_confirmed
      and not exists(select 1 from public.member_media mm where mm.media_id=m.id)
      and not exists(select 1 from public.family_members fm where fm.portrait_media_id=m.id)
      and exists(select 1 from public.article_media am join public.articles a on a.id=am.article_id
        where am.media_id=m.id and a.status='published'));
$$;
drop policy public_media_metadata on public.media_assets;
revoke select on public.media_assets from anon;
create view public.public_media with (security_barrier = true) as
select m.id,m.kind,m.mime_type,m.bytes,m.alt_text,m.caption,m.speaker_name,m.attribution
from public.media_assets m where public.is_public_media(m.id);
grant select on public.public_media to anon, authenticated;

drop policy approved_storage_select on storage.objects;
drop policy admin_storage_update on storage.objects;
drop policy admin_storage_insert on storage.objects;
create policy admin_storage_insert on storage.objects for insert to authenticated
with check(bucket_id='heritage-media' and (select public.is_admin()) and exists(
  select 1 from public.media_upload_intents i where i.storage_path=name and i.created_by=(select auth.uid())
    and i.consumed_at is null and i.expires_at>now() and i.payload is not null));
update storage.buckets set public=false, file_size_limit=50000000,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav','video/mp4','video/webm']
where id='heritage-media';

create function public.guard_media_approval() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Existing approved originals may predate required context. Allow unrelated
  -- metadata/FK maintenance, but validate every new approval or consent/alt change.
  if new.public_approved and (tg_op='INSERT' or not old.public_approved
    or row(new.consent_confirmed,new.alt_text) is distinct from row(old.consent_confirmed,old.alt_text)) then
    if not new.consent_confirmed or (new.kind='image' and length(btrim(coalesce(new.alt_text,'')))=0) then
      raise exception 'Record consent and image alternative text before approving public use' using errcode='23514';
    end if;
    if not exists(select 1 from public.media_details where media_id=new.id)
      or not exists(select 1 from public.article_media where media_id=new.id) then
      raise exception 'Complete media context and attach an article before approving public use' using errcode='23514';
    end if;
    if exists(select 1 from public.member_media where media_id=new.id)
      or exists(select 1 from public.family_members where portrait_media_id=new.id) then
      raise exception 'Family media remains private and cannot be approved for public use' using errcode='23514';
    end if;
  end if;
  return new;
end $$;
create trigger guard_media_approval before insert or update on public.media_assets
  for each row execute function public.guard_media_approval();

create function public.guard_family_media_link() returns trigger
language plpgsql set search_path = '' as $$
declare asset_id uuid;
begin
  if tg_table_name='family_members' then
    asset_id:=new.portrait_media_id;
    if tg_op='UPDATE' and new.portrait_media_id is not distinct from old.portrait_media_id then return new; end if;
  else
    asset_id:=new.media_id;
  end if;
  perform 1 from public.media_assets where id=asset_id for update;
  if exists(select 1 from public.media_assets where id=asset_id and public_approved) then
    raise exception 'Revoke public approval before attaching media to a family member' using errcode='23514';
  end if;
  return new;
end $$;
create trigger guard_member_media_privacy before insert or update on public.member_media
  for each row execute function public.guard_family_media_link();
create trigger guard_portrait_media_privacy before insert or update of portrait_media_id on public.family_members
  for each row execute function public.guard_family_media_link();

create function public.guard_article_media_privacy() returns trigger
language plpgsql set search_path = '' as $$
begin
  perform 1 from public.articles where id=new.article_id and status in ('draft','review') for update;
  if not found then
    raise exception 'Choose a draft or review article' using errcode='23514';
  end if;
  perform 1 from public.media_assets where id=new.media_id for update;
  if exists(select 1 from public.member_media where media_id=new.media_id)
    or exists(select 1 from public.family_members where portrait_media_id=new.media_id) then
    raise exception 'Family media stays private and cannot be attached to a public story' using errcode='23514';
  end if;
  return new;
end $$;
create trigger guard_article_media_privacy before insert or update on public.article_media
  for each row execute function public.guard_article_media_privacy();

create or replace function public.validate_article_edit() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (old.status='published' or new.status='published') and
    row(new.slug,new.title,new.summary,new.body_markdown) is distinct from row(old.slug,old.title,old.summary,old.body_markdown) then
    raise exception 'Move the article to draft before editing published content' using errcode='23514';
  end if;
  if new.status='published' and old.status is distinct from 'published' and exists(
    select 1 from public.article_media am join public.media_assets m on m.id=am.media_id
    where am.article_id=new.id and (
      not (m.consent_confirmed and m.public_approved)
      or exists(select 1 from public.member_media where media_id=m.id)
      or exists(select 1 from public.family_members where portrait_media_id=m.id)
      or not exists(select 1 from public.media_details where media_id=m.id))) then
    raise exception 'Approve each attachment for this story; family media must stay private' using errcode='23514';
  end if;
  return new;
end $$;

create or replace function public.validate_lexeme_publication() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op='UPDATE' and (old.status='published' or new.status='published') and
    row(new.headword,new.part_of_speech,new.usage_note,new.etymology_note,new.orthography_version_id)
      is distinct from row(old.headword,old.part_of_speech,old.usage_note,old.etymology_note,old.orthography_version_id) then
    raise exception 'Move the entry to draft before editing its published fields' using errcode='23514';
  end if;
  if new.status='published' then
    if tg_op='INSERT' then raise exception 'Create a draft entry before publishing' using errcode='23514'; end if;
    if old.status is distinct from 'published' and (
      not exists(select 1 from public.word_forms where lexeme_id=new.id and is_preferred)
      or not exists(select 1 from public.senses where lexeme_id=new.id)) then
      raise exception 'A published entry needs a preferred spelling and at least one meaning' using errcode='23514';
    end if;
  end if;
  -- Dictionary publication never releases attached originals publicly.
  return new;
end $$;

create function public.update_media_metadata(asset_id uuid, expected_version integer, changes jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare asset public.media_assets; details public.media_details; field text;
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
  if jsonb_typeof(changes) is distinct from 'object' or changes='{}'::jsonb
    or exists(select 1 from jsonb_object_keys(changes) k where k not in
      ('title','subject_description','captured_on','location','alt_text','caption','speaker_name','attribution','consent_confirmed','public_approved')) then
    raise exception 'Invalid media changes' using errcode='23514';
  end if;
  select * into asset from public.media_assets where id=asset_id for update;
  if not found or asset.version is distinct from expected_version then
    raise exception 'Record changed since you opened it, or no longer exists' using errcode='40001';
  end if;
  foreach field in array array['title','subject_description','captured_on','location','alt_text','caption','speaker_name','attribution'] loop
    if changes ? field and jsonb_typeof(changes->field) not in ('string','null') then
      raise exception 'Invalid media field: %',field using errcode='23514';
    end if;
  end loop;
  foreach field in array array['consent_confirmed','public_approved'] loop
    if changes ? field and jsonb_typeof(changes->field) is distinct from 'boolean' then
      raise exception 'Invalid media field: %',field using errcode='23514';
    end if;
  end loop;
  if length(coalesce(changes->>'alt_text',''))>500 or length(coalesce(changes->>'caption',''))>2000
    or length(coalesce(changes->>'speaker_name',''))>200 or length(coalesce(changes->>'attribution',''))>1000 then
    raise exception 'Media metadata is too long' using errcode='23514';
  end if;
  select * into details from public.media_details where media_id=asset_id;
  if changes ?| array['title','subject_description','captured_on','location'] then
    if changes->>'captured_on' is not null and changes->>'captured_on' !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Use a calendar date for the capture date' using errcode='23514';
    end if;
    insert into public.media_details(media_id,title,subject_description,captured_on,location)
    values(asset_id,
      case when changes ? 'title' then btrim(changes->>'title') else details.title end,
      case when changes ? 'subject_description' then btrim(changes->>'subject_description') else details.subject_description end,
      case when changes ? 'captured_on' then nullif(changes->>'captured_on','')::date else details.captured_on end,
      case when changes ? 'location' then nullif(btrim(changes->>'location'),'') else details.location end)
    on conflict(media_id) do update set title=excluded.title,subject_description=excluded.subject_description,captured_on=excluded.captured_on,location=excluded.location;
  end if;
  update public.media_assets set
    alt_text=case when changes ? 'alt_text' then nullif(btrim(changes->>'alt_text'),'') else alt_text end,
    caption=case when changes ? 'caption' then nullif(btrim(changes->>'caption'),'') else caption end,
    speaker_name=case when changes ? 'speaker_name' then nullif(btrim(changes->>'speaker_name'),'') else speaker_name end,
    attribution=case when changes ? 'attribution' then nullif(btrim(changes->>'attribution'),'') else attribution end,
    consent_confirmed=coalesce((changes->>'consent_confirmed')::boolean,consent_confirmed),
    public_approved=case when changes->'consent_confirmed'='false'::jsonb then false else coalesce((changes->>'public_approved')::boolean,public_approved) end
  where id=asset_id;
  return asset_id;
end $$;
revoke all on function public.update_media_metadata(uuid,integer,jsonb) from public;
grant execute on function public.update_media_metadata(uuid,integer,jsonb) to authenticated;

-- A validated original cannot be replaced by changing its database pointer.
create function public.guard_media_identity() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='INSERT' then
    if (new.kind='image' and new.bytes>10000000) or (new.kind='audio' and new.bytes>25000000)
      or (new.kind='video' and new.bytes>50000000) then
      raise exception 'File exceeds the upload limit for this media type' using errcode='23514';
    end if;
    return new;
  end if;
  if row(new.id,new.kind,new.storage_path,new.mime_type,new.bytes,new.original_name,new.created_at)
    is distinct from row(old.id,old.kind,old.storage_path,old.mime_type,old.bytes,old.original_name,old.created_at) then
    raise exception 'Original file identity is immutable; upload a new file' using errcode='23514';
  end if;
  -- Honor ON DELETE SET NULL without allowing administrators to rewrite provenance.
  -- The definer reads auth.users without granting clients access to that table.
  if new.created_by is distinct from old.created_by and not (
    new.created_by is null and old.created_by is not null
    and not exists(select 1 from auth.users where id=old.created_by)) then
    raise exception 'Original file creator is immutable' using errcode='23514';
  end if;
  return new;
end $$;
create trigger guard_media_identity before insert or update on public.media_assets
  for each row execute function public.guard_media_identity();

-- Public association rows must not disclose IDs of private attachments.
drop policy public_article_media on public.article_media;
create policy public_article_media on public.article_media for select to anon, authenticated using (
  public.is_public_media(media_id) and exists(select 1 from public.articles where id=article_id and status='published'));
drop policy public_lexeme_media on public.lexeme_media;
create policy public_lexeme_media on public.lexeme_media for select to anon, authenticated using (
  public.is_public_media(media_id) and exists(select 1 from public.lexemes where id=lexeme_id and status='published'));
drop policy public_example_media on public.example_media;
create policy public_example_media on public.example_media for select to anon, authenticated using (
  public.is_public_media(media_id) and exists(select 1 from public.examples e join public.senses s on s.id=e.sense_id
    join public.lexemes l on l.id=s.lexeme_id where e.id=example_id and l.status='published'));

-- Serialize publication against attachment/reference edits on that article.
create or replace function public.guard_published_article_child() returns trigger
language plpgsql set search_path = '' as $$
declare old_article uuid; new_article uuid;
begin
  if tg_op <> 'INSERT' then old_article:=old.article_id; end if;
  if tg_op <> 'DELETE' then new_article:=new.article_id; end if;
  perform 1 from public.articles where id in (old_article,new_article) order by id for update;
  if exists(select 1 from public.articles where id in (old_article,new_article) and status='published') then
    raise exception 'Move the article to draft before editing attachments or references' using errcode='23514';
  end if;
  return coalesce(new,old);
end $$;
