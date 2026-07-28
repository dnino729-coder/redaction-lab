"use client";

// Error global de la aplicación (fuera del árbol de layouts).
// Placeholder de infraestructura — se integrará con Sentry en una fase posterior.

export default function GlobalError({
  error,
}: {
  error: Error;
}) {
  console.error(error);

  return (
    <html>
      <body />
    </html>
  );
}