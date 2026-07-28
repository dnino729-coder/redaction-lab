import type { AcademyRole } from "../composition/adapters";

// Contexto de actor autenticado (Sprint 6.3) — combina el `studentId`
// interno (único dato que `services/auth` ya resuelve, reutilizado sin
// cambios) con el rol de Academia (ver `ClerkRoleResolver`, Nota de
// hallazgo). `studentId` es SIEMPRE el id interno del `User` autenticado
// actual, sin importar su rol (un Profesor autenticado también tiene una
// fila `User`/`id` propia — lo que cambia es qué recurso puede operar,
// nunca la forma de resolver su identidad).
export interface AcademyActor {
  readonly userId: string;
  readonly role: AcademyRole;
}

// Contexto de request — Correlation Id / Request Id (API Contract v1.3,
// Secciones 2/12) y marca de tiempo para el cálculo de duración
// (Telemetry, Alcance #10 del encargo).
export interface AcademyRequestContext {
  readonly correlationId: string;
  readonly requestId: string;
  readonly startedAtMs: number;
  readonly endpoint: string;
  readonly method: string;
}
