// Blueprint §5.1. Forma real producida por
// features/academy/api/response-mappers/unitResponseMappers.ts — no la
// promesa idealizada del API Contract (ver gap disclosed abajo).
import type { TextType, UnitState } from "./enums";

export interface AcademyUnitSummaryHttp {
  unitId: string;
  studentId: string;
  textType: TextType;
  position: number;
  state: UnitState;
  activeAttemptId: string | null;
}

export interface AcademyUnitDetailHttp extends AcademyUnitSummaryHttp {
  completedAt: string | null;
  masteredAt: string | null;
  eligibleForUnlock: boolean;
  repeatable: boolean;
  teacherOverrideCount: number;
}

/**
 * ⚠️ Gap disclosed (Blueprint §5.1): el Contract documenta además
 * `unlockedAt`, `attemptCount` e `isRecommended` — ninguno lo produce hoy el
 * Response Mapper real. No añadir estos campos a la interfaz: hacerlo
 * simularía una respuesta que el backend no entrega.
 */
