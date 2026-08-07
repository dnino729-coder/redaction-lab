// ComprehensionGate — Blueprint §11.2 (P-05), props completas (resolución
// AFR2-01). 100% presentacional: cero hooks de datos, nunca invoca
// `useVerifyComprehension()` — recibe todo resuelto de `AttemptStepContainer`.
// El componente no decide cuándo "pasó" ni navega; al recibir
// `satisfied===true` es el Container quien navega (§10.1) — este componente
// simplemente deja de renderizarse en ese momento.
//
// Validación (Blueprint §9): `comprehensionResponse: z.string().min(1)` vía
// `react-hook-form` + `zodResolver` (ya instalados, sin dependencias nuevas).
//
// Caso borde (§11.2): "isInsufficient se resetea a false en cuanto el
// usuario modifica el campo tras un resultado insuficiente" — al ser
// `isInsufficient` una prop controlada por el Container (no hay llamada de
// red por cada tecleo), el reseteo visual se implementa localmente con un
// flag `isDismissed` de un solo sentido: se arma (`false`) únicamente cuando
// `isInsufficient` pasa de `false` a `true` (un resultado nuevo del
// servidor); se apaga (`true`) en cuanto el usuario edita el campo respecto
// al valor que tenía en ese momento, y permanece apagado aunque el usuario
// vuelva a escribir exactamente el mismo texto (fix AFR024-02 — antes se
// recomputaba comparando el valor actual contra el snapshot en cada
// render, lo que permitía que el mensaje reapareciera sin una verificación
// nueva). Esto no es un hook de datos — es el mismo tipo de estado local ya
// aceptado para `WritingEditor` (contenido tecleado, debounce).
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Textarea } from "@/components/ui";
import { comprehensionSchema, type ComprehensionInput } from "../../schemas";
import type { AcademyErrorHttp } from "../../types";

export interface ComprehensionGateProps {
  onVerify: (comprehensionResponse: string) => void;
  isSubmitting: boolean;
  isInsufficient: boolean;
  submitError: AcademyErrorHttp | null;
}

export function ComprehensionGate({ onVerify, isSubmitting, isInsufficient, submitError }: ComprehensionGateProps) {
  const t = useTranslations("academy.comprehensionGate");

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<ComprehensionInput>({
    resolver: zodResolver(comprehensionSchema),
    mode: "onChange",
    defaultValues: { comprehensionResponse: "" },
  });

  const [insufficientSnapshot, setInsufficientSnapshot] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const wasInsufficientRef = useRef(false);

  const currentValue = watch("comprehensionResponse");

  useEffect(() => {
    const justBecameInsufficient = isInsufficient && !wasInsufficientRef.current;
    wasInsufficientRef.current = isInsufficient;

    if (justBecameInsufficient) {
      setInsufficientSnapshot(getValues("comprehensionResponse"));
      setIsDismissed(false);
      return;
    }

    if (isInsufficient && !isDismissed && currentValue !== insufficientSnapshot) {
      setIsDismissed(true);
    }
  }, [isInsufficient, currentValue, isDismissed, insufficientSnapshot, getValues]);

  const showInsufficient = isInsufficient && !isDismissed;

  function onSubmit(values: ComprehensionInput) {
    onVerify(values.comprehensionResponse);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="comprehensionResponse" className="text-sm font-medium text-neutral-700">
          {t("fieldLabel")}
        </label>
        <Textarea
          id="comprehensionResponse"
          disabled={isSubmitting}
          aria-invalid={errors.comprehensionResponse ? true : undefined}
          aria-describedby={errors.comprehensionResponse ? "comprehensionResponse-error" : undefined}
          {...register("comprehensionResponse")}
        />
        {errors.comprehensionResponse ? (
          <p id="comprehensionResponse-error" className="text-sm text-danger-600">
            {t("fieldRequired")}
          </p>
        ) : null}
      </div>

      {showInsufficient ? (
        <p role="status" aria-live="assertive" className="text-sm text-warning-700">
          {t("insufficientMessage")}
        </p>
      ) : null}

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
