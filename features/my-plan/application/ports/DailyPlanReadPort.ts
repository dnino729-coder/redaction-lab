// Puerto de lectura (CQRS) — `DailyPlan` (13.4). AMBIGÜEDAD DETECTADA Y
// RESUELTA EXPLÍCITAMENTE (ver informe de entrega, sección "Ambigüedad
// reportada"): `DailyPlan`/`WeeklyPlan`/`LearningProgress` fueron
// deliberadamente excluidas del Domain Layer del Sprint 3.3.2 (ninguna
// tiene Entity, Value Object ni Repository de dominio — su ficha en 13.4
// es un resumen agregado de solo lectura, sin comportamiento ni
// invariantes propios, no una entidad con ciclo de vida). Exigir un
// Repository de dominio para poder implementar `GetDailyPlan` violaría
// "No modificar Domain Layer".
//
// Resolución adoptada: un puerto de lectura CQRS independiente del
// modelo de escritura, que devuelve directamente el DTO de lectura — sin
// pasar por ninguna Entity. Es una separación Command/Query legítima
// (la propia consigna del sprint pide "CQRS cuando aplique"): estas 3
// consultas son lecturas de un modelo agregado ya materializado, no
// requieren reconstruir un Aggregate. Solo se declara el contrato — la
// implementación (consulta a Prisma) es infraestructura, fuera de
// alcance.
import type { DailyPlanReadModel } from "../dto/DailyPlanDto";

export interface DailyPlanReadPort {
  findByLearningPlanIdAndDate(learningPlanId: string, date: Date): Promise<DailyPlanReadModel | null>;
}
