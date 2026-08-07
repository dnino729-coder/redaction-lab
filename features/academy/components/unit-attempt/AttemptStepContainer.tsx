// AttemptStepContainer — Blueprint §10.1/§12 (P-04 a P-10, un solo Page
// paramétrico). Único componente inteligente: concentra hooks de datos,
// validación de `step` vs `currentStep` real, navegación y mutaciones. Los
// presentacionales (`StepProgressTracker`, `StepContentPanel`,
// `StepAdvanceButton`, `ComprehensionGate`) no invocan React Query ni Server
// Actions.
//
// Alcance (construcción incremental sprint a sprint, igual que P-01/P-02/
// P-03): Sprint 1.5 añadió `CONTEXTUALIZE`/`DEFINE_OBJECTIVES` (P-04).
// Sprint 1.6 añadió `COMPREHEND` (P-05 — "Comprender"/`ComprehensionGate`).
// Sprint 1.7 añadió `OBSERVE`/`ANALYZE` (P-06 — "Observar / Analizar", §12):
// el Blueprint define P-06 como una única pantalla con `step ∈ {observe,
// analyze}` (ruta, componentes, hooks y criterios de aceptación idénticos
// para ambos valores — nunca se diferencia su tratamiento), por lo que se
// implementaron los dos juntos, no solo `OBSERVE`.
// Sprint 1.8 añade `PRACTICE` (P-07 — "Practicar", §12): Blueprint asigna a
// P-07 exactamente los mismos componentes/hooks/estados que P-04
// (`StepContentPanel`+`StepAdvanceButton`+`useAdvanceStep()`, sin gate,
// "Riesgos: Actividades de práctica sin respaldo de datos real" — mismo gap
// de contenido editorial ya aceptado, §14 ítem 3) — no requiere ningún
// componente/hook nuevo, cae en la misma rama por defecto que P-04.
// ⚠️ Discrepancia documental (disclosed, no corregida — fuera de alcance;
// corrección de precisión AFR032-01/AFR-033 sobre la cita original):
// la Frontend Contract v1.1 (2026-07-20, línea 150) asigna a su propio
// "P-07 — Practicar" el componente `PracticeActivityPanel` — no
// `WritingEditor`. Ese mismo documento (línea 159) ya asigna `WritingEditor`/
// `AutosaveIndicator`/`WordCountIndicator`/`SubmitButton` a su P-08
// ("Producir / Reescribir"), igual que el Blueprint FROZEN (2026-07-28,
// posterior) — en eso ambos documentos coinciden. La discrepancia real es
// que el Blueprint FROZEN simplifica P-07 reutilizando el `StepContentPanel`
// genérico (ya usado en P-04), en vez del `PracticeActivityPanel` dedicado
// de la Frontend Contract v1.1. El Blueprint FROZEN sigue siendo el
// documento de mayor precedencia (más reciente y más específico), por lo
// que la implementación permanece exactamente igual: P-07 usa
// `StepContentPanel`, nunca `PracticeActivityPanel` ni `WritingEditor`.
// Sprint 1.9 añade `PRODUCE`/`REWRITE` (P-08 — "Producir / Reescribir",
// §12): mismo screen paramétrico (`step ∈ {produce, rewrite}`), mismos
// componentes/hooks para ambos valores. Navegación tras envío exitoso →
// `.../feedback` — a diferencia de P-04/P-06/P-07, `submitVersionAction`
// retorna `VersionHttp` (sin `currentStep`), por lo que el Blueprint exige
// aquí el único destino hardcodeado de todo este Container ("Navegación:
// envío exitoso → navega a .../feedback", §12 P-08) — no hay ningún dato de
// la respuesta que pudiera decidirlo de otra forma.
// Sprint 2.0 añade `RECEIVE_FEEDBACK` (P-09 — "Recibir retroalimentación",
// §12): reutiliza `useFeedback(attemptId, versionNumber)` (ya existente,
// polling con techo de 3 min, §8.3) y `useAdvancePhase()` (ya existente,
// EP-04) sin modificar ninguno de los dos. `versionNumber` se deriva de
// `matchedAttempt.versionCount` (ACP-004 — único origen fiable, disponible
// en todos los puntos de entrada a esta pantalla: envío desde P-08,
// "Continuar" desde P-01/P-02, redirección defensiva de este mismo
// Container). Igual que `useModelExamples` (P-06), `useFeedback` se invoca
// sin condicional (Rules of Hooks) — mismo trade-off ya aceptado, sin
// exponer `enabled` en el hook.
// ⚠️ Límite conocido, no corregido (fuera de alcance — corregirlo exigiría
// modificar el efecto de redirección compartido, usado por P-04 a P-10):
// en cuanto el backend entrega el feedback, `currentStep` pasa a `REWRITE`
// (`Attempt.recordFeedback()`) — si el estudiante cierra la pestaña después
// de eso y la reabre, el remount de este Container obtiene un
// `useContinuation()` fresco con `currentStep=REWRITE` y la redirección
// defensiva lo envía a `.../rewrite`, sin volver a mostrar el panel de
// retroalimentación ya entregado. El Blueprint (§12 P-09, "Casos borde")
// solo exige preservar el estado durante `PROCESSING` (donde `currentStep`
// sigue en `RECEIVE_FEEDBACK`, sin este problema) — el caso de reapertura
// después de `READY` no está entre los 5 criterios de aceptación.
// Sprint 2.0 añade `REFLECT` (P-10 — "Reflexionar y cerrar", §12), última
// pantalla del recorrido lineal (P-04 a P-10) — `UNLOCK` no tiene pantalla
// propia (ya resuelto arriba, fix AFR021-02) y no avanza el alcance más
// allá. Reutiliza `useCompleteReflection()`/`useRepeatUnit()` (ya
// existentes) sin modificarlos.
// ⚠️ Discrepancia documental (disclosed, no corregida — fuera de alcance):
// el Blueprint FROZEN, en su propia entrada de P-10 (Sección 12, línea
// "Navegación"), dice "Breadcrumb: Academia / {Unidad} (mismo criterio que
// P-02)" — pero esto contradice a la Sección 19 del mismo documento
// ("Navegación y breadcrumbs — resolución de AFR-F07"), cuya tabla oficial
// declara explícitamente "P-04 a P-10 | No (usa StepProgressTracker en su
// lugar)". La Sección 19 es más específica, tiene resolución formal propia,
// y es lo que el código ya implementa consistentemente desde P-04 (ningún
// Container de P-04 a P-09 invoca `AcademyBreadcrumbs, confirmado en este
// mismo archivo) — el propio componente `AcademyBreadcrumbs.tsx` ya cita la
// Sección 19 para excluir explícitamente a P-04–P-10. Se sigue la Sección
// 19: P-10 no muestra breadcrumb, solo `StepProgressTracker`.
// A diferencia de P-04 a P-09, `EP-05` (REST, sin Server Action) retorna
// `AcademyUnitDetailHttp` (detalle de Unidad, sin `currentStep`) — por lo
// que P-10 no navega automáticamente tras el éxito;
// permanece en la misma pantalla mostrando el resumen de cierre inline
// (`completeReflection.isSuccess`), navegando solo cuando el estudiante
// presiona "Volver al mapa" o "Repetir esta unidad".
// "409 → redirigir al paso real" (Blueprint §12 P-10): sin `currentStep` en
// la respuesta de error, se reutiliza el mecanismo genérico ya existente —
// al fallar, se refresca `continuationQuery`; si el paso real cambió, el
// efecto de redirección defensiva ya existente (sin modificar) actúa por sí
// solo.
//
// Validación `step` vs `currentStep` real (§10.1, "useContinuation()...
// para validar currentStep real vs step de URL"): `useContinuation()`
// devuelve el intento activo más reciente de TODO el estudiante, no
// necesariamente el de este `attemptId` (mismo hallazgo real de AFR-015 en
// P-02, corregido en AFR-016) — aquí se aplica la misma guarda: solo se
// confía en `continuation.attempt` cuando su `attemptId` coincide
// exactamente con el de la URL. Si no coincide, no se redirige (se evita
// enviar al estudiante al paso de otro intento); la verificación real de
// propiedad la hace el backend al invocar `advanceStepAction`/
// `verifyComprehensionAction` (§12: "STUDENT, propiedad verificada por
// backend... sin validación de runtime").
//
// Forbidden/Not Found (disclosed, ya válido para P-04/P-05): ni P-04 ni P-05
// tienen ninguna Query propia (gap de contenido editorial, §14 ítem 3) — la
// interacción con el backend es siempre una Server Action
// (`advanceStepAction`/`verifyComprehensionAction`), cuyo error se normaliza
// a `AcademyErrorHttp` sin código HTTP (Blueprint §5.11: "code, vocabulario
// PENDIENTE"). Por lo tanto, a diferencia de P-02/P-03 (REST, `ApiError.status`
// real), este Container no puede distinguir 403 de un error genérico para
// estos pasos — se muestra el mismo banner de Error para cualquier fallo.
// `continuation.data === null` (sin ningún intento activo) se trata como el
// mejor proxy disponible de "attemptId inexistente" → `notFound()`.
//
// P-06 sí tiene Query propia (EP-19 `useModelExamples(textType)`, REST): su
// error se maneja de forma independiente (banner inline dentro de la sección
// de ejemplos, Blueprint §12 P-06 "Error: banner + reintento"), sin afectar
// el guard de `notFound()`/Forbidden de arriba, que sigue gobernado
// exclusivamente por `useContinuation()`.
//
// Fix AFR-021/AFR-022 (Sprint 1.5, preservado sin cambios):
// - AFR021-01: foco automático vía callback ref, también en la primera
//   carga exitosa.
// - AFR021-02: `UNLOCK` resuelve `notFound()` igual que cualquier paso fuera
//   de alcance, nunca llega a `displayStep`.
// - AFR021-03: cada `notFound()` va seguido de un `return null` explícito.
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/apiClient";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import {
  useAdvancePhase,
  useAdvanceStep,
  useAutosaveDraft,
  useCompleteReflection,
  useContinuation,
  useDraft,
  useFeedback,
  useModelExamples,
  useRepeatUnit,
  useSubmitVersion,
  useVerifyComprehension,
} from "../../hooks";
import { academyRoutes, STEP_TO_URL_SLUG, stepFromUrlSlug } from "../../constants";
import { StepProgressTracker } from "../shared";
import { StepContentPanel } from "./StepContentPanel";
import { StepAdvanceButton } from "./StepAdvanceButton";
import { ComprehensionGate } from "./ComprehensionGate";
import { WritingEditor } from "./WritingEditor";
import { VersionWithFeedbackPanel } from "./VersionWithFeedbackPanel";
import { ReflectionForm } from "./ReflectionForm";
import { ReflectionSummaryPanel } from "./ReflectionSummaryPanel";
import { ModelExampleCard } from "../model-library";
import type { AttemptSummaryHttp, UnitStep } from "../../types";

