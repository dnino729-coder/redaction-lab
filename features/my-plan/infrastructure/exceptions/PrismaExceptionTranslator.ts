import { Prisma } from "@prisma/client";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";

// Punto 9 del encargo: "Traducir errores de Prisma → Application
// Exceptions → Domain Exceptions. Nunca propagar errores propios de
// Prisma hacia capas superiores." Este traductor es la única frontera
// donde `Prisma.PrismaClientKnownRequestError` (u otro error de
// infraestructura) puede aparecer — todo repositorio/adaptador de este
// sprint captura sus propias llamadas a Prisma con este traductor antes
// de dejar que el error suba a Application/Domain.
//
// Cobertura deliberadamente mínima (2 códigos): son los únicos que
// pueden producirse legítimamente con las operaciones que este sprint
// implementa (upsert por `id` ya validado como UUID por el dominio, y
// relaciones FK ya garantizadas por el flujo de Application Layer, p.
// ej. `learningPlanId` siempre existe porque `CreateLearningPlanHandler`
// crea el `LearningPlan` antes que sus `LearningGoal`). Cualquier otro
// código de Prisma (P2003 FK violation, timeouts, errores de conexión,
// etc.) se traduce a un `ConflictException` genérico como salvaguarda —
// nunca se deja escapar `PrismaClientKnownRequestError` ni ningún otro
// error nativo de Prisma — pero se señala como riesgo pendiente en el
// informe de entrega: una cobertura más fina por código requiere casos
// de uso reales que aún no existen en este sprint (p. ej. ningún Handler
// actual puede violar una FK, porque Application Layer siempre resuelve
// el padre antes de crear el hijo).
export function translatePrismaError(error: unknown, resourceName: string, resourceId: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new ResourceNotFoundException(resourceName, resourceId);
    }
    if (error.code === "P2002") {
      throw new ConflictException(
        `${resourceName} (${resourceId}) viola una restricción de unicidad ya existente en la base de datos.`,
      );
    }
    throw new ConflictException(
      `${resourceName} (${resourceId}): error de persistencia no clasificado (Prisma ${error.code}).`,
    );
  }
  throw error;
}
