// TeacherStudentDetailContainer — component test (Blueprint §16.2: MSW para
// REST). Se mockea `@/i18n/navigation` (App Router real no disponible en
// jsdom) — mismo patrón que UnitDetailContainer.test.tsx. El handler MSW de
// `GET /students/:studentId/progress-summary` ya existe en el scaffolding
// de Fase 0 (`tests/unit/academy/mocks/handlers.ts`).
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import { TeacherStudentDetailContainer } from "@/features/academy/components/teacher-panel";

const BASE = "/api/v1/academy";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

registerAcademyMswServer();

function renderContainer(studentId: string) {
  const queryClient = createTestQueryClient();
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <TeacherStudentDetailContainer studentId={studentId} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("TeacherStudentDetailContainer", () => {
  it("muestra el resumen de progreso real (vía MSW) cuando la consulta resuelve con éxito", async () => {
    renderContainer("student-1");
    // "student-1" aparece dos veces (breadcrumb + encabezado, Sprint 3) —
    // se verifica el encabezado específicamente por rol.
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 2, name: "student-1" })).toBeInTheDocument(),
    );
    expect(screen.getByText("Unités par état")).toBeInTheDocument();
  });

  it("muestra ForbiddenState cuando el backend responde 403 (caso real hoy: TeacherStudentRelationshipAdapter siempre deniega)", async () => {
    server.use(
      http.get(`${BASE}/students/:studentId/progress-summary`, () =>
        HttpResponse.json(
          { code: "FORBIDDEN", message: "Forbidden", correlationId: "test" },
          { status: 403 },
        ),
      ),
    );
    renderContainer("student-2");
    // useStudentProgressSummary (Blueprint §8.2, EP-20) especifica `retry: 2`
    // explícitamente en el propio hook — eso ANULA el `retry: false` del
    // QueryClient de prueba (las opciones por-query tienen precedencia sobre
    // los defaults del cliente en TanStack Query). Se espera con un timeout
    // mayor al del backoff exponencial de los reintentos reales, en vez de
    // modificar el hook (código estable, fuera de alcance de este Sprint).
    await waitFor(
      () => expect(screen.getByText("Vous n'avez pas accès à cet étudiant")).toBeInTheDocument(),
      { timeout: 10_000 },
    );
  });
});
