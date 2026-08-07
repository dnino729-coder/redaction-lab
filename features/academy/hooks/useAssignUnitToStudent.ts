"use client";
// Blueprint §8.2, fila EP-08. Transporte REST, Idempotency-Key obligatorio.
// Sin invalidación de caché: RN-13 no vincula esta operación a ninguna vista
// de progreso/unidades ya cargada (la recomendación se consume en su propia
// pantalla, P-13, vía su propio fetch inicial).
import { useMutation } from "@tanstack/react-query";
import { assignUnitToStudent } from "../services";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import { useIdempotencyKey } from "./useIdempotencyKey";
import type { AcademyErrorHttp, TeacherRecommendationHttp } from "../types";

interface AssignUnitToStudentInput {
  studentId: string;
  unitId: string;
}

export function useAssignUnitToStudent() {
  const idempotencyKey = useIdempotencyKey();

  return useMutation<TeacherRecommendationHttp, AcademyErrorHttp, AssignUnitToStudentInput>({
    mutationFn: async ({ studentId, unitId }) => {
      try {
        return await assignUnitToStudent(studentId, unitId, idempotencyKey);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
  });
}
