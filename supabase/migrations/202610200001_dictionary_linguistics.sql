-- Store concise linguistic labels separately from editorial prose.
alter table public.lexemes
  add column morphology_note text,
  add column linguistic_tags text[] not null default '{}';

alter table public.lexemes
  add constraint lexemes_linguistic_tags_limit check (cardinality(linguistic_tags) <= 20);

create function public.guard_published_lexeme_linguistics() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (old.status = 'published' or new.status = 'published') and
    row(old.morphology_note, old.linguistic_tags)
      is distinct from row(new.morphology_note, new.linguistic_tags) then
    raise exception 'Move the entry to draft before editing its published fields' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger guard_lexeme_linguistics before update on public.lexemes
  for each row execute function public.guard_published_lexeme_linguistics();

-- A new entry, its preferred spelling, first meaning, and optional example
-- belong to one transaction so a failed child insert cannot leave a partial draft.
create function public.create_dictionary_entry(input jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  entry_id uuid;
  meaning_id uuid;
  labels text[];
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  labels := array(select pg_catalog.btrim(tag.value)
    from pg_catalog.jsonb_array_elements_text(coalesce(input->'linguistic_tags', '[]'::jsonb)) as tag(value)
    where pg_catalog.btrim(tag.value) <> '');
  insert into public.lexemes (
    headword, part_of_speech, morphology_note, linguistic_tags,
    usage_note, etymology_note, status, created_by
  ) values (
    pg_catalog.btrim(input->>'headword'), nullif(pg_catalog.btrim(input->>'part_of_speech'), ''),
    nullif(pg_catalog.btrim(input->>'morphology_note'), ''), labels,
    nullif(pg_catalog.btrim(input->>'usage_note'), ''),
    nullif(pg_catalog.btrim(input->>'etymology_note'), ''), 'draft', auth.uid()
  ) returning id into entry_id;
  -- sync_lexeme_headword creates the preferred spelling on lexeme INSERT.
  insert into public.senses (lexeme_id, gloss_en, definition_en)
    values (entry_id, pg_catalog.btrim(input->>'gloss_en'),
      nullif(pg_catalog.btrim(input->>'definition_en'), '')) returning id into meaning_id;
  if nullif(pg_catalog.btrim(input->>'kutchi_text'), '') is not null then
    insert into public.examples (sense_id, kutchi_text, english_translation)
      values (meaning_id, pg_catalog.btrim(input->>'kutchi_text'),
        nullif(pg_catalog.btrim(input->>'english_translation'), ''));
  end if;
  return entry_id;
end $$;
revoke all on function public.create_dictionary_entry(jsonb) from public;
grant execute on function public.create_dictionary_entry(jsonb) to authenticated;
