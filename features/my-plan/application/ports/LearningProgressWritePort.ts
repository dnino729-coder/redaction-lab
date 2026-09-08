// Puerto de escritura (CQRS) — `LearningProgress` (13.4). Misma
// justificación que `LearningProgressReadPort.ts`/`DailyPlanReadPort.ts`:
// `LearningProgress` no tiene Entity ni Repository de dominio (es un
// resumen agregado, sin comportamiento ni invariantes propios) — por eso
// esta es una operación de escritura de proyección (upsert por clave
// natural `learningPlanId`, ya `UNIQUE` en la tabla), no un método de
// Repository de dominio. Ver auditoría "Learning Progress Architecture
// Audit", secciones 9-10: la base de datos ya otorga a
// `dashboard_service_role` el GRANT necesario (migración
// 202607171400_my_plan_rls_policies) — este puerto solo declara el
// contrato, sin implicar ningún cambio de RLS/GRANT.
import type { LearningProgressWriteInputDto } from "../dto/LearningProgressDto";

export interface LearningProgressWritePort {
  upsert(input: LearningProgressWriteInputDto): Promise<void>;
}
