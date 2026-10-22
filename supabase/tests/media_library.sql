-- Real PostgreSQL role checks for private context, publication and atomic uploads.
begin;
insert into auth.users(id) values
  ('66666666-6666-4666-8666-666666666666'),
  ('77777777-7777-4777-8777-777777777777'),
  ('88888888-8888-4888-8888-888888888888');
insert into public.app_users(user_id,role) values
  ('66666666-6666-4666-8666-666666666666','admin'),
  ('77777777-7777-4777-8777-777777777777','admin'),
  ('88888888-8888-4888-8888-888888888888','viewer');
create temporary table media_test_ids(name text primary key,id uuid not null);
grant select,insert,update on media_test_ids to authenticated,service_role;
with inserted as (insert into public.family_members(preferred_name,living_status) values('Private living speaker','living') returning id)
insert into media_test_ids select 'person',id from inserted;
with inserted as (insert into public.family_members(preferred_name,living_status) values('Archived during upload','living') returning id)
insert into media_test_ids select 'changed-person',id from inserted;
with inserted as (insert into public.articles(slug,title) values('media-story','Media story') returning id)
insert into media_test_ids select 'article',id from inserted;
with inserted as (insert into public.articles(slug,title) values('changed-during-upload','Changed during upload') returning id)
insert into media_test_ids select 'changed-article',id from inserted;
with inserted as (insert into public.articles(slug,title,status) values('archived-media-story','Archived story','archived') returning id)
insert into media_test_ids select 'archived-article',id from inserted;
with inserted as (
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,created_by)
  values('image','former-creator.png','image/png',10,'former-creator.png','77777777-7777-4777-8777-777777777777') returning id)
insert into media_test_ids select 'former-creator',id from inserted;

set local role authenticated;
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
do $$ declare intent uuid; before_count integer; begin
  select count(*) into before_count from public.media_upload_intents;
  begin
    insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
    values('10000000-0000-4000-8000-000000000000.mp4','video/mp4',10,'video.mp4',auth.uid(),'{}');
    raise exception 'Context-free upload was accepted';
  exception when check_violation then null; end;
  begin
    insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
    values('10000000-0000-4000-8000-000000000000.mp4','video/mp4',10,'video.mp4',auth.uid(),
      '{"title":"Video","subject_description":"A community event","consent_confirmed":false}');
    raise exception 'Upload without storage consent was accepted';
  exception when check_violation then null; end;
  begin
    insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
    values('10000000-0000-4000-8000-000000000000.mp4','video/mp4',50000001,'video.mp4',auth.uid(),
      '{"title":"Video","subject_description":"A community event","consent_confirmed":true}');
    raise exception 'Oversized video upload was accepted';
  exception when check_violation then null; end;
  if (select count(*) from public.media_upload_intents) <> before_count then raise exception 'Invalid uploads left intent rows'; end if;
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
  values('10000000-0000-4000-8000-000000000001.mp4','video/mp4',50000000,'video-private-name.mp4',auth.uid(),
    jsonb_build_object('title','Private title','subject_description','Private subject','location','Private location',
      'captured_on','2026-10-22','consent_confirmed',true,'article_id',(select id from media_test_ids where name='article')))
  returning id into intent;
  insert into media_test_ids values('video-intent',intent);
  insert into storage.objects(bucket_id,name) values('heritage-media','10000000-0000-4000-8000-000000000001.mp4');
  begin
    update public.media_upload_intents set payload=jsonb_set(payload,'{title}','"Changed after ticket"') where id=intent;
    raise exception 'Upload payload was mutable';
  exception when check_violation then null; end;
  begin
    update public.media_upload_intents set consumed_at=now() where id=intent;
    raise exception 'Client finalized an unverified upload';
  exception when insufficient_privilege then null; end;
  begin
    perform public.finalize_media_upload(intent,auth.uid());
    raise exception 'Client bypassed file verification';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name)
    values('video','unverified.mp4','video/mp4',10,'unverified.mp4');
    raise exception 'Client inserted an unverified asset directly';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects(bucket_id,name) values('heritage-media','not-an-upload-intent.mp4');
    raise exception 'Unbound storage upload was accepted';
  exception when insufficient_privilege then null; end;
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
  values('10000000-0000-4000-8000-000000000002.png','image/png',10000000,'family.png',auth.uid(),
    jsonb_build_object('title','Family picture','subject_description','Living speaker','alt_text','A speaker',
      'consent_confirmed',true,'member_ids',jsonb_build_array((select id from media_test_ids where name='person'))))
  returning id into intent;
  insert into media_test_ids values('family-intent',intent);
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
  values('10000000-0000-4000-8000-000000000003.mp3','audio/mpeg',25000000,'word.mp3',auth.uid(),
    '{"title":"Pronunciation","subject_description":"Word recording","consent_confirmed":true}') returning id into intent;
  insert into media_test_ids values('dictionary-intent',intent);
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload,expires_at)
  values('10000000-0000-4000-8000-000000000004.webm','video/webm',10,'expired.webm',auth.uid(),
    '{"title":"Expired","subject_description":"An expired recording","consent_confirmed":true}',now()-interval '1 second') returning id into intent;
  insert into media_test_ids values('expired-intent',intent);
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
  values('10000000-0000-4000-8000-000000000005.webm','video/webm',10,'changed.webm',auth.uid(),
    jsonb_build_object('title','Changed article','subject_description','Target is no longer a draft','consent_confirmed',true,
      'article_id',(select id from media_test_ids where name='changed-article'))) returning id into intent;
  insert into media_test_ids values('changed-intent',intent);
  update public.articles set status='published',published_at=now() where id=(select id from media_test_ids where name='changed-article');
  insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by,payload)
  values('10000000-0000-4000-8000-000000000006.png','image/png',10,'changed-person.png',auth.uid(),
    jsonb_build_object('title','Changed person','subject_description','Person archived during upload','consent_confirmed',true,
      'member_ids',jsonb_build_array((select id from media_test_ids where name='changed-person')))) returning id into intent;
  insert into media_test_ids values('changed-person-intent',intent);
  update public.family_members set status='archived' where id=(select id from media_test_ids where name='changed-person');
