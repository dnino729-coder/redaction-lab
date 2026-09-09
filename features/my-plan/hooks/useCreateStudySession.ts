"use client";
// Mismo patrón que useCompleteStudentOnboarding.ts (features/profile) —
// única diferencia: este hook sí invalida una query key propia
// (myPlanKeys.phases()) porque vive dentro de la misma feature que la
// expone, sin el problema de acoplamiento cruzado que evitaba ese otro
// hook.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { createStudySession } from "../services/myPlanApi";

export function useCreateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => createStudySession(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.phases() });
    },
  });
}
