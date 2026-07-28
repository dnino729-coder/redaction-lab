import { Prisma } from "@prisma/client";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/academy/application/exceptions/ConflictException";

// Traductor de errores técnicos de Prisma -> excepciones de Application
// (mismo patrón que features/my-plan/infrastructure/exceptions/
// PrismaExceptionTranslator.ts, adaptado a que las excepciones de
// Application de Academia — a diferencia de las de Mi Plan — exigen un
// `code` del catálogo ya Frozen como primer argumento, no solo
// resourceName/message). Cobertura mínima (P2025/P2002, igual que Mi
// Plan) — cualquier otro código se traduce a un ConflictException
// genérico como salvaguarda; nunca se deja escapar un error nativo de
// Prisma hacia Application/Domain.
export function translatePrismaError(error: unknown, resourceName: string, resourceId: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new ResourceNotFoundException(
        `ACADEMY_NOT_FOUND_${resourceName.toUpperCase()}`,
        resourceName,
        resourceId,
      );
    }
    if (error.code === "P2002") {
      // Código ya cataloged (Application Layer Spec v1.0, Sección 1) para
      // conflictos de escritura concurrente — el más cercano a una
      // violación de unicidad detectada en este punto.
      throw new ConflictException(
        "ACADEMY_CONFLICT_CONCURRENT_MODIFICATION",
        `${resourceName} (${resourceId}) viola una restricción de unicidad ya existente en la base de datos.`,
      );
    }
    throw new ConflictException(
      "ACADEMY_CONFLICT_CONCURRENT_MODIFICATION",
      `${resourceName} (${resourceId}): error de persistencia no clasificado (Prisma ${error.code}).`,
    );
  }
  throw error;
}
