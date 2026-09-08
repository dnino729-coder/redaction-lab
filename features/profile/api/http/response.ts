import { NextResponse } from "next/server";
import { ApplicationException } from "@/features/profile/application/exceptions/ApplicationException";
import { ValidationException } from "@/features/profile/application/exceptions/ValidationException";
import { ConflictException } from "@/features/profile/application/exceptions/ConflictException";
import { UnauthorizedException } from "@/features/profile/application/exceptions/UnauthorizedException";

export function jsonSuccess<T>(data: T, status: number): NextResponse {
  return NextResponse.json(data, { status });
}

// Traduce la jerarquía de ApplicationException de Profile a HTTP — mismo
// patrón que features/my-plan/api/http/response.ts (sin campo `code`,
// solo `message`/`fieldErrors`). Cualquier excepción no reconocida aquí
// (incluida una ConflictException/ValidationException de My Plan que
// pudiera escapar de CreateLearningPlanHandler en una condición de carrera
// ya mitigada por el chequeo previo del Handler) cae al 500 genérico, sin
// exponer detalles internos.
export function jsonError(error: unknown): NextResponse {
  if (error instanceof ValidationException) {
    return NextResponse.json(
      { message: error.message, fieldErrors: error.fieldErrors },
      { status: 400 },
    );
  }
  if (error instanceof UnauthorizedException) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
  if (error instanceof ConflictException) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }
  if (error instanceof ApplicationException) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
}
