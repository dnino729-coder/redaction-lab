"use client";
// ModelAnalysisLibrary — bloque 2 "Analyse d'un modèle". Único bloque de
// Laboratorio ya conectado a persistencia real: reutiliza el ModelExample
// de Academia (tabla/repositorio/query handler/endpoint ya existentes,
// sin ninguna modificación) vía useModelExamples(). El resto de los
// bloques de Laboratorio sigue en laboratoryService.dev.ts.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton, ErrorState } from "@/components/ui";
import { useModelExamples } from "../hooks";

export function ModelAnalysisLibrary() {
  const t = useTranslations("laboratory.modelAnalysis");
  const tTextType = useTranslations("laboratory.textType");
  const { data, isLoading, isError, refetch } = useModelExamples();

  const models = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <ErrorState title={t("error")} onRetry={() => refetch()} />
        ) : models.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {models.map((model) => (
              <li
                key={model.modelExampleId}
                className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {tTextType(model.textType)}
                  </span>
                  <Badge variant={model.rating === "EXCELLENT" ? "success" : "warning"}>
                    {t(`rating.${model.rating}`)}
                  </Badge>
                </div>
                <p className="line-clamp-3 text-sm text-neutral-700">{model.content}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
