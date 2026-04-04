import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./generated/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "<DATABASE_URL>",
  },
});
