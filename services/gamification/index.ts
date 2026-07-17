// Servicio: gamification — Gamificación (sección 11).
// "Los servicios nunca dependerán de componentes visuales" (sección 5.4).
//
// Alcance de esta fase (implementación del módulo Dashboard): expone
// ÚNICAMENTE una lectura de solo-consulta (racha, nivel, XP total) para los
// bloques 2 y 6 del Dashboard. NO implementa reglas de negocio de
// Gamificación (otorgar XP, desbloquear insignias/logros, completar
// misiones, reclamar recompensas — sección 11.4) — esa lógica pertenece al
// futuro módulo Gamificación (10_gamification) y no debe construirse aquí.

import { findGamificationSnapshot, withStudentContext, type GamificationSnapshot } from "@/database/repositories";

export type { GamificationSnapshot };

export async function getGamificationSnapshot(studentId: string): Promise<GamificationSnapshot> {
  return withStudentContext(studentId, (tx) => findGamificationSnapshot(tx, studentId));
}
