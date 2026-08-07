"use client";
// Blueprint §15.2. Sin llamada de red: deriva el rol de Academia directamente
// de `publicMetadata` de Clerk en el cliente, replicando la misma prioridad
// de claims que `ClerkRoleResolver.ts` (Presentation/API) ya aplica en el
// servidor — ausencia o valor no reconocido resuelve `null` (fail-closed,
// nunca se asume STUDENT por defecto). `hooks/useAuth.ts` no expone
// `publicMetadata` (por diseño, ver su propio comentario), por eso este hook
// llama a `useUser()` directamente en vez de envolver aquél.
//
// Reutiliza el tipo `AcademyRole` ya definido por `ClerkRoleResolver.ts`
// (`import type`, coste cero en runtime) en vez de duplicar el enum en el
// frontend.
import { useUser } from "@clerk/nextjs";
import type { AcademyRole } from "../api/composition/adapters/ClerkRoleResolver";

const RECOGNIZED_ROLES: readonly AcademyRole[] = ["STUDENT", "TEACHER", "ADMIN"];

export function useAcademyRole(): { role: AcademyRole | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return { role: null, isLoaded: false };

  const publicRole = user?.publicMetadata?.["role"];
  const role =
    typeof publicRole === "string" && RECOGNIZED_ROLES.includes(publicRole as AcademyRole)
      ? (publicRole as AcademyRole)
      : null;

  return { role, isLoaded: true };
}
