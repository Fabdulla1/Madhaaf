-- Kutchi Roots foundation. Apply with the Supabase CLI; do not run against a live
-- project before taking a database AND independent Storage backup.
create extension if not exists pgcrypto;

create type public.editorial_status as enum ('draft', 'review', 'published', 'archived');
create type public.living_status as enum ('unknown', 'living', 'deceased');
create type public.relationship_kind as enum ('parent', 'partner');
create type public.parent_kind as enum ('biological', 'adoptive', 'unknown');
create type public.evidence_confidence as enum ('confirmed', 'uncertain', 'disputed');
create type public.media_kind as enum ('image', 'audio');

create table public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

-- No signup trigger: administrators are granted explicitly by an operator.
create function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.app_users where user_id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create function public.touch_record() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.version := old.version + 1;
  return new;
end $$;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 300),
  citation text,
  url text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null,
  storage_path text not null unique check (storage_path !~ '(^/|\.\.)'),
  mime_type text not null,
  bytes bigint not null check (bytes > 0 and bytes <= 26214400),
  original_name text not null,
  alt_text text,
  caption text,
  speaker_name text,
  attribution text,
  consent_confirmed boolean not null default false,
  public_approved boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint media_mime_check check (
    (kind = 'image' and mime_type in ('image/jpeg','image/png','image/webp')) or
    (kind = 'audio' and mime_type in ('audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav'))
  ),
  constraint public_media_needs_consent check (not public_approved or consent_confirmed)
);
create trigger touch_media before update on public.media_assets for each row execute function public.touch_record();

