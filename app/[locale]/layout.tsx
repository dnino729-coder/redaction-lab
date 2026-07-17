// Layout raíz de la aplicación (segmento [locale] — resolución 18.18: i18n
// vía next-intl, sin lógica de producto, ver sección 5.4: "Toda la lógica
// deberá residir fuera de esta carpeta"). Monta los providers globales
// (Theme, Auth, Toast, Analytics, Coach) definidos en providers/, envueltos
// en NextIntlClientProvider para exponer los diccionarios de mensajes a los
// Client Components del árbol.
//
// Corrige el hallazgo 3 de la auditoría de infraestructura: antes este
// layout no montaba AppProviders, por lo que ClerkProvider (y el resto de
// providers) nunca se ejecutaban pese a estar implementados.
//
// No existe app/layout.tsx en la raíz: al vivir todas las páginas bajo
// app/[locale]/, este layout funciona como raíz efectiva (patrón oficial de
// next-intl para App Router). app/global-error.tsx permanece fuera del
// segmento de idioma por requisito de Next.js (fallback cuando el propio
// layout raíz lanza un error).

import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/providers";
import "../../styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Redaction Lab",
  description:
    "Plataforma de entrenamiento de la producción escrita DELF B2 mediante Inteligencia Artificial.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita el renderizado estático de esta ruta pese a leer el locale
  // dinámicamente (ver documentación de next-intl para App Router).
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
