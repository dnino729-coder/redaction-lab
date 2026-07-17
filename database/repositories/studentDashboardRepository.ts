// Repositorio: `student_dashboard` (13.8) — la única tabla propia del
// módulo Dashboard. Envuelve database/queries con una interfaz orientada a
// entidad; no contiene reglas de negocio — ver ARCHITECTURE.md, sección 2.1.

import {
  queryStudentDashboard,
  upsertStudentDashboard,
  type StudentDashboardUpsertInput,
} from "@/database/queries/studentDashboard";
import type { StudentScopedClient } from "./withStudentContext";

export type { StudentDashboardUpsertInput };

export interface StudentDashboardRecord {
  currentLevel: string;
  totalXp: number;
  completedActivities: number;
  completedPlans: number;
  currentStreak: number;
  updatedAt: Date;
}

export async function findStudentDashboard(
  tx: StudentScopedClient,
  studentId: string,
): Promise<StudentDashboardRecord | null> {
  const record = await queryStudentDashboard(tx, studentId);
  if (!record) return null;

  return {
    currentLevel: record.currentLevel,
    totalXp: record.totalXp,
    completedActivities: record.completedActivities,
    completedPlans: record.completedPlans,
    currentStreak: record.currentStreak,
    updatedAt: record.updatedAt,
  };
}

export function saveStudentDashboard(
  tx: StudentScopedClient,
  studentId: string,
  data: StudentDashboardUpsertInput,
) {
  return upsertStudentDashboard(tx, studentId, data);
}