create table public.media_upload_intents (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  mime_type text not null,
  bytes bigint not null check (bytes > 0 and bytes <= 26214400),
  original_name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  consumed_at timestamptz
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  preferred_name text not null check (length(btrim(preferred_name)) between 1 and 200),
  birth_date_text text,
  death_date_text text,
  living_status public.living_status not null default 'unknown',
  birthplace text,
  places_lived text[] not null default '{}',
  short_bio text,
  biography text,
  private_notes text,
  portrait_media_id uuid references public.media_assets(id) on delete set null,
  status public.editorial_status not null default 'draft',
  visibility text not null default 'private' check (visibility in ('private','family','public')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create index family_members_name_idx on public.family_members using gin (to_tsvector('simple', preferred_name));
create trigger touch_family_members before update on public.family_members for each row execute function public.touch_record();

create table public.member_names (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.family_members(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 200),
  note text,
  unique(member_id, name)
);
create table public.family_relationships (
  id uuid primary key default gen_random_uuid(),
  person_a_id uuid not null references public.family_members(id) on delete restrict,
  person_b_id uuid not null references public.family_members(id) on delete restrict,
  kind public.relationship_kind not null,
  parent_kind public.parent_kind,
  confidence public.evidence_confidence not null default 'uncertain',
  note text,
  status public.editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint no_self_relationship check (person_a_id <> person_b_id),
  constraint relationship_shape check ((kind = 'parent' and parent_kind is not null) or (kind = 'partner' and parent_kind is null and person_a_id < person_b_id)),
  unique(person_a_id, person_b_id, kind)
);
create index family_relationships_b_idx on public.family_relationships(person_b_id);
create trigger touch_relationships before update on public.family_relationships for each row execute function public.touch_record();

create function public.reject_ancestry_cycle() returns trigger language plpgsql
set search_path = '' as $$
declare would_cycle boolean;
begin
  if new.kind <> 'parent' then return new; end if;
  -- Serialize edge writes so two concurrent inserts cannot each miss the
  -- other's uncommitted edge and create a cycle together.
  perform pg_catalog.pg_advisory_xact_lock(73190542);
  -- A parent edge A -> B is invalid if B can already reach A.
  with recursive descendants(id) as (
    select new.person_b_id
    union
    select r.person_b_id from public.family_relationships r
    join descendants d on r.person_a_id = d.id
    where r.kind = 'parent' and r.id is distinct from new.id
  )
  select exists(select 1 from descendants where id = new.person_a_id) into would_cycle;
  if would_cycle then raise exception 'Ancestry cycle is not permitted' using errcode = '23514'; end if;
  return new;
end $$;
create trigger no_ancestry_cycle before insert or update of person_a_id, person_b_id, kind
on public.family_relationships for each row execute function public.reject_ancestry_cycle();

-- One RPC call creates a person and their first edge in a single transaction.
-- Any FK, duplicate, or cycle failure rolls back both inserts.
create function public.create_connected_member(
  new_member jsonb, existing_member_id uuid, new_member_side text,
  relationship_kind public.relationship_kind, parentage public.parent_kind,
  relationship_confidence public.evidence_confidence,
  relationship_note text, relationship_status public.editorial_status
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare person public.family_members%rowtype; edge public.family_relationships%rowtype;
declare aid uuid; bid uuid;
begin
  if not public.is_admin() then raise exception 'Unauthorized' using errcode='42501'; end if;
  if new_member_side not in ('a','b') then raise exception 'Invalid side' using errcode='22023'; end if;
  if relationship_kind='parent' and parentage is null then raise exception 'Parent kind required' using errcode='22023'; end if;
  if relationship_kind='partner' and parentage is not null then raise exception 'Partner cannot have parent kind' using errcode='22023'; end if;
  perform 1 from public.family_members where id=existing_member_id;
  if not found then raise exception 'Existing member not found' using errcode='23503'; end if;
  insert into public.family_members(
    preferred_name,birth_date_text,death_date_text,living_status,birthplace,places_lived,
    short_bio,biography,private_notes,portrait_media_id,status,visibility,created_by,updated_by
  ) values (
    new_member->>'preferred_name',new_member->>'birth_date_text',new_member->>'death_date_text',
    coalesce((new_member->>'living_status')::public.living_status,'unknown'),
    new_member->>'birthplace',
    array(select jsonb_array_elements_text(coalesce(new_member->'places_lived','[]'::jsonb))),
    new_member->>'short_bio',new_member->>'biography',new_member->>'private_notes',
    (new_member->>'portrait_media_id')::uuid,
    coalesce((new_member->>'status')::public.editorial_status,'draft'),
    coalesce(new_member->>'visibility','private'),auth.uid(),auth.uid()
  ) returning * into person;
  aid := case when new_member_side='a' then person.id else existing_member_id end;
  bid := case when new_member_side='b' then person.id else existing_member_id end;
  if relationship_kind='partner' and aid > bid then
    aid := existing_member_id; bid := person.id;
  end if;
  if relationship_kind='partner' and aid > bid then
    aid := person.id; bid := existing_member_id;
  end if;
  insert into public.family_relationships(person_a_id,person_b_id,kind,parent_kind,confidence,note,status)
  values(aid,bid,relationship_kind,parentage,relationship_confidence,relationship_note,relationship_status)
  returning * into edge;
  return jsonb_build_object('member',to_jsonb(person),'relationship',to_jsonb(edge));
end $$;
revoke all on function public.create_connected_member(jsonb,uuid,text,public.relationship_kind,public.parent_kind,public.evidence_confidence,text,public.editorial_status) from public;
grant execute on function public.create_connected_member(jsonb,uuid,text,public.relationship_kind,public.parent_kind,public.evidence_confidence,text,public.editorial_status) to authenticated;

create table public.member_media (
  member_id uuid not null references public.family_members(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  note text,
  primary key(member_id, media_id)
);
create table public.member_sources (
  member_id uuid not null references public.family_members(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  note text,
  primary key(member_id, source_id)
);

create table public.orthography_versions (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  title text not null,
  body_markdown text not null default '',
  status public.editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create trigger touch_orthography before update on public.orthography_versions for each row execute function public.touch_record();

create table public.lexemes (
  id uuid primary key default gen_random_uuid(),
  headword text not null check (length(btrim(headword)) between 1 and 200),
  part_of_speech text,
  usage_note text,
  etymology_note text,
  orthography_version_id uuid references public.orthography_versions(id) on delete set null,
  status public.editorial_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create index lexemes_headword_idx on public.lexemes(lower(headword));
create trigger touch_lexemes before update on public.lexemes for each row execute function public.touch_record();

create function public.validate_lexeme_publication() returns trigger language plpgsql
set search_path = '' as $$
begin
  if tg_op='UPDATE' and (old.status='published' or new.status='published') then
    if row(new.headword,new.part_of_speech,new.usage_note,new.etymology_note,new.orthography_version_id)
      is distinct from row(old.headword,old.part_of_speech,old.usage_note,old.etymology_note,old.orthography_version_id) then
      raise exception 'Move the entry to draft before editing its published fields' using errcode='23514';
    end if;
  end if;
  if new.status='published' then
    if tg_op='INSERT' then
      raise exception 'Create a draft entry and add a preferred spelling and meaning before publishing' using errcode='23514';
    end if;
    if old.status is distinct from 'published' and (
      not exists(select 1 from public.word_forms f where f.lexeme_id=new.id and f.is_preferred)
      or not exists(select 1 from public.senses s where s.lexeme_id=new.id)
    ) then
      raise exception 'A published entry needs a preferred spelling and at least one meaning' using errcode='23514';
    end if;
  end if;
  return new;
end $$;
create trigger validate_lexeme_before_write before insert or update on public.lexemes
for each row execute function public.validate_lexeme_publication();

create table public.word_forms (
  id uuid primary key default gen_random_uuid(),
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  spelling text not null check (length(btrim(spelling)) between 1 and 200),
  is_preferred boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  unique(lexeme_id, spelling)
);
create unique index one_preferred_form_per_lexeme on public.word_forms(lexeme_id) where is_preferred;
create index word_forms_spelling_idx on public.word_forms(lower(spelling));

create table public.senses (
  id uuid primary key default gen_random_uuid(),
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  gloss_en text not null check (length(btrim(gloss_en)) between 1 and 500),
  definition_en text,
  display_order integer not null default 0 check (display_order >= 0),
  unique(lexeme_id, display_order)
);
create index senses_gloss_idx on public.senses using gin (to_tsvector('english', gloss_en));

create table public.examples (
  id uuid primary key default gen_random_uuid(),
  sense_id uuid not null references public.senses(id) on delete cascade,
  kutchi_text text not null check (length(btrim(kutchi_text)) > 0),
  english_translation text,
  note text,
  display_order integer not null default 0 check (display_order >= 0),
  unique(sense_id, display_order)
);
create table public.lexeme_media (
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  purpose text not null check (purpose in ('pronunciation','other')),
  primary key(lexeme_id, media_id)
);
create table public.example_media (
  example_id uuid not null references public.examples(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  primary key(example_id, media_id)
);
create table public.related_lexemes (
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  related_lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  note text,
  primary key(lexeme_id, related_lexeme_id),
  check (lexeme_id <> related_lexeme_id)
);
create table public.lexeme_sources (
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  note text,
  primary key(lexeme_id, source_id)
);

create function public.guard_published_lexeme_child() returns trigger language plpgsql
set search_path = '' as $$
declare target_lexeme uuid;
begin
  if tg_table_name in ('word_forms','senses','lexeme_media','lexeme_sources','related_lexemes') then
    target_lexeme := coalesce(new.lexeme_id,old.lexeme_id);
  elsif tg_table_name='examples' then
    select lexeme_id into target_lexeme from public.senses
      where id=coalesce(new.sense_id,old.sense_id);
  elsif tg_table_name='example_media' then
    select s.lexeme_id into target_lexeme from public.examples e
      join public.senses s on s.id=e.sense_id
      where e.id=coalesce(new.example_id,old.example_id);
  end if;
  if exists(select 1 from public.lexemes where id=target_lexeme and status='published') then
    raise exception 'Unpublish this dictionary entry before editing its details' using errcode='23514';
  end if;
  return coalesce(new,old);
end $$;
create trigger guard_word_forms before insert or update or delete on public.word_forms for each row execute function public.guard_published_lexeme_child();
create trigger guard_senses before insert or update or delete on public.senses for each row execute function public.guard_published_lexeme_child();
create trigger guard_examples before insert or update or delete on public.examples for each row execute function public.guard_published_lexeme_child();
create trigger guard_lexeme_media before insert or update or delete on public.lexeme_media for each row execute function public.guard_published_lexeme_child();
create trigger guard_example_media before insert or update or delete on public.example_media for each row execute function public.guard_published_lexeme_child();
create trigger guard_lexeme_sources before insert or update or delete on public.lexeme_sources for each row execute function public.guard_published_lexeme_child();
create trigger guard_related_lexemes before insert or update or delete on public.related_lexemes for each row execute function public.guard_published_lexeme_child();

-- A headword correction keeps the lexeme UUID stable and retains the former
-- preferred written form as a variant. The child guard requires draft status.
create function public.sync_preferred_word_form() returns trigger language plpgsql
set search_path = '' as $$
begin
  if new.headword is distinct from old.headword then
    update public.word_forms set is_preferred=false
      where lexeme_id=new.id and is_preferred;
    insert into public.word_forms(lexeme_id,spelling,is_preferred)
      values(new.id,new.headword,true)
      on conflict (lexeme_id,spelling) do update set is_preferred=true;
  end if;
  return new;
end $$;
create trigger sync_lexeme_headword after update of headword on public.lexemes
for each row execute function public.sync_preferred_word_form();

-- Literal substring search preserves orthographic punctuation. Exact written
-- forms rank ahead of partial forms and English gloss matches.
create function public.search_dictionary(search_term text, result_limit integer default 24, result_offset integer default 0)
returns table(lexeme_id uuid, match_rank integer, total_count bigint)
language sql stable security invoker set search_path = '' as $$
  with ranked as (
    select l.id, l.headword,
      case
        when lower(l.headword)=lower(search_term) or exists (
          select 1 from public.word_forms f where f.lexeme_id=l.id and lower(f.spelling)=lower(search_term)
        ) then 0
        when position(lower(search_term) in lower(l.headword))=1 or exists (
          select 1 from public.word_forms f where f.lexeme_id=l.id and position(lower(search_term) in lower(f.spelling))=1
        ) then 1
        else 2
      end as rank
    from public.lexemes l
    where l.status='published' and length(search_term) between 1 and 100
      and (
        position(lower(search_term) in lower(l.headword))>0 or
        exists(select 1 from public.word_forms f where f.lexeme_id=l.id and position(lower(search_term) in lower(f.spelling))>0) or
        exists(select 1 from public.senses s where s.lexeme_id=l.id and position(lower(search_term) in lower(s.gloss_en))>0)
      )
  )
  select id, rank, count(*) over() from ranked
  order by rank, lower(headword), id
  limit least(greatest(result_limit,1),100)
  offset greatest(result_offset,0);
$$;
grant execute on function public.search_dictionary(text,integer,integer) to anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text,
  display_order integer not null default 0
);
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) between 1 and 300),
  summary text,
  body_markdown text not null default '',
  status public.editorial_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint publication_date_check check (status <> 'published' or published_at is not null)
);
create index articles_status_date_idx on public.articles(status, published_at desc);
create trigger touch_articles before update on public.articles for each row execute function public.touch_record();
create function public.validate_article_edit() returns trigger language plpgsql
set search_path = '' as $$
begin
  if (old.status='published' or new.status='published') and
    row(new.slug,new.title,new.summary,new.body_markdown)
      is distinct from row(old.slug,old.title,old.summary,old.body_markdown) then
    raise exception 'Move the article to draft before editing published content' using errcode='23514';
  end if;
  return new;
end $$;
create trigger validate_article_before_update before update on public.articles
for each row execute function public.validate_article_edit();
create table public.article_categories (
  article_id uuid not null references public.articles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key(article_id, category_id)
);
create table public.article_media (
  article_id uuid not null references public.articles(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  display_order integer not null default 0,
  primary key(article_id, media_id)
);
create table public.article_sources (
  article_id uuid not null references public.articles(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  note text,
  primary key(article_id, source_id)
);
create table public.article_lexemes (
  article_id uuid not null references public.articles(id) on delete cascade,
  lexeme_id uuid not null references public.lexemes(id) on delete restrict,
  primary key(article_id, lexeme_id)
);
create function public.guard_published_article_child() returns trigger language plpgsql
set search_path = '' as $$
begin
  if exists(select 1 from public.articles where id=coalesce(new.article_id,old.article_id) and status='published') then
    raise exception 'Move the article to draft before editing attachments or references' using errcode='23514';
  end if;
  return coalesce(new,old);
end $$;
create trigger guard_article_media before insert or update or delete on public.article_media for each row execute function public.guard_published_article_child();
create trigger guard_article_categories before insert or update or delete on public.article_categories for each row execute function public.guard_published_article_child();
create trigger guard_article_sources before insert or update or delete on public.article_sources for each row execute function public.guard_published_article_child();
create trigger guard_article_lexemes before insert or update or delete on public.article_lexemes for each row execute function public.guard_published_article_child();
-- Family references in public articles are intentionally omitted until a
-- publication-safe projection and consent workflow exists.

create table public.editorial_revisions (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  old_record jsonb,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
create index editorial_revisions_record_idx on public.editorial_revisions(table_name, record_id, changed_at desc);
create table public.audit_events (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  operation text not null,
  actor_id uuid,
  occurred_at timestamptz not null default now()
);
create index audit_events_time_idx on public.audit_events(occurred_at desc);
create function public.capture_change() returns trigger language plpgsql security definer
set search_path = '' as $$
declare record_id uuid;
begin
  record_id := coalesce(new.id, old.id);
  if tg_op in ('UPDATE', 'DELETE') then
    insert into public.editorial_revisions(table_name, record_id, old_record, changed_by)
    values (tg_table_name, record_id, to_jsonb(old), auth.uid());
  end if;
  insert into public.audit_events(table_name, record_id, operation, actor_id)
  values (tg_table_name, record_id, tg_op, auth.uid());
  return coalesce(new, old);
end $$;
create trigger audit_family_members after insert or update or delete on public.family_members for each row execute function public.capture_change();
create trigger audit_relationships after insert or update or delete on public.family_relationships for each row execute function public.capture_change();
create trigger audit_lexemes after insert or update or delete on public.lexemes for each row execute function public.capture_change();
create trigger audit_articles after insert or update or delete on public.articles for each row execute function public.capture_change();
create trigger audit_media after insert or update or delete on public.media_assets for each row execute function public.capture_change();

-- RLS: every table is enabled; grants are limited to the JWT's role and then
-- narrowed by policy. No family table has an anonymous SELECT policy.
do $$ declare t text; begin
  foreach t in array array[
    'app_users','sources','media_assets','media_upload_intents','family_members','member_names',
    'family_relationships','member_media','member_sources','orthography_versions',
    'lexemes','word_forms','senses','examples','lexeme_media','example_media',
    'related_lexemes','lexeme_sources','categories','articles',
    'article_categories','article_media','article_sources','article_lexemes',
    'editorial_revisions','audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy admin_all on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
grant usage on schema public to anon, authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy public_lexemes on public.lexemes for select to anon, authenticated using (status = 'published');
create policy public_forms on public.word_forms for select to anon, authenticated using (
  exists(select 1 from public.lexemes l where l.id = lexeme_id and l.status = 'published'));
create policy public_senses on public.senses for select to anon, authenticated using (
  exists(select 1 from public.lexemes l where l.id = lexeme_id and l.status = 'published'));
create policy public_examples on public.examples for select to anon, authenticated using (
  exists(select 1 from public.senses s join public.lexemes l on l.id = s.lexeme_id where s.id = sense_id and l.status = 'published'));
create policy public_orthography on public.orthography_versions for select to anon, authenticated using (status = 'published');
create policy public_articles on public.articles for select to anon, authenticated using (status = 'published');
create policy public_categories on public.categories for select to anon, authenticated using (true);
create policy public_article_categories on public.article_categories for select to anon, authenticated using (
  exists(select 1 from public.articles a where a.id = article_id and a.status = 'published'));
create policy public_article_media on public.article_media for select to anon, authenticated using (
  exists(select 1 from public.articles a where a.id = article_id and a.status = 'published'));
create policy public_lexeme_media on public.lexeme_media for select to anon, authenticated using (
  exists(select 1 from public.lexemes l where l.id = lexeme_id and l.status = 'published'));
create policy public_example_media on public.example_media for select to anon, authenticated using (
  exists(select 1 from public.examples e join public.senses s on s.id=e.sense_id join public.lexemes l on l.id=s.lexeme_id where e.id=example_id and l.status='published'));
create policy public_related_lexemes on public.related_lexemes for select to anon, authenticated using (
  exists(select 1 from public.lexemes l where l.id=lexeme_id and l.status='published') and
  exists(select 1 from public.lexemes l where l.id=related_lexeme_id and l.status='published'));
create policy public_media_metadata on public.media_assets for select to anon, authenticated using (
  public_approved and consent_confirmed and (
    exists(select 1 from public.article_media am join public.articles a on a.id=am.article_id where am.media_id=media_assets.id and a.status='published') or
    exists(select 1 from public.lexeme_media lm join public.lexemes l on l.id=lm.lexeme_id where lm.media_id=media_assets.id and l.status='published') or
    exists(select 1 from public.example_media em join public.examples e on e.id=em.example_id join public.senses s on s.id=e.sense_id join public.lexemes l on l.id=s.lexeme_id where em.media_id=media_assets.id and l.status='published')
  ));
grant select on public.lexemes, public.word_forms, public.senses, public.examples,
  public.orthography_versions, public.articles, public.categories, public.article_categories,
  public.article_media, public.lexeme_media, public.example_media, public.related_lexemes,
  public.media_assets to anon;

-- Public citations expose only bibliographic fields. Editorial source notes
-- remain available exclusively through the admin-only base table.
create view public.published_sources with (security_barrier = true) as
select distinct s.id, s.title, s.citation, s.url
from public.sources s
where exists (
  select 1 from public.article_sources x join public.articles a on a.id=x.article_id
  where x.source_id=s.id and a.status='published'
) or exists (
  select 1 from public.lexeme_sources x join public.lexemes l on l.id=x.lexeme_id
  where x.source_id=s.id and l.status='published'
);
grant select on public.published_sources to anon, authenticated;

-- All objects remain private. The API grants short-lived signed URLs only
-- after checking the media metadata's RLS visibility.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('heritage-media', 'heritage-media', false, 26214400,
  array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav'])
on conflict (id) do nothing;
create policy admin_storage_select on storage.objects for select to authenticated
  using (bucket_id='heritage-media' and (select public.is_admin()));
create policy approved_storage_select on storage.objects for select to anon, authenticated
  using (bucket_id='heritage-media' and exists (
    select 1 from public.media_assets m where m.storage_path = name
      and m.public_approved and m.consent_confirmed
      and (exists(select 1 from public.article_media am join public.articles a on a.id=am.article_id where am.media_id=m.id and a.status='published')
        or exists(select 1 from public.lexeme_media lm join public.lexemes l on l.id=lm.lexeme_id where lm.media_id=m.id and l.status='published')
        or exists(select 1 from public.example_media em join public.examples e on e.id=em.example_id join public.senses s on s.id=e.sense_id join public.lexemes l on l.id=s.lexeme_id where em.media_id=m.id and l.status='published'))
  ));
create policy admin_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id='heritage-media' and (select public.is_admin()));
create policy admin_storage_update on storage.objects for update to authenticated
  using (bucket_id='heritage-media' and (select public.is_admin()))
  with check (bucket_id='heritage-media' and (select public.is_admin()));
-- Deletion is intentionally disallowed: archive metadata and back up originals.

insert into public.categories(slug,title,description,display_order) values
  ('diaspora','Diaspora',null,10),
  ('mombasa-community','Mombasa community',null,20),
  ('language-oral-traditions','Language and oral traditions',null,30),
  ('food-cultural-practices','Food and cultural practices',null,40),
  ('family-stories','Family stories',null,50);

insert into public.orthography_versions(label,title,body_markdown,status)
values ('0.3','How We Write Mombasa Kutchi',
  'Draft 0.3. The working Latin orthography uses `a` and `aa` provisionally for short and long A; `n` for a fully pronounced N; `(n)` for nasalization of the preceding vowel; `l` for ordinary L; `''l` for a proposed special L whose realization remains under investigation; and `gh` and `ch` as provisional spellings. These choices are developing and do not claim formal academic or community recognition.',
  'published');

-- These six spellings and meanings were supplied by the project owner. No
-- invented vocabulary or example sentences are seeded.
do $$ declare item text[]; lid uuid; begin
  foreach item slice 1 in array array[
    array['maa','Mother'], array['bapa','Father'], array['paani','Water'],
    array['ghar','House'], array['hadaa ach','Come here'], array['ku''la','Why']
  ] loop
    insert into public.lexemes(headword,orthography_version_id,status)
    values (item[1],(select id from public.orthography_versions where label='0.3'),'draft') returning id into lid;
    insert into public.word_forms(lexeme_id,spelling,is_preferred) values (lid,item[1],true);
    insert into public.senses(lexeme_id,gloss_en) values (lid,item[2]);
    update public.lexemes set status='published' where id=lid;
  end loop;
end $$;
