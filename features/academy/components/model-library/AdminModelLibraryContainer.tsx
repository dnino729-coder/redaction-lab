// AdminModelLibraryContainer — Blueprint §10.1/§12 (P-14). Único componente
// inteligente de esta pantalla: concentra los 4 hooks de datos ya existentes
// (`useModelExamples`, `useCreateModelExample`, `useUpdateModelExample`,
// `useRetireModelExample`, ninguno modificado) y el estado local de filtro/
// formulario/confirmación de retiro. `ModelExampleCard` (variante editable) y
// `ModelExampleForm` son 100% presentacionales.
//
// Filtro: mismo patrón exacto que `ModelLibraryContainer` (P-11) — sin
// selección, `textType` es `undefined`, EP-19 devuelve los 5 tipos
// combinados. A diferencia de P-06/P-11, aquí el grid incluye también
// ejemplos `RETIRED` (Blueprint §12 P-14: "DTOs consumidos: `ModelExampleHttp[]`
// (incluye `RETIRED`, a diferencia de P-06/P-11)") — el backend ya filtra por
// rol (EP-19, Sección 4 del API Contract: `status: ACTIVE` únicamente para
// `STUDENT`), sin ningún filtro adicional del lado del Frontend.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Dialog, EmptyState, ErrorState, Select, Skeleton } from "@/components/ui";
import {
  useCreateModelExample,
  useModelExamples,
  useRetireModelExample,
  useUpdateModelExample,
} from "../../hooks";
import { ALL_TEXT_TYPES } from "../../constants";
import { AcademyBreadcrumbs } from "../shared";
import { ModelExampleCard } from "./ModelExampleCard";
import { ModelExampleForm } from "./ModelExampleForm";
import type { CreateModelExampleInput } from "../../schemas";
import type { ModelExampleHttp, TextType } from "../../types";

type FormState = { mode: "create" } | { mode: "edit"; example: ModelExampleHttp } | null;

export function AdminModelLibraryContainer() {
  const t = useTranslations("academy.adminModelLibrary");
  const tModelExample = useTranslations("academy.modelExample");
  const tTextType = useTranslations("academy.textType");
  const tLayout = useTranslations("academy.layout");

  const [textType, setTextType] = useState<TextType | undefined>(undefined);
  const [formState, setFormState] = useState<FormState>(null);
  const [pendingRetire, setPendingRetire] = useState<ModelExampleHttp | null>(null);

  const modelExamplesQuery = useModelExamples(textType);
  const createModelExample = useCreateModelExample();
  const updateModelExample = useUpdateModelExample();
  const retireModelExample = useRetireModelExample();

  function handleSubmit(values: CreateModelExampleInput) {
    if (formState?.mode === "edit") {
      updateModelExample.mutate(
        {
          modelExampleId: formState.example.modelExampleId,
          content: values.content,
          curatorialComment: values.curatorialComment,
        },
        { onSuccess: () => setFormState(null) },
      );
    } else {
      createModelExample.mutate(values, { onSuccess: () => setFormState(null) });
    }
  }

  function handleConfirmRetire() {
    if (!pendingRetire) return;
    retireModelExample.mutate(pendingRetire.modelExampleId, { onSuccess: () => setPendingRetire(null) });
  }

  const examples = modelExamplesQuery.data?.data ?? [];
  const isFormSubmitting = formState?.mode === "edit" ? updateModelExample.isPending : createModelExample.isPending;
  const formSubmitError =
    formState?.mode === "edit"
      ? updateModelExample.isError
        ? updateModelExample.error
        : null
      : createModelExample.isError
        ? createModelExample.error
        : null;

  return (
    <div className="flex flex-col gap-6">
      <AcademyBreadcrumbs items={[{ label: tLayout("title") }, { label: t("title") }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            {t("filterLabel")}
            <Select
              value={textType ?? ""}
              onChange={(event) => setTextType((event.target.value || undefined) as TextType | undefined)}
            >
              <option value="">{t("filterAll")}</option>
              {ALL_TEXT_TYPES.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {tTextType(candidate)}
                </option>
              ))}
            </Select>
          </label>
          <Button onClick={() => setFormState({ mode: "create" })}>{t("createLabel")}</Button>
        </div>
      </div>

      {modelExamplesQuery.isLoading ? (
        <AdminModelLibraryLoadingSkeleton />
      ) : modelExamplesQuery.isError ? (
        <ErrorState
          title={t("errorTitle")}
          description={modelExamplesQuery.error.message}
          retryLabel={t("retryLabel")}
          onRetry={() => modelExamplesQuery.refetch()}
        />
      ) : examples.length === 0 ? (
        <EmptyState title={tModelExample("emptyTitle")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <ModelExampleCard
              key={example.modelExampleId}
              example={example}
              onEdit={(selected) => setFormState({ mode: "edit", example: selected })}
              onRetire={(selected) => setPendingRetire(selected)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={formState !== null}
        onClose={() => setFormState(null)}
        title={formState?.mode === "edit" ? t("editTitle") : t("createTitle")}
      >
        <ModelExampleForm
          mode={formState?.mode ?? "create"}
          initialValues={formState?.mode === "edit" ? formState.example : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isFormSubmitting}
          submitError={formSubmitError}
        />
      </Dialog>

      <Dialog open={pendingRetire !== null} onClose={() => setPendingRetire(null)} title={t("retireConfirmTitle")}>
        <p className="text-sm text-neutral-700">{t("retireConfirmMessage")}</p>
        {retireModelExample.isError ? (
          <p role="alert" className="text-sm text-danger-600">
            {retireModelExample.error.message}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingRetire(null)}>
            {t("cancelLabel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmRetire}
            disabled={retireModelExample.isPending}
            aria-busy={retireModelExample.isPending}
          >
            {t("confirmRetireLabel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function AdminModelLibraryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );
}
