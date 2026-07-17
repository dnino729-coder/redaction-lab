// Consultas Prisma reutilizables — `student_dashboard` (13.8), la única
// tabla que el módulo Dashboard posee y en la que escribe (regla MUST:
// "el Dashboard consolida únicamente información derivada de otras tablas —
// no almacena información duplicada"). Sin reglas de negocio: solo acceso a
// datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";
import type { DelfLevel } from "@prisma/client";

export function queryStudentDashboard(tx: StudentScopedClient, studentId: string) {
  return tx.studentDashboard.findUnique({ where: { studentId } });
}

export interface StudentDashboardUpsertInput {
  currentLevel: DelfLevel;
  totalXp: number;
  completedActivities: number;
  completedPlans: number;
  currentStreak: number;
}

/**
 * Materialización del consolidado (15.1: "Materialized View 'Student
 * Dashboard' actualizada mediante procesos programados, en vez de recalcular
 * agregados en cada carga"). En ausencia de un job programado real en esta
 * fase, el Dashboard Service llama a esta función tras leer el resto de
 * fuentes, manteniendo `student_dashboard` como espejo derivado — nunca como
 * origen de verdad.
 */
export function upsertStudentDashboard(
  tx: StudentScopedClient,
  studentId: string,
  data: StudentDashboardUpsertInput,
) {
  return tx.studentDashboard.upsert({
    where: { studentId },
    create: { studentId, ...data },
    update: { ...data },
  });
}
