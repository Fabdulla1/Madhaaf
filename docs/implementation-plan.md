# Kutchi Roots implementation and verification plan

**Scope:** Full-stack working foundation for the brief. This plan records dependencies and acceptance checks; it does not mark unbuilt features as complete.

## Delivery sequence

1. **Foundation:** Initialize Git on `feat/kutchi-roots-foundation`, scaffold strict Next.js App Router, Tailwind, lint/typecheck/test scripts, Supabase local configuration, `.env.example`, and base design tokens. Verify local boot with no external credentials. Commit this checkpoint and open a draft PR if remote authentication becomes available.
2. **Schema and access:** Write ordered SQL migrations for roles, shared editorial fields, revisions/audit, family, dictionary, history, sources, and media; enable RLS and explicit grants on every exposed table and Storage object path. Seed only the six supplied dictionary examples and orthography Draft 0.3. Build database tests for public, unauthenticated, admin, and later-family roles. Document first-admin provisioning without public sign-up.
3. **Server services:** Implement centralized Supabase browser/server clients, session validation, admin authorization, Zod request schemas, domain services, transactional writes, optimistic version checks, search, publication invalidation, upload validation, and recoverable editorial snapshots. Never call privileged operations directly from client components.
4. **Public experience:** Build the editorial homepage, dictionary search/detail/orthography, and history listings/articles. Render meaningful empty states where authentic content is absent. Ensure private family data never enters public HTML, metadata, search, or cache.
5. **Admin experience:** Build login/logout/reset UI, dashboard overview based on actual counts/activity, all eight navigation sections, consistent edit forms, drafts/publishing/revisions, media management, and precise success/error feedback. Include unsaved-change protection and conflict resolution for stale edits.
6. **Family experience:** Build member CRUD, duplicate suggestion/reuse, relationship builder with preview and transaction, profile and quick view, interactive React Flow explorer, search/focus/branch controls, and accessible list representation. Validate cycles, canonical identity, private access, and targeted refresh after publication.
7. **Media and content integrity:** Finish image/audio upload pipeline, attribution and consent, private signed access, safe replacement/deletion, article cross-link checks, and playable audio. Confirm no public URL or link exposes a private person or recording.
8. **Review and remediation:** Independently review rendered UI across desktop/tablet/mobile, keyboard flows, engineering boundaries, and adversarial private-data access. Record findings with severity, location, reproduction, fix, and verification evidence. Re-run affected tests and review changed code after remediation.
9. **Release readiness:** Run typecheck, lint, unit/integration tests, RLS tests, Playwright workflows, production build, and restore rehearsal where infrastructure permits. Document environment setup, Vercel deployment, backups, exports, known limitations, and exact external configuration remaining. Push focused commits and inspect actual CI status. Do not merge or deploy to production without explicit authorization.

## Acceptance matrix

| Workflow | Required evidence |
| --- | --- |
| Authentication | Admin can log in, load private dashboard, log out; invalid credentials fail; anonymous requests to admin routes and write endpoints fail; client-side role tampering cannot elevate access. |
| Family | Admin creates a member, biography and photograph, links an existing or new member, publishes, and sees the relationship in the explorer without redeploy. Cycle/self-link/duplicate attempts fail. Anonymous search, detail, graph, metadata, and private media access fail. |
| Dictionary | Admin creates a lexeme with multiple meanings, variant, example and recording; published entry appears in exact and English search. Apostrophe and `(n)` survive storage and search; spelling edits retain permanent ID links. |
| History | Admin drafts, previews, revises, publishes and unpublishes an article with media; public pages show only published content and safe cross-links. |
| Editorial integrity | Stale updates report a conflict; revisions can be recovered; publication and permission changes appear in audit events; shared media cannot be orphaned by routine deletion. |
| Design and accessibility | Inspect actual desktop, tablet and mobile renderings; complete keyboard navigation and list-based family exploration; verify focus, contrast, labels, responsive forms, touch targets, and reduced-motion behavior. |
| Operations | Local setup works from documented steps; migration/seed can be replayed; database and independent media backup/restore are tested in isolation before claiming recovery readiness. |

## Review evidence format

For each critique finding record severity (`critical`, `high`, `medium`, `low`), route/component or file, reproduction steps, expected behavior, actual behavior, proposed fix, owner, and verification result. A resolved label requires a passing focused test or an inspected browser flow. Report infrastructure-dependent checks as **not run**, not passing.

## External setup checklist

- Supabase project(s), local CLI runtime, Auth email provider and approved redirect origins.
- First administrator created through a secure management process and explicitly granted the database `admin` role by UUID.
- Storage buckets and RLS policies migrated in each environment.
- Vercel project, environment-specific variables, domain, and deployment protection for previews containing private data.
- Off-project encrypted PostgreSQL export destination and independent media-object backup destination, retention policy, and restore-test schedule.
- Approved family content, recording consent, archival imagery, and historically sourced articles before public publication.

Until these are configured, local tests can establish code behavior but cannot prove hosted authentication email, production storage access, deployment, or recovery.
