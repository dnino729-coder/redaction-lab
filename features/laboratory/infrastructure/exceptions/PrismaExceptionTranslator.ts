import { Prisma } from "@prisma/client";

// Errores propios de infraestructura — Application todavía no existe en
// este módulo (fuera de alcance de este paso), así que no se lanza ninguna
// excepción de esa capa; se traduce a un tipo mínimo que Application podrá
// volver a traducir cuando exista.
export class PersistenceNotFoundError extends Error {
  constructor(resourceName: string, resourceId: string) {
    super(`${resourceName} (${resourceId}) no encontrado.`);
    this.name = "PersistenceNotFoundError";
  }
}

export class PersistenceConflictError extends Error {
  constructor(resourceName: string, resourceId: string, detail: string) {
    super(`${resourceName} (${resourceId}): ${detail}`);
    this.name = "PersistenceConflictError";
  }
}

export function translatePersistenceError(error: unknown, resourceName: string, resourceId: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new PersistenceNotFoundError(resourceName, resourceId);
    }
    if (error.code === "P2002") {
      throw new PersistenceConflictError(
        resourceName,
        resourceId,
        "viola una restricción de unicidad ya existente en la base de datos.",
      );
    }
    throw new PersistenceConflictError(resourceName, resourceId, `error de persistencia no clasificado (Prisma ${error.code}).`);
  }
  throw error;
}
