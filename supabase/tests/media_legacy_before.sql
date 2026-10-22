-- Upgrade fixture: apply after the video enum but before private_media_library.
insert into auth.users(id) values('99999999-9999-4999-8999-999999999999'),('99999999-9999-4999-8999-999999999998');
insert into public.app_users(user_id,role) values('99999999-9999-4999-8999-999999999999','admin');
insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,alt_text,consent_confirmed,public_approved,created_by)
values('image','legacy-large-image.png','image/png',12000000,'legacy-large-image.png','Existing image',true,true,'99999999-9999-4999-8999-999999999998'),
  ('audio','legacy-large-audio.mp3','audio/mpeg',25500000,'legacy-large-audio.mp3',null,true,true,null);
insert into public.media_upload_intents(storage_path,mime_type,bytes,original_name,created_by)
values('99999999-9999-4999-8999-000000000001.png','image/png',12000000,'legacy-pending.png','99999999-9999-4999-8999-999999999999');
