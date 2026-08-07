// UnitDetailContainer — component test (Blueprint §16.2: MSW para REST, mock
// de módulo para las Server Actions). Se mockea `@/i18n/navigation` (App
// Router real no disponible en jsdom) y `next/navigation` (solo `notFound`,
// única función que este Container importa de ahí). No se modifica ningún
// archivo de scaffolding de Fase 0 — mismo patrón que
// `UnitMapContainer.test.tsx` (Sprint 1.2).
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
import { unitDetailFixture } from "../mocks/fixtures";
import { createAcademyActionsMock } from "../mocks/actions";
import { UnitDetailContainer } from "@/features/academy/components/unit-attempt";
import { startUnitAction, repeatUnitAction } from "@/features/academy/actions";

const { routerPush, notFoundMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  notFoundMock: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn() }),
  usePathname: () => "/academy/units/unit-1",
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/academy/actions", () => createAcademyActionsMock());

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

describe("UnitDetailContainer", () => {
  beforeEach(() => {
    routerPush.mockClear();
    notFoundMock.mockClear();
    vi.mocked(startUnitAction).mockClear();
    vi.mocked(repeatUnitAction).mockClear();
  });

  it("muestra el skeleton de carga antes de que EP-14 resuelva", () => {
    const { container } = renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("muestra el detalle, breadcrumbs, badge y botón 'Commencer' para una unidad UNLOCKED sin intento activo", async () => {
    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Unité 1"));
    expect(screen.getByRole("link", { name: "Académie" })).toHaveAttribute("href", "/academy");
    expect(screen.getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Recommencer" })).not.toBeInTheDocument();

    const historyLink = screen.getByRole("link", { name: "Voir l'historique" });
    expect(historyLink).toHaveAttribute("href", `/academy/units/${UNIT_ID}/history`);
  });

  it("al presionar 'Commencer' invoca startUnitAction y navega al paso devuelto", async () => {
    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Commencer" }).click();

    await waitFor(() => expect(startUnitAction).toHaveBeenCalledWith(UNIT_ID));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/academy/attempts/attempt-1/contextualize"));
  });

  it("con intento activo, 'Continuer' navega directo vía useContinuation() sin invocar startUnitAction", async () => {
    server.use(
      http.get(`${BASE}/units/:unitId`, () =>
        HttpResponse.json({ ...unitDetailFixture, activeAttemptId: "attempt-1" }),
      ),
    );

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Continuer" }).click();

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/academy/attempts/attempt-1/contextualize"));
    expect(startUnitAction).not.toHaveBeenCalled();
  });

  it("AFR015-01: si la continuación pertenece a OTRA unidad, ignora useContinuation() e invoca startUnitAction de esta unidad", async () => {
    // Escenario real detectado en AFR-015: la Unidad B (esta pantalla) tiene
    // su propio intento activo, pero `useContinuation()` (EP-15) devuelve el
    // intento más reciente de TODO el estudiante — que aquí pertenece a la
    // Unidad A. La corrección debe ignorar esa continuación (no coincide el
    // `unitId`) e invocar `startUnitAction` de la Unidad B, navegando al
    // paso real de SU propio intento (`attempt-b`/`observe`), nunca al de la
    // Unidad A (`attempt-a`/`practice`).
    server.use(
      http.get(`${BASE}/units/:unitId`, () =>
        HttpResponse.json({ ...unitDetailFixture, unitId: "unit-b", activeAttemptId: "attempt-b" }),
      ),
      http.get(`${BASE}/continuation`, () =>
        HttpResponse.json({
          unit: { ...unitDetailFixture, unitId: "unit-a" },
          attempt: {
            attemptId: "attempt-a",
            unitId: "unit-a",
            currentStep: "PRACTICE",
            startedAt: "2026-07-02T00:00:00.000Z",
            isCurrent: true,
          },
          draft: null,
        }),
      ),
    );

    vi.mocked(startUnitAction).mockResolvedValueOnce({
      attemptId: "attempt-b",
      unitId: "unit-b",
      currentStep: "OBSERVE",
      startedAt: "2026-07-03T00:00:00.000Z",
      isCurrent: true,
    });

    renderContainer(<UnitDetailContainer unitId="unit-b" />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Continuer" }).click();

    await waitFor(() => expect(startUnitAction).toHaveBeenCalledWith("unit-b"));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/academy/attempts/attempt-b/observe"));
    expect(routerPush).not.toHaveBeenCalledWith("/academy/attempts/attempt-a/practice");
  });

  it("muestra el botón 'Recommencer' cuando repeatable es true, e invoca repeatUnitAction al presionarlo", async () => {
    server.use(
      http.get(`${BASE}/units/:unitId`, () => HttpResponse.json({ ...unitDetailFixture, repeatable: true })),
    );

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Recommencer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Recommencer" }).click();

    await waitFor(() => expect(repeatUnitAction).toHaveBeenCalledWith(UNIT_ID));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/academy/attempts/attempt-1/contextualize"));
  });

  it("deshabilita el botón principal y comunica el bloqueo por texto cuando state es LOCKED", async () => {
    server.use(http.get(`${BASE}/units/:unitId`, () => HttpResponse.json({ ...unitDetailFixture, state: "LOCKED" })));

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    const button = await screen.findByRole("button", { name: "Unité verrouillée" });
    expect(button).toBeDisabled();
  });

  it("muestra el estado Error con reintento cuando EP-14 falla con un 500", async () => {
    server.use(
      http.get(`${BASE}/units/:unitId`, () =>
        HttpResponse.json(
          { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado", correlationId: "corr-1" },
          { status: 500 },
        ),
      ),
    );

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(
      () => expect(screen.getByText("Nous n'avons pas pu charger le détail de l'unité")).toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  }, 10000);

  it("muestra el estado Forbidden cuando EP-14 responde 403", async () => {
    server.use(
      http.get(`${BASE}/units/:unitId`, () =>
        HttpResponse.json(
          { code: "ACADEMY_FORBIDDEN", message: "Sin acceso", correlationId: "corr-2" },
          { status: 403 },
        ),
      ),
    );

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    // Igual que el 500: `useUnitDetail` (Fase 0) no excluye 403 de su
    // `retry: 2` — el backoff exponencial por defecto tarda unos segundos
    // antes de asentarse en `isError`.
    await waitFor(() => expect(screen.getByText("Tu n'as pas accès à cette unité")).toBeInTheDocument(), {
      timeout: 8000,
    });
  }, 10000);

  it("invoca notFound() cuando EP-14 responde 404", async () => {
    server.use(
      http.get(`${BASE}/units/:unitId`, () =>
        HttpResponse.json(
          { code: "ACADEMY_NOT_FOUND_UNIT", message: "No existe", correlationId: "corr-3" },
          { status: 404 },
        ),
      ),
    );

    renderContainer(<UnitDetailContainer unitId={UNIT_ID} />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled(), { timeout: 8000 });
  }, 10000);
});
