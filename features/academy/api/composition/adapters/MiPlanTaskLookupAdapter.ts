import type { MiPlanTaskLookupPort } from "@/features/academy/domain/ports/MiPlanTaskLookupPort";

// Implementación de `MiPlanTaskLookupPort` (Domain Layer, puerto ya
// Frozen) — resuelve la tarea de Mi Plan vinculada a una AcademyUnit,
// consultada antes de `AcademyUnit.completeFromAttempt()` (RN-10, A-08).
//
// Hallazgo de este Sprint (disclosed, no BLOCKER): el modelo `LearningTask`
// de Mi Plan (`prisma/schema.prisma`) tiene un campo `source` con el valor
// `ACADEMY` ya reservado (`enum LearningTaskSource { SELF_DIRECTED ACADEMY
// LABORATORY DAILY_TRAINING SIMULATOR }`), pero **ninguna columna** enlaza
// una fila de `LearningTask` con el `id` de una `AcademyUnit` específica
// (sin `academyUnitId`, sin `externalRefId`) — ese enlace no fue construido
// en el Sprint de Mi Plan y añadirlo ahora exigiría modificar el schema de
// Mi Plan, fuera de alcance de este Sprint de Academia ("no modificar
// ninguna capa anterior").
//
// Resolución: se implementa el puerto devolviendo siempre `null` — el
// propio contrato del puerto ya documenta `null` como "no existe ninguna
// [tarea vinculada]", un caso válido, no un error. `AcademyUnit
// .completeFromAttempt()` y `CompleteUnitOnReflectionCompletedHandler` ya
// están diseñados para tolerar ausencia de vínculo. Comportamiento honesto
// dado el estado real del schema — no se fabrica un enlace inexistente.
export class MiPlanTaskLookupAdapter implements MiPlanTaskLookupPort {
  public async findLinkedTaskId(): Promise<string | null> {
    return null;
  }
}
