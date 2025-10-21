import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';

// Load env only if not in production (e.g., for local migrations)
if (process.env.NODE_ENV !== 'production') {
  loadEnv({ path: '.env.local' });
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/media.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
