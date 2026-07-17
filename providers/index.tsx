"use client";
// Composición de todos los providers globales — se monta desde
// app/[locale]/layout.tsx. Sección 5.4: ThemeProvider, AuthProvider,
// CoachProvider, AnalyticsProvider, ToastProvider, QueryProvider (TanStack
// Query — sección 5.2, wiring completado al implementar el módulo Dashboard,
// primer consumidor real de datos derivados del servidor vía TanStack Query).

import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { CoachProvider } from "./CoachProvider";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { ToastProvider } from "./ToastProvider";
import { QueryProvider } from "./QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <CoachProvider>
            <QueryProvider>
              <ToastProvider>{children}</ToastProvider>
            </QueryProvider>
          </CoachProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
