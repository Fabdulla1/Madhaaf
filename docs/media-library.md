# Media library and privacy

The dashboard preserves images, audio, and video with enough context to identify their subjects. Uploads begin private. Publishing a dictionary entry, adding a family photograph, or approving a file alone does not publish it.

## Upload and describe

Before requesting an upload ticket, provide a title, describe who or what appears in the file, and confirm permission for private storage. Optional fields include recording date, place, alternative text, caption, speaker, and creator/source credit. Leave uncertain dates blank and describe uncertainty in the private subject field.

Search existing people by name to attach one or more family profiles, including living people. Alternatively, attach a draft or review article/story. Family-linked media and portraits always remain private. The upload workflow asks you to choose people or an article, and article attachment rejects files already associated with family records. A meaningful description is sufficient when there is no existing person or story record.

| Format | Maximum original size |
| --- | --- |
| JPEG, PNG, WebP image | 10,000,000 bytes |
| MP3, M4A, Ogg, WebM, WAV audio | 25,000,000 bytes |
| MP4, WebM video | 50,000,000 bytes |

The browser uploads directly to the private bucket. The server verifies actual size, MIME, and a bounded file signature before creating the asset, private context, and associations in one database transaction. A retry after a successful transfer finalizes the same upload instead of creating a duplicate. Invalid or abandoned objects remain private for later reconciliation.

Search the library by title, subject, person, place, or filename, and filter by media type. Preview and details supports metadata edits and attachments after upload. The preview uses native image, audio, and video controls inside a keyboard-contained dialog.

## Deliberate publication

1. Attach a non-family file to a draft/review article or story.
2. Open its media details. Review the content, permission, public caption/credit, and alternative text for images.
3. Explicitly approve public use and save.
4. Publish the article/story through its editorial workflow.

The library distinguishes private files, approved files awaiting publication, and files actually published in a story. Approval belongs to the asset and applies to all attached stories. An approved asset can become public when any attached story is published. Dictionary attachments may display it only while that separate published-story authorization exists.

Family media cannot receive public approval. Attaching a previously approved file to a person or portrait requires revoking approval first and removing article attachments. Review and create a separately consented copy if an editorial article needs an image from the family archive; do not remove family links merely to circumvent the privacy rule.

Revoking approval or consent blocks subsequent public file requests, even when an article remains published. Unpublishing the last article also removes public eligibility. Already downloaded copies and in-flight responses cannot be recalled.

## Stored information and access controls

| Information | Access |
| --- | --- |
| Title, subject description, date, location (`media_details`) | Administrators only |
| Family associations, upload tickets, object keys, original filenames | Administrators only |
| Alt text, caption, speaker name, attribution, type and size | Public only while the asset satisfies publication rules |
| Original image/audio/video bytes | Administrator preview, or public gateway while publication rules hold |

All originals remain in the private `heritage-media` bucket. Anonymous users cannot read objects directly or mint download tokens. Server-only credentials are used after an administrator or public-eligibility check. Public responses contain an application URL, never a signed Storage URL. The file gateway supports GET, HEAD, and a single byte range for seeking, checks access on each request, and sends no-store and no-sniff headers.

Upload intents are owner-bound, expiring, and immutable. Ordinary administrator clients cannot insert finalized asset rows, overwrite an original, or change its storage identity. Finalization is a service-only RPC with actor validation, row locking, idempotence, and atomic attachment creation. Metadata changes use a version check and transaction to reject stale edits. Database grants, RLS, constraints, and triggers enforce these boundaries independently of the UI.

These controls do not make unreviewed media suitable for publication. File signature checks do not scan for malware, verify every codec, transcode video, remove embedded location/EXIF metadata, or generate captions. Review the original bytes and identifiable people before approval; prepare a sanitized or captioned copy where needed. Playback depends on the viewer's browser and the file's codec. Public copies can be downloaded and redistributed by viewers.

## Deployment and operations

1. Back up the database and original bucket objects independently, using the [recovery runbook](backup-recovery.md).
2. Confirm `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY` is present only on the application server. Media finalization and delivery now depend on it, as account administration already does.
3. Apply `202610220001_video_media_kind.sql` and commit that transaction before applying `202610220002_private_media_library.sql`. The second migration uses the enum value added by the first. Apply these through the normal trusted migration runner before deploying dependent application code.
4. Deploy the application. Existing unfinished upload tickets without required context expire and must be restarted. Existing original files are preserved. Legacy records need title and subject details before a new public approval.
5. Verify in the hosted project: private anonymous denial, administrator photo/audio/video upload and playback, a deliberately consented draft-to-published story, byte seeking, and public denial after approval revocation. Confirm direct anonymous Storage downloads remain denied.

Previously issued Storage download tokens can remain valid until expiry, despite removing the anonymous read policy. Inventory the old flow and token lifetime before claiming old links are revoked. If immediate invalidation is necessary, use the storage provider's supported operational procedure; changing the app URL or RLS alone cannot recall an issued token.

No production database migration or hosted Auth/Storage verification is implied by merging code or passing local tests. Preserve a record of the environment, applied migration versions, and hosted smoke-test result.

The library retains originals when associations are removed. Reconcile abandoned uploads separately; do not automatically delete an object after a failed finalize response, because the transaction may have committed before the response was lost. Administrator JSON exports include private archive context but not media bytes and are not a substitute for database snapshots and independent object backups.

## Verification

Run lint, TypeScript, the production build, the standard Playwright suite, and:

```bash
npx playwright test --config tests/media-ui/playwright.config.ts
```

The additional suite uses a local test-only Auth/Storage fixture with actual Next.js media handlers. It checks upload UX, private preview authorization, safe metadata projection, public delivery, revocation, and byte-range behavior. SQL tests in `supabase/tests/media_library.sql` cover roles, required context, atomic rollback, idempotent finalization, storage policies, immutable identities, publication, and version conflicts. CI runs all migrations and SQL suites on PostgreSQL 16.
