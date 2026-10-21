# Kutchi Roots — Mombasa

A cultural archive for Mombasa Kutchi words, family histories, and documented community stories. The public site includes a dictionary, a draft orthography guide, and a history archive. The private administrator space manages genealogy, entries, articles, recordings, and publication.

The repository is a Next.js 16 App Router and TypeScript modular monolith. Supabase PostgreSQL is the only content database; Supabase Auth and private Storage provide identity and media. No family records or historical claims are preloaded. The migration seeds only the six expressions supplied by the project owner and Draft 0.3 writing conventions.

## Start locally

1. Install Node.js and npm, Docker, and the Supabase CLI.
2. Run `npm ci`.
3. Run `npx supabase start` and `npx supabase db reset` **only against your local development stack**.
4. Copy `.env.example` to `.env.local`; set the local Supabase URL and publishable key from `npx supabase status`.
5. Run `npm run dev` and open `http://localhost:3000`.

See [local setup and administrator provisioning](docs/setup.md) for the first account, Auth redirect settings, and hosted environments. The first visitor is never made an administrator; public registration must remain disabled. A configured Supabase project is required for content editing and live data. Without it, the public pages show honest unavailable states and private endpoints reject access.

## Checks

```bash
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

Playwright tests cover public responsive pages, exact-spelling display, article citations and private-link handling, unauthenticated access denial, relationship validation, request size and origin checks, and media signatures. With a configured Supabase project, the live browser test also exercises administrator creation, editing, and sign-in with disposable accounts. [Database smoke tests](docs/backend-api.md#local-database-smoke-test) cover schema invariants and RLS using PostgreSQL test stubs. The [quality workflow](.github/workflows/quality.yml) runs lint, type checking, build, database smoke, and browser tests when GitHub is connected.

## Documentation

- [Architecture and data decisions](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Product design system](docs/design-system.md)
- [API contract](docs/backend-api.md)
- [Backup and recovery](docs/backup-recovery.md)
- [Engineering and security review](docs/reviews/engineering-security-round1.md)

Media uploads go directly to private Supabase Storage with an administrator-issued upload intent, then the server validates the stored object before creating metadata. Public media needs recorded consent, administrator approval, and an association to published dictionary or history content. A database export does not include photograph or audio bytes; back up the bucket independently.

## Language research articles

The editorial research collection lives at `/language/articles`, with one static, statically generated route per study. Content and evidence labels live in `src/lib/language-articles.ts`; the reusable article renderer lives in `src/components/public/language-research.tsx`; illustrations are original decorative SVGs in `public/language/research/`. They are **not** historical photographs or linguistic source material. No grammar article is written to the History CMS or the database.

Every published example must come from speaker-supplied elicitation, and speaker judgments must remain distinct from proposed linguistic explanations. Maintain original wording and the project's `(n)`-before-`th` display convention. Word links lead to published dictionary searches, rather than assuming fixed IDs; unpublished entries may not appear. Check this evidence policy and the mobile reading experience whenever adding or changing a study.

## Founder and editorial attribution

Madhaaf was founded by **Farhan Abdulla**, a native speaker documenting East African Mombasa Kutchi as a personal language-preservation and cultural-history project. The About page (`/about`) describes the family-history context, the provisional nature of early migration accounts, and the role of **Adam Anderson** and **TokenWorks LLC** in supporting the work.

The research papers, grammar guide, and writing guide use Farhan's first-person editorial voice. Preserve the speaker's exact Kutchi examples and distinguish observed grammaticality from interpretation. Do not claim the papers are peer reviewed or have been validated across other speakers.

**Research article dating policy:** The five dates displayed in the series are retrospectively assigned **2026 editorial issue dates**, not claimed historical online publication dates or verified dates of elicitation. The papers first appeared on the website in October 2026. Keep this distinction visible on the index, article pages and in publication metadata; do not backdate `publishedTime` or provenance.
