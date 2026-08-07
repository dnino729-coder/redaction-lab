// Ruta raíz — decide el destino según el estado de autenticación (Sprint 2:
// "cerrar el recorrido Login → Dashboard"). Antes redirigía siempre a
// `/landing`, incluso para una sesión ya autenticada — un usuario que
// vuelve a `/` tras iniciar sesión (p. ej. cerrando y reabriendo la
// pestaña) nunca llegaba a su Dashboard sin escribir la URL a mano.
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { resolvePostAuthRedirectPath } from "@/services/auth";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId, sessionClaims } = await auth();

  const destination = userId ? resolvePostAuthRedirectPath(sessionClaims) : "/landing";

  if (locale === "fr") {
    redirect(destination);
  }

  redirect(`/${locale}${destination}`);
}
