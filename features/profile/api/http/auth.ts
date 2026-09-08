import { auth } from "@clerk/nextjs/server";
import { findStudentIdByClerkId } from "@/database/repositories";
import { UnauthorizedException } from "@/features/profile/application/exceptions/UnauthorizedException";

export interface ProfileActor {
  readonly studentId: string;
}

// Mismo patrón que resolveMyPlanActor()/resolveLaboratoryActor()/
// resolveAcademyActor() — el middleware raíz ya exige sesión Clerk válida
// antes de que cualquier Route Handler de /api/v1/profile/* se ejecute;
// esta función solo traduce esa sesión ya verificada al studentId interno.
export async function resolveProfileActor(): Promise<ProfileActor> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new UnauthorizedException(
      "No hay sesión Clerk activa (middleware.ts debería haber bloqueado esta ruta).",
    );
  }

  const studentId = await findStudentIdByClerkId(clerkUserId);
  if (!studentId) {
    throw new UnauthorizedException("No existe un perfil interno asociado a esta sesión de Clerk.");
  }

  return { studentId };
}