end $$;

reset role;
set local role service_role;
do $$ declare intent uuid; asset uuid; before_count integer; begin
  select id into intent from media_test_ids where name='video-intent';
  begin
    perform public.finalize_media_upload(intent,'77777777-7777-4777-8777-777777777777');
    raise exception 'Another administrator finalized someone else''s upload';
  exception when insufficient_privilege then null; end;
  begin
    perform public.finalize_media_upload(intent,'88888888-8888-4888-8888-888888888888');
    raise exception 'Viewer actor was accepted';
  exception when insufficient_privilege then null; end;
  asset:=public.finalize_media_upload(intent,'66666666-6666-4666-8666-666666666666');
  insert into media_test_ids values('video',asset);
  if public.finalize_media_upload(intent,'66666666-6666-4666-8666-666666666666')<>asset then
    raise exception 'Finalize retry was not idempotent';
  end if;
  if (select count(*) from public.media_assets where storage_path='10000000-0000-4000-8000-000000000001.mp4')<>1 then
    raise exception 'Finalize retry duplicated asset';
  end if;
  if not exists(select 1 from public.media_details where media_id=asset and title='Private title' and captured_on='2026-10-22')
    or not exists(select 1 from public.article_media where media_id=asset)
    or not exists(select 1 from public.media_upload_intents where id=intent and consumed_at is not null and finalized_media_id=asset) then
    raise exception 'Atomic upload context, attachment, or completion missing';
  end if;
  if (select public_approved from public.media_assets where id=asset) then raise exception 'Upload was public-approved by default'; end if;
  insert into media_test_ids values('family',public.finalize_media_upload((select id from media_test_ids where name='family-intent'),'66666666-6666-4666-8666-666666666666'));
  insert into media_test_ids values('dictionary',public.finalize_media_upload((select id from media_test_ids where name='dictionary-intent'),'66666666-6666-4666-8666-666666666666'));
  select count(*) into before_count from public.media_assets;
  begin
    perform public.finalize_media_upload((select id from media_test_ids where name='expired-intent'),'66666666-6666-4666-8666-666666666666');
    raise exception 'Expired intent finalized';
  exception when check_violation then null; end;
  begin
    perform public.finalize_media_upload((select id from media_test_ids where name='changed-intent'),'66666666-6666-4666-8666-666666666666');
    raise exception 'Upload attached to an article published during upload';
  exception when check_violation then null; end;
  begin
    perform public.finalize_media_upload((select id from media_test_ids where name='changed-person-intent'),'66666666-6666-4666-8666-666666666666');
    raise exception 'Upload attached to a person archived during upload';
  exception when check_violation then null; end;
  if exists(select 1 from public.media_assets where storage_path='10000000-0000-4000-8000-000000000006.png') then
    raise exception 'Failed family attachment retained partial asset/context';
  end if;
  if (select count(*) from public.media_assets)<>before_count
    or exists(select 1 from public.media_upload_intents where id=(select id from media_test_ids where name='changed-intent') and consumed_at is not null) then
    raise exception 'Failed finalization left partial records';
  end if;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
