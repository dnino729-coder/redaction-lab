import { NextResponse } from "next/server";
import { ApplicationException } from "@/features/my-plan/application/exceptions/ApplicationException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { UnauthorizedException } from "@/features/my-plan/application/exceptions/UnauthorizedException";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";

export function jsonSuccess<T>(data: T, status: number): NextResponse {
  return NextResponse.json(data, { status });
}

// Traduce la jerarquía de ApplicationException (Mi Plan) a HTTP — único
// lugar que conoce esa jerarquía dentro de la capa API. A diferencia de
// Laboratory/Academy, las excepciones de Mi Plan no tienen un campo
// `code` (ver ApplicationException.ts) — el body solo expone `message`
// (y `fieldErrors` cuando aplica), sin inventar un código que no existe.
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
  if (error instanceof ForbiddenException) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }
  if (error instanceof ResourceNotFoundException) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
  if (error instanceof ConflictException) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }
  if (error instanceof ApplicationException) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Error inesperado." }, { status: 500 });
}
