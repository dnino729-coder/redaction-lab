import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";

describe("translatePrismaError", () => {
  it("P2025 (registro no encontrado) -> ResourceNotFoundException", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", { code: "P2025" });
    expect(() => translatePrismaError(error, "LearningPlan", "id-1")).toThrow(ResourceNotFoundException);
  });

  it("P2002 (violación de unicidad) -> ConflictException", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002" });
    expect(() => translatePrismaError(error, "LearningPlan", "id-1")).toThrow(ConflictException);
  });

  it("código Prisma no clasificado -> ConflictException genérico (nunca deja escapar el error nativo)", () => {
    const error = new Prisma.PrismaClientKnownRequestError("FK violation", { code: "P2003" });
    expect(() => translatePrismaError(error, "LearningPlan", "id-1")).toThrow(ConflictException);
  });

  it("un error que no es de Prisma se relanza sin modificar (no lo traduce indebidamente)", () => {
    const genericError = new Error("boom");
    expect(() => translatePrismaError(genericError, "LearningPlan", "id-1")).toThrow(genericError);
  });
});
