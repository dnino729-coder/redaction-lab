// UnitMapContainer — component test (Blueprint §16.2: MSW para REST, mock de
// módulo para dependencias externas). Se mockea `@clerk/nextjs` (rol
// resuelto vía Clerk, sin sesión real disponible en el entorno de test) y
// `@/i18n/navigation` (requiere el App Router real de Next.js, no disponible
// en jsdom/Vitest). No se modifica ningún archivo de scaffolding de Fase 0
// (`tests/unit/academy/mocks/`, `tests/unit/academy/utils/`) — este archivo
// compone su propio wrapper de render (QueryClient + NextIntlClientProvider)
// localmente para no tocarlos.
//
// `useUserMock` (AFR012-02, Fix Pack de AFR-012/AFR-013): antes fijo a
// `publicMetadata: {}` para todos los tests — ahora es un `vi.fn()`
// controlable por test, con ese mismo valor como default en `beforeEach`,
// para poder ejercitar también las ramas de redirect `TEACHER`/`ADMIN` de
// `UnitMapContainer` sin modificar su lógica.
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import { unitSummaryFixture } from "../mocks/fixtures";
import { UnitMapContainer } from "@/features/academy/components/unit-map";
import { academyRoutes } from "@/features/academy/constants";

const { routerReplace, routerPush, useUserMock } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerPush: vi.fn(),
  useUserMock: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: useUserMock,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
  usePathname: () => "/academy",
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
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

describe("UnitMapContainer", () => {
  beforeEach(() => {
    routerReplace.mockClear();
    routerPush.mockClear();
    useUserMock.mockReturnValue({ user: { publicMetadata: {} }, isLoaded: true });
  });

  it("agrupa las unidades por textType y muestra el banner de continuación", async () => {
    server.use(
      http.get(`${BASE}/units`, () =>
        HttpResponse.json({
          data: [unitSummaryFixture, { ...unitSummaryFixture, unitId: "unit-2", textType: "LETTER", position: 2 }],
          meta: { total: 2, limit: 20, offset: 0 },
        }),
      ),
    );

    renderContainer(<UnitMapContainer />);

    await waitFor(() => expect(screen.getByText("Unité 1")).toBeInTheDocument());
    expect(screen.getByText("Unité 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Essai" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lettre" })).toBeInTheDocument();

    const banner = screen.getByRole("link", { name: "Continuer où tu t'es arrêté" });
    expect(banner).toHaveAttribute("href", "/academy/attempts/attempt-1/contextualize");
  });

  it("muestra el estado Empty cuando EP-13 no retorna unidades", async () => {
    server.use(
      http.get(`${BASE}/units`, () => HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } })),
    );

    renderContainer(<UnitMapContainer />);

    await waitFor(() => expect(screen.getByText("Ton plan d'unités est en préparation")).toBeInTheDocument());
  });

  it("muestra el estado Error con reintento cuando EP-13 falla", async () => {
    server.use(
      http.get(`${BASE}/units`, () =>
        HttpResponse.json(
          { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado", correlationId: "corr-1" },
          { status: 500 },
        ),
      ),
    );

    renderContainer(<UnitMapContainer />);

    await waitFor(
      () => expect(screen.getByText("Nous n'avons pas pu charger tes unités")).toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  }, 10000);

  it("invoca router.replace con la query string correcta al cambiar el filtro de textType", async () => {
    server.use(
      http.get(`${BASE}/units`, () =>
        HttpResponse.json({ data: [unitSummaryFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<UnitMapContainer />);
    await waitFor(() => expect(screen.getByText("Unité 1")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Type de texte"), { target: { value: "LETTER" } });

    expect(routerReplace).toHaveBeenCalledWith("/academy?textType=LETTER");
  });

  it("redirige a academyRoutes.teacherPanel() cuando el rol resuelto es TEACHER", async () => {
    useUserMock.mockReturnValue({ user: { publicMetadata: { role: "TEACHER" } }, isLoaded: true });
    server.use(
      http.get(`${BASE}/units`, () =>
        HttpResponse.json({ data: [unitSummaryFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<UnitMapContainer />);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith(academyRoutes.teacherPanel()));
  });

  it("redirige a academyRoutes.adminModelLibrary() cuando el rol resuelto es ADMIN", async () => {
    useUserMock.mockReturnValue({ user: { publicMetadata: { role: "ADMIN" } }, isLoaded: true });
    server.use(
      http.get(`${BASE}/units`, () =>
        HttpResponse.json({ data: [unitSummaryFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<UnitMapContainer />);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith(academyRoutes.adminModelLibrary()));
  });
});
