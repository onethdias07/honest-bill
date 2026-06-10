import path from "node:path";
import { defineConfig } from "@prisma/config";

// Prisma 7 no longer auto-loads .env. Node 24 has a native loader, so we use it
// to make DATABASE_URL available to the CLI (migrate / db push / studio / seed).
try {
  process.loadEnvFile();
} catch {
  // .env may be absent in some environments (e.g. CI with real env vars) — fine.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
