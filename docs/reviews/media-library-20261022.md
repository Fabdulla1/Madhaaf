# Media library implementation and review

Date: 22 October 2026. Base: `2b157eb`.

## Outcome

The dashboard requires descriptive context and private-storage consent before uploads, supports person and draft-story associations, and handles image/audio/video media. Family-linked files remain private. Public delivery requires explicit approval and a published article/story, uses a permission-checked application stream, and never returns a Storage download token to public clients.

Work was divided among backend, database/security, interface, and verification agents. Backend and database changes received an independent Ponytail review. Impeccable used separate design and detector assessments, followed by desktop/mobile screenshot review and browser interaction checks. React best-practices checks were also applied to the changed components.

## Findings addressed

| Finding | Change |
| --- | --- |
| Uploads accepted a file without identifying its subject | Title, subject, and recorded storage permission are required in the UI, API, and database intent. |
| Partial finalization could leave inconsistent records or duplicate retries | Service-only transaction creates the asset, context, associations, and consumed intent together; retry returns the same asset. |
| Anonymous Storage access permitted independently issued download tokens | Removed anonymous Storage access; public routes check current eligibility and stream without redirects. |
| Dictionary publication could expose media independently | Only an explicitly approved published article/story can authorize public delivery. |
| Rich archive context could leak through a public asset row | Admin-only `media_details` and a safe public view separate private context from display metadata. |
| Validated originals could be replaced by normal admin writes | Original identity is immutable and administrator Storage overwrite policy is removed. |
| New size limits could break migration or block revoking older files | Legacy originals retain their historical limits for maintenance; stricter caps apply to new uploads. Old tickets expire before the stricter check is installed. Upgrade fixtures exercise both. |
| Immutable creator protection broke the existing account-deletion FK | Permit only the FK's creator nullification after that Auth user is gone; manual reassignment and clearing remain rejected. Legacy approvals do not block unrelated FK maintenance. |
| Direct attachment accepted an archived story | Attachment trigger locks and requires draft/review status. |
| Newly required fields blocked legacy public-access revocation | Independent Remove public access action patches approval only, without requiring other edits. |
| Approval wording implied one story or immediate publication | Lists all attached stories and distinguishes approval from actual public availability. |
| Generic file list, inaccessible preview, unclear upload failures | Searchable descriptions and associations, native modal dialog, distinct loading/error states, and finalization-only retry. |

The Impeccable source assessment improved from 18/40 to 29/40. Its deterministic detector reported no findings across the five reviewed interface components. No remaining P0/P1/P2 finding was identified in the final review. A low-priority opportunity remains to shorten optional metadata fields for repeated mobile uploads.

## Verification and limits

- Full ESLint, TypeScript, and production build passed.
- The standard browser suite has 59 passing checks (57 in the full run plus two focused reruns), with six live-project checks skipped because no hosted credentials were present. It includes public pages, dictionary/family behavior, request validation, and six new pure media tests. Two stale research assertions were updated for the eighth article already present in the base commit; research content was not changed.
- Ten dedicated browser/HTTP checks passed: required context and consent, living-person selection, retained error state, one-object finalization retry, video/dialog controls, legacy revocation, approval scope, private preview authorization, public metadata redaction, delivery/revocation, and range/HEAD handling (some tests cover several cases).
- Bootstrap, all migrations, the legacy upgrade fixture, and all seven SQL suites passed in local PGlite PostgreSQL 18.6. Only the unavailable `pgcrypto` extension declaration was omitted from that temporary runner; `gen_random_uuid` is built in. CI is configured to run the unchanged SQL on PostgreSQL 16.
- Real ffmpeg-generated MP4, WebM, and M4A samples passed bounded signature inspection. The browser fixture asserts native video controls, not codec decoding of its placeholder bytes.
- Database tests use Auth/Storage schema stubs; browser tests use a local test-only service fixture. They do not claim hosted Supabase Auth, Storage, or production end-to-end verification.

Production database credentials were unavailable in this session. The two migrations and a hosted smoke test remain deployment work; see [the release procedure](../media-library.md#deployment-and-operations). Previously issued download tokens may last until expiry. Signature validation does not perform malware scanning, transcoding, EXIF removal, or caption generation. Backup/restore operations remain separate from this code change.
