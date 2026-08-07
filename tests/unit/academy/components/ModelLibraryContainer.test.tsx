// ModelLibraryContainer — component test (Blueprint §16.2: MSW para REST).
// A diferencia de UnitMapContainer, este Container no invoca `useRouter`,
// `usePathname`, `Link` ni `useAcademyRole()` (sin navegación, sin
// dependencia de rol) — no se mockea `@clerk/nextjs` ni `@/i18n/navigation`,
// mismo criterio de "solo mockear lo que el componente realmente usa" ya
// aplicado en los tests presentacionales de P-09/P-10.
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import { modelExampleFixture } from "../mocks/fixtures";
import { ModelLibraryContainer } from "@/features/academy/components/model-library";
import { ALL_TEXT_TYPES } from "@/features/academy/constants";

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

describe("ModelLibraryContainer", () => {
  it("muestra el skeleton de carga antes de que EP-19 resuelva", () => {
    renderContainer(<ModelLibraryContainer />);

    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("criterio de aceptación 1: sin filtro seleccionado, muestra los 5 tipos de texto combinados", async () => {
    // Blueprint §12 P-11: "los 5 tipos de texto combinados" — la fixture
    // reproduce literalmente los 5 valores reales de `TextType` (no una
    // muestra parcial) para que la aserción demuestre el número exacto que
    // exige el criterio, no solo que "más de uno" se combina.
    const allTextTypeExamples = ALL_TEXT_TYPES.map((textType, index) => ({
      ...modelExampleFixture,
      modelExampleId: `model-example-${index + 1}`,
      textType,
    }));

    server.use(
      http.get(`${BASE}/model-examples`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("textType")).toBeNull();
        return HttpResponse.json({
          data: allTextTypeExamples,
          meta: { total: allTextTypeExamples.length, limit: 20, offset: 0 },
        });
      }),
    );

    renderContainer(<ModelLibraryContainer />);

    await waitFor(() => expect(screen.getAllByText("Comentario curatorial de ejemplo.")).toHaveLength(5));
  });

  it("éxito: muestra el grid poblado con los ejemplos retornados por EP-19", async () => {
    // Escenario "éxito con grid poblado" (FASE 2), separado del criterio 1:
    // aquí se verifica el render correcto de un `ModelExampleCard` individual
    // (incluida su etiqueta de rating), no el número de tipos combinados.
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({ data: [modelExampleFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<ModelLibraryContainer />);

    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());
    expect(screen.getByText("Exemple excellent")).toBeInTheDocument();
  });

  it("criterio de aceptación 2: un textType filtrado sin ejemplos ACTIVE muestra el estado Empty", async () => {
    server.use(http.get(`${BASE}/model-examples`, () => HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } })));

    renderContainer(<ModelLibraryContainer />);
    await waitFor(() =>
      expect(screen.getByText("Il n'y a pas encore d'exemples modèles pour ce type de texte")).toBeInTheDocument(),
    );
  });

  it("al cambiar el filtro, invoca EP-19 con el textType seleccionado y actualiza el grid renderizado", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({ data: [modelExampleFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<ModelLibraryContainer />);
    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());

    let capturedTextType: string | null = null;
    const filteredExample = {
      ...modelExampleFixture,
      modelExampleId: "model-example-letter",
      textType: "LETTER" as const,
      curatorialComment: "Commentaire filtré par LETTER.",
    };
    server.use(
      http.get(`${BASE}/model-examples`, ({ request }) => {
        capturedTextType = new URL(request.url).searchParams.get("textType");
        return HttpResponse.json({ data: [filteredExample], meta: { total: 1, limit: 20, offset: 0 } });
      }),
    );

    fireEvent.change(screen.getByLabelText("Type de texte"), { target: { value: "LETTER" } });

    // No basta con capturar el parámetro enviado (M-02) — se verifica además
    // que el grid renderizado refleja el resultado filtrado: el ejemplo
    // nuevo aparece y el anterior (de un textType distinto) desaparece.
    await waitFor(() => expect(capturedTextType).toBe("LETTER"));
    await waitFor(() => expect(screen.getByText("Commentaire filtré par LETTER.")).toBeInTheDocument());
    expect(screen.queryByText("Comentario curatorial de ejemplo.")).not.toBeInTheDocument();
  });

  it("muestra el estado Error con reintento cuando EP-19 falla", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json(
          { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado", correlationId: "corr-1" },
          { status: 500 },
        ),
      ),
    );

    renderContainer(<ModelLibraryContainer />);

    await waitFor(
      () => expect(screen.getByText("Nous n'avons pas pu charger la bibliothèque de modèles")).toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  }, 10000);
});
