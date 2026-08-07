// UnitDetailContainer — Blueprint §10.1/§12 (P-02). Único componente
// inteligente de esta pantalla: concentra hooks de datos, navegación,
// mutaciones y manejo de errores/loading. `AttemptActionButton` no invoca
// React Query ni Server Actions.
//
// Sin `useAcademyRole()`: a diferencia de P-01, el Blueprint no lo lista
// entre los hooks de `UnitDetailContainer` (§10.1) — P-02 solo es alcanzable
// navegando desde P-01, que ya resolvió y filtró el rol; un TEACHER/ADMIN
// nunca llega aquí en un recorrido real (mapa de navegación, §19.1).
// "Permisos: STUDENT, propiedad verificada por backend... sin validación de
// runtime" (§12, P-02) confirma que la verificación de propiedad es
// responsabilidad exclusiva del backend, no de este Container.
"use client";

import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ErrorState, ForbiddenState, Skeleton } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useContinuation, useRepeatUnit, useStartUnit, useUnitDetail } from "../../hooks";
import { academyRoutes } from "../../constants";
import { AcademyBreadcrumbs, UnitStatusBadge } from "../shared";
import { AttemptActionButton } from "./AttemptActionButton";
import type { AttemptSummaryHttp } from "../../types";

export interface UnitDetailContainerProps {
  unitId: string;
}

export function UnitDetailContainer({ unitId }: UnitDetailContainerProps) {
  const t = useTranslations("academy.unitDetail");
  const tUnitMap = useTranslations("academy.unitMap");
  const tLayout = useTranslations("academy.layout");
  const router = useRouter();

  const unitDetailQuery = useUnitDetail(unitId);
  const continuationQuery = useContinuation();
  const startUnit = useStartUnit();
  const repeatUnit = useRepeatUnit();

  function navigateToAttempt(attempt: AttemptSummaryHttp) {
    // Blueprint §12 (P-04-P-10): `UNLOCK` no tiene pantalla propia — mismo
    // guard defensivo ya aplicado al banner de continuación de P-01.
    if (attempt.currentStep === "UNLOCK") return;
    router.push(academyRoutes.attemptStep(attempt.attemptId, attempt.currentStep));
  }

  function handleStart() {
    const unit = unitDetailQuery.data;
    if (!unit) return;

    // Blueprint §10.1: "useContinuation() para decidir si continuar navega
    // directo al paso real sin llamada adicional" — pero `useContinuation()`
    // (EP-15) devuelve el intento activo más reciente de TODO el estudiante,
    // no necesariamente el de esta unidad (AFR-015, hallazgo AFR015-01):
    // `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE` es una regla por unidad, no
    // global, por lo que dos unidades distintas pueden tener cada una su
    // propio intento activo simultáneamente. Solo se reutiliza la
    // continuación cuando su `attempt.unitId` coincide con la unidad que se
    // está viendo; si no coincide (o todavía no resolvió), se ejecuta el
    // flujo por defecto del Blueprint (`startUnitAction`), que ya
    // es idempotente y resuelve al intento activo real de esta unidad si
    // existe (Sección 3.1, comentario ya presente en el código real de
    // `unitActions.ts`).
    const continuation = continuationQuery.data;
    if (unit.activeAttemptId && continuation && continuation.attempt.unitId === unitId) {
      navigateToAttempt(continuation.attempt);
      return;
    }

    startUnit.mutate(unitId, { onSuccess: navigateToAttempt });
  }

  function handleRepeat() {
    repeatUnit.mutate(unitId, { onSuccess: navigateToAttempt });
  }

  if (unitDetailQuery.isLoading) {
    return <UnitDetailLoadingSkeleton />;
  }

  if (unitDetailQuery.isError) {
    const error = unitDetailQuery.error;

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    if (error instanceof ApiError && error.status === 403) {
      return <ForbiddenState title={t("forbiddenTitle")} />;
    }

    return (
      <ErrorState
        title={t("errorTitle")}
        description={error.message}
        retryLabel={tUnitMap("retryLabel")}
        onRetry={() => unitDetailQuery.refetch()}
      />
    );
  }

  const unit = unitDetailQuery.data;
  // Guarda de tipos: `isLoading`/`isError` ya se descartaron arriba, así que
  // en runtime `data` siempre está definido aquí — TypeScript no lo infiere
  // automáticamente sin este guard explícito.
  if (!unit) return null;

  const isLocked = unit.state === "LOCKED";
  const primaryLabel = isLocked
    ? t("lockedLabel")
    : unit.activeAttemptId
      ? t("continueLabel")
      : t("startLabel");

  return (
    <div className="flex flex-col gap-6">
      <AcademyBreadcrumbs
        items={[
          { label: tLayout("title"), href: academyRoutes.unitMap() },
          { label: tUnitMap("unitLabel", { position: unit.position }) },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-neutral-900">
            {tUnitMap("unitLabel", { position: unit.position })}
          </h1>
          <UnitStatusBadge state={unit.state} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <AttemptActionButton
            label={primaryLabel}
            onClick={handleStart}
            disabled={isLocked}
            isLoading={startUnit.isPending}
          />
          {unit.repeatable ? (
            <AttemptActionButton
              label={t("repeatLabel")}
              onClick={handleRepeat}
              variant="outline"
              isLoading={repeatUnit.isPending}
            />
          ) : null}
        </div>
      </div>

      {startUnit.isError ? (
        <p role="alert" className="text-sm text-danger-600">
          {startUnit.error.message}
        </p>
      ) : null}
      {repeatUnit.isError ? (
        <p role="alert" className="text-sm text-danger-600">
          {repeatUnit.error.message}
        </p>
      ) : null}

      <Link
        href={academyRoutes.unitHistory(unitId)}
        className="text-sm font-medium text-primary-600 hover:underline"
      >
        {t("viewHistoryLink")}
      </Link>
    </div>
  );
}

function UnitDetailLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
