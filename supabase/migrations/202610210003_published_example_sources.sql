-- A source attached only to a published example is still public bibliographic
-- evidence. Expose the title and citation, never the editorial source notes.
create or replace view public.published_sources with (security_barrier = true) as
select distinct s.id, s.title, s.citation, s.url
from public.sources s
where exists (
  select 1 from public.article_sources x join public.articles a on a.id = x.article_id
  where x.source_id = s.id and a.status = 'published'
) or exists (
  select 1 from public.lexeme_sources x join public.lexemes l on l.id = x.lexeme_id
  where x.source_id = s.id and l.status = 'published'
) or exists (
  select 1 from public.examples e
    join public.senses se on se.id = e.sense_id
    join public.lexemes l on l.id = se.lexeme_id
  where e.source_id = s.id and l.status = 'published'
);
