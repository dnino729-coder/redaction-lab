"use client";
// Blueprint §8.2, fila EP-23. Transporte REST. Usado en P-13 (vista de
// historial de un estudiante sobre una unidad, rol Profesor).
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getStudentUnitHistory } from "../services";

export function useStudentUnitHistory(studentId: string, unitId: string) {
  return useQuery({
    queryKey: academyKeys.studentUnitHistory(studentId, unitId),
    queryFn: () => getStudentUnitHistory(studentId, unitId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
