"use client";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, Select, Textarea } from "@/components/ui";
import { useCreateWritingExercise } from "../../hooks/useCreateWritingExercise";
import type { ExerciseMode, ExerciseTextType } from "../../services/writingExercisesApi";

const MODES: ExerciseMode[] = ["GUIDED", "AUTONOMOUS"];
const TEXT_TYPES: ExerciseTextType[] = ["LETTER", "ARTICLE", "ESSAY", "EMAIL", "REPORT"];

export interface CreateExerciseFormProps {
  onCreated?: () => void;
}

export function CreateExerciseForm({ onCreated }: CreateExerciseFormProps) {
  const t = useTranslations("laboratory.writingWorkshop.createForm");
  const tTextType = useTranslations("laboratory.textType");
  const [mode, setMode] = useState<ExerciseMode>("GUIDED");
  const [textType, setTextType] = useState<ExerciseTextType>("LETTER");
  const [guidedPrompt, setGuidedPrompt] = useState("");
  const mutation = useCreateWritingExercise();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(
      { mode, textType, guidedPrompt: mode === "GUIDED" ? guidedPrompt : null },
      {
        onSuccess: () => {
          setGuidedPrompt("");
          onCreated?.();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-700">{t("modeLabel")}</span>
          <Select value={mode} onChange={(event) => setMode(event.target.value as ExerciseMode)}>
            {MODES.map((value) => (
              <option key={value} value={value}>
                {t(`mode.${value}`)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-700">{t("textTypeLabel")}</span>
          <Select value={textType} onChange={(event) => setTextType(event.target.value as ExerciseTextType)}>
            {TEXT_TYPES.map((value) => (
              <option key={value} value={value}>
                {tTextType(value)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {mode === "GUIDED" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-700">{t("guidedPromptLabel")}</span>
          <Textarea
            value={guidedPrompt}
            onChange={(event) => setGuidedPrompt(event.target.value)}
            rows={3}
            required
          />
        </label>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t("submitting") : t("submit")}
      </Button>
      {mutation.isError && <p className="text-sm text-danger-600">{t("error")}</p>}
    </form>
  );
}
