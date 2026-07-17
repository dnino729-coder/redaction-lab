// Consultas Prisma reutilizables — Competencias y Analíticas de Aprendizaje
// (13.8), subconjunto leído por el Dashboard (bloque 6, "Evolución"). Ver el
// límite exacto entre /prisma, database/ y services/database en
// ARCHITECTURE.md, sección 2.1. Sin reglas de negocio: solo acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/**
 * Últimas 7 competencias evaluadas del estudiante (calidad de escritura,
 * organización textual, gramática, cohesión, vocabulario, autonomía —
 * sección 2, bloque 6). El bloque 6 reduce este conjunto a 5/3-4/2-3
 * indicadores visibles según el dispositivo (14.10) — esa reducción es
 * responsabilidad del componente de presentación, no de esta consulta.
 */
export function queryStudentCompetencies(tx: StudentScopedClient, studentId: string) {
  return tx.studentCompetency.findMany({
    where: { studentId },
    orderBy: { lastUpdated: "desc" },
    include: { competency: { select: { name: true } } },
  });
}

export function queryLearningAnalytics(tx: StudentScopedClient, studentId: string) {
  return tx.learningAnalytics.findUnique({ where: { studentId } });
}
