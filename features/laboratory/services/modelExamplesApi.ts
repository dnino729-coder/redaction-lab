// Transporte REST para el bloque "Analyse d'un modèle" (bloque 2) —
// reutiliza exclusivamente el endpoint ya existente de Academia
// (GET /api/v1/academy/model-examples, EP-19) vía el api client genérico
// compartido (lib/apiClient.ts, no específico de ningún módulo). No
// duplica lógica de negocio: solo transporte HTTP.
import { apiFetch } from "@/lib/apiClient";
import type { ModelTextType } from "../types";

export type ModelExampleRating = "EXCELLENT" | "HAS_ERRORS";
export type ModelExampleStatus = "ACTIVE" | "RETIRED";

export interface ModelExampleHttp {
  modelExampleId: string;
  textType: ModelTextType;
  content: string;
  rating: ModelExampleRating;
  curatorialComment: string;
  status: ModelExampleStatus;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number; offset: number };
}

export async function getModelExamples(): Promise<PaginatedResponse<ModelExampleHttp>> {
  return apiFetch<PaginatedResponse<ModelExampleHttp>>("/api/v1/academy/model-examples");
}
