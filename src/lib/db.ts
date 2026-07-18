import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Point it at a Postgres connection string.");
  }
  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter });
}

// Built lazily (on first real query, not at module import) so that Next.js's
// build-time route analysis — which imports this module without ever running
// a request — doesn't fail just because env vars aren't loaded yet at build time.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    const client = globalForPrisma.prisma;
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
