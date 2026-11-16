import { defineConfig } from 'vitest/config';

// Deliberately NOT extending vite.config.ts: that file registers a dev-only
// middleware which loads the real .env.local (including the Resend key) into
// process.env. Tests must never see it, or an endpoint test could send a real
// email. Run with `npm test` (scripts/test.mjs).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
