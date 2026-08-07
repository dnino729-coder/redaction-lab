"use client";
// Blueprint §8.2, fila EP-20. Transporte REST. Usado en P-12 (×N vía
// `useQueries`, Blueprint §8.4) y P-13.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getStudentProgressSummary } from "../services";

export function useStudentProgressSummary(studentId: string) {
  return useQuery({
    queryKey: academyKeys.studentProgress(studentId),
    queryFn: () => getStudentProgressSummary(studentId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
