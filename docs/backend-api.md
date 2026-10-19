# Backend contract and setup

## Environment and first administrator

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` from the same Supabase project. The publishable key is safe for the browser; no service-role key is needed by the app. Apply `supabase/migrations/202610190001_foundation.sql` through the Supabase CLI or controlled migration runner before starting the app. The migration creates all tables, RLS policies, private `heritage-media` bucket, orthography Draft 0.3 text, six user-provided seed expressions, and empty history categories.

Disable public sign-up in Supabase Auth. Create the first email/password user through the protected Supabase Auth dashboard, confirm their exact UUID, then run this SQL in the same project's protected SQL editor with the verified UUID substituted:

```sql
insert into public.app_users (user_id, role)
values ('VERIFIED-AUTH-USER-UUID', 'admin');
```

No visitor or newly created Auth user is automatically made an administrator. Configure Auth email delivery and the site's permitted redirect URLs before using password reset. Configure Supabase Auth's managed rate limits and anti-abuse controls before opening login to the public Internet.

## API responses

All JSON routes return `{ "data": ... }` on success or `{ "error": "..." }` on failure. Admin responses use `Cache-Control: private, no-store`. Mutating endpoints require the admin session and a same-origin browser request. The UI should treat HTTP 409 as a stale edit or unique/constraint conflict and refresh the record before retrying.

| Route | Methods | Request or query |
| --- | --- | --- |
| `/api/auth/login` | POST | `{ email, password }` |
| `/api/auth/logout` | POST | Empty body |
| `/api/auth/reset` | POST | `{ email }`; always uses a non-enumerating response |
| `/api/auth/password` | POST | `{ password }`, at least 12 characters, after reset callback |
| `/api/admin/overview` | GET | Status counts, recent records, audit activity |
| `/api/admin/tree` | GET | Private members and relationships |
| `/api/admin/{resource}` | GET, POST | Resources: `members`, `relationships`, `lexemes`, `spellings`, `senses`, `examples`, `articles`, `categories`, `orthography`, `sources`. GET supports `limit` up to 200; `status` for editorial resources; `q` for member names; `lexeme_id` for spellings and senses; `sense_id` for examples. POST accepts the relevant validated fields. |
| `/api/admin/{resource}/{id}` | GET, PATCH, DELETE | PATCH of an editorial resource requires its current `version`; DELETE archives an editorial resource and requires `{ version }`. Child resource PATCH does not use a version. |
| `/api/admin/relationships/with-member` | POST | `{ member, relationship, newMemberSide: "a" | "b" }`; the opposite relationship endpoint must reference an existing member. Creates both rows in one database transaction. |
| `/api/admin/media` | GET | Media list; uploads use the direct Storage flow below. |
| `/api/admin/media/upload-url` | POST | `{ mime_type, bytes, original_name }` creates an upload intent and returns `{ intent_id, path, token }`. Max 10 MB image or 25 MB audio. |
| `/api/admin/media/finalize` | POST | `{ intent_id, alt_text?, caption?, speaker_name?, attribution?, consent_confirmed? }` verifies stored size, MIME, and file signature, then creates private unapproved media metadata. |
| `/api/admin/media/{id}` | GET, PATCH | GET includes a 5-minute signed `url`; PATCH metadata, consent, and `public_approved` with current `version`. |
| `/api/admin/links` | GET, POST, DELETE | GET `kind` and `owner_id`; POST/DELETE JSON `kind` plus owner ID and `media_id`. Kinds are `member_media`, `lexeme_media` (requires `purpose`), `example_media`, `article_media`. |
| `/api/admin/revisions` | GET | `resource` and `id`; snapshots of previous editorial records |
| `/api/admin/revisions/restore` | POST | `{ resource, id, revision_id, version }` |
| `/api/admin/export/{family|dictionary}` | GET | Download private JSON export including relational rows and media metadata |
| `/api/dictionary` | GET | Optional `q` or `letter=A`, plus `page` and `limit` (max 100); returns `data` and `pagination`. Literal search preserves apostrophe and `(n)` distinctions; exact spelling results rank first. |
| `/api/dictionary/{uuid}` | GET | Published entry, forms, senses, examples, approved media URLs |
| `/api/history` | GET | Published articles; optional `category` slug |
| `/api/history/{slug}` | GET | Published article, categories, approved media URLs |
| `/api/orthography` | GET | Latest published orthography version |
| `/api/media/{uuid}` | GET | Signed URL only when RLS permits an approved, consented asset associated with published content |

Published dictionary and history pages are intentionally separate from private genealogy. A family's `visibility = public` field does **not** grant anonymous access in this release; a future consent and safe-publication workflow is required first.

## Media preservation

The `heritage-media` bucket is private. The API grants short-lived signed URLs after RLS authorization. An image or recording becomes publicly retrievable only after `consent_confirmed` and `public_approved` are true **and** it is associated with a published dictionary entry or article. Family media never qualifies. Uploaded objects are retained when associations are removed; intentional removal requires a separately reviewed maintenance process. A failed metadata insert can leave a private orphan object that an administrator must reconcile.

The browser uploads directly to Supabase Storage to avoid the Vercel Function request body limit. After obtaining an upload intent, call `supabase.storage.from('heritage-media').uploadToSignedUrl(path, token, file, { contentType: file.type })`, then call `/api/admin/media/finalize`. The finalized metadata starts private and unapproved. Invalid or abandoned uploads remain private orphan objects until reconciled. Published dictionary entries must be moved back to draft before changing spellings, meanings, examples, or associated media; a database trigger enforces this even for direct database clients.

JSON exports contain paths and metadata, not photographs or audio bytes. Back up PostgreSQL **and** the bucket objects independently, with a manifest matching object paths and consent state. Restore into an isolated project and verify public/private reads before calling a backup proven.

## Local database smoke test

`supabase/tests/bootstrap.sql` supplies minimal Auth and Storage schemas for a plain PostgreSQL 16 test. Apply bootstrap, then the migration, then `supabase/tests/foundation.sql` with `psql -v ON_ERROR_STOP=1`. The final test transaction rolls back. It checks seed spellings, exact punctuation search, admin permissions, private family denial, cycle rejection, atomic connected-member creation, published-entry edit guard, and public-versus-private media and Storage visibility. This smoke test does not replace testing a configured Supabase Auth and Storage project.
