// Configuración base de Next.js (App Router).
// No debe contener lógica de negocio ni de módulos — solo ajustes de plataforma.
// Ver sección 5.2 (Arquitectura Tecnológica) y 5.4 (Arquitectura del Proyecto).

import createNextIntlPlugin from "next-intl/plugin";

// Registra i18n/request.ts como resolvedor de locale + diccionario de
// mensajes para Server Components (resolución 18.18).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Dominios de almacenamiento de assets (Supabase Storage — resolución
    // 18.16) se añadirán aquí cuando se configure el módulo de Storage.
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // No-op en versiones de Next.js donde instrumentation.ts ya es estable;
    // se mantiene explícito por compatibilidad (hallazgo 11 de la auditoría:
    // habilita el registro de OpenTelemetry en instrumentation.ts).
    instrumentationHook: true,
  },
  // Cabeceras de seguridad de referencia (sección 15.2/15.6, MUST: CSP,
  // protección XSS/CSRF, equivalente a Helmet). Corrige el hallazgo 12 de
  // la auditoría de infraestructura — antes no existía ninguna cabecera
  // configurada. Este es un baseline conservador; se ajustará cuando se
  // conozcan los orígenes reales de scripts/estilos/conexiones de cada
  // integración (Clerk, Sentry, PostHog, Supabase) durante el desarrollo.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
