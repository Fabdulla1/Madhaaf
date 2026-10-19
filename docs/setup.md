# Local setup and first administrator

This guide describes the intended configured environment. It does not imply that a hosted Supabase project, email provider, or Vercel deployment already exists.

## Prerequisites

- A supported Node.js installation and npm.
- Docker and the Supabase CLI for a local Supabase stack, or a separate Supabase project for development.
- A secure place to store local environment variables. Never commit `.env.local` or a service-role key.

## Local application

1. Run `npm ci` from the repository root.
2. Start the local Supabase stack with `npx supabase start` using the committed `supabase/config.toml`. Read the local API URL and publishable key from `npx supabase status`; do not copy its service-role key into client variables.
3. Apply migrations and seeds using the repository's documented reset command, normally `npx supabase db reset` for **local data only**. This destroys the local database contents; do not run it against a shared or production project.
4. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key. This application uses the administrator's Supabase session and does not require a service-role key. Set the site URL and Auth callback origin to the local application URL.
5. Run `npm run dev`. Run the repository's lint, typecheck, tests, and production build scripts before publishing changes.

The migration creates the private `heritage-media` bucket and its administrator-only object policies. The six owner-supplied dictionary examples and Draft 0.3 orthography are seeded. Family members and historical claims are intentionally absent.

## Provision the first administrator

Public registration must remain disabled in Supabase Auth. The first visitor never becomes an administrator. An operator who already has management access to the intended Supabase project must:

1. Create the administrator's email/password Auth account in the Supabase dashboard's protected user-management interface. Use a strong unique password and verify the email as required by the project's policy.
2. Copy the exact `auth.users.id` UUID of that new user from the same project.
3. In that project's protected SQL editor, grant the role using the UUID, after checking the target project and user:

   ```sql
   insert into public.app_users (user_id, role)
   values ('REPLACE_WITH_EXACT_AUTH_USER_UUID'::uuid, 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

4. Sign in through `/login`, verify `/admin` access, sign out, then verify `/admin` and all write actions reject the signed-out session.
5. Confirm a different valid account without the `admin` row cannot access admin data. Revoke a role by changing it to `viewer` or deleting its `app_users` row from the protected management interface.

Only trusted project operators should run this SQL. Do not expose a web endpoint that accepts a user UUID and assigns the admin role. Future invitations should be built as a separate authenticated workflow with an audit trail.

## Hosted environments

Use separate Supabase projects for preview and production if preview work may contain private data. In each environment, apply the same migrations, configure Auth allowed redirect URLs and email delivery, set environment variables in Vercel settings, and then deploy compatible application code. Store production secrets only in protected settings. Verify private storage, RLS, and admin provisioning in the target project before inviting users or publishing content.

Password reset requires a configured Auth email sender and approved redirect URL. Until a real reset email has been received and completed in that environment, report this path as unverified.
