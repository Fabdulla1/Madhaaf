# Backup, export, and recovery runbook

Madhaaf preserves private family records and culturally important photographs, audio, and video. A database dump alone is incomplete: [Supabase database backups omit the underlying Storage objects](https://supabase.com/docs/guides/platform/backups). Keep the database and media copies independently, encrypted, access-controlled, and outside the live Supabase project.

## Backup set

At each scheduled backup, record a backup ID, environment, start/end time, migration version, row counts, object counts, operator, and checksums in a manifest. Capture:

1. A PostgreSQL logical dump or managed database snapshot that includes application tables, constraints, policies, functions, and reference data, including `media_details`, upload intents, attachment tables, and consent/approval state. Confirm Auth identities and role mappings are recoverable under the selected method; `app_users` refers to `auth.users` UUIDs.
2. A separate copy of every object in the private `heritage-media` bucket, preserving exact object keys and original bytes. Record per-object SHA-256, size, MIME type, and the related `media_assets.id`. The database stores metadata and relationships, not the original media bytes.
3. The application Git commit, migration files, Supabase configuration, deployment environment-variable **names** (never secret values), and any external Auth/email configuration needed to reconstruct the service.

The project owner must select retention periods and off-project destinations before launch. Use encrypted storage with restricted access and versioning or immutable retention so accidental deletion in the live project does not erase the only backup. Schedule both backup jobs and monitor failures; a failed database or object job makes the set incomplete.

## Restore rehearsal

At a regular interval and before claiming recovery readiness, restore a backup set into an isolated project with no public traffic and no production email sender. Follow this sequence:

1. Record the source backup ID and create a new isolated Supabase project or local stack. Keep its credentials separate from production.
2. Restore database schemas/data or apply the corresponding migrations and import data, according to the chosen backup method. Preserve stable UUIDs. Recreate Auth identities or use the managed recovery path so role mappings still refer to valid users. Do not automatically give a new test account an admin role.
3. Recreate the private `heritage-media` bucket and policies, then restore object bytes under their original keys. Compare counts and SHA-256 checksums against the manifest.
4. Run integrity queries for orphaned foreign keys and media references. Confirm the six owner-supplied lexemes, published article state, revisions, and audit events survived. Verify a representative family profile and representative image, audio, and video objects.
5. Test as anonymous, non-admin, and admin: anonymous access to private profiles, relationships, and media must fail; authorized admin access must succeed; approved published public media must be available only through the application file gateway; anonymous Storage access must fail.
6. Record the test date, operator, restore duration, discrepancies, and corrective actions. The latest successful isolated restore is the recovery evidence; backup-job success by itself is insufficient.

Never rehearse by overwriting the live project. A production restore needs an incident-specific decision on data loss window, communication, and traffic cutover.

## Portable exports

Provide an administrator-only export action that uses a consistent database snapshot and produces UTF-8 JSON files with a schema version and export timestamp. At minimum:

- `genealogy.json`: canonical member UUIDs, names, uncertain date text, life status, visibility, biographies, relationship UUIDs/endpoints/kinds/confidence, source IDs/citations, and media IDs/attribution. Do not include private records in a public download. Future GEDCOM mapping can be added, but it must not flatten disputed/adoptive relationships or erase provenance.
- `dictionary.json`: immutable lexeme UUIDs, headwords, all written forms, senses, examples, related lexeme IDs, orthography version/rules, source and speaker/recording references, and editorial provenance. Keep apostrophes and `(n)` byte-for-byte. This serves as the input to a future Wikibase Lexeme mapping, while PostgreSQL remains the only editable source.
- `media-manifest.json`: asset UUIDs, storage keys, checksums, MIME types, visibility, approval/consent, attribution, and references. Exporting a manifest does not export the media bytes; offer a separately authorized media archive when required.

Apply the same admin authorization and audit logging to exports as to sensitive reads. Stream large exports; do not put private archive downloads in public CDN caches. Test round-trip parsing and record counts before treating an export as a usable preservation copy.

## Private upload reconciliation

Failed validation and abandoned uploads can leave private originals without finalized asset rows. Compare object keys against `media_upload_intents` and `media_assets`, record why each object is unreferenced, and retain a backup before any separately authorized cleanup. Never delete on a failed request or infer that an unattached finalized asset is disposable. A successful retry may already have completed the original intent.

The application JSON exports are paged reads, not a transactional database snapshot. They include private media context, but are supplementary to a database backup and independent object copy. Keep them access-controlled.
