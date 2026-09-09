"use client";
// Mismo patrón que useCreateStudySession.ts/useCompleteLearningTask.ts —
// única query key invalidada: myPlanKeys.studySchedule(). Esta mutación
// solo cambia la configuración de disponibilidad (StudySchedule) — no
// afecta fases/tareas/progreso/sesiones/plan activo/metas, así que no se
// invalida ninguna otra key (ver UpdateStudyScheduleHandler, sin
// modificar: solo escribe `study_schedule`).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { updateStudySchedule, type UpdateStudyScheduleRequestHttp } from "../services/myPlanApi";

export function useUpdateStudySchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudyScheduleRequestHttp) => updateStudySchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.studySchedule() });
    },
  });
}
