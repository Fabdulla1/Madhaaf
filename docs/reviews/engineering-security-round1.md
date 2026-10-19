# Engineering and security review — round 1

**Reviewed:** 19 October 2026, current uncommitted SQL, API routes, and key UI components. This is a static review; database migration, browser flows, and adversarial requests still need to be executed in a configured environment. Severity reflects production impact. Findings should be marked resolved only with the evidence described below.

## High priority

### H0 — Configured image/audio sizes cannot reach the Vercel upload route

**Location:** `src/app/api/admin/media/route.ts:9-17,56-78`.

The API advertises 10 MB images and 25 MB audio, but routes the whole multipart payload through a Next.js function. The [current Vercel Function request-body limit is 4.5 MB](https://vercel.com/docs/functions/limitations), so the hosting target rejects many permitted files with 413 before this route runs. Use an admin-authorized signed upload directly to Supabase Storage (or resumable upload for larger audio), then validate and finalize metadata server-side. Supabase documents [signed uploads](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl) and [resumable uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads?language=js&queryGroups=language). Test a file above 4.5 MB in the actual deployment environment.

### H1 — Password reset cannot complete

**Location:** `src/app/api/auth/reset/route.ts:10`, `src/app/api/auth/callback/route.ts:10`, and missing `/reset-password` page.

The reset email redirects through the callback to `/reset-password`, but no page exists at that path. A user can request a reset email and reach a 404 after token exchange, so the promised workflow fails. Add the reset-password page with new-password/confirmation form calling the existing password endpoint, and test a real email recovery flow in an environment with email configured. Do not describe reset as verified before then.

### H2 — Upload request can buffer an unbounded body before validation

**Location:** `src/app/api/admin/media/route.ts:56-64`.

The route checks `Content-Length`, then calls `request.formData()` and `file.arrayBuffer()`. A client can omit or understate `Content-Length`; the framework reads the entire multipart body before `file.size` is checked. In local or alternate hosting without a lower platform cap, a valid admin session or compromised one can consume excessive memory. The direct-to-Storage upload flow in H0 should avoid proxy buffering, enforce a bounded upload token/path/size, and validate content before metadata becomes usable. Test an oversized chunked request. Retain the per-file type/size/signature checks.

### H3 — Published dictionary records expose child edits immediately

**Location:** `src/app/api/admin/[resource]/route.ts:34-46`, `src/components/admin/dictionary-details.tsx:14-20`, `supabase/migrations/202610190001_foundation.sql:387-393`.

Forms, senses, and examples are inserted directly beneath a published lexeme. RLS immediately exposes every child of a published lexeme; there is no child editorial state or staged revision. A spelling, definition, sentence, or recording may become public on clicking “Add,” before preview and approval. Add child-level draft/publication state or an entry-wide working revision that is atomically published. Also require at least one meaning and preferred form before publishing a lexeme. Verify anonymous search/detail before and after publication.

### H4 — Login and reset endpoints lack an established abuse limit

**Location:** `src/app/api/auth/login/route.ts:7-20`, `src/app/api/auth/reset/route.ts:5-14`.

Both public endpoints can be invoked repeatedly. The reset endpoint also asks Supabase to send an email on every request. Supabase project protections may help, but no project configuration or application rate limit is documented or tested. Configure managed anti-abuse/rate limits for sign-in and reset, apply a per-IP and per-account budget where appropriate, and verify that repeated requests are throttled without account enumeration.

## Medium priority

### M1 — Auth callback can redirect to an external host

**Location:** `src/app/api/auth/callback/route.ts:7-13`.

The check accepts any `next` value starting with `/` unless the second character is `/`. WHATWG URL parsing treats a path such as `/\\evil.example` as a network-path redirect; `new URL('/\\evil.example', 'https://site.example')` resolves to `https://evil.example/`. Allowlist exact internal destinations such as `/admin` and `/reset-password`, or resolve the URL and compare its final origin before redirecting. Test encoded backslash variants.

### M2 — Revision coverage misses child content and media links

**Location:** `supabase/migrations/202610190001_foundation.sql:362-366`, `src/app/api/admin/revisions/restore/route.ts:24-31`.

Triggers snapshot only family members, relationships, lexemes, articles, and media metadata. Edits/deletions to word forms, senses, examples, categories, source links, and media attachments have no revision history. The REST restore action restores only the main row, so an entry cannot be returned to a prior complete editorial state. Capture child/link mutations with actor and previous state, or move to aggregate-level versioned snapshots and transactional restore. Test a lexeme with multiple senses and recordings through edit and restore.

### M3 — Public content links can bypass editorial link checks

**Location:** `src/components/public/markdown.tsx:8-20`, `src/lib/admin-config.ts:11-13`.

Article Markdown accepts any internal `/...` link, including `/family/<id>`, with no publication/visibility validation. The family page itself remains protected, so this is not a direct private-data disclosure, but public articles can advertise private profile IDs and create broken links. Resolve structured links server-side against published/authorized targets or reject private family paths from public articles. Test a published article containing a private family link.

### M4 — Tree and admin list silently truncate larger collections

**Location:** `src/app/api/admin/tree/route.ts:9-10`, `src/app/api/admin/[resource]/route.ts:12-15`, `src/components/family/family-explorer.tsx:23-28`.

The API caps the graph at 2,000 people and 4,000 edges, while the admin lists default to 100 and cap at 200. There is no cursor/page control or notice that results were truncated. A family can appear to have missing relationships, and records beyond the first page become hard to edit. Add stable pagination or branch/generation loading and surface a total/truncation indicator. Verify search/selection across page boundaries.

### M5 — Published article URL changes break permanent links

**Location:** `src/lib/admin-config.ts:12`, `src/app/api/admin/[resource]/[id]/route.ts:32-39`, `src/app/api/history/[slug]/route.ts:5-11`.

An administrator can edit an article slug, and the detail route looks up only the current slug. Existing citations and shared links then return 404. Use immutable article IDs in the canonical URL or store old slugs and redirect them. Test an article URL before and after a slug correction.

### M6 — Generic database errors expose internal details

**Location:** `src/app/api/admin/[resource]/route.ts:44`, `src/app/api/admin/[resource]/[id]/route.ts:38`, `src/app/api/admin/links/route.ts:39`, `src/app/api/admin/revisions/restore/route.ts:34`.

Several handlers return raw `dbError.message`. Only admins can reach them, so exposure is limited, but messages can include table/constraint details and confusing operational text. Map known uniqueness/validation conflicts to user-facing messages, log a correlation ID and sanitized diagnostic server-side, and use a generic response for unexpected errors. Verify failures do not include query or schema internals.

## Lower priority and confirmation tests

- **L1 — Missing content ownership checks:** `src/app/api/admin/links/route.ts:30-40` accepts any media UUID for any association, regardless of MIME kind, approval, or consent. A profile portrait can point to audio (`family_members.portrait_media_id`) and an article can attach private family media. Add purpose-specific constraints and an explicit publish-time consent check. This is a data-quality/privacy hazard even though the public media RLS still requires approval.
- **L2 — Search scale:** `src/app/api/dictionary/route.ts:12-27` caps each matching subquery at 100 and the final result at 100 without pagination or total; common English glosses can hide later matches. Add cursor-based search and an exact-match-first query strategy. Keep apostrophe and `(n)` characters significant.
- **L3 — Relationship update validation:** `src/app/api/admin/[resource]/[id]/route.ts:29-39` permits `parent_kind` edits that conflict with `kind` (for example setting null for a parent). The database shape check blocks these, but API errors are raw and the editor lacks a clear repair flow. Validate the merged row shape before update and return a specific error.

## Controls that are present

- Admin routes and mutations call `getAdmin()`, which verifies the Auth user and checks the `app_users` role. Family pages require this check before rendering. Family base tables have no anonymous grants or read policies.
- Write routes compare request origin, and most JSON payloads pass strict Zod validation. The media route checks declared MIME and leading signatures; article Markdown is rendered as React text rather than raw HTML.
- Genealogy self-links, duplicate endpoint pairs, and ancestry cycles have database constraints/triggers. The cycle trigger now serializes parent-edge writes with an advisory transaction lock. The connected-member RPC creates a person and first edge in one transaction.
- Public media metadata and storage policies require approval, consent, and a published dictionary/history attachment. Private family media is not publicly readable through these policies. Verify this with anonymous Storage download/list tests after migration.

## Required verification after fixes

Run migration and RLS tests against a fresh local Supabase database, including anon/non-admin/admin identities and direct Storage API access. Exercise a real recovery email, an oversized chunked upload, stale-version writes, a published-entry child edit, a relationship cycle race, and article slug/link changes. Browser-test family creation → media attachment → relationship publication → tree refresh, plus dictionary and history publishing. Record actual results and any environment-dependent tests as not run.
