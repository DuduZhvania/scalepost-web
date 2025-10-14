import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",      // or "./src/db/schema/**/*.ts" if split files
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // read from env
  },
});
