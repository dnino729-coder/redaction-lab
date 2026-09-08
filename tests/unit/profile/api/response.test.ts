import { describe, it, expect } from "vitest";
import { jsonError, jsonSuccess } from "@/features/profile/api/http/response";
import { UnauthorizedException } from "@/features/profile/application/exceptions/UnauthorizedException";
import { ConflictException } from "@/features/profile/application/exceptions/ConflictException";
import { ValidationException } from "@/features/profile/application/exceptions/ValidationException";

describe("jsonSuccess", () => {
  it("devuelve el status HTTP indicado con el body dado", async () => {
    const response = jsonSuccess({ learningPlanId: "plan-1" }, 201);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ learningPlanId: "plan-1" });
  });
});

describe("jsonError", () => {
  it("traduce UnauthorizedException a 401", async () => {
    const response = jsonError(new UnauthorizedException("No hay sesión Clerk activa."));
    expect(response.status).toBe(401);
  });

  it("traduce ValidationException a 400 e incluye fieldErrors", async () => {
    const response = jsonError(new ValidationException(["nativeLanguage es obligatorio."]));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors).toEqual(["nativeLanguage es obligatorio."]);
  });

  it("traduce ConflictException (onboarding ya completado) a 409", async () => {
    const response = jsonError(new ConflictException("El onboarding ya fue completado."));
    expect(response.status).toBe(409);
  });

  it("traduce un error no clasificado a 500 sin exponer el error nativo", async () => {
    const response = jsonError(new Error("boom"));
    expect(response.status).toBe(500);
    expect((await response.json()).message).toBe("Error inesperado.");
  });
});
