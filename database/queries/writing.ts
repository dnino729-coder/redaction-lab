// Consultas Prisma reutilizables — Producción Escrita (13.5), subconjunto
// leído por el Dashboard ("Continúa donde te quedaste", bloque 4). Ver el
// límite exacto entre /prisma, database/ y services/database en
// ARCHITECTURE.md, sección 2.1. Sin reglas de negocio: solo acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/**
 * Última entrega no finalizada del estudiante (estado distinto de
 * CORRECTED/ARCHIVED), con su borrador más reciente — es la fuente de
 * "último texto escrito" / "simulaciones incompletas" del bloque 4
 * (docs/modules/dashboard.md, sección 2).
 */
export function queryLatestIncompleteSubmission(tx: StudentScopedClient, studentId: string) {
  return tx.writingSubmission.findFirst({
    where: {
      studentId,
      status: { notIn: ["CORRECTED", "ARCHIVED"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      drafts: { orderBy: { autosavedAt: "desc" }, take: 1 },
    },
  });
}
