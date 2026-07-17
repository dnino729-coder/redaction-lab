// Consultas Prisma reutilizables — Coach IA y Memoria (13.7), subconjunto
// leído por el Dashboard (bloque 5, "Recomendación del Coach IA"). El
// Dashboard NUNCA genera recomendaciones (eso es responsabilidad del módulo
// Coach IA/AI Orchestrator, sección 9.4) — solo lee la más reciente y no
// completada. Ver el límite exacto entre /prisma, database/ y
// services/database en ARCHITECTURE.md, sección 2.1.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/**
 * Regla de contención del Coach IA (9.2, "cuándo NO aparece" — criterio de
 * aceptación del Dashboard, docs/modules/dashboard.md sección 16): como
 * máximo una recomendación por visita. Se toma la más reciente y no
 * completada; el Dashboard no decide cuál mostrar más allá de "la última".
 */
export function queryActiveRecommendation(tx: StudentScopedClient, studentId: string) {
  return tx.coachRecommendation.findFirst({
    where: { studentId, completed: false },
    orderBy: { createdAt: "desc" },
  });
}

export function queryCoachContext(tx: StudentScopedClient, studentId: string) {
  return tx.coachContext.findUnique({ where: { studentId } });
}
