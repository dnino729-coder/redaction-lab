// API Client genérico — wrapper mínimo sobre `fetch` (Blueprint de Academia
// §3). No es específico de ningún módulo: cualquier feature futura que
// consuma un endpoint REST propio del proyecto puede reutilizarlo. Añade:
//   - `Authorization`: no requiere manejo manual — la sesión de Clerk viaja
//     como cookie (`credentials: "same-origin"`), y cada Route Handler
//     resuelve el actor server-side (`resolveAcademyActor()` u homólogo).
//   - `Accept-Language`: derivado del locale activo (atributo `lang` de
//     `<html>`, ya fijado por next-intl/App Router — no requiere que cada
//     call site pase el locale explícitamente).
//   - Parseo uniforme del envoltorio de error `{code, message, correlationId,
//     details}` que ya usan los Route Handlers de Academia.
//
// Sin lógica de negocio ni de módulo — solo transporte HTTP.

export interface ApiErrorBody {
  code: string;
  message: string;
  correlationId: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function resolveActiveLocale(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.lang || null;
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Cabeceras adicionales específicas de la llamada (ej. `Idempotency-Key`). */
  headers?: Record<string, string>;
}

/**
 * Ejecuta una llamada REST y retorna el JSON tipado en éxito. En error,
 * lanza `ApiError` con el envoltorio uniforme ya parseado — nunca deja
 * escapar un error de `fetch` sin normalizar.
 */
export async function apiFetch<TResponse>(path: string, options: ApiFetchOptions = {}): Promise<TResponse> {
  const { body, headers, ...rest } = options;
  const locale = resolveActiveLocale();

  const response = await fetch(path, {
    ...rest,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(locale ? { "Accept-Language": locale } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null as TResponse;
  }

  if (!response.ok) {
    let parsedBody: ApiErrorBody;
    try {
      parsedBody = (await response.json()) as ApiErrorBody;
    } catch {
      parsedBody = {
        code: "ACADEMY_UNKNOWN_ERROR",
        message: `Error inesperado (${response.status})`,
        correlationId: "",
      };
    }
    throw new ApiError(response.status, parsedBody);
  }

  return (await response.json()) as TResponse;
}
