// Blueprint §3.1 — normaliza cualquier excepción (de una Server Action o de
// `ApiError` de REST) a la misma forma `AcademyErrorHttp`, para que el campo
// `error` de todo `useMutation` de Academia tenga siempre el mismo tipo sin
// importar el transporte (Blueprint §5.11). Usar dentro del `catch` de
// `mutationFn`, nunca en `onError` (cuyo valor de retorno no se expone).
import { ApiError } from "@/lib/apiClient";
import type { AcademyErrorHttp } from "../types";

export function normalizeAcademyError(error: unknown): AcademyErrorHttp {
  if (error instanceof ApiError) return error.body;
  return {
    code: "ACADEMY_UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    correlationId: "",
  };
}
