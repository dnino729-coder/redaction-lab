"use client";
// StudentOnboardingForm — único formulario del onboarding mínimo de
// perfil. Hace UNA SOLA petición HTTP (POST /api/v1/profile/onboarding);
// el backend coordina la creación de StudentProfile + LearningPlan. No
// importa nada de features/my-plan — `onSuccess` es una prop genérica que
// el llamante (dentro de My Plan) usa para invalidar sus propias queries.
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Textarea,
  Button,
} from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useCompleteStudentOnboarding } from "../hooks/useCompleteStudentOnboarding";
import type { CefrLevelHttp } from "../services/profileApi";

const CEFR_LEVELS: CefrLevelHttp[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Mismo className que components/ui/Textarea.tsx (sin crear un nuevo
// primitivo de Design System solo para inputs de texto/número — el
// catálogo actual no incluye un componente Input dedicado).
const INPUT_CLASS =
  "flex w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-800 " +
  "placeholder:text-neutral-400 transition-colors duration-150 ease-delf-ease focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

export interface StudentOnboardingFormProps {
  onSuccess?: () => void;
}

export function StudentOnboardingForm({ onSuccess }: StudentOnboardingFormProps) {
  const t = useTranslations("profile.onboarding");
  const mutation = useCompleteStudentOnboarding();

  const [currentLevel, setCurrentLevel] = useState<CefrLevelHttp>("A1");
  const [targetLevel, setTargetLevel] = useState<CefrLevelHttp>("B2");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [minutesPerSession, setMinutesPerSession] = useState(30);
  const [reminderTime, setReminderTime] = useState("");
  const [targetExamDate, setTargetExamDate] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const [reminderHour, reminderMinute] = reminderTime
      ? reminderTime.split(":").map((part) => Number(part))
      : [undefined, undefined];

    mutation.mutate(
      {
        currentLevel,
        targetLevel,
        nativeLanguage,
        learningGoal,
        daysPerWeek,
        sessionsPerDay,
        minutesPerSession,
        reminderHour,
        reminderMinute,
        targetExamDate: targetExamDate ? new Date(targetExamDate).toISOString() : undefined,
      },
      { onSuccess: () => onSuccess?.() },
    );
  }

  // `ApiErrorBody` (lib/apiClient.ts) no declara `fieldErrors` — es un
  // campo propio de jsonError() de Profile/My Plan, no del contrato
  // genérico compartido. Se lee con un tipo local explícito en vez de
  // `as any`, reflejando la forma real de esta respuesta sin modificar el
  // contrato compartido (fuera de alcance de este slice).
  interface OnboardingErrorBody {
    fieldErrors?: string[];
  }
  const fieldErrors =
    mutation.error instanceof ApiError
      ? (mutation.error.body as unknown as OnboardingErrorBody).fieldErrors
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-neutral-600">{t("description")}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700">{t("currentLevelLabel")}</span>
              <Select
                value={currentLevel}
                onChange={(event) => setCurrentLevel(event.target.value as CefrLevelHttp)}
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700">{t("targetLevelLabel")}</span>
              <Select
                value={targetLevel}
                onChange={(event) => setTargetLevel(event.target.value as CefrLevelHttp)}
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700">{t("nativeLanguageLabel")}</span>
            <input
              type="text"
              className={INPUT_CLASS}
              value={nativeLanguage}
              onChange={(event) => setNativeLanguage(event.target.value)}
              maxLength={50}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700">{t("learningGoalLabel")}</span>
            <Textarea
              value={learningGoal}
              onChange={(event) => setLearningGoal(event.target.value)}
              rows={3}
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700">{t("daysPerWeekLabel")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(event) => setDaysPerWeek(Number(event.target.value))}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700">{t("sessionsPerDayLabel")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={24}
                value={sessionsPerDay}
                onChange={(event) => setSessionsPerDay(Number(event.target.value))}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700">{t("minutesPerSessionLabel")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={1440}
                value={minutesPerSession}
                onChange={(event) => setMinutesPerSession(Number(event.target.value))}
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700">{t("reminderLabel")}</span>
            <input
              type="time"
              className={INPUT_CLASS}
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700">{t("targetExamDateLabel")}</span>
            <input
              type="date"
              className={INPUT_CLASS}
              value={targetExamDate}
              onChange={(event) => setTargetExamDate(event.target.value)}
            />
          </label>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t("submitting") : t("submit")}
          </Button>

          {mutation.isError && (
            <div className="text-sm text-danger-600">
              <p>{t("error")}</p>
              {fieldErrors ? (
                <ul className="mt-1 list-disc pl-5">
                  {fieldErrors.map((fieldError) => (
                    <li key={fieldError}>{fieldError}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
