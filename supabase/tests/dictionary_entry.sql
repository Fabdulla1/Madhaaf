begin;
insert into auth.users(id) values ('22222222-2222-4222-8222-222222222222');
insert into public.app_users(user_id, role) values ('22222222-2222-4222-8222-222222222222', 'admin');
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$
declare entry_id uuid; before_count integer;
begin
  select public.create_dictionary_entry('{
    "headword":"test word", "part_of_speech":"verb", "morphology_note":"plural suffix -o",
    "linguistic_tags":["verb","plural"], "gloss_en":"to gather",
    "definition_en":"to bring people together",
    "kutchi_text":"A test sentence", "english_translation":"A translated test sentence"
  }'::jsonb) into entry_id;
  if (select count(*) from public.word_forms where lexeme_id=entry_id and is_preferred) <> 1 then
    raise exception 'Preferred spelling missing or duplicated';
  end if;
  if (select count(*) from public.senses where lexeme_id=entry_id and definition_en='to bring people together') <> 1 then
    raise exception 'First meaning or definition missing';
  end if;
  if (select count(*) from public.examples e join public.senses s on s.id=e.sense_id
      where s.lexeme_id=entry_id and e.english_translation='A translated test sentence') <> 1 then
    raise exception 'Example sentence missing';
  end if;
  update public.lexemes set status='published' where id=entry_id;
  begin
    update public.lexemes set linguistic_tags=array['changed'] where id=entry_id;
    raise exception 'Published linguistic tags could be changed';
  exception when check_violation then null;
  end;
  select count(*) into before_count from public.lexemes;
  begin
    perform public.create_dictionary_entry('{"headword":"incomplete","gloss_en":""}'::jsonb);
    raise exception 'Invalid first meaning was accepted';
  exception when check_violation then null;
  end;
  if (select count(*) from public.lexemes) <> before_count then
    raise exception 'Failed entry left a partial draft';
  end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  if has_function_privilege('anon','public.create_dictionary_entry(jsonb)','EXECUTE') then
    raise exception 'Anonymous dictionary mutation granted';
  end if;
end $$;
rollback;
