/**
 * Redaction Lab — Punto de entrada del seed de base de datos.
 *
 * Esqueleto de infraestructura únicamente. Los seeds reales (Roles,
 * Permissions, Competencies, DELF Rubrics, Levels, Badges, Achievements,
 * Notification Templates, Feature Flags, Configurations — sección 13.12)
 * se implementarán cuando se desarrolle cada módulo correspondiente.
 *
 * Recordatorio (resolución 18.4/18.14): el seed de Roles deberá generar
 * los 7 valores vigentes: SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER,
 * AI_SERVICE, SYSTEM.
 */

import { PrismaClient } from "@prisma/client";
import { seedCompetencies } from "./seed_competencies";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Catálogo de competencias (13.8) — requerido por el módulo Dashboard
  // (bloque 6) para mostrar nombres legibles. El resto de seeds (Roles,
  // Permissions, DELF Rubrics, Levels, Badges, Achievements, Notification
  // Templates, Feature Flags, Configurations) se añadirán al desarrollar
  // cada módulo correspondiente (sección 13.14).
  await seedCompetencies(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
