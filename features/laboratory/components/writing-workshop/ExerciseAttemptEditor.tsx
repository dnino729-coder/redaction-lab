"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Textarea } from "@/components/ui";
import { useAutosaveExerciseDraft } from "../../hooks/useAutosaveExerciseDraft";
import { useCompleteExerciseAttempt } from "../../hooks/useCompleteExerciseAttempt";

const AUTOSAVE_DEBOUNCE_MS = 1500;

export interface ExerciseAttemptEditorProps {
  attemptId: string;
  exerciseId: string;
  initialContent?: string;
  onCompleted?: () => void;
}

function countWords(content: string): number {
  const trimmed = content.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

// Panel expandible embebido en WritingWorkshop (decisión de UX ya
// aprobada) — no es una página propia.
export function ExerciseAttemptEditor({
  attemptId,
  exerciseId,
  initialContent = "",
  onCompleted,
}: ExerciseAttemptEditorProps) {
  const t = useTranslations("laboratory.writingWorkshop");
  const [content, setContent] = useState(initialContent);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autosave = useAutosaveExerciseDraft();
  const complete = useCompleteExerciseAttempt();

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      autosave.mutate({ attemptId, exerciseId, content: value });
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  function handleComplete() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    complete.mutate({ attemptId, exerciseId }, { onSuccess: () => onCompleted?.() });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      <Textarea
        value={content}
        onChange={(event) => handleChange(event.target.value)}
        rows={10}
        placeholder={t("editor.placeholder")}
      />
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>{t("wordCount", { count: countWords(content) })}</span>
        <span>{autosave.isPending ? t("editor.saving") : t("editor.saved")}</span>
      </div>
      <Button onClick={handleComplete} disabled={complete.isPending}>
        {complete.isPending ? t("editor.completing") : t("editor.complete")}
      </Button>
    </div>
  );
}