// Pasos que este Container ya sabe renderizar. `COMPREHEND` usa
// `ComprehensionGate` (gate obligatorio); `OBSERVE`/`ANALYZE` usan la
// sección de ejemplos modelo (P-06 — ver `isModelExamplesStep` más abajo);
// `PRODUCE`/`REWRITE` usan `WritingEditor` (P-08 — ver `isWritingStep` más
// abajo); `RECEIVE_FEEDBACK` usa `VersionWithFeedbackPanel` (P-09 — ver
// `isFeedbackStep` más abajo); `REFLECT` usa `ReflectionForm`/
// `ReflectionSummaryPanel` (P-10 — ver `isReflectionStep` más abajo); el
// resto (incluido `PRACTICE`, P-07) son de avance libre (`StepAdvanceButton`
// + `StepContentPanel`, misma rama por defecto que
// `CONTEXTUALIZE`/`DEFINE_OBJECTIVES`).
const SUPPORTED_STEPS: readonly UnitStep[] = [
  "CONTEXTUALIZE",
  "DEFINE_OBJECTIVES",
  "COMPREHEND",
  "OBSERVE",
  "ANALYZE",
  "PRACTICE",
  "PRODUCE",
  "REWRITE",
  "RECEIVE_FEEDBACK",
  "REFLECT",
];

