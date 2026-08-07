// AttemptHistoryContainer — component test (Blueprint §16.2: MSW para REST).
// Se mockea `@/i18n/navigation` (App Router real no disponible en jsdom) y
// `next/navigation` (solo `notFound`). No se modifica ningún archivo de
// scaffolding de Fase 0 — mismo patrón que `UnitDetailContainer.test.tsx`
// (Sprint 1.3).
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import { attemptSummaryFixture, unitDetailFixture } from "../mocks/fixtures";
import { AttemptHistoryContainer } from "@/features/academy/components/unit-attempt";

const { notFoundMock } = vi.hoisted(() => ({ notFoundMock: vi.fn() }));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/academy/units/unit-1/history",
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

registerAcademyMswServer();

function renderContainer(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

const BASE = "/api/v1/academy";
const UNIT_ID = unitDetailFixture.unitId;

describe("AttemptHistoryContainer", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("muestra el skeleton de carga antes de que EP-16 resuelva", () => {
    const { container } = renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("muestra el breadcrumb con la unidad y la lista de intentos con el intento actual distinguido", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json({
          data: [
            { ...attemptSummaryFixture, attemptId: "attempt-1", currentStep: "OBSERVE", isCurrent: false },
            { ...attemptSummaryFixture, attemptId: "attempt-2", currentStep: "PRACTICE", isCurrent: true },
          ],
          meta: { total: 2, limit: 20, offset: 0 },
        }),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    // "Historique" ahora aparece dos veces (segmento actual del breadcrumb +
    // heading propio, fix AFR018-02) — se distinguen por rol.
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Historique" })).toBeInTheDocument());
    expect(screen.getAllByText("Historique").length).toBe(2);
    expect(screen.getByRole("link", { name: "Académie" })).toHaveAttribute("href", "/academy");
    expect(screen.getByRole("link", { name: "Unité 1" })).toHaveAttribute("href", `/academy/units/${UNIT_ID}`);

    expect(screen.getAllByText("Observer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pratiquer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("En cours").length).toBeGreaterThan(0);
  });

  it("AFR018-02: muestra un heading <h1> propio también en el estado Empty", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Historique" })).toBeInTheDocument());
    expect(
      screen.getByText("Il n'y a pas encore de tentatives enregistrées pour cette unité"),
    ).toBeInTheDocument();
  });

  it("muestra el estado Empty cuando EP-16 no retorna intentos", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    await waitFor(() =>
      expect(
        screen.getByText("Il n'y a pas encore de tentatives enregistrées pour cette unité"),
      ).toBeInTheDocument(),
    );
  });

  it("muestra el estado Error con reintento cuando EP-16 falla con un 500", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json(
          { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado", correlationId: "corr-1" },
          { status: 500 },
        ),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    await waitFor(
      () => expect(screen.getByText("Nous n'avons pas pu charger l'historique des tentatives")).toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  }, 10000);

  it("muestra el estado Forbidden (mismo mensaje que P-02) cuando EP-16 responde 403", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json(
          { code: "ACADEMY_FORBIDDEN", message: "Sin acceso", correlationId: "corr-2" },
          { status: 403 },
        ),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByText("Tu n'as pas accès à cette unité")).toBeInTheDocument(), {
      timeout: 8000,
    });
  }, 10000);

  it("invoca notFound() cuando EP-16 responde 404", async () => {
    server.use(
      http.get(`${BASE}/units/${UNIT_ID}/attempts`, () =>
        HttpResponse.json(
          { code: "ACADEMY_NOT_FOUND_UNIT", message: "No existe", correlationId: "corr-3" },
          { status: 404 },
        ),
      ),
    );

    renderContainer(<AttemptHistoryContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled(), { timeout: 8000 });
  }, 10000);
});
