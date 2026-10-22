# Backend contract and setup

## Environment and first administrator

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` from the same Supabase project. The publishable key is safe for the browser. Set `SUPABASE_SECRET_KEY` (or the legacy server-only `SUPABASE_SERVICE_ROLE_KEY`) for account administration, verified media finalization, and media delivery; never expose it in a browser variable. Apply every file in `supabase/migrations/` in filename order through the Supabase CLI or controlled migration runner before starting the app. Commit each migration separately, including the video enum change before the media privacy migration. The foundation migration creates all tables, RLS policies, private `heritage-media` bucket, orthography Draft 0.3 text, six user-provided seed expressions, and empty history categories.

`supabase/config.toml` was generated with the current Supabase CLI. Local sign-up is disabled, local passwords require 12 characters, and the local Auth sign-in limit is 10 requests per five minutes per IP. **Hosted Supabase Auth password-login and reset rate limits must be configured and verified separately**; the local config does not set hosted policy. The local config permits reset callbacks from both `localhost:3000` and `127.0.0.1:3000`.

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
| `/api/auth/status` | GET | `{ data: { admin: boolean } }`; no private account details |
| `/api/admin/overview` | GET | Status counts, recent records, audit activity |
| `/api/admin/tree` | GET | Private members and relationships |
| `/api/admin/{resource}` | GET, POST | Resources: `members`, `relationships`, `lexemes`, `spellings`, `senses`, `examples`, `articles`, `categories`, `orthography`, `sources`. GET supports `page`, `limit` up to 200, and returns `pagination`; `status` for editorial resources; `q` for member names; `lexeme_id` for spellings and senses; `sense_id` for examples. POST accepts the relevant validated fields. |
| `/api/admin/{resource}/{id}` | GET, PATCH, DELETE | PATCH of an editorial resource requires its current `version`; DELETE archives an editorial resource and requires `{ version }`. Child resource PATCH does not use a version. DELETE of a spelling, sense, or example needs no body, but rejects removal of a preferred spelling or a meaning that still has examples. |
| `/api/admin/relationships/with-member` | POST | `{ member, relationship, newMemberSide: "a" | "b" }`; the opposite relationship endpoint must reference an existing member. Creates both rows in one database transaction. |
| `/api/admin/media` | GET | Media list; uploads use the direct Storage flow below. |
| `/api/admin/media/upload-url` | POST | Required: `{ mime_type, bytes, original_name, title, subject_description, consent_confirmed: true }`. Optional: `captured_on`, `location`, `alt_text`, `caption`, `speaker_name`, `attribution`, `member_ids`, `article_id`. Creates an immutable upload intent and returns `{ intent_id, path, token }`. Max 10 MB image, 25 MB audio, 50 MB MP4/WebM video. |
| `/api/admin/media/finalize` | POST | `{ intent_id }` verifies stored size, MIME, and file signature, then atomically creates the private asset, details, and selected associations. Retrying the same finalized intent returns the existing asset. |
| `/api/admin/media/{id}` | GET, PATCH | GET includes private archive details, associations, actual `is_public` status, and a session-protected app preview `url`. PATCH metadata, consent, and `public_approved` atomically with current `version`. |
| `/api/admin/media/{id}/file` | GET, HEAD | Session-protected streaming preview; supports a single byte range and denies anonymous/non-admin access. |
| `/api/admin/links` | GET, POST, DELETE | GET `kind` and `owner_id`; POST/DELETE JSON `kind` plus owner ID and `media_id`. Kinds are `member_media`, `lexeme_media` (requires `purpose`), `example_media`, `article_media`. |
| `/api/admin/references` | GET, POST, DELETE | GET `kind` and `owner_id`; POST/DELETE accept the relevant IDs for `article_categories`, `article_sources`, `lexeme_sources`, `member_sources`, or `article_lexemes`. |
| `/api/admin/revisions` | GET | `resource` and `id`; snapshots of previous editorial records |
| `/api/admin/revisions/restore` | POST | `{ resource, id, revision_id, version }` |
| `/api/admin/export/{family|dictionary}` | GET | Download private JSON export including relational rows and media metadata |
| `/api/dictionary` | GET | Optional `q` or `letter=A`, plus `page` and `limit` (max 100); returns `data` and `pagination`. Literal search preserves apostrophe and `(n)` distinctions; exact spelling results rank first. |
| `/api/dictionary/{uuid}` | GET | Published entry, forms, senses, examples, approved media URLs |
| `/api/history` | GET | Published articles; optional `category` slug |
| `/api/history/{slug}` | GET | Published article, categories, citation-safe `sources`, approved media URLs. Old slugs resolve to the current record and return the canonical `data.slug`. |
| `/api/orthography` | GET | Latest published orthography version |
| `/api/media/{uuid}` | GET | Safe public display metadata and `/api/media/{uuid}/file` URL only for approved, consented, non-family media in a published article/story. No private description, people, location, filename, storage key, or download token. |
| `/api/media/{uuid}/file` | GET, HEAD | Rechecks public eligibility for every request and streams bytes; supports a single byte range. No-store responses and no redirect to Storage. |

Published dictionary and history pages are intentionally separate from private genealogy. A family's `visibility = public` field does **not** grant anonymous access in this release; a future consent and safe-publication workflow is required first.

The tree endpoint returns `data: { members, relationships, pagination }`; each side is paged in 1,000-row chunks with `memberPage` and `relationshipPage`. The UI must not present a first page as a complete tree when `hasMore` is true.

## Media preservation

The `heritage-media` bucket is private. Only explicit consent and public approval plus a published article/story allow public delivery. Dictionary attachments alone do not publish an asset. A family attachment or portrait always disqualifies it from public use; unlinking an asset does not delete its original. Public images require meaningful alternative text. Private title, subject, date, and location live in the admin-only `media_details` table and are included in administrator exports.

The browser uploads directly to Storage to avoid the application request-body limit. Supply required context before requesting a ticket, then call `supabase.storage.from('heritage-media').uploadToSignedUrl(path, token, file, { contentType: file.type })`, followed by `/api/admin/media/finalize` with the intent ID only. Finalization validates the actual object and uses a service-only transaction to save the asset and associations. Failed or abandoned objects remain private for later reconciliation; successful retries do not create duplicate assets. Original object identity and bytes cannot be overwritten by the admin client.

Public clients cannot read Storage directly or mint Storage download URLs. The app delivers approved media through a permission-checked stream, with private/no-store caching and byte-range support for playback. Revocation blocks subsequent requests, but cannot retract already downloaded copies or cancel an in-flight response. Previously issued Storage tokens may remain valid until they expire; follow the rollout notes when migrating from the old flow.

JSON exports contain metadata and paths, not original media bytes. Back up PostgreSQL and bucket objects independently. See [media workflow and deployment](media-library.md) and [backup and recovery](backup-recovery.md).

## Local database smoke test

`supabase/tests/bootstrap.sql` supplies minimal Auth and Storage schemas for a plain PostgreSQL test database. Apply bootstrap, every migration in filename order (each separately), then each SQL test with `psql -v ON_ERROR_STOP=1`. Test transactions roll back. The quality workflow runs the suite on PostgreSQL 16. These checks exercise database roles, RLS, transaction rollback, publication, private context, storage policy boundaries, and idempotent finalization; they do not substitute for a hosted Auth/Storage smoke test.

The media browser suite runs with `npx playwright test --config tests/media-ui/playwright.config.ts`. It uses real Next.js handlers with a local test-only Supabase/Storage fixture and tests the UI, public/private delivery, HTTP range behavior, and revocation. It does not connect to production.
