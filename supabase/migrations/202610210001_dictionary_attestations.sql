-- Keep attested inflections distinct from spelling variants. A word can have
-- the same written form in more than one grammatical context.
create table public.inflected_forms (
  id uuid primary key default gen_random_uuid(),
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  written_form text not null check (length(btrim(written_form)) between 1 and 200),
  grammatical_person text check (grammatical_person in ('first', 'second', 'third')),
  grammatical_number text check (grammatical_number in ('singular', 'plural')),
  gender text check (gender in ('masculine', 'feminine')),
  tense text check (tense in ('present', 'past', 'future')),
  aspect text check (length(btrim(aspect)) between 1 and 100),
  mood text check (mood in ('indicative', 'imperative')),
  politeness text check (length(btrim(politeness)) between 1 and 100),
  original_transcription text check (length(btrim(original_transcription)) between 1 and 200),
  evidence_status text not null default 'attested' check (evidence_status in ('attested', 'provisional')),
  source_id uuid references public.sources(id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  constraint inflected_forms_identity unique nulls not distinct (
    lexeme_id, written_form, grammatical_person, grammatical_number,
    gender, tense, aspect, mood, politeness
  )
);
create index inflected_forms_written_idx on public.inflected_forms(lower(written_form));
create index inflected_forms_original_idx on public.inflected_forms(lower(original_transcription))
  where original_transcription is not null;

-- Examples retain their original sense. This link lets one attested sentence
-- appear on other relevant entries without copying or altering that evidence.
create table public.example_lexemes (
  example_id uuid not null references public.examples(id) on delete cascade,
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  primary key (example_id, lexeme_id)
);
create index example_lexemes_lexeme_idx on public.example_lexemes(lexeme_id, example_id);

-- The existing published-child trigger covers the primary sense of an
-- example. These guards also protect additional published entries linked to it.
create function public.guard_published_dictionary_attestation() returns trigger
language plpgsql set search_path = '' as $$
declare
  old_lexeme uuid;
  new_lexeme uuid;
  old_example uuid;
  new_example uuid;
begin
  if tg_table_name = 'inflected_forms' then
    if tg_op <> 'INSERT' then old_lexeme := old.lexeme_id; end if;
    if tg_op <> 'DELETE' then new_lexeme := new.lexeme_id; end if;
  else
    if tg_op <> 'INSERT' then
      old_lexeme := old.lexeme_id;
      old_example := old.example_id;
    end if;
    if tg_op <> 'DELETE' then
      new_lexeme := new.lexeme_id;
      new_example := new.example_id;
    end if;
  end if;

  if exists (select 1 from public.lexemes
      where id in (old_lexeme, new_lexeme) and status = 'published') then
    raise exception 'Unpublish this dictionary entry before editing its details' using errcode = '23514';
  end if;
  if exists (
    select 1 from public.examples e
      join public.senses s on s.id = e.sense_id
      join public.lexemes l on l.id = s.lexeme_id
    where e.id in (old_example, new_example) and l.status = 'published'
  ) then
    raise exception 'Unpublish this dictionary entry before editing its details' using errcode = '23514';
  end if;
  return coalesce(new, old);
end $$;
create trigger guard_inflected_forms before insert or update or delete on public.inflected_forms
  for each row execute function public.guard_published_dictionary_attestation();
create trigger guard_example_lexemes before insert or update or delete on public.example_lexemes
  for each row execute function public.guard_published_dictionary_attestation();

create function public.guard_published_example_crosslink() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'examples' then
    if exists (
      select 1 from public.example_lexemes x
        join public.lexemes l on l.id = x.lexeme_id
      where x.example_id = old.id and l.status = 'published'
    ) then
      raise exception 'Unpublish linked dictionary entries before editing this example' using errcode = '23514';
    end if;
  elsif tg_table_name = 'senses' then
    if exists (
      select 1 from public.examples e
        join public.example_lexemes x on x.example_id = e.id
        join public.lexemes l on l.id = x.lexeme_id
      where e.sense_id = old.id and l.status = 'published'
    ) then
      raise exception 'Unpublish linked dictionary entries before editing this sense' using errcode = '23514';
    end if;
  end if;
  return old;
end $$;
create trigger guard_example_crosslinks before update or delete on public.examples
  for each row execute function public.guard_published_example_crosslink();
create trigger guard_sense_crosslinks before update or delete on public.senses
  for each row execute function public.guard_published_example_crosslink();

alter table public.inflected_forms enable row level security;
alter table public.example_lexemes enable row level security;
create policy admin_all on public.inflected_forms for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.example_lexemes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy public_inflected_forms on public.inflected_forms for select to anon, authenticated
  using (exists (select 1 from public.lexemes l where l.id = lexeme_id and l.status = 'published'));
create policy public_example_lexemes on public.example_lexemes for select to anon, authenticated
  using (
    exists (select 1 from public.lexemes l where l.id = lexeme_id and l.status = 'published')
    and exists (
      select 1 from public.examples e
        join public.senses s on s.id = e.sense_id
        join public.lexemes l on l.id = s.lexeme_id
      where e.id = example_id and l.status = 'published'
    )
  );
revoke all on public.inflected_forms, public.example_lexemes from public;
grant select on public.inflected_forms, public.example_lexemes to anon;
grant select, insert, update, delete on public.inflected_forms, public.example_lexemes to authenticated;

-- Search attested forms through their parent lemma. Unpublished lemmas never
-- enter the ranked set, including when a source transcription matches.
create or replace function public.search_dictionary(search_term text, result_limit integer default 24, result_offset integer default 0)
returns table(lexeme_id uuid, match_rank integer, total_count bigint)
language sql stable security invoker set search_path = '' as $$
  with ranked as (
    select l.id, l.headword,
      case
        when pg_catalog.lower(l.headword) = pg_catalog.lower(search_term) or exists (
          select 1 from public.word_forms f where f.lexeme_id = l.id
            and pg_catalog.lower(f.spelling) = pg_catalog.lower(search_term)
        ) then 0
        when exists (
          select 1 from public.inflected_forms f where f.lexeme_id = l.id
            and pg_catalog.lower(f.written_form) = pg_catalog.lower(search_term)
        ) then 1
        when exists (
          select 1 from public.inflected_forms f where f.lexeme_id = l.id
            and pg_catalog.lower(f.original_transcription) = pg_catalog.lower(search_term)
        ) then 2
        when position(pg_catalog.lower(search_term) in pg_catalog.lower(l.headword)) = 1 or exists (
          select 1 from public.word_forms f where f.lexeme_id = l.id
            and position(pg_catalog.lower(search_term) in pg_catalog.lower(f.spelling)) = 1
        ) then 3
        when exists (
          select 1 from public.inflected_forms f where f.lexeme_id = l.id
            and (position(pg_catalog.lower(search_term) in pg_catalog.lower(f.written_form)) = 1
              or position(pg_catalog.lower(search_term) in pg_catalog.lower(f.original_transcription)) = 1)
        ) then 4
        else 5
      end as rank
    from public.lexemes l
    where l.status = 'published' and pg_catalog.length(search_term) between 1 and 100
      and (
        position(pg_catalog.lower(search_term) in pg_catalog.lower(l.headword)) > 0 or
        exists (select 1 from public.word_forms f where f.lexeme_id = l.id
          and position(pg_catalog.lower(search_term) in pg_catalog.lower(f.spelling)) > 0) or
        exists (select 1 from public.inflected_forms f where f.lexeme_id = l.id
          and (position(pg_catalog.lower(search_term) in pg_catalog.lower(f.written_form)) > 0
            or position(pg_catalog.lower(search_term) in pg_catalog.lower(f.original_transcription)) > 0)) or
        exists (select 1 from public.senses s where s.lexeme_id = l.id
          and position(pg_catalog.lower(search_term) in pg_catalog.lower(s.gloss_en)) > 0)
      )
  )
  select id, rank, count(*) over() from ranked
  order by rank, pg_catalog.lower(headword), id
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
$$;
