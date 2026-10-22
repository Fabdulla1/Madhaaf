# Madhaaf | Mombasa and Ethiopian Kutchi research

Madhaaf is an academic research and documentation project focused on Kutchi language, history, and cultural knowledge in Mombasa and Ethiopian communities. The public site includes a dictionary, grammatical studies, a provisional Latin orthography, and historical records. The private administrator space manages genealogy, lexical entries, articles, recordings, source records, and publication.

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
- [Media library, privacy, and rollout](docs/media-library.md)
- [Backup and recovery](docs/backup-recovery.md)
- [Engineering and security review](docs/reviews/engineering-security-round1.md)

Media uploads go directly to private Supabase Storage with an administrator-issued upload intent, then the server validates the stored object before creating metadata. Uploads require a title, subject description, and storage permission, and support photographs, audio, and video. Public media needs explicit approval and an association to a published article or story; family-linked media remains private. Media delivery checks access on every request without sharing Storage download tokens. A database export does not include media bytes; back up the bucket independently. See the [media rollout guide](docs/media-library.md) before deploying the two media migrations.

## Language research articles

The editorial research collection lives at `/language/articles`, with one static, statically generated route per study. Content and evidence labels live in `src/lib/language-articles.ts`; the reusable article renderer lives in `src/components/public/language-research.tsx`; illustrations are original decorative SVGs in `public/language/research/`. They are **not** historical photographs or linguistic source material. No grammar article is written to the History CMS or the database.

Every published example must come from speaker-supplied elicitation, and speaker judgments must remain distinct from proposed linguistic explanations. Maintain original wording and the project's `(n)`-before-`th` display convention. Word links lead to published dictionary searches, rather than assuming fixed IDs; unpublished entries may not appear. Check this evidence policy and the mobile reading experience whenever adding or changing a study.

## Historical research studies

The History section also includes a source-controlled study of the Kutchi diaspora in Kenya and Ethiopia, with numbered references, attributed images and an optional animated map. The study is published at `/history/kutchi-diaspora-kenya-ethiopia`; [maintenance and evidence notes](docs/history-diaspora-study.md) describe its sources, route limitations, assets and verification. It sits alongside the administrator-managed community archive and is not a CMS database record.

## Research scope, attribution and editorial policy

Madhaaf was founded by **Farhan Abdulla** to document Kutchi spoken in Mombasa and Ethiopian communities, alongside relevant oral history and cultural records. **TokenWorks LLC** and **Adam Anderson** are acknowledged for research infrastructure and technical support. This does not imply formal university sponsorship or peer review.

The public site uses concise, evidence-focused academic language. It is not a personal memoir or a hobby project. Author credit remains visible, but project descriptions should refer to Mombasa and Ethiopian Kutchi rather than "my Kutchi". Published articles preserve native-speaker wording, original forms, supplied translations and explicit grammaticality judgments. Analyses, comparisons with Gujarati or Sindhi, and unverified historical accounts must be labeled as such. Do not claim findings are representative of speakers who have not been studied.

See [editorial and evidence standards](docs/editorial-policy.md) when revising content. Avoid em dashes as editorial punctuation in the research articles. Mobile interfaces should not rely on emoji or decorative arrow symbols.

**Research article dating policy:** Displayed study dates are retrospectively assigned **2026 editorial issue dates**, not verified elicitation or earlier online publication dates. The articles first appeared online in October 2026. Keep that distinction visible in article and index metadata; do not backdate `publishedTime` or provenance.
