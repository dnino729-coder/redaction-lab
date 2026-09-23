// Ruta: Inicio de sesión (Clerk — sección 12.3, resolución 18.1).
// Uso del componente prebuilt oficial de Clerk: wiring de infraestructura,
// no una pantalla de producto diseñada (sin Design System aplicado todavía
// — eso corresponde a la fase de desarrollo del módulo de Autenticación).
import { SignIn } from "@clerk/nextjs";
import { routing } from "@/i18n/routing";

function localizedPath(locale: string, segment: "sign-in" | "sign-up") {
  return locale === routing.defaultLocale ? `/${segment}` : `/${locale}/${segment}`;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <SignIn path={localizedPath(locale, "sign-in")} signUpUrl={localizedPath(locale, "sign-up")} />
  );
}
