"use client";
// QueryProvider — envoltura de TanStack Query (sección 5.2: "TanStack Query
// para los datos derivados del servidor"), ya declarado en el stack
// tecnológico resuelto (18.1) pero nunca montado — sin este provider,
// ningún hook basado en TanStack Query (ej. `useDashboardData`,
// docs/modules/dashboard.md sección 9) podría funcionar. Wiring de
// infraestructura únicamente: no define ninguna query de producto aquí.

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Presupuesto de rendimiento del Dashboard (docs/modules/dashboard.md,
            // sección 1: responder en <5s) — datos frescos por 60s evita
            // refetch innecesario en navegación entre ecosistemas.
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
