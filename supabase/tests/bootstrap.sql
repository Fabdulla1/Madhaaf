-- Minimal Supabase-shaped schemas for migration smoke tests in plain Postgres.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid;
$$;
create table storage.buckets(
  id text primary key, name text not null, public boolean not null,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema auth, storage to anon, authenticated;
grant select on auth.users to authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
