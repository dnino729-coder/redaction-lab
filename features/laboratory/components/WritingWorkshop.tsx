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

export function WritingWorkshop() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [activeAttemptContent, setActiveAttemptContent] = useState("");

  const startMutation = useStartExerciseAttempt();
  const historyQuery = useExerciseAttemptHistory(selectedExerciseId);

  // "Continuar": el intento IN_PROGRESS se localiza en el propio
  // historial ya cargado del ejercicio (no existe un endpoint de lectura
  // de un único intento — fuera de alcance de este paso).
  useEffect(() => {
    if (activeAttemptId) return;
    const inProgress = historyQuery.data?.attempts.find((attempt) => attempt.status === "IN_PROGRESS");
    if (inProgress) setActiveAttemptId(inProgress.id);
  }, [historyQuery.data, activeAttemptId]);

  function handleStartOrRepeat(exerciseId: string) {
    setSelectedExerciseId(exerciseId);
    setActiveAttemptContent("");
    startMutation.mutate(exerciseId, {
      onSuccess: (attempt) => setActiveAttemptId(attempt.id),
    });
  }

  function handleContinue(exerciseId: string) {
    setSelectedExerciseId(exerciseId);
    setActiveAttemptContent("");
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

      {selectedExerciseId && activeAttemptId && (
        <ExerciseAttemptEditor
          attemptId={activeAttemptId}
          exerciseId={selectedExerciseId}
          initialContent={activeAttemptContent}
          onCompleted={handleCompleted}
        />
      )}

      {selectedExerciseId && <ExerciseAttemptHistoryList exerciseId={selectedExerciseId} />}

      <CreateExerciseForm />
    </div>
  );
}
