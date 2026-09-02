import { auth } from "@clerk/nextjs/server";
import { findStudentIdByClerkId } from "@/database/repositories";
import { UnauthorizedException } from "@/features/laboratory/application/exceptions/UnauthorizedException";

export interface LaboratoryActor {
  readonly studentId: string;
}

// El middleware raíz ya exige sesión Clerk válida antes de que cualquier
// Route Handler de /api/v1/laboratory/* se ejecute — esta función solo
// traduce esa sesión ya verificada al studentId interno.
export async function resolveLaboratoryActor(): Promise<LaboratoryActor> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new UnauthorizedException(
      "LABORATORY_UNAUTHORIZED_NO_SESSION",
      "No hay sesión Clerk activa (middleware.ts debería haber bloqueado esta ruta).",
    );
  }

  const studentId = await findStudentIdByClerkId(clerkUserId);
  if (!studentId) {
    throw new UnauthorizedException(
      "LABORATORY_UNAUTHORIZED_NO_PROFILE",
      "No existe un perfil interno asociado a esta sesión de Clerk.",
    );
  }

  return { studentId };
}
