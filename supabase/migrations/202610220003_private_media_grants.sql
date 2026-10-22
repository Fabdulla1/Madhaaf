-- Hosted projects can auto-grant newly created public tables to anon.
-- Keep the private archive inaccessible at the privilege layer as well as RLS.
revoke all on public.media_assets, public.media_details,
  public.media_upload_intents, public.member_media from anon;

-- The archive context is editable through the metadata RPC, not deletable by
-- an ordinary authenticated client.
revoke all on public.media_details from authenticated;
grant select, insert, update on public.media_details to authenticated;

-- Expose only the safe public projection, never view write privileges.
revoke all on public.public_media from anon, authenticated;
grant select on public.public_media to anon, authenticated;
