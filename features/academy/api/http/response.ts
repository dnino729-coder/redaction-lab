import { NextResponse } from "next/server";
import type { AcademyErrorBody } from "./errors";

// Response Mapping (Alcance #7) — envoltorio HTTP uniforme (API Contract
// v1.3, Secciones 2/11/12): headers `X-Correlation-Id`/`X-Request-Id`
// SIEMPRE presentes en la respuesta (éxito o error); paginación con
// `meta.total/limit/offset` (Sección 2) en toda colección.
export interface AcademyResponseHeaders {
  readonly correlationId: string;
  readonly requestId: string;
}

function withObservabilityHeaders(response: NextResponse, headers: AcademyResponseHeaders): NextResponse {
  response.headers.set("X-Correlation-Id", headers.correlationId);
  response.headers.set("X-Request-Id", headers.requestId);
  return response;
}

export function jsonSuccess<T>(
  data: T,
  status: number,
  headers: AcademyResponseHeaders,
  cacheControl?: "no-store" | "cacheable",
): NextResponse {
  const response = NextResponse.json(data, { status });
  // Performance (API Contract v1.3, Sección 13): nunca cachear una lectura
  // que participe en una decisión de negocio en curso; únicamente EP-19
  // (Biblioteca de Modelos) puede ser cacheable — decidido por el llamador
  // vía el parámetro `cacheControl`, nunca por defecto.
  response.headers.set("Cache-Control", cacheControl === "cacheable" ? "public, max-age=60" : "no-store");
  return withObservabilityHeaders(response, headers);
}

export function jsonNoContent(headers: AcademyResponseHeaders): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return withObservabilityHeaders(response, headers);
}

export function jsonError(mapped: { status: number; body: AcademyErrorBody }, headers: AcademyResponseHeaders): NextResponse {
  const response = NextResponse.json(mapped.body, { status: mapped.status });
  return withObservabilityHeaders(response, headers);
}

export interface PaginationInput {
  readonly limit: number;
  readonly offset: number;
}

export interface PaginatedBody<T> {
  readonly data: readonly T[];
  readonly meta: { readonly total: number; readonly limit: number; readonly offset: number };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Resuelve `limit`/`offset` desde los query params (Sección 2: "limit
 * máximo de 100 y valor por defecto de 20 en toda colección"). */
export function resolvePagination(searchParams: URLSearchParams): PaginationInput {
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const rawOffset = Number(searchParams.get("offset") ?? 0);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.trunc(rawOffset) : 0;
  return { limit, offset };
}

/**
 * Pagina un arreglo ya materializado (Nota de reconciliación, disclosed):
 * `AcademyReadModelPort` (Application Layer, Frozen) no declara parámetros
 * de paginación en ninguno de sus métodos de listado — la paginación del
 * Contrato (Sección 2) se aplica aquí, en el borde de la API, sobre el
 * resultado ya devuelto por el Read Model. Para volúmenes grandes esto no
 * pagina a nivel de consulta SQL — limitación conocida y disclosed en el
 * informe de entrega, no resoluble sin modificar Application/Infrastructure
 * (ambos fuera de alcance de este Sprint).
 */
export function paginate<T>(items: readonly T[], input: PaginationInput): PaginatedBody<T> {
  return {
    data: items.slice(input.offset, input.offset + input.limit),
    meta: { total: items.length, limit: input.limit, offset: input.offset },
  };
}
