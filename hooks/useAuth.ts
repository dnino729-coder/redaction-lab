"use client";
// useAuth — hook reutilizable (sección 5.4), envoltura fina del cliente de
// Clerk (resolución 18.1). Expone únicamente el estado de sesión (nunca el
// `studentId` interno — la resolución Clerk → User.id ocurre en el
// servidor, ver database/repositories/userRepository.ts,
// findStudentIdByClerkId) para no duplicar esa lógica en el cliente.
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export interface UseAuthResult {
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Id de Clerk (no el `studentId` interno — ver nota de archivo). */
  clerkUserId: string | null;
  firstName: string | null;
  imageUrl: string | null;
}

export function useAuth(): UseAuthResult {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    clerkUserId: userId ?? null,
    firstName: user?.firstName ?? null,
    imageUrl: user?.imageUrl ?? null,
  };
}
