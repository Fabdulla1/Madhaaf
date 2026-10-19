-- Run after bootstrap.sql and the migration, inside a rollback-only transaction.
begin;
insert into auth.users(id) values ('11111111-1111-1111-1111-111111111111');
insert into public.app_users(user_id, role) values ('11111111-1111-1111-1111-111111111111','admin');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
do $$ declare a uuid; b uuid; c uuid; count_words integer; public_asset uuid; private_asset uuid; family_asset uuid; portrait_asset uuid; entry uuid; draft_entry uuid; connected jsonb; published_article_id uuid; draft_article uuid; citation_source_id uuid; begin
  if not public.is_admin() then raise exception 'Admin role not recognized'; end if;
  select count(*) into count_words from public.lexemes where status='published';
  if count_words <> 6 then raise exception 'Expected six seeded entries, found %', count_words; end if;
  if not exists(select 1 from public.word_forms where spelling='ku''la') then raise exception 'Apostrophe spelling changed'; end if;
  select id into entry from public.lexemes where headword='maa';
  begin
    insert into public.word_forms(lexeme_id,spelling) values(entry,'changed while public');
    raise exception 'Published lexeme child edit was accepted';
  exception when check_violation then null;
  end;
  begin
    update public.lexemes set headword='maa corrected' where id=entry;
    raise exception 'Published headword edit was accepted';
  exception when check_violation then null;
  end;
  update public.lexemes set status='draft' where id=entry;
  update public.lexemes set headword='maa corrected' where id=entry;
  if not exists(select 1 from public.word_forms where lexeme_id=entry and spelling='maa corrected' and is_preferred) then
    raise exception 'Preferred form did not follow corrected headword';
  end if;
  if not exists(select 1 from public.word_forms where lexeme_id=entry and spelling='maa' and not is_preferred) then
    raise exception 'Former preferred spelling was lost';
  end if;
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,consent_confirmed,public_approved)
    values('audio','public.mp3','audio/mpeg',10,'public.mp3',true,true) returning id into public_asset;
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,consent_confirmed,public_approved)
    values('audio','private.mp3','audio/mpeg',10,'private.mp3',true,true) returning id into private_asset;
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,consent_confirmed,public_approved)
    values('audio','family-shared.mp3','audio/mpeg',10,'family-shared.mp3',true,true) returning id into family_asset;
  insert into public.media_assets(kind,storage_path,mime_type,bytes,original_name,alt_text,consent_confirmed,public_approved)
    values('image','portrait-shared.png','image/png',10,'portrait-shared.png','Portrait used in the private family tree',true,true) returning id into portrait_asset;
  insert into public.lexeme_media(lexeme_id,media_id,purpose) values(entry,public_asset,'pronunciation');
  insert into public.lexeme_media(lexeme_id,media_id,purpose) values(entry,family_asset,'other');
  insert into public.lexeme_media(lexeme_id,media_id,purpose) values(entry,portrait_asset,'other');
  update public.lexemes set status='published' where id=entry;
  insert into public.lexemes(headword) values('Draft test only') returning id into draft_entry;
  begin
    update public.word_forms set lexeme_id=draft_entry where lexeme_id=entry and spelling='maa';
    raise exception 'Published form was reparented to a draft entry';
  exception when check_violation then null;
  end;
  insert into public.sources(title,citation,notes) values('Test source','Test citation','Private editorial note') returning id into citation_source_id;
  insert into public.articles(slug,title) values('old-test-slug','Test history') returning id into published_article_id;
  insert into public.article_sources(article_id,source_id) values(published_article_id,citation_source_id);
  insert into public.article_media(article_id,media_id) values(published_article_id,public_asset);
  update public.articles set slug='new-test-slug' where id=published_article_id;
  update public.articles set status='published',published_at=now() where id=published_article_id;
  insert into public.articles(slug,title) values('draft-test-slug','Draft article') returning id into draft_article;
  begin
    update public.article_sources set article_id=draft_article where article_id=published_article_id and source_id=citation_source_id;
    raise exception 'Published citation was reparented to a draft article';
  exception when check_violation then null;
  end;
  begin
    update public.articles set title='Changed while published' where id=published_article_id;
    raise exception 'Published article field edit was accepted';
  exception when check_violation then null;
  end;
  insert into storage.objects(bucket_id,name) values('heritage-media','public.mp3'),('heritage-media','private.mp3'),('heritage-media','family-shared.mp3'),('heritage-media','portrait-shared.png');
  insert into public.family_members(preferred_name,portrait_media_id) values ('Test A',portrait_asset) returning id into a;
  insert into public.member_media(member_id,media_id) values(a,family_asset);
  insert into public.family_members(preferred_name) values ('Test B') returning id into b;
  insert into public.family_members(preferred_name) values ('Test C') returning id into c;
  insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind)
    values(a,b,'parent','unknown'),(b,c,'parent','adoptive');
  begin
    insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind)
      values(a,a,'parent','unknown');
    raise exception 'Self relationship was accepted';
  exception when check_violation then null;
  end;
  select public.create_connected_member(
    '{"preferred_name":"Test D","biography":"A draft biography"}'::jsonb,
    c,'b','parent','unknown','uncertain',null,'draft'
  ) into connected;
  if connected->'member'->>'preferred_name' <> 'Test D' then raise exception 'Atomic member creation failed'; end if;
  begin
    insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind)
      values(c,a,'parent','unknown');
    raise exception 'Cycle was accepted';
  exception when check_violation then null;
  end;
  if not exists(select 1 from public.family_members where id=a) then raise exception 'Admin cannot read family member'; end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  if has_table_privilege('anon','public.family_members','SELECT') then raise exception 'Anonymous family SELECT granted'; end if;
  if has_table_privilege('anon','public.family_members','INSERT') then raise exception 'Anonymous family INSERT granted'; end if;
  if has_function_privilege('anon',
    'public.create_connected_member(jsonb,uuid,text,public.relationship_kind,public.parent_kind,public.evidence_confidence,text,public.editorial_status)',
    'EXECUTE') then raise exception 'Anonymous connected-member mutation granted'; end if;
  if (select count(*) from public.lexemes) <> 6 then raise exception 'Published lexemes inaccessible'; end if;
  if not exists(select 1 from public.search_dictionary('ku''la',24,0) where match_rank=0) then raise exception 'Exact punctuation search failed'; end if;
  if (select count(*) from public.media_assets) <> 1 then raise exception 'Public media policy leaked or hid asset'; end if;
  if (select count(*) from storage.objects) <> 1 then raise exception 'Storage policy leaked or hid object'; end if;
  if not exists(select 1 from public.article_slug_history where slug='old-test-slug') then raise exception 'Article slug history unavailable'; end if;
  if not exists(select 1 from public.published_article_sources where title='Test source' and citation='Test citation') then raise exception 'Published citation unavailable'; end if;
end $$;
rollback;
