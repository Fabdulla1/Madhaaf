-- Keep the cross-linked publication guard while allowing reviewed corrections
-- to draft examples and senses. The original trigger returned OLD for UPDATE,
-- silently discarding allowed changes.
create or replace function public.guard_published_example_crosslink() returns trigger
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
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
