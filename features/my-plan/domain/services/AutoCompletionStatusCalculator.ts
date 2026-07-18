import type { LifecycleStatus } from "../shared/statusTransitions";

// Domain Service — regla de cálculo automático compartida por
// `LearningGoal` (a partir de sus `LearningObjective`) y `LearningPhase`
// (a partir de sus `LearningTask`), resolución 18.21, punto 2:
// "LearningPhase.status/LearningGoal.status se calculan automáticamente...
// COMPLETED cuando el 100% de sus tareas/objetivos no CANCELLED están en
// COMPLETED". Se extrae a un servicio de dominio, en vez de duplicar el
// mismo algoritmo dentro de ambas entidades, porque la regla es
// textualmente idéntica para las dos — es una decisión de diseño (DRY),
// no una regla nueva.
//
// Es un Domain Service en sentido estricto: una operación pura, sin
// identidad propia, que no pertenece naturalmente a ninguna entidad
// individual (opera sobre una *colección* de estados hijos) y no requiere
// ningún acceso a infraestructura — recibe los estados ya calculados de
// las hijas como argumento, nunca los consulta él mismo.
export class AutoCompletionStatusCalculator {
  /**
   * @param childStatuses Estados actuales de todas las entidades hijas
   *   (p. ej. todos los `LearningObjective.status` de un `LearningGoal`).
   *   Las hijas en `CANCELLED` se excluyen del cálculo (18.21: "queda
   *   excluido tanto del cálculo de LearningProgress como de las
   *   condiciones de completado automático de sus entidades padre").
   */
  public static calculate(childStatuses: readonly LifecycleStatus[]): LifecycleStatus {
    const relevant = childStatuses.filter((status) => status !== "CANCELLED");

    if (relevant.length === 0) {
      // Sin hijas relevantes (ninguna hija, o todas CANCELLED): no hay
      // ningún trabajo real que marcar como iniciado o terminado. Lectura
      // conservadora, no contradicha por 18.21 (que no define
      // explícitamente este caso límite) — se documenta aquí como
      // decisión de diseño, no como texto literal de la resolución.
      return "NOT_STARTED";
    }

    const allCompleted = relevant.every((status) => status === "COMPLETED");
    if (allCompleted) return "COMPLETED";

    const anyStarted = relevant.some(
      (status) => status === "IN_PROGRESS" || status === "COMPLETED",
    );
    return anyStarted ? "IN_PROGRESS" : "NOT_STARTED";
  }
}