export interface AttemptStepContainerProps {
  attemptId: string;
  step: string;
}

export function AttemptStepContainer({ attemptId, step }: AttemptStepContainerProps) {
  const t = useTranslations("academy.attemptStep");
  const tUnitMap = useTranslations("academy.unitMap");
  const tStep = useTranslations("academy.unitStep");
  const tModelExample = useTranslations("academy.modelExample");
  const router = useRouter();
  const lastFocusedStepRef = useRef<string | null>(null);

  const continuationQuery = useContinuation();
  const advanceStep = useAdvanceStep();
  const verifyComprehension = useVerifyComprehension();
  const draftQuery = useDraft(attemptId);
  const autosaveDraft = useAutosaveDraft();
  const submitVersion = useSubmitVersion();
  const [isInsufficient, setIsInsufficient] = useState(false);

  const stepFromUrl = stepFromUrlSlug(step);
  const matchedAttempt: AttemptSummaryHttp | null =
    continuationQuery.data && continuationQuery.data.attempt.attemptId === attemptId
      ? continuationQuery.data.attempt
      : null;

  // P-06 (§12): EP-19 filtra por el `textType` de la unidad del intento
  // actual — solo se confía en `continuationQuery.data.unit` cuando
  // `matchedAttempt` ya validó que la continuación pertenece a este
  // `attemptId` (mismo objeto de respuesta, mismo criterio de confianza que
  // el resto del Container). Se invoca sin condicional (Rules of Hooks, un
  // único Container para P-04 a P-10): a diferencia de las mutaciones
  // (`useAdvanceStep`/`useVerifyComprehension`, sin costo hasta invocar
  // `.mutate()`), `useModelExamples` sí dispara una petición GET real en
  // cuanto se monta el Container, incluso en pasos distintos de `OBSERVE`/
  // `ANALYZE` — trade-off aceptado del patrón de un solo Container que no
  // modifica el hook (no expone `enabled`); su `staleTime: 60s` deja el
  // resultado en caché listo para cuando el estudiante llegue a P-06.
  const modelExamplesQuery = useModelExamples(matchedAttempt ? continuationQuery.data!.unit.textType : undefined);

  // P-08 (§12): `useSubmitVersion()` requiere `unitId` (para invalidar
  // `academyKeys.unit(unitId)`, Blueprint §8.2) — ni `DraftHttp` ni
  // `VersionHttp` lo incluyen, la única fuente es `continuationQuery.data.
  // unit.unitId`, con el mismo criterio de confianza que `textType` en P-06.
  const unitId = matchedAttempt ? continuationQuery.data!.unit.unitId : "";

  // P-09 (§12): `useFeedback()` requiere `versionNumber` — su única fuente
  // fiable es `matchedAttempt.versionCount` (ACP-004), disponible en todos
  // los orígenes de navegación a esta pantalla (P-08, "Continuar" de P-01/
  // P-02, redirección defensiva). Invocado sin condicional (Rules of Hooks,
  // mismo trade-off ya aceptado por `useModelExamples` en P-06).
  const versionNumber = matchedAttempt?.versionCount ?? 0;
  const feedbackQuery = useFeedback(attemptId, versionNumber);
  const advancePhase = useAdvancePhase();
  const completeReflection = useCompleteReflection();
  const repeatUnit = useRepeatUnit();

  // Redirección defensiva (§10.1, criterio de aceptación 2 de P-04): si el
  // `step` de la URL no coincide con el `currentStep` real del intento
  // (mismo `attemptId`), navega al slug correcto — nunca confía en la URL
  // como fuente de verdad de progreso.
  useEffect(() => {
    if (!matchedAttempt || matchedAttempt.currentStep === "UNLOCK") return;
    const realSlug = STEP_TO_URL_SLUG[matchedAttempt.currentStep];
    if (realSlug !== step) {
      router.replace(academyRoutes.attemptStep(attemptId, matchedAttempt.currentStep));
    }
  }, [matchedAttempt, attemptId, step, router]);

  // Accesibilidad (§12/§10.1): foco automático + aria-live al cambiar de
  // paso — también en la primera carga exitosa (fix AFR021-01). Callback
  // ref: se invoca cada vez que el nodo se monta (incluida la primera vez
  // que la rama de éxito reemplaza al skeleton de Loading, donde antes el
  // nodo no existía todavía), comparando contra `lastFocusedStepRef` para
  // no repetir el foco si `step` no cambió respecto a la última vez.
  function focusLiveRegion(node: HTMLDivElement | null) {
    if (!node || lastFocusedStepRef.current === step) return;
    lastFocusedStepRef.current = step;
    node.focus();
  }

  if (continuationQuery.isLoading) {
    return <AttemptStepLoadingSkeleton />;
  }

  if (continuationQuery.isError) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={continuationQuery.error.message}
        retryLabel={tUnitMap("retryLabel")}
        onRetry={() => continuationQuery.refetch()}
      />
    );
  }

  if (continuationQuery.data === null) {
    notFound();
    return null;
  }

  // Fix AFR021-02: `UNLOCK` nunca tiene pantalla propia (§12, P-10) — se
  // trata aquí, en el mismo punto que cualquier otro paso fuera de alcance,
  // en vez de dejar que llegue a `displayStep`/al renderizado.
  if (matchedAttempt?.currentStep === "UNLOCK") {
    notFound();
    return null;
  }

  if (!stepFromUrl || !SUPPORTED_STEPS.includes(stepFromUrl)) {
    notFound();
    return null;
  }

  // Navega al paso real devuelto por la Server Action (nunca hardcodeado) —
  // compartido entre el avance libre (P-04) y la verificación de
  // comprensión exitosa (P-05, criterio de aceptación 3: "satisfied===true
  // → navega a .../observe", que es exactamente el `currentStep` que
  // `verifyComprehensionAction` devuelve en ese caso).
  function navigateToAttempt(attempt: AttemptSummaryHttp) {
    if (attempt.currentStep === "UNLOCK") return;
    router.push(academyRoutes.attemptStep(attemptId, attempt.currentStep));
  }

  function handleAdvance() {
    advanceStep.mutate(attemptId, { onSuccess: navigateToAttempt });
  }

  // Fix AFR024-01: cada nuevo intento de verificación limpia el resultado
  // "insuficiente" del intento anterior antes de conocer el desenlace del
  // nuevo — así, si este nuevo intento falla genuinamente (error real de la
  // Server Action), `isInsufficient` ya está en `false` y no puede coexistir
  // con `submitError` (los 4 estados de `ComprehensionGate`, Blueprint §11.2,
  // dejan de solaparse).
  function handleVerify(comprehensionResponse: string) {
    setIsInsufficient(false);
    verifyComprehension.mutate(
      { attemptId, comprehensionResponse },
      {
        onSuccess: (result) => {
          if (result.satisfied) {
            navigateToAttempt(result.attempt);
          } else {
            setIsInsufficient(true);
          }
        },
      },
    );
  }

  const displayStep = matchedAttempt?.currentStep ?? (stepFromUrl as UnitStep);
  const isComprehendStep = displayStep === "COMPREHEND";
  const isModelExamplesStep = displayStep === "OBSERVE" || displayStep === "ANALYZE";
  const isWritingStep = displayStep === "PRODUCE" || displayStep === "REWRITE";
  const isFeedbackStep = displayStep === "RECEIVE_FEEDBACK";
  const isReflectionStep = displayStep === "REFLECT";

  // Envío del formulario de reflexión (P-10, Blueprint §12, criterio de
  // aceptación 1). No navega tras el éxito (`EP-05` no retorna
  // `currentStep`) — el propio `completeReflection.isSuccess`/`.data` hace
  // que `renderReflectionSection()` muestre el resumen de cierre en la
  // misma pantalla.
  function handleCompleteReflection(responses: readonly string[]) {
    completeReflection.mutate(
      { attemptId, responses },
      {
        // Criterio de aceptación 2 / Blueprint §12 P-10: "409 → redirigir al
        // paso real". Sin `currentStep` en la respuesta de error, se
        // refresca `continuationQuery` — si el paso real cambió, el efecto
        // de redirección defensiva ya existente (arriba) actúa por sí solo.
        onError: () => continuationQuery.refetch(),
      },
    );
  }

  function handleBackToMap() {
    router.push(academyRoutes.unitMap());
  }

  // Criterio de aceptación 3 (P-10): reutiliza `navigateToAttempt`, mismo
  // patrón exacto que "Repetir" en `UnitDetailContainer` (P-02).
  function handleRepeatFromSummary() {
    repeatUnit.mutate(unitId, { onSuccess: navigateToAttempt });
  }

  // Navegación (P-09, Blueprint §12): "Reescribir navega directo a
  // .../rewrite (no requiere EP-04, el currentStep sigue en el ciclo de
  // revisión)" — destino hardcodeado por exigencia literal del Blueprint,
  // mismo criterio ya aplicado a la navegación post-envío de P-08.
  function handleRewrite() {
    router.push(academyRoutes.attemptStep(attemptId, "REWRITE"));
  }

  // Navegación (P-09, Blueprint §12, criterios de aceptación 3 y 4):
  // invoca useAdvancePhase() (EP-04); solo si resuelve con éxito navega a
  // .../reflect. Si falla (409 u otro error), no navega — el error queda
  // expuesto vía `advancePhase.isError`/`advancePhase.error`, mostrado por
  // `VersionWithFeedbackPanel`, permaneciendo en esta pantalla.
  function handleContinueToReflection() {
    advancePhase.mutate(
      { attemptId, unitId },
      { onSuccess: () => router.push(academyRoutes.attemptStep(attemptId, "REFLECT")) },
    );
  }

  function handleAutosave(content: string) {
    autosaveDraft.mutate({ attemptId, content });
  }

  // Navegación (P-08, Blueprint §12): "envío exitoso → navega a
  // .../feedback" — `submitVersionAction` retorna `VersionHttp`, que no
  // incluye `currentStep` (a diferencia de `AttemptSummaryHttp`, usado por
  // `navigateToAttempt`), por lo que este es el único destino de este
  // Container que el propio Blueprint especifica de forma literal en vez de
  // derivarlo de la respuesta.
  function handleSubmitVersion(content: string) {
    submitVersion.mutate(
      { attemptId, unitId, content },
      { onSuccess: () => router.push(academyRoutes.attemptStep(attemptId, "RECEIVE_FEEDBACK")) },
    );
  }

  // Sección de ejemplos modelo (P-06, Blueprint §12): reemplaza a
  // `StepContentPanel` únicamente para `OBSERVE`/`ANALYZE` — a diferencia de
  // P-04/P-07, P-06 sí tiene una fuente de contenido real (EP-19), por lo
  // que no aplica el mensaje genérico de "contenido pendiente" (resuelto a
  // favor de la especificación detallada de §12 P-06, más específica que la
  // entrada general de la tabla de gaps de §14 ítem 3, mismo criterio ya
  // usado en `UnitMapContainer` para resolver discrepancias menores dentro
  // del propio Blueprint).
  function renderModelExamplesSection(): ReactNode {
    // Fix AFR028-01: sin `matchedAttempt` (continuación no verificada para
    // este `attemptId`, mismo criterio AFR-015/016) no existe ningún
    // `textType` de confianza — `modelExamplesQuery` pudo haberse disparado
    // sin filtro (§12 P-06 exige "filtrados por el textType de la unidad").
    // Nunca se muestran esos resultados sin filtrar: se trata como Empty,
    // igual que el caso ya contemplado por el Blueprint ("Empty, nunca
    // error"), sin tocar la llamada al hook ni su firma.
    const examples = matchedAttempt ? modelExamplesQuery.data?.data ?? [] : [];

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{tStep(displayStep)}</h1>

        {!matchedAttempt ? (
          <EmptyState title={tModelExample("emptyTitle")} />
        ) : modelExamplesQuery.isLoading ? (
          <ModelExamplesLoadingSkeleton />
        ) : modelExamplesQuery.isError ? (
          <ErrorState
            title={t("errorTitle")}
            description={modelExamplesQuery.error.message}
            retryLabel={tUnitMap("retryLabel")}
            onRetry={() => modelExamplesQuery.refetch()}
          />
        ) : examples.length === 0 ? (
          <EmptyState title={tModelExample("emptyTitle")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((example) => (
              <ModelExampleCard key={example.modelExampleId} example={example} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sección del editor de escritura (P-08, Blueprint §12): reemplaza a
  // `StepContentPanel` únicamente para `PRODUCE`/`REWRITE` — P-08 sí tiene
  // una fuente de contenido real (EP-17, el borrador), no aplica el mensaje
  // genérico de "contenido pendiente".
  function renderWritingSection(): ReactNode {
    if (draftQuery.isLoading) {
      return <WritingEditorLoadingSkeleton />;
    }

    // EP-17 en 404 (sin borrador previo) no es un error — el editor inicia
    // vacío (Blueprint §12 P-08, criterio de aceptación 2).
    const isDraftNotFound = draftQuery.isError && draftQuery.error instanceof ApiError && draftQuery.error.status === 404;

    if (draftQuery.isError && !isDraftNotFound) {
      return (
        <ErrorState
          title={t("errorTitle")}
          description={draftQuery.error.message}
          retryLabel={tUnitMap("retryLabel")}
          onRetry={() => draftQuery.refetch()}
        />
      );
    }

    const initialContent = isDraftNotFound ? "" : draftQuery.data?.content ?? "";
    const autosaveState = autosaveDraft.isPending
      ? "saving"
      : autosaveDraft.isError
        ? "error"
        : autosaveDraft.isSuccess
          ? "saved"
          : "idle";

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{tStep(displayStep)}</h1>
        <WritingEditor
          attemptId={attemptId}
          initialContent={initialContent}
          mode={displayStep === "REWRITE" ? "rewrite" : "produce"}
          onAutosave={handleAutosave}
          autosaveState={autosaveState}
          lastSavedAt={autosaveDraft.data?.lastSavedAt ?? draftQuery.data?.lastSavedAt ?? null}
          onSubmit={handleSubmitVersion}
          isSubmitting={submitVersion.isPending}
          submitError={submitVersion.isError ? submitVersion.error : null}
        />
      </div>
    );
  }

  // Sección de retroalimentación (P-09, Blueprint §12): reemplaza a
  // `StepContentPanel` únicamente para `RECEIVE_FEEDBACK` — igual que P-06/
  // P-08, P-09 sí tiene una fuente de contenido real (EP-18), no aplica el
  // mensaje genérico de "contenido pendiente".
  function renderFeedbackSection(): ReactNode {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{tStep(displayStep)}</h1>
        {feedbackQuery.isError ? (
          <ErrorState
            title={t("errorTitle")}
            description={feedbackQuery.error.message}
            retryLabel={tUnitMap("retryLabel")}
            onRetry={() => feedbackQuery.refetch()}
          />
        ) : !feedbackQuery.data ? (
          <VersionWithFeedbackPanelLoadingSkeleton />
        ) : (
          <VersionWithFeedbackPanel
            status={feedbackQuery.data.status}
            observations={feedbackQuery.data.observations}
            timedOut={feedbackQuery.timedOut}
            onRetryProcessing={() => feedbackQuery.refetch()}
            onRewrite={handleRewrite}
            onContinueToReflection={handleContinueToReflection}
            isAdvancingPhase={advancePhase.isPending}
            advancePhaseError={advancePhase.isError ? advancePhase.error : null}
          />
        )}
      </div>
    );
  }

  // Sección de reflexión (P-10, Blueprint §12): reemplaza a
  // `StepContentPanel` únicamente para `REFLECT`. Sin Query propia (Blueprint
  // §12: "ninguno propio para el formulario") — el único estado relevante es
  // el de la propia mutación `completeReflection`. Tras el éxito
  // (`isSuccess`), permanece en la misma pantalla mostrando el resumen de
  // cierre (`completeReflection.data`, ya es `AcademyUnitDetailHttp`) en vez
  // del formulario — EP-05 no retorna `currentStep`, no hay a dónde navegar
  // automáticamente.
  function renderReflectionSection(): ReactNode {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{tStep(displayStep)}</h1>
        {completeReflection.isSuccess ? (
          <ReflectionSummaryPanel
            unit={completeReflection.data}
            onBackToMap={handleBackToMap}
            onRepeat={handleRepeatFromSummary}
            isRepeating={repeatUnit.isPending}
          />
        ) : (
          <ReflectionForm
            onSubmit={handleCompleteReflection}
            isSubmitting={completeReflection.isPending}
            submitError={completeReflection.isError ? completeReflection.error : null}
          />
        )}
        {repeatUnit.isError ? (
          <p role="alert" className="text-sm text-danger-600">
            {repeatUnit.error.message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={focusLiveRegion} tabIndex={-1} aria-live="polite" className="sr-only">
        {t("stepChangedAnnouncement", { step: tStep(displayStep) })}
      </div>

      <StepProgressTracker currentStep={displayStep} />
      {isModelExamplesStep ? (
        renderModelExamplesSection()
      ) : isWritingStep ? (
        renderWritingSection()
      ) : isFeedbackStep ? (
        renderFeedbackSection()
      ) : isReflectionStep ? (
        renderReflectionSection()
      ) : (
        <StepContentPanel step={displayStep} />
      )}

      {isComprehendStep ? (
        <ComprehensionGate
          onVerify={handleVerify}
          isSubmitting={verifyComprehension.isPending}
          isInsufficient={isInsufficient}
          submitError={verifyComprehension.isError ? verifyComprehension.error : null}
        />
      ) : isWritingStep || isFeedbackStep || isReflectionStep ? null : (
        <>
          {advanceStep.isError ? (
            <ErrorState
              title={t("errorTitle")}
              description={advanceStep.error.message}
              retryLabel={tUnitMap("retryLabel")}
              onRetry={handleAdvance}
            />
          ) : null}
          <StepAdvanceButton onAdvance={handleAdvance} isSubmitting={advanceStep.isPending} />
        </>
      )}
    </div>
  );
}

function AttemptStepLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-8 w-full" />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// P-06 (Blueprint §12): "Loading: grid de Skeleton tipo ModelExampleCard".
function ModelExamplesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );
}

// P-08 (Blueprint §12): "Loading: skeleton del área de texto + contador".
function WritingEditorLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// P-09 (Blueprint §12): "Loading: skeleton de VersionWithFeedbackPanel".
function VersionWithFeedbackPanelLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
