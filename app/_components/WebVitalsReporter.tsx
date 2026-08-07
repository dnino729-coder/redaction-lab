// WebVitalsReporter — Fase 6 del Roadmap de Academia (§24: "medición de
// performance (Web Vitals)"). Mecanismo oficial de Next.js 14.2.35
// (confirmado por lectura directa de `node_modules/next/dist/client/
// web-vitals.d.ts`): `useReportWebVitals` de `next/web-vitals`. Es un Hook,
// por lo que exige un Client Component — el layout raíz
// (`app/[locale]/layout.tsx`) es un Server Component (usa `await params`,
// `setRequestLocale`) y no puede invocarlo directamente; este componente
// existe únicamente para ese propósito y se renderiza desde allí.
//
// Sin dependencias nuevas ni mecanismo alternativo: el hook ya reporta las
// 6 métricas estándar (CLS, FID, LCP, INP, FCP, TTFB) interna y
// automáticamente (ver el propio `web-vitals.js` compilado de Next) — este
// componente solo provee el callback de recepción, sin reimplementar nada.
// El destino del reporte (consola en desarrollo) es deliberadamente mínimo:
// ningún documento de Academia exige un backend de telemetría propio; un
// pipeline de envío real pertenece al Platform Core (Telemetry Catalog,
// `redaction-lab-platform-core-foundation-v1.0-2026-07-19.md`, Sección 3),
// no a este Sprint.
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(metric);
    }
  });

  return null;
}
