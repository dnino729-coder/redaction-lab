import { Prisma } from "@prisma/client";
import { ConflictException } from "@/features/profile/application/exceptions/ConflictException";

// Traductor de errores Prisma → Application, copia propia de Profile
// (mismo patrón que features/my-plan/infrastructure/exceptions/
// PrismaExceptionTranslator.ts). Cobertura mínima: P2002 (violación de
// unicidad en student_profile.user_id) es el único caso realista aquí —
// una condición de carrera entre dos peticiones concurrentes de
// onboarding para el mismo estudiante, ya que el Handler verifica
// no-existencia antes de llamar a create() pero no dentro de la misma
// transacción que el INSERT (create(), nunca upsert, por diseño).
export function translatePrismaError(
  error: unknown,
  resourceName: string,
  resourceId: string,
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new ConflictException(
        `${resourceName} (${resourceId}) ya existe (violación de unicidad).`,
      );
    }
    throw new ConflictException(
      `${resourceName} (${resourceId}): error de persistencia no clasificado (Prisma ${error.code}).`,
    );
  }
  throw error;
}
