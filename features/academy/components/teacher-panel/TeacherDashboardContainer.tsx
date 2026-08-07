// TeacherDashboardContainer — Panel del Profesor (P-12). Único componente
// inteligente de esta pantalla: concentra hooks de datos, estado local de
// selección y navegación (mismo criterio que `UnitDetailContainer`/
// `UnitMapContainer`).
//
// Selección de estudiantes: no existe (Application Layer Spec, PND-04,
// heredado) ningún mecanismo para listar automáticamente "los estudiantes
// de este Profesor" — `TeacherStudentRelationshipPort.hasRelationship()`
// está implementado como fail-closed (`TeacherStudentRelationshipAdapter`,
// siempre `false`) hasta que exista un módulo de Organización Académica.
// Por eso este Container no intenta enumerar estudiantes: reutiliza
// `useAcademyTeacherPanelStore` (P-12, ya existente) para que el Profesor
// añada manualmente los `studentId` que quiere consultar — comportamiento
// honesto dado el estado real del proyecto, no una simulación de un listado
// que el backend no puede proveer todavía.
//
// `useQueries` (Blueprint §8.4, ya documentado en `useStudentProgressSummary`)
// para resolver N resúmenes de progreso en paralelo, reutilizando la misma
// queryKey/queryFn que el hook singular — sin duplicar lógica de fetch.
"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, EmptyState } from "@/components/ui";
import { useAcademyTeacherPanelStore } from "../../hooks";
import { academyKeys } from "../../constants";
import { getStudentProgressSummary } from "../../services";
import { TeacherStudentSummaryCard } from "./TeacherStudentSummaryCard";

export function TeacherDashboardContainer() {
  const t = useTranslations("academy.teacherPanel");
  const [studentIdInput, setStudentIdInput] = useState("");

  const selectedStudentIds = useAcademyTeacherPanelStore((state) => state.selectedStudentIds);
  const toggleStudent = useAcademyTeacherPanelStore((state) => state.toggleStudent);

  const progressQueries = useQueries({
    queries: selectedStudentIds.map((studentId) => ({
      queryKey: academyKeys.studentProgress(studentId),
      queryFn: () => getStudentProgressSummary(studentId),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
    })),
  });

  function handleAddStudent(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = studentIdInput.trim();
    if (!trimmed || selectedStudentIds.includes(trimmed)) return;
    toggleStudent(trimmed);
    setStudentIdInput("");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAddStudent} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          {t("addStudentLabel")}
          <input
            type="text"
            value={studentIdInput}
            onChange={(event) => setStudentIdInput(event.target.value)}
            placeholder={t("addStudentPlaceholder")}
            className="h-10 min-w-64 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          />
        </label>
        <Button type="submit" disabled={!studentIdInput.trim()}>
          {t("addStudentButton")}
        </Button>
      </form>

      {selectedStudentIds.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectedStudentIds.map((studentId, index) => (
            <TeacherStudentSummaryCard
              key={studentId}
              studentId={studentId}
              summary={progressQueries[index]?.data}
              isLoading={progressQueries[index]?.isLoading ?? false}
              error={progressQueries[index]?.error}
              onRemove={() => toggleStudent(studentId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
