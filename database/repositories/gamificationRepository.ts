// Repositorio: Gamificación (13.9/11.4), subconjunto para los bloques 2 y 6
// (racha, nivel, XP). Envuelve database/queries con una interfaz orientada a
// entidad; no contiene reglas de negocio de Gamificación (cálculo de XP por
// actividad, desbloqueo de logros, etc. — eso pertenece al futuro módulo
// Gamificación) — ver ARCHITECTURE.md, sección 2.1.

import { queryStreak, queryStudentLevel, queryTotalXp } from "@/database/queries/gamification";
import type { StudentScopedClient } from "./withStudentContext";

export interface GamificationSnapshot {
  currentStreak: number;
  longestStreak: number;
  levelNumber: number;
  totalXp: number;
}

export async function findGamificationSnapshot(
  tx: StudentScopedClient,
  studentId: string,
): Promise<GamificationSnapshot> {
  const [streak, level, totalXp] = await Promise.all([
    queryStreak(tx, studentId),
    queryStudentLevel(tx, studentId),
    queryTotalXp(tx, studentId),
  ]);

  return {
    currentStreak: streak?.currentCount ?? 0,
    longestStreak: streak?.longestCount ?? 0,
    levelNumber: level?.levelNumber ?? 1,
    totalXp,
  };
}
