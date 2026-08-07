// QueryClient de prueba compartido — mismo rol que `renderWithIntl` (Fixture
// de pruebas) pero para React Query. `retry: false` y `gcTime: Infinity`:
// los tests no deben esperar reintentos reales ni perder cache entre
// aserciones dentro del mismo test.
import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function renderWithQueryClient(ui: ReactElement, queryClient: QueryClient = createTestQueryClient()) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper }) };
}
