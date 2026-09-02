import { NextResponse } from "next/server";
import { ApplicationException } from "@/features/laboratory/application/exceptions/ApplicationException";
import { ValidationException } from "@/features/laboratory/application/exceptions/ValidationException";
import { ResourceNotFoundException } from "@/features/laboratory/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/laboratory/application/exceptions/ConflictException";
import { UnauthorizedException } from "@/features/laboratory/application/exceptions/UnauthorizedException";
import { ForbiddenException } from "@/features/laboratory/application/exceptions/ForbiddenException";

export function jsonSuccess<T>(data: T, status: number): NextResponse {
  return NextResponse.json(data, { status });
}

// Traduce la jerarquía de ApplicationException (Paso 5) a HTTP — único
// lugar que conoce esa jerarquía dentro de la capa API.
export function jsonError(error: unknown): NextResponse {
  if (error instanceof ValidationException) {
    return NextResponse.json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors }, { status: 400 });
  }
  if (error instanceof UnauthorizedException) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenException) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 403 });
  }
  if (error instanceof ResourceNotFoundException) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 404 });
  }
  if (error instanceof ConflictException) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 409 });
  }
  if (error instanceof ApplicationException) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ code: "LABORATORY_UNKNOWN_ERROR", message: "Error inesperado." }, { status: 500 });
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

export function resolvePagination(searchParams: URLSearchParams): PaginationInput {
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const rawOffset = Number(searchParams.get("offset") ?? 0);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.trunc(rawOffset) : 0;
  return { limit, offset };
}

export function paginate<T>(items: readonly T[], input: PaginationInput): PaginatedBody<T> {
  return {
    data: items.slice(input.offset, input.offset + input.limit),
    meta: { total: items.length, limit: input.limit, offset: input.offset },
  };
}
