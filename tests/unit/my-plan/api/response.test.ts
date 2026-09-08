import { describe, it, expect } from "vitest";
import { jsonError, jsonSuccess } from "@/features/my-plan/api/http/response";
import { UnauthorizedException } from "@/features/my-plan/application/exceptions/UnauthorizedException";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";

describe("jsonSuccess", () => {
  it("devuelve el status HTTP indicado con el body dado", async () => {
    const response = jsonSuccess({ id: "plan-1" }, 200);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "plan-1" });
  });
});

describe("jsonError", () => {
  it("traduce UnauthorizedException (sin sesión / sin perfil) a 401", async () => {
    const response = jsonError(new UnauthorizedException("No hay sesión Clerk activa."));
    expect(response.status).toBe(401);
    expect((await response.json()).message).toBe("No hay sesión Clerk activa.");
  });

  it("traduce ResourceNotFoundException (sin plan activo) a 404", async () => {
    const response = jsonError(new ResourceNotFoundException("LearningPlan (activo)", "student-1"));
    expect(response.status).toBe(404);
  });

  it("traduce ValidationException a 400 e incluye fieldErrors", async () => {
    const response = jsonError(new ValidationException(["studentId debe ser un UUID válido."]));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors).toEqual(["studentId debe ser un UUID válido."]);
  });

  it("traduce un error no clasificado a 500 sin exponer el error nativo", async () => {
    const response = jsonError(new Error("boom"));
    expect(response.status).toBe(500);
    expect((await response.json()).message).toBe("Error inesperado.");
  });
});
