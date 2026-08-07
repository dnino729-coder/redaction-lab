// AdminModelLibraryContainer — component test (Blueprint §16.2: MSW para
// REST). Sin `useRouter`/`usePathname`/`Link`/`useAcademyRole()` (este
// Container no navega ni depende del rol resuelto) — no se mockea
// `@clerk/nextjs` ni `@/i18n/navigation`, mismo criterio ya aplicado en
// `ModelLibraryContainer.test.tsx` (P-11).
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import { modelExampleFixture } from "../mocks/fixtures";
import { AdminModelLibraryContainer } from "@/features/academy/components/model-library";

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

describe("AdminModelLibraryContainer", () => {
  it("muestra el skeleton de carga antes de que EP-19 resuelva", () => {
    renderContainer(<AdminModelLibraryContainer />);
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("muestra el estado Empty cuando EP-19 no retorna ejemplos", async () => {
    server.use(http.get(`${BASE}/model-examples`, () => HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } })));

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(() =>
      expect(screen.getByText("Il n'y a pas encore d'exemples modèles pour ce type de texte")).toBeInTheDocument(),
    );
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

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(
      () => expect(screen.getByText("Nous n'avons pas pu charger la bibliothèque de modèles")).toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  }, 10000);

  it("criterio de aceptación A: alta válida invoca CreateModelExampleCommand (EP-09) y cierra el diálogo", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({ data: [modelExampleFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Créer un exemple modèle" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Créer un exemple modèle")).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Type de texte"), { target: { value: "LETTER" } });
    fireEvent.change(within(dialog).getByLabelText("Évaluation"), { target: { value: "EXCELLENT" } });
    fireEvent.change(within(dialog).getByLabelText("Contenu de l'exemple"), { target: { value: "Nouveau contenu." } });
    fireEvent.change(within(dialog).getByLabelText("Commentaire curatorial"), { target: { value: "Nouveau commentaire." } });

    let capturedBody: unknown = null;
    server.use(
      http.post(`${BASE}/model-examples`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ ...modelExampleFixture, modelExampleId: "model-example-new" });
      }),
    );

    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Enregistrer" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(capturedBody).toMatchObject({
        textType: "LETTER",
        rating: "EXCELLENT",
        content: "Nouveau contenu.",
        curatorialComment: "Nouveau commentaire.",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("criterio de aceptación B: confirmar el retiro en el Dialog invoca RetireModelExampleCommand (EP-11) y cierra el diálogo", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({ data: [modelExampleFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Retirer l'exemple modèle")).toBeInTheDocument();

    let retiredId: string | null = null;
    server.use(
      http.delete(`${BASE}/model-examples/:modelExampleId`, ({ params }) => {
        retiredId = params.modelExampleId as string;
        return HttpResponse.json({ ...modelExampleFixture, status: "RETIRED" });
      }),
    );

    fireEvent.click(within(dialog).getByRole("button", { name: "Retirer" }));

    await waitFor(() => expect(retiredId).toBe(modelExampleFixture.modelExampleId));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("flujo de edición: modificar datos e invocar UpdateModelExampleCommand (EP-10) cierra el diálogo", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({ data: [modelExampleFixture], meta: { total: 1, limit: 20, offset: 0 } }),
      ),
    );

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Modifier l'exemple modèle")).toBeInTheDocument();

    // Blueprint §9 (`updateModelExampleSchema`): "textType/rating no se editan
    // tras la creación" — verificado tanto en la UI (deshabilitados) como en
    // el cuerpo real enviado a EP-10, más abajo.
    expect(within(dialog).getByLabelText("Type de texte")).toBeDisabled();
    expect(within(dialog).getByLabelText("Évaluation")).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText("Contenu de l'exemple"), { target: { value: "Contenu modifié." } });
    fireEvent.change(within(dialog).getByLabelText("Commentaire curatorial"), {
      target: { value: "Commentaire modifié." },
    });

    let capturedId: string | null = null;
    let capturedBody: unknown = null;
    server.use(
      http.patch(`${BASE}/model-examples/:modelExampleId`, async ({ request, params }) => {
        capturedId = params.modelExampleId as string;
        capturedBody = await request.json();
        return HttpResponse.json({
          ...modelExampleFixture,
          content: "Contenu modifié.",
          curatorialComment: "Commentaire modifié.",
        });
      }),
    );

    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Enregistrer" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(capturedId).toBe(modelExampleFixture.modelExampleId));
    await waitFor(() =>
      expect(Object.keys(capturedBody as Record<string, unknown>).sort()).toEqual(
        ["content", "curatorialComment"].sort(),
      ),
    );
    expect(capturedBody).toMatchObject({
      content: "Contenu modifié.",
      curatorialComment: "Commentaire modifié.",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("criterio de aceptación C: un ejemplo ya RETIRED no muestra el botón Retirer, pero sí Modifier", async () => {
    server.use(
      http.get(`${BASE}/model-examples`, () =>
        HttpResponse.json({
          data: [{ ...modelExampleFixture, status: "RETIRED" }],
          meta: { total: 1, limit: 20, offset: 0 },
        }),
      ),
    );

    renderContainer(<AdminModelLibraryContainer />);
    await waitFor(() => expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Modifier" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retirer" })).not.toBeInTheDocument();
  });
});
