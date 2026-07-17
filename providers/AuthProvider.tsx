"use client";
// AuthProvider — envoltura del ClerkProvider oficial (resolución 18.1).
// Wiring de infraestructura únicamente: no implementa flujos de negocio
// (onboarding, diagnóstico, etc. — eso pertenece a features/).
import { ClerkProvider } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
