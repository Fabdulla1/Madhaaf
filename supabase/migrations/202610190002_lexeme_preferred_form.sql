-- A new draft must have a preferred written form before it can be published.
-- Keep the form in the same transaction as the lexeme insert or correction.
create or replace function public.sync_preferred_word_form() returns trigger language plpgsql
set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.word_forms(lexeme_id, spelling, is_preferred)
      values(new.id, new.headword, true);
  elsif new.headword is distinct from old.headword then
    update public.word_forms set is_preferred = false
      where lexeme_id = new.id and is_preferred;
    insert into public.word_forms(lexeme_id, spelling, is_preferred)
      values(new.id, new.headword, true)
      on conflict (lexeme_id, spelling) do update set is_preferred = true;
  end if;
  return new;
end $$;

drop trigger sync_lexeme_headword on public.lexemes;
create trigger sync_lexeme_headword after insert or update of headword on public.lexemes
for each row execute function public.sync_preferred_word_form();

-- Repair drafts created before this trigger existed. Reuse a matching variant
-- when present; leave entries that already have a preferred form untouched.
insert into public.word_forms(lexeme_id, spelling, is_preferred)
select l.id, l.headword, true
from public.lexemes l
where not exists (
  select 1 from public.word_forms f where f.lexeme_id = l.id and f.is_preferred
)
on conflict (lexeme_id, spelling) do update set is_preferred = true;
