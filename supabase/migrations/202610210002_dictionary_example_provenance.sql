-- Attribute each attested sentence to its own source. A lexeme can have many
-- sources, so its source links cannot establish the origin of one example.
alter table public.examples
  add column source_id uuid references public.sources(id) on delete restrict,
  add column original_transcription text
    check (length(btrim(original_transcription)) between 1 and 2000);

create index examples_source_id_idx on public.examples(source_id)
  where source_id is not null;
