# Media flow checks

Run from the repository root after installing Playwright Chromium:

```sh
npx playwright install chromium
npx playwright test --config tests/media-ui/playwright.config.ts
```

The configuration starts a local Supabase fixture on port 3210 and the actual Next.js app on port 3100. It sets test-only credentials for those processes; no application authentication bypass or real account is used.

- `gateway.spec.ts` exercises real public and private media HTTP routes, with local Auth, PostgREST, and Storage responses. It covers public revocation, private access checks, metadata redaction, seeking, HEAD, and rejected storage ranges.
- `media.spec.ts` runs the real admin page in Chromium with mocked media APIs. It covers required context and consent, living-person selection, failed upload recovery, finalization retries, private video preview, dialog keyboard behavior, mobile overflow, and revoking older records without required metadata.
- `../browser/media-validation.spec.ts` tests shared validation and binary inspection independently of network services.

These fixtures do not implement Supabase RLS. Database authorization and publication invariants are verified separately by the SQL suites under `supabase/tests`. CI runs both layers. The preview fixture checks native video controls; codec decoding is not asserted with its placeholder bytes.
