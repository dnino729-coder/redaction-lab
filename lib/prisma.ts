// Cliente Prisma singleton (evita múltiples conexiones en desarrollo con HMR).
// Sección 13.12 (Modelo Físico) — motor PostgreSQL 17, ORM Prisma (resolución 18.1).
// Sin lógica de negocio: solo instanciación del cliente.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