do $$ declare video uuid; family uuid; dictionary uuid; word uuid; revision integer; begin
  select id into video from media_test_ids where name='video';
  select id into family from media_test_ids where name='family';
  select id into dictionary from media_test_ids where name='dictionary';
  begin
    update public.media_assets set storage_path='replacement.mp4' where id=video;
    raise exception 'Validated original identity could be replaced';
  exception when check_violation then null; end;
  begin
    update public.media_assets set created_by=null where id=(select id from media_test_ids where name='former-creator');
    raise exception 'Existing creator attribution could be removed';
  exception when check_violation then null; end;
  begin
    update public.media_assets set created_by=auth.uid() where id=(select id from media_test_ids where name='former-creator');
    raise exception 'Existing creator attribution could be reassigned';
  exception when check_violation then null; end;
  update storage.objects set name='replacement.mp4' where name='10000000-0000-4000-8000-000000000001.mp4';
  if found then raise exception 'Validated storage object could be overwritten'; end if;
  begin
    insert into public.article_media(article_id,media_id) values((select id from media_test_ids where name='article'),family);
    raise exception 'Private family media attached to a story';
  exception when check_violation then null; end;
  begin
    insert into public.article_media(article_id,media_id) values((select id from media_test_ids where name='archived-article'),dictionary);
    raise exception 'Media attached to an archived article';
  exception when check_violation then null; end;
  insert into public.lexemes(headword) values('media-policy-word') returning id into word;
  insert into public.senses(lexeme_id,gloss_en) values(word,'test');
  insert into public.lexeme_media(lexeme_id,media_id,purpose) values(word,dictionary,'pronunciation');
  update public.lexemes set status='published' where id=word;
  if public.is_public_media(dictionary) then raise exception 'Dictionary publication exposed original'; end if;
  begin
    perform public.update_media_metadata(dictionary,1,'{"title":"Must roll back","public_approved":true}');
    raise exception 'Dictionary-only asset received public approval';
  exception when check_violation then null; end;
  if (select title from public.media_details where media_id=dictionary)<>'Pronunciation' then
    raise exception 'Failed approval retained a partial context update';
  end if;
  select version into revision from public.media_assets where id=video;
  perform public.update_media_metadata(video,revision,'{"title":"Corrected private title","caption":"Public caption"}');
  begin
    perform public.update_media_metadata(video,revision,'{"caption":"Stale change"}');
    raise exception 'Stale metadata edit was accepted';
  exception when serialization_failure then null; end;
  if (select title from public.media_details where media_id=video)<>'Corrected private title' then raise exception 'Private context update missing'; end if;
  select version into revision from public.media_assets where id=video;
  perform public.update_media_metadata(video,revision,'{"public_approved":true}');
  if public.is_public_media(video) then raise exception 'Draft story exposed an approved asset'; end if;
  begin
    insert into public.member_media(member_id,media_id) values((select id from media_test_ids where name='person'),video);
    raise exception 'Approved asset silently became a family attachment';
  exception when check_violation then null; end;
  update public.articles set status='published',published_at=now() where id=(select id from media_test_ids where name='article');
  if not public.is_public_media(video) then raise exception 'Explicitly published video inaccessible'; end if;
  update public.articles set status='draft' where id=(select id from media_test_ids where name='article');
  if public.is_public_media(video) then raise exception 'Unpublished story retained public media access'; end if;
  update public.articles set status='published' where id=(select id from media_test_ids where name='article');
  select version into revision from public.media_assets where id=video;
  perform public.update_media_metadata(video,revision,'{"consent_confirmed":false}');
  if public.is_public_media(video) or (select public_approved from public.media_assets where id=video) then raise exception 'Consent revocation did not remove public approval/access'; end if;
  select version into revision from public.media_assets where id=video;
  perform public.update_media_metadata(video,revision,'{"consent_confirmed":true,"public_approved":true}');
end $$;

reset role;
delete from auth.users where id='77777777-7777-4777-8777-777777777777';
do $$ begin
  if not exists(select 1 from public.media_assets where id=(select id from media_test_ids where name='former-creator') and created_by is null) then
    raise exception 'Deleting an account did not preserve its media and clear the creator reference';
  end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare visible jsonb; begin
  if has_table_privilege('anon','public.media_assets','SELECT') or has_table_privilege('anon','public.media_details','SELECT')
    or has_table_privilege('anon','public.media_upload_intents','SELECT') then raise exception 'Private base-table grants exposed'; end if;
  if has_function_privilege('anon','public.finalize_media_upload(uuid,uuid)','EXECUTE') then raise exception 'Anonymous finalization granted'; end if;
  if (select count(*) from storage.objects)<>0 then raise exception 'Anonymous storage access allows independent signed links'; end if;
  if (select count(*) from public.public_media)<>1 then raise exception 'Public media view leaked or hid assets'; end if;
  select to_jsonb(p) into visible from public.public_media p limit 1;
  if visible ?| array['storage_path','original_name','created_by','title','subject_description','location','captured_on'] then
    raise exception 'Public projection includes private metadata';
  end if;
  if (select count(*) from public.lexeme_media)<>0 then raise exception 'Private dictionary attachment ID leaked'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','88888888-8888-4888-8888-888888888888',true);
do $$ begin
  if (select count(*) from public.media_assets)<>0 or (select count(*) from public.media_details)<>0
    or (select count(*) from public.media_upload_intents)<>0 then raise exception 'Viewer can read private media context'; end if;
  if (select count(*) from public.public_media)<>1 then raise exception 'Viewer public projection differs'; end if;
  begin
    perform public.update_media_metadata(gen_random_uuid(),1,'{"caption":"Unauthorized"}');
    raise exception 'Viewer changed media metadata';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
