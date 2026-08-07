// ReflectionForm — Blueprint §11.2/§12 (P-10). 100% presentacional: cero
// hooks de datos, nunca invoca `useCompleteReflection()` — recibe todo
// resuelto de `AttemptStepContainer` (mismo patrón que `ComprehensionGate`,
// resolución AFR2-01).
//
// Un único campo abierto (Blueprint §14 ítem 8, gap ya disclosed desde la
// creación de `reflectionSchema`: "número de preguntas es contenido, no
// estructura"): no se fabrican múltiples preguntas pedagógicas sin fuente
// real — mismo criterio ya aplicado a `StepContentPanel` (contenido
// editorial pendiente). Reutiliza `reflectionSchema`/`ReflectionInput`
// (`responses: string[]`, ya existente) en vez de un schema ad-hoc — el
// formulario solo llena `responses[0]`, la validación de "al menos 1
// respuesta no vacía" ya viven en ese schema, sin duplicarla aquí.
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Textarea } from "@/components/ui";
import { reflectionSchema, type ReflectionInput } from "../../schemas";
import type { AcademyErrorHttp } from "../../types";

export interface ReflectionFormProps {
  onSubmit: (responses: readonly string[]) => void;
  isSubmitting: boolean;
  submitError: AcademyErrorHttp | null;
}

export function ReflectionForm({ onSubmit, isSubmitting, submitError }: ReflectionFormProps) {
  const t = useTranslations("academy.reflection");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ReflectionInput>({
    resolver: zodResolver(reflectionSchema),
    mode: "onChange",
    defaultValues: { responses: [""] },
  });

  function handleFormSubmit(values: ReflectionInput) {
    onSubmit(values.responses);
  }

  const fieldError = errors.responses?.[0];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="reflectionResponse" className="text-sm font-medium text-neutral-700">
          {t("responseLabel")}
        </label>
        <Textarea
          id="reflectionResponse"
          disabled={isSubmitting}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? "reflectionResponse-error" : undefined}
          {...register("responses.0")}
        />
        {fieldError ? (
          <p id="reflectionResponse-error" className="text-sm text-danger-600">
            {t("responseRequired")}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-danger-600">
          {submitError.message}
        </p>
      ) : null}

      <Button type="submit" disabled={!isValid || isSubmitting} aria-busy={isSubmitting} className="w-full sm:w-auto">
        {t("submitLabel")}
      </Button>
    </form>
  );
}
