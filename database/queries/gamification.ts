// Consultas Prisma reutilizables — Gamificación (13.9/11.4), subconjunto
// leído por el Dashboard (bloques 2 y 6). El XP total NUNCA se lee de un
// campo cacheado aquí: se agrega en tiempo real con SUM sobre
// `xp_transaction` (regla MUST, 11.4: "el XP total se calcula como la suma
// de todas las transacciones") — esto es una consulta agregada, no una
// regla de negocio de Gamificación (esa pertenece al futuro módulo
// Gamificación, no a esta lectura). Sin reglas de negocio adicionales: solo
// acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

export function queryStreak(tx: StudentScopedClient, studentId: string) {
  return tx.streak.findUnique({ where: { studentId } });
}

export function queryStudentLevel(tx: StudentScopedClient, studentId: string) {
  return tx.studentLevel.findUnique({ where: { studentId } });
}

export async function queryTotalXp(tx: StudentScopedClient, studentId: string): Promise<number> {
  const result = await tx.xPTransaction.aggregate({
    where: { studentId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
