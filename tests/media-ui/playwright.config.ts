import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: ['media.spec.ts', 'gateway.spec.ts'],
  timeout: 45_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node tests/media-ui/auth-server.mjs',
      cwd: process.cwd(),
      url: 'http://127.0.0.1:3210/health',
      env: { MADHAAF_MEDIA_TEST_AUTH: '1' },
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 -p 3100',
      cwd: process.cwd(),
      url: 'http://127.0.0.1:3100/login',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:3210',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-only-publishable-key',
        SUPABASE_SECRET_KEY: 'test-only-service-key',
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
