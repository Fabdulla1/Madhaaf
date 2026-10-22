-- Legacy originals remain editable/revocable, while new uploads use lower caps.
begin;
-- Old approved media has no new context yet; account deletion must still work.
delete from auth.users where id='99999999-9999-4999-8999-999999999998';
do $$ begin
  if not exists(select 1 from public.media_assets where storage_path='legacy-large-image.png' and created_by is null and public_approved) then
    raise exception 'Deleting a legacy creator failed to preserve its approved original';
  end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
do $$ declare asset record; begin
  for asset in select id,version from public.media_assets where storage_path in ('legacy-large-image.png','legacy-large-audio.mp3') loop
    perform public.update_media_metadata(asset.id,asset.version,'{"consent_confirmed":false}');
    if (select consent_confirmed or public_approved from public.media_assets where id=asset.id) then
      raise exception 'Historical size prevented consent/public-approval revocation';
    end if;
  end loop;
  if exists(select 1 from public.media_upload_intents where storage_path='99999999-9999-4999-8999-000000000001.png' and expires_at>now()) then
    raise exception 'Legacy pending upload was not expired';
  end if;
end $$;
reset role;
do $$ begin
  begin
    insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name)
    values('image','new-oversize-image.png','image/png',12000000,'new-oversize-image.png');
    raise exception 'New image bypassed stricter upload limit';
  exception when check_violation then null; end;
end $$;
commit;
-- This fixture leaves the database exactly as it was before the upgrade test.
delete from public.media_upload_intents where created_by='99999999-9999-4999-8999-999999999999';
delete from public.media_assets where storage_path in ('legacy-large-image.png','legacy-large-audio.mp3');
delete from public.app_users where user_id='99999999-9999-4999-8999-999999999999';
delete from auth.users where id='99999999-9999-4999-8999-999999999999';
