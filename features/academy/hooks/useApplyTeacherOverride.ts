"use client";
// Blueprint §8.2, fila EP-07. Transporte REST, Idempotency-Key obligatorio.
// Usado por `TeacherOverrideDialog` vía `StudentDetailContainer` (Blueprint
// §10.1/§11.2 — el diálogo nunca invoca este hook directamente).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyTeacherOverride } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import { useIdempotencyKey } from "./useIdempotencyKey";
import type { AcademyErrorHttp, OverrideAction, TeacherOverrideHttp } from "../types";

interface ApplyTeacherOverrideInput {
  unitId: string;
  studentId: string;
  action: OverrideAction;
  reason: string;
}

export function useApplyTeacherOverride() {
  const queryClient = useQueryClient();
  const idempotencyKey = useIdempotencyKey();

  return useMutation<TeacherOverrideHttp, AcademyErrorHttp, ApplyTeacherOverrideInput>({
    mutationFn: async ({ unitId, action, reason }) => {
      try {
        return await applyTeacherOverride(unitId, { action, reason }, idempotencyKey);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (_data, { unitId, studentId }) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(unitId) });
      queryClient.invalidateQueries({ queryKey: academyKeys.studentProgress(studentId) });
    },
  });
}
