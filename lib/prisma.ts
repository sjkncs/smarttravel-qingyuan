// Gracefully handle missing Prisma generated output (e.g. static export builds)
let PrismaClient: any;
try {
  PrismaClient = require("@/lib/generated/prisma").PrismaClient;
} catch {
  PrismaClient = null;
}

const globalForPrisma = globalThis as unknown as { prisma: any | null };

function createPrismaClient(): any | null {
  if (!PrismaClient) {
    console.warn("[Prisma] Generated client not found — DB features disabled (static export mode).");
    return null;
  }
  try {
    return new PrismaClient();
  } catch (e) {
    console.warn("[Prisma] Failed to initialize PrismaClient — DB features disabled.", e);
    return null;
  }
}

export const prisma: any | null =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
