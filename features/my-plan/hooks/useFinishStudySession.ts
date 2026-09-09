"use client";
// Mismo patrón que useCreateStudySession.ts.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { finishStudySession } from "../services/myPlanApi";

export function useFinishStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => finishStudySession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.phases() });
    },
  });
}
