"use client";
// WritingWorkshop — bloque 3 "Atelier d'écriture". Contenedor real
// conectado a persistencia (ya no consume laboratoryService.dev.ts):
// ensambla CreateExerciseForm, WritingExerciseList, ExerciseAttemptEditor
// y ExerciseAttemptHistoryList. El editor es un panel expandible dentro
// de este mismo bloque (decisión de UX ya aprobada — sin página propia).
import { useEffect, useState } from "react";
import { CreateExerciseForm } from "./writing-workshop/CreateExerciseForm";
import { WritingExerciseList } from "./writing-workshop/WritingExerciseList";
import { ExerciseAttemptEditor } from "./writing-workshop/ExerciseAttemptEditor";
import { ExerciseAttemptHistoryList } from "./writing-workshop/ExerciseAttemptHistoryList";
import { useStartExerciseAttempt } from "../hooks/useStartExerciseAttempt";
import { useExerciseAttemptHistory } from "../hooks/useExerciseAttemptHistory";
import { useExerciseAttempt } from "../hooks/useExerciseAttempt";

export function WritingWorkshop() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);

  const startMutation = useStartExerciseAttempt();
  const historyQuery = useExerciseAttemptHistory(selectedExerciseId);

  // "Continuar": el intento IN_PROGRESS se localiza en el propio
  // historial ya cargado del ejercicio.
  useEffect(() => {
    if (activeAttemptId) return;
    const inProgress = historyQuery.data?.attempts.find(
      (attempt) => attempt.status === "IN_PROGRESS",
    );
    if (inProgress) setActiveAttemptId(inProgress.id);
  }, [historyQuery.data, activeAttemptId]);

  // El draft/autosave guardado se recupera vía GET /attempts/{attemptId}
  // (contenido real, no expuesto por el historial) — cubre tanto un
  // attempt recién creado (content = "") como uno recuperado con borrador.
  const attemptQuery = useExerciseAttempt(activeAttemptId);

  function handleStartOrRepeat(exerciseId: string) {
    setSelectedExerciseId(exerciseId);
    startMutation.mutate(exerciseId, {
      onSuccess: (attempt) => setActiveAttemptId(attempt.id),
    });
  }

  function handleContinue(exerciseId: string) {
    setSelectedExerciseId(exerciseId);
    setActiveAttemptId(null);
  }

  function handleCompleted() {
    setActiveAttemptId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <WritingExerciseList
        onStart={handleStartOrRepeat}
        onContinue={handleContinue}
        onRepeat={handleStartOrRepeat}
        pendingExerciseId={startMutation.isPending ? selectedExerciseId : null}
      />

      {selectedExerciseId && activeAttemptId && attemptQuery.data && (
        <ExerciseAttemptEditor
          key={activeAttemptId}
          attemptId={activeAttemptId}
          exerciseId={selectedExerciseId}
          initialContent={attemptQuery.data.content}
          onCompleted={handleCompleted}
        />
      )}

      {selectedExerciseId && <ExerciseAttemptHistoryList exerciseId={selectedExerciseId} />}

      <CreateExerciseForm />
    </div>
  );
}
