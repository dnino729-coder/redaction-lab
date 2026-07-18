import { InvalidStatusTransitionException } from "../exceptions/InvalidStatusTransitionException";

// Tabla de transiciones válidas, común a `LearningGoal`, `LearningObjective`,
// `LearningPhase` y `LearningTask` — las 4 entidades que comparten
// exactamente el mismo ENUM de 4 valores y la misma tabla de transiciones
// (resolución 18.21, punto 2, "Transiciones válidas (mismas para las 4
// entidades)"). Se centraliza aquí para no duplicar la misma tabla 4 veces;
// cada entidad sigue siendo responsable de decidir *cuándo* invocarla (p.
// ej. `LearningTask` exige además que `source = SELF_DIRECTED` antes de
// permitir una transición manual — esa regla adicional vive en la propia
// entidad, no aquí).
export type LifecycleStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface TransitionOptions {
  /**
   * `COMPLETED → IN_PROGRESS` (reversión) solo está permitida en las
   * entidades de transición manual — `LearningTask` con
   * `source = SELF_DIRECTED` y `LearningObjective` (18.21, punto 2). Las
   * entidades de cálculo automático (`LearningGoal`, `LearningPhase`)
   * nunca la usan, porque nunca transicionan manualmente a `COMPLETED` en
   * primer lugar.
   */
  allowReversionFromCompleted?: boolean;
}

const ALWAYS_VALID_EDGES: ReadonlyArray<readonly [LifecycleStatus, LifecycleStatus]> = [
  ["NOT_STARTED", "IN_PROGRESS"],
  ["IN_PROGRESS", "COMPLETED"],
  ["NOT_STARTED", "CANCELLED"],
  ["IN_PROGRESS", "CANCELLED"],
];

/**
 * Lanza `InvalidStatusTransitionException` si `from → to` no es una
 * transición permitida por 18.21. Transiciones explícitamente prohibidas,
 * sin excepción: `COMPLETED → CANCELLED`, y cualquier transición *desde*
 * `CANCELLED` (estado terminal, sin reactivación).
 */
export function assertTransitionAllowed(
  entityName: string,
  from: LifecycleStatus,
  to: LifecycleStatus,
  options: TransitionOptions = {},
): void {
  if (from === to) {
    throw new InvalidStatusTransitionException(entityName, from, to);
  }

  const isAlwaysValidEdge = ALWAYS_VALID_EDGES.some(
    ([edgeFrom, edgeTo]) => edgeFrom === from && edgeTo === to,
  );
  if (isAlwaysValidEdge) return;

  const isAllowedReversion =
    options.allowReversionFromCompleted === true &&
    from === "COMPLETED" &&
    to === "IN_PROGRESS";
  if (isAllowedReversion) return;

  throw new InvalidStatusTransitionException(entityName, from, to);
}
