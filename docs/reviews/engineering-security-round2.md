# Engineering and security review — round 2

**Reviewed:** 19 October 2026, post-remediation source. This is an independent static review plus local `npm run typecheck` and `npm run lint`; both passed. No configured hosted Supabase identity, email delivery, Storage service, or Vercel deployment was available for this review, so live end-to-end security remains unverified.

## Round-one disposition

| Finding | Current state and evidence |
| --- | --- |
| H0/H2 media upload size and buffering | **Code addressed:** browser uploads with a short-lived signed Supabase Storage token, then a small finalize request checks intent, stored size/MIME, and signature (`api/admin/media/upload-url`, `finalize`, `media-manager`). A >4.5 MB hosted upload still needs a real Vercel/Supabase test. |
| H1 reset flow | **Code addressed:** `/reset-password` page calls `/api/auth/password`; callback only accepts that internal destination or `/admin`. Real email delivery/recovery remains untested. |
| H3 immediate dictionary child publication | **Mostly addressed:** SQL guards reject edits to forms, senses, examples, sources, and recordings while their lexeme is published. A lexeme needs a preferred form and meaning before publication. The reparenting loophole below remains. |
| H4 authentication abuse limit | **Environment dependent:** local Supabase config sets a sign-in limit, while production Auth rate limits and reset-email anti-abuse settings are documented but cannot be confirmed here. |
| M1 callback redirect | **Addressed:** exact destination allowlist in `/api/auth/callback`. |
| M2 revisions | **Partially open:** main rows have snapshots, but child/link records still lack complete revision/restore coverage. |
| M3 private article links | **Addressed for rendered Markdown:** internal links are restricted to public dictionary/history/orthography paths; raw HTML remains React-escaped. |
| M4 pagination | **Addressed for visibility:** admin lists and dictionary have page controls; tree shows counts and an explicit Load more control. A large-tree performance test remains. |
| M5 article slugs | **Addressed:** old slugs are stored and the public route resolves them to the canonical current slug. |
| M6 raw database errors | **Open:** several admin endpoints still return `dbError.message`; impact is limited to admins but should be mapped to stable user-facing messages. |

## Additional concrete findings

### Resolved during review — Published-content guard checks both parents on reparenting

**Location:** `supabase/migrations/202610190001_foundation.sql:330-355`, `:488-499`; `src/app/api/admin/[resource]/[id]/route.ts:25-40`.

The initial round-two inspection found `coalesce(new.lexeme_id, old.lexeme_id)` on UPDATE, which allowed a child to move away from a published parent. The backend agent updated both dictionary and article guards to check OLD and NEW parent IDs (`:330-357`, `:498-508`). The revised SQL closes the static bypass. Execute a database test moving a form, sense, example, media link, and article attachment away from a published owner before treating the finding as runtime verified.

### Resolved after review — Published article editor advertised a save path blocked by database rules

**Location:** `src/components/admin/resource-editor.tsx:30-47`, `supabase/migrations/202610190001_foundation.sql:448-465`.

Unlike the dictionary editor, published history fields remain enabled and “Save changes” is shown. The SQL trigger rejects changes to a published article's slug/title/summary/body, so normal edits fail with a conflict. Disable those fields and direct the editor through Unpublish → edit draft → Publish, or implement staged working revisions. Verify the flow with a published article in the browser.

### Medium — Full editorial recovery remains incomplete

**Location:** `supabase/migrations/202610190001_foundation.sql:503-538`, `src/app/api/admin/revisions/restore/route.ts`.

Revisions capture selected parent rows but not forms, senses, examples, media/source/category associations, or their ordering. Restoring a prior lexeme or article can therefore leave newer child content in place. Either snapshot the aggregate with a transactional restore or make child-level revisions/restores explicit. Test a multi-sense entry and an article with a removed recording/source.

### Resolved after review — Family-linked media could become public through reuse

**Location:** `supabase/migrations/202610190001_foundation.sql:592-638`, `docs/backend-api.md` media-preservation section.

The public media policies require consent, approval, and a published dictionary/article attachment, but do not exclude an asset also linked to a private family member as a portrait or in `member_media`. An administrator may intentionally approve that reuse; however, the backend document's categorical claim that “Family media never qualifies” is stronger than the policy. Either enforce a negative family-association condition, require a distinct public asset/copy for approved reuse, or document and confirm the intended shared-asset behavior. Test an approved asset attached to both a member and a published article.

## Release gates and limits of this review

### Post-review remediation

- The published history editor now disables content fields and save/publish actions until the article is unpublished, matching the database guard. Type checking, linting, and a production build pass after this change; a configured browser edit remains unverified.
- `is_public_media` now excludes assets referenced by either `member_media` or `family_members.portrait_media_id`, even when the same asset is approved and linked to published public content. The SQL smoke test includes both cases. The expanded SQL smoke could not be rerun after these changes because this machine's Supabase and fresh PostgreSQL Docker containers stalled before startup. The earlier PostgreSQL 16 smoke passed before the final guard/media changes.
- Administrator list search and status filters now run before pagination on the server, so a match beyond the first page is no longer silently hidden. This remains to be checked against a large configured dataset.

- Exercise anonymous, ordinary authenticated, and admin identities against actual Supabase RLS and Storage endpoints. In particular, verify private family member, edge, portrait, source, and media reads are denied to the first two roles, including direct Storage paths and signed URL creation.
- Test reset email, login throttling, signed upload/finalize (>4.5 MB), publication of approved media, and a failed consent/publication attempt in hosted preview. Local configuration or static inspection does not prove those paths.
- Verify a database backup **and independent Storage object backup** by restoring into an isolated project. No recovery claim should be made until object checksums and authorized/private reads pass.
- Browser-test end-to-end family, dictionary, and history workflows with real database writes. Typecheck/lint passed here; these checks do not establish workflow completion.

The admin session check is repeated on private routes and mutations; family tables have no anonymous grant, and public media policy requires consent, approval, and a published article/dictionary reference. This second pass found no new unauthenticated family-data path in the reviewed code, subject to the live RLS and Storage tests above.
