// ModelExampleForm — Blueprint §11.2/§12 (P-14, "formulario de alta/edición",
// nombre no fijado literalmente por el Blueprint). 100% presentacional: cero
// hooks de datos, recibe todo resuelto de `AdminModelLibraryContainer`
// (mismo patrón que `ComprehensionGate`/`ReflectionForm`, resolución AFR2-01).
//
// Un único componente para alta y edición: `textType`/`rating` se deshabilitan
// en modo edición (Blueprint §9, `updateModelExampleSchema`: "textType/rating
// no se editan tras la creación"), pero el formulario siempre valida y envía
// los 4 campos de `createModelExampleSchema` — es el Container quien decide,
// según `mode`, si invoca `useCreateModelExample()` con el objeto completo o
// `useUpdateModelExample()` extrayendo solo `content`/`curatorialComment`.
// Evita duplicar un segundo schema/tipo de formulario para un caso que ya
// comparte el 100% de los campos visualmente.
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Select, Textarea } from "@/components/ui";
import { createModelExampleSchema, type CreateModelExampleInput } from "../../schemas";
import { ALL_TEXT_TYPES } from "../../constants";
import type { AcademyErrorHttp } from "../../types";

export interface ModelExampleFormProps {
  mode: "create" | "edit";
  initialValues?: CreateModelExampleInput;
  onSubmit: (values: CreateModelExampleInput) => void;
  isSubmitting: boolean;
  submitError: AcademyErrorHttp | null;
}

export function ModelExampleForm({ mode, initialValues, onSubmit, isSubmitting, submitError }: ModelExampleFormProps) {
  const t = useTranslations("academy.modelExampleForm");
  const tTextType = useTranslations("academy.textType");
  const tModelExample = useTranslations("academy.modelExample");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateModelExampleInput>({
    resolver: zodResolver(createModelExampleSchema),
    mode: "onChange",
    defaultValues: initialValues ?? { textType: undefined, content: "", rating: undefined, curatorialComment: "" },
  });

  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="modelExampleTextType" className="text-sm font-medium text-neutral-700">
          {t("textTypeLabel")}
        </label>
        <Select id="modelExampleTextType" disabled={isEdit || isSubmitting} {...register("textType")}>
          <option value="">{t("textTypePlaceholder")}</option>
          {ALL_TEXT_TYPES.map((candidate) => (
            <option key={candidate} value={candidate}>
              {tTextType(candidate)}
            </option>
          ))}
        </Select>
        {errors.textType ? <p className="text-sm text-danger-600">{t("textTypeRequired")}</p> : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="modelExampleRating" className="text-sm font-medium text-neutral-700">
          {t("ratingLabel")}
        </label>
        <Select id="modelExampleRating" disabled={isEdit || isSubmitting} {...register("rating")}>
          <option value="">{t("ratingPlaceholder")}</option>
          <option value="EXCELLENT">{tModelExample("ratingExcellent")}</option>
          <option value="HAS_ERRORS">{tModelExample("ratingHasErrors")}</option>
        </Select>
        {errors.rating ? <p className="text-sm text-danger-600">{t("ratingRequired")}</p> : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="modelExampleContent" className="text-sm font-medium text-neutral-700">
          {t("contentLabel")}
        </label>
        <Textarea
          id="modelExampleContent"
          disabled={isSubmitting}
          aria-invalid={errors.content ? true : undefined}
          {...register("content")}
        />
        {errors.content ? <p className="text-sm text-danger-600">{t("contentRequired")}</p> : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="modelExampleCuratorialComment" className="text-sm font-medium text-neutral-700">
          {t("curatorialCommentLabel")}
        </label>
        <Textarea
          id="modelExampleCuratorialComment"
          disabled={isSubmitting}
          aria-invalid={errors.curatorialComment ? true : undefined}
          {...register("curatorialComment")}
        />
        {errors.curatorialComment ? <p className="text-sm text-danger-600">{t("curatorialCommentRequired")}</p> : null}
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
