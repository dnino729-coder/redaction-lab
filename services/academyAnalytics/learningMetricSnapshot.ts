// Lógica pura de proyección: qué campos de `learning_metric` escribe este
// slice y cuáles arrastra sin tocar. Sin acceso a base de datos.
//
// Block 2D §4/§5: esta proyección ES DUEÑA de exactamente un campo —
// `completedTasks`. Cualquier otro campo del snapshot se copia verbatim
// desde el snapshot más reciente del estudiante (o el default 0 del schema
// si no hay ninguno), para que el read model de "último snapshot"
// (`findStudyFrequencySnapshot`) nunca pierda un valor que este evento no
// tiene derecho a cambiar.

export interface PreviousLearningMetricSnapshot {
  readonly studyTimeMinutes: number;
  readonly completedSessions: number;
  readonly activeDays: number;
}

export interface LearningMetricSnapshotFields {
  readonly studyTimeMinutes: number;
  readonly completedSessions: number;
  readonly completedTasks: number;
  readonly activeDays: number;
}

export function buildLearningMetricSnapshotFields(
  previous: PreviousLearningMetricSnapshot | null,
  completedTasks: number,
): LearningMetricSnapshotFields {
  return {
    // Único campo que esta proyección determina honestamente: conteo de
    // eventos ReflectionCompleted ya proyectados para el estudiante.
    completedTasks,
    // NUNCA se deriva desde Academia: un Attempt no registra tiempo de
    // dedicación. Se arrastra.
    studyTimeMinutes: previous?.studyTimeMinutes ?? 0,
    // No hay un mapeo de ReflectionCompleted a "sesión de estudio"
    // (concepto de My Plan). Se arrastra.
    completedSessions: previous?.completedSessions ?? 0,
    // Sin definición acordada para derivar "días activos distintos" desde
    // eventos del Outbox (auditoría Block 2C). Se arrastra, no se inventa.
    activeDays: previous?.activeDays ?? 0,
  };
}
