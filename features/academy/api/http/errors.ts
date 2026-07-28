import { ApplicationException } from "@/features/academy/application/exceptions/ApplicationException";
import { ValidationException } from "@/features/academy/application/exceptions/ValidationException";
import { UnauthorizedException } from "@/features/academy/application/exceptions/UnauthorizedException";
import { ForbiddenException } from "@/features/academy/application/exceptions/ForbiddenException";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/academy/application/exceptions/ConflictException";

// Error Mapping (Alcance #8 del encargo, API Contract v1.3 Sección 11) —
// única fuente de traducción Application Exception → HTTP. Ningún código
// HTTP fuera del catálogo ya congelado por el contrato (400/401/403/404/
// 409/422/500) se introduce aquí.
export interface AcademyErrorBody {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly details?: Record<string, unknown>;
}

export interface MappedAcademyError {
  readonly status: number;
  readonly body: AcademyErrorBody;
}

export function mapErrorToHttp(error: unknown, correlationId: string): MappedAcademyError {
  if (error instanceof ValidationException) {
    // Toda `ValidationException` es una violación sintáctica del borde de
    // la API (400, Sección 11) — el único caso `422` del contrato (EP-22,
    // "verificación de comprensión insuficiente") NO lanza esta excepción
    // (`VerifyComprehensionHandler` lo trata como resultado válido, ver
    // `features/academy/api/handlers/attemptsHandlers.ts`) — se distingue
    // por estado de respuesta, no por excepción, y se resuelve fuera de
    // este mapper.
    return {
      status: 400,
      body: {
        code: error.code,
        message: error.message,
        correlationId,
        details: { fieldErrors: error.fieldErrors },
      },
    };
  }
  if (error instanceof UnauthorizedException) {
    return { status: 401, body: { code: error.code, message: error.message, correlationId } };
  }
  if (error instanceof ForbiddenException) {
    return { status: 403, body: { code: error.code, message: error.message, correlationId } };
  }
  if (error instanceof ResourceNotFoundException) {
    return { status: 404, body: { code: error.code, message: error.message, correlationId } };
  }
  if (error instanceof ConflictException) {
    return { status: 409, body: { code: error.code, message: error.message, correlationId } };
  }
  if (error instanceof ApplicationException) {
    // Cualquier futura subclase de `ApplicationException` no listada arriba
    // (ninguna existe hoy, ver `application/exceptions/index.ts`) se trata
    // como error técnico no clasificado — nunca se inventa un código HTTP
    // fuera del catálogo del contrato.
    return { status: 500, body: { code: error.code, message: error.message, correlationId } };
  }
  return {
    status: 500,
    body: {
      code: "ACADEMY_INTERNAL_ERROR",
      message: "Error técnico interno.",
      correlationId,
      details: { error: String(error instanceof Error ? error.message : error) },
    },
  };
}
