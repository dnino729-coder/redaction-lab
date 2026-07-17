"use client";
// Error global de la aplicación (fuera del árbol de layouts). Placeholder de
// infraestructura — se integrará con Sentry (sección 15.5) en fase de desarrollo.

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body />
    </html>
  );
}
