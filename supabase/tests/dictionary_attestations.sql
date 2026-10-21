-- Structured inflections and cross-linked examples obey publication and RLS.
-- All fixture changes are rolled back.
begin;

insert into auth.users(id) values
  ('33333333-3333-4333-8333-333333333333'),
  ('44444444-4444-4444-8444-444444444444');
insert into public.app_users(user_id, role) values
  ('33333333-3333-4333-8333-333333333333', 'admin'),
  ('44444444-4444-4444-8444-444444444444', 'viewer');

create temporary table attestation_fixture(name text primary key, id uuid not null);
grant select on attestation_fixture to anon, authenticated;
do $$
declare
  kar_id uuid;
  vin_id uuid;
  draft_id uuid;
  kar_sense uuid;
  vin_sense uuid;
  draft_sense uuid;
  vin_example uuid;
  draft_example uuid;
  evidence_source uuid;
begin
  insert into public.sources(title) values ('Test speaker elicitation') returning id into evidence_source;
  insert into public.lexemes(headword) values ('test kar') returning id into kar_id;
  insert into public.lexemes(headword) values ('test vin') returning id into vin_id;
  insert into public.lexemes(headword) values ('test draft') returning id into draft_id;
  insert into public.senses(lexeme_id, gloss_en) values (kar_id, 'do') returning id into kar_sense;
  insert into public.senses(lexeme_id, gloss_en) values (vin_id, 'go') returning id into vin_sense;
  insert into public.senses(lexeme_id, gloss_en) values (draft_id, 'hidden') returning id into draft_sense;
  insert into public.examples(sense_id, kutchi_text, english_translation, source_id, original_transcription)
    values (vin_sense, 'Au(n) test kara(n)tho', 'I do a test', evidence_source, 'Au(n) test karantho') returning id into vin_example;
  if not exists (select 1 from public.examples where id = vin_example
      and source_id = evidence_source and original_transcription = 'Au(n) test karantho') then
    raise exception 'Example source or original transcription was not preserved';
  end if;
  insert into public.examples(sense_id, kutchi_text, english_translation)
    values (draft_sense, 'Hidden attestation', 'Hidden translation') returning id into draft_example;
  insert into public.example_lexemes(example_id, lexeme_id) values
    (vin_example, kar_id), (draft_example, kar_id);
  insert into public.inflected_forms(
    lexeme_id, written_form, grammatical_person, grammatical_number, gender,
    tense, mood, original_transcription, evidence_status
  ) values (
    kar_id, 'test kara(n)tho', 'first', 'singular', 'masculine',
    'present', 'indicative', 'test karantho', 'attested'
  );
  begin
    insert into public.inflected_forms(
      lexeme_id, written_form, grammatical_person, grammatical_number, gender, tense, mood
    ) values (
      kar_id, 'test kara(n)tho', 'first', 'singular', 'masculine', 'present', 'indicative'
    );
    raise exception 'Identical grammatical form was duplicated';
  exception when unique_violation then null;
  end;
  begin
    insert into public.inflected_forms(lexeme_id, written_form, grammatical_person)
      values (kar_id, 'invalid', 'fourth');
    raise exception 'Invalid grammatical person was accepted';
  exception when check_violation then null;
  end;
  insert into public.inflected_forms(lexeme_id, written_form, tense, evidence_status)
    values (draft_id, 'hiddenatho', 'present', 'provisional');
  update public.lexemes set status = 'published' where id in (kar_id, vin_id);
  insert into attestation_fixture(name, id) values
    ('kar', kar_id), ('vin', vin_id), ('draft', draft_id),
    ('vin_example', vin_example), ('draft_example', draft_example);
end $$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare
  kar_id uuid := (select id from attestation_fixture where name = 'kar');
begin
  if (select count(*) from public.inflected_forms) <> 1 then
    raise exception 'Anonymous inflection read exposed a draft or hid a published form';
  end if;
  if (select count(*) from public.example_lexemes where lexeme_id = kar_id) <> 1 then
    raise exception 'Anonymous example link read exposed an unpublished source sentence';
  end if;
  if not exists(select 1 from public.search_dictionary('test kara(n)tho', 24, 0)
      where lexeme_id = kar_id and match_rank = 1) then
    raise exception 'Written inflection did not resolve to published lemma';
  end if;
  if not exists(select 1 from public.search_dictionary('test karantho', 24, 0)
      where lexeme_id = kar_id and match_rank = 2) then
    raise exception 'Original transcription did not resolve to published lemma';
  end if;
  if exists(select 1 from public.search_dictionary('hiddenatho', 24, 0)) then
    raise exception 'Unpublished inflection appeared in public search';
  end if;
  if has_table_privilege('anon', 'public.inflected_forms', 'INSERT') or
     has_table_privilege('anon', 'public.example_lexemes', 'INSERT') then
    raise exception 'Anonymous caller can mutate dictionary attestations';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
do $$
declare draft_id uuid := (select id from attestation_fixture where name = 'draft');
begin
  begin
    insert into public.inflected_forms(lexeme_id, written_form) values (draft_id, 'unauthorized');
    raise exception 'Viewer wrote an inflection';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.example_lexemes(example_id, lexeme_id)
      values ((select id from attestation_fixture where name = 'draft_example'), draft_id);
    raise exception 'Viewer wrote an example link';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
do $$
declare draft_id uuid := (select id from attestation_fixture where name = 'draft');
begin
  insert into public.inflected_forms(lexeme_id, written_form)
    values (draft_id, 'admin draft form');
  insert into public.example_lexemes(example_id, lexeme_id)
    values ((select id from attestation_fixture where name = 'draft_example'), draft_id);
end $$;

reset role;
do $$
declare
  kar_id uuid := (select id from attestation_fixture where name = 'kar');
  vin_id uuid := (select id from attestation_fixture where name = 'vin');
begin
  begin
    update public.inflected_forms set note = 'changed' where lexeme_id = kar_id;
    raise exception 'Published inflection edit was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.inflected_forms(lexeme_id, written_form) values (kar_id, 'new form');
    raise exception 'Published inflection insert was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.example_lexemes(example_id, lexeme_id)
      values ((select id from attestation_fixture where name = 'vin_example'), vin_id);
    raise exception 'Published example link insert was accepted';
  exception when check_violation then null;
  end;
  update public.lexemes set status = 'draft' where id = vin_id;
  begin
    update public.examples set kutchi_text = 'changed'
      where id = (select id from attestation_fixture where name = 'vin_example');
    raise exception 'Published cross-link did not protect source example';
  exception when check_violation then null;
  end;
end $$;

rollback;
