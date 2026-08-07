// AttemptStepContainer — component test (Blueprint §16.2: MSW para REST,
// mock de módulo para las Server Actions). Se mockea `@/i18n/navigation`
// (App Router real no disponible en jsdom) y `next/navigation` (solo
// `notFound`). Mismo patrón que `UnitDetailContainer.test.tsx` (Sprint 1.3).
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import messages from "@/messages/fr.json";
import { createTestQueryClient } from "../utils/testQueryClient";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { server } from "../mocks/server";
import {
  continuationFixture,
  draftFixture,
  modelExampleFixture,
  feedbackFixture,
  unitDetailFixture,
} from "../mocks/fixtures";
import { createAcademyActionsMock } from "../mocks/actions";
import { AttemptStepContainer } from "@/features/academy/components/unit-attempt";
import {
  advanceStepAction,
  autosaveDraftAction,
  repeatUnitAction,
  submitVersionAction,
  verifyComprehensionAction,
} from "@/features/academy/actions";

const { routerReplace, routerPush, notFoundMock } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerPush: vi.fn(),
  notFoundMock: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
  usePathname: () => "/academy/attempts/attempt-1/contextualize",
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/academy/actions", () => createAcademyActionsMock());

registerAcademyMswServer();

const activeQueryClients: ReturnType<typeof createTestQueryClient>[] = [];

function renderContainer(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  activeQueryClients.push(queryClient);
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

const BASE = "/api/v1/academy";
const ATTEMPT_ID = continuationFixture!.attempt.attemptId;

describe("AttemptStepContainer", () => {
  beforeEach(() => {
    routerReplace.mockClear();
    routerPush.mockClear();
    notFoundMock.mockClear();
    vi.mocked(advanceStepAction).mockClear();
    vi.mocked(verifyComprehensionAction).mockClear();
    vi.mocked(autosaveDraftAction).mockClear();
    vi.mocked(submitVersionAction).mockClear();
    vi.mocked(repeatUnitAction).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    // El test de "al perder conectividad" (P-08) dispara `offline` en
    // `window` sin restaurarlo — se compensa aquí globalmente para que
    // ningún test posterior (incluidos los de P-09) herede ese estado.
    fireEvent(window, new Event("online"));
    // Detiene cualquier reintento/refetchInterval en vuelo (p. ej. el
    // backoff de una Query con `retry` tras un error real, o el polling de
    // `useFeedback`, P-09) antes de pasar al siguiente test — sin esto, un
    // timer real pendiente de un test puede disparar durante el siguiente.
    while (activeQueryClients.length > 0) {
      activeQueryClients.pop()!.clear();
    }
  });

  it("muestra el skeleton de carga antes de que useContinuation() resuelva", () => {
    const { container } = renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("renderiza el paso, el tracker y el botón cuando step de la URL coincide con currentStep real", async () => {
    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Contextualiser" })).toBeInTheDocument());
    const activeItem = screen.getAllByRole("listitem").find((item) => item.getAttribute("aria-current") === "step");
    expect(activeItem).toHaveTextContent("Contextualiser");
    expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("redirige cuando el step de la URL no coincide con el currentStep real del mismo attemptId", async () => {
    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="define-objectives" />);

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/contextualize`),
    );
  });

  it("al presionar el botón invoca advanceStepAction y navega al paso devuelto", async () => {
    vi.mocked(advanceStepAction).mockResolvedValueOnce({
      attemptId: ATTEMPT_ID,
      unitId: continuationFixture!.attempt.unitId,
      currentStep: "DEFINE_OBJECTIVES",
      startedAt: "2026-07-01T00:00:00.000Z",
      isCurrent: true,
    });

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Continuer" }).click();

    await waitFor(() => expect(advanceStepAction).toHaveBeenCalledWith(ATTEMPT_ID));
    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/define-objectives`),
    );
  });

  it("no redirige ni confía en la continuación cuando pertenece a otro attemptId (mismo criterio de AFR-016)", async () => {
    // continuationFixture.attempt.attemptId es "attempt-1" — se pide un
    // attemptId distinto, simulando el mismo escenario real de AFR-015: la
    // continuación global no corresponde al intento que se está viendo.
    renderContainer(<AttemptStepContainer attemptId="attempt-otro" step="define-objectives" />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "Définir les objectifs" })).toBeInTheDocument(),
    );
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("invoca notFound() cuando no hay ningún intento activo (useContinuation() retorna null)", async () => {
    server.use(http.get(`${BASE}/continuation`, () => new HttpResponse(null, { status: 204 })));

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled());
  });

  it("invoca notFound() cuando el slug de la URL no corresponde a ningún UnitStep válido", async () => {
    // Ajustado en Sprint 2.0 (P-10): con `REFLECT` ya soportado, los 11
    // valores de `UnitStep` quedan cubiertos (10 en `SUPPORTED_STEPS` +
    // `UNLOCK`, con su propio guard dedicado — fix AFR021-02, test
    // independiente). Ya no queda ningún paso real "todavía no
    // implementado" — este test pasa a cubrir el otro branch del mismo
    // guard: un slug que no mapea a ningún `UnitStep` en absoluto
    // (`stepFromUrlSlug()` retorna `undefined`), escenario que permanece
    // fuera de alcance indefinidamente por definición.
    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="not-a-real-step" />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled());
  });

  it("muestra el estado Error con reintento cuando useContinuation() falla", async () => {
    server.use(
      http.get(`${BASE}/continuation`, () =>
        HttpResponse.json(
          { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado", correlationId: "corr-1" },
          { status: 500 },
        ),
      ),
    );

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(screen.getByText("Nous n'avons pas pu charger cette étape")).toBeInTheDocument(), {
      timeout: 8000,
    });
    expect(screen.getByText("Fallo simulado")).toBeInTheDocument();
  }, 10000);

  it("muestra un banner de error inline cuando advanceStepAction falla", async () => {
    vi.mocked(advanceStepAction).mockRejectedValueOnce(new Error("Fallo de la Server Action"));

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Continuer" }).click();

    await waitFor(() => expect(screen.getByText("Fallo de la Server Action")).toBeInTheDocument());
  });

  it("AFR021-01: enfoca automáticamente la región aria-live tras la primera carga exitosa (sin necesidad de un cambio posterior de step)", async () => {
    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Contextualiser" })).toBeInTheDocument());
    expect(document.activeElement).toHaveAttribute("aria-live", "polite");
  });

  it("AFR021-02: invoca notFound() y no renderiza contenido de paso cuando el currentStep real es UNLOCK", async () => {
    server.use(
      http.get(`${BASE}/continuation`, () =>
        HttpResponse.json({
          ...continuationFixture,
          attempt: { ...continuationFixture!.attempt, currentStep: "UNLOCK" },
        }),
      ),
    );

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled());
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continuer" })).not.toBeInTheDocument();
  });

  it("AFR021-03: no renderiza ningún contenido de paso tras notFound() cuando no hay intento activo (antes de la corrección, esto sí renderizaba contenido bajo el mock de test)", async () => {
    server.use(http.get(`${BASE}/continuation`, () => new HttpResponse(null, { status: 204 })));

    renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="contextualize" />);

    await waitFor(() => expect(notFoundMock).toHaveBeenCalled());
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continuer" })).not.toBeInTheDocument();
  });

  // Sprint 1.6 — P-05 (Comprender / ComprehensionGate).
  describe("paso COMPREHEND (P-05)", () => {
    function mockComprehendContinuation() {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: "COMPREHEND" },
          }),
        ),
      );
    }

    it("renderiza ComprehensionGate (no StepAdvanceButton) cuando el currentStep real es COMPREHEND", async () => {
      mockComprehendContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="comprehend" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Comprendre" })).toBeInTheDocument());
      expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
    });

    it("criterio de aceptación 1 y 3: satisfied===true invoca verifyComprehensionAction y navega al paso real devuelto (.../observe)", async () => {
      mockComprehendContinuation();
      vi.mocked(verifyComprehensionAction).mockResolvedValueOnce({
        attempt: { ...continuationFixture!.attempt, currentStep: "OBSERVE" },
        satisfied: true,
      });

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="comprehend" />);

      await waitFor(() => expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Mi respuesta de comprensión." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() =>
        expect(verifyComprehensionAction).toHaveBeenCalledWith(ATTEMPT_ID, "Mi respuesta de comprensión."),
      );
      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/observe`));
    });

    it("criterio de aceptación 2: satisfied===false muestra el estado 'Verificación insuficiente' y NO navega, permitiendo reintentar", async () => {
      mockComprehendContinuation();
      vi.mocked(verifyComprehensionAction).mockResolvedValueOnce({
        attempt: { ...continuationFixture!.attempt, currentStep: "COMPREHEND" },
        satisfied: false,
      });

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="comprehend" />);

      await waitFor(() => expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta insuficiente" } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() =>
        expect(
          screen.getByText(
            "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
          ),
        ).toBeInTheDocument(),
      );
      expect(routerPush).not.toHaveBeenCalled();
      // Reintento sin límite: el formulario sigue habilitado.
      expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled();
    });

    it("muestra el error inline dentro de ComprehensionGate cuando verifyComprehensionAction falla genuinamente", async () => {
      mockComprehendContinuation();
      vi.mocked(verifyComprehensionAction).mockRejectedValueOnce(new Error("Fallo real de verificación"));

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="comprehend" />);

      await waitFor(() => expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Cualquier respuesta" } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() => expect(screen.getByText("Fallo real de verificación")).toBeInTheDocument());
    });

    it("AFR024-01: un error real en un segundo intento reemplaza por completo el estado 'insuficiente' del primer intento (sin editar el texto)", async () => {
      mockComprehendContinuation();
      vi.mocked(verifyComprehensionAction)
        .mockResolvedValueOnce({
          attempt: { ...continuationFixture!.attempt, currentStep: "COMPREHEND" },
          satisfied: false,
        })
        .mockRejectedValueOnce(new Error("Fallo real de verificación"));

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="comprehend" />);

      await waitFor(() => expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta insuficiente" } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() =>
        expect(
          screen.getByText(
            "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
          ),
        ).toBeInTheDocument(),
      );

      // Segundo envío sin editar el campo (mismo texto) — antes de la
      // corrección, el mensaje "insuficiente" seguía visible al mismo tiempo
      // que el error real (AFR024-01).
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() => expect(screen.getByText("Fallo real de verificación")).toBeInTheDocument());
      expect(
        screen.queryByText(
          "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
        ),
      ).not.toBeInTheDocument();
    });
  });

  // Sprint 1.7 — P-06 (Observar / Analizar). El Blueprint (§12) define un
  // único screen con step ∈ {observe, analyze}: mismos componentes, hooks y
  // criterios de aceptación para ambos valores.
  describe("pasos OBSERVE/ANALYZE (P-06)", () => {
    function mockObserveContinuation(step: "OBSERVE" | "ANALYZE" = "OBSERVE") {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: step },
          }),
        ),
      );
    }

    it("renderiza el heading, el grid de ejemplos modelo y StepAdvanceButton cuando el currentStep real es OBSERVE", async () => {
      mockObserveContinuation("OBSERVE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="observe" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Observer" })).toBeInTheDocument());
      expect(screen.getByText(modelExampleFixture.curatorialComment)).toBeInTheDocument();
      expect(screen.getByText("Exemple excellent")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    });

    it("renderiza el heading correcto cuando el currentStep real es ANALYZE (mismo componente, Blueprint §12)", async () => {
      mockObserveContinuation("ANALYZE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="analyze" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Analyser" })).toBeInTheDocument());
      expect(screen.getByText(modelExampleFixture.curatorialComment)).toBeInTheDocument();
    });

    it("muestra el estado Empty cuando EP-19 no retorna ejemplos modelo para este textType", async () => {
      mockObserveContinuation("OBSERVE");
      server.use(
        http.get(`${BASE}/model-examples`, () =>
          HttpResponse.json({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="observe" />);

      await waitFor(() =>
        expect(
          screen.getByText("Il n'y a pas encore d'exemples modèles pour ce type de texte"),
        ).toBeInTheDocument(),
      );
      // El paso sigue siendo avanzable aunque no haya ejemplos (Empty, nunca error).
      expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    });

    it("muestra el estado Error con reintento cuando EP-19 falla, sin bloquear StepAdvanceButton", async () => {
      mockObserveContinuation("OBSERVE");
      server.use(
        http.get(`${BASE}/model-examples`, () =>
          HttpResponse.json(
            { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado de EP-19", correlationId: "corr-1" },
            { status: 500 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="observe" />);

      await waitFor(() => expect(screen.getByText("Fallo simulado de EP-19")).toBeInTheDocument(), {
        timeout: 8000,
      });
      expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    }, 10000);

    it("al presionar StepAdvanceButton desde OBSERVE invoca advanceStepAction y navega al paso devuelto (analyze)", async () => {
      mockObserveContinuation("OBSERVE");
      vi.mocked(advanceStepAction).mockResolvedValueOnce({
        attemptId: ATTEMPT_ID,
        unitId: continuationFixture!.attempt.unitId,
        currentStep: "ANALYZE",
        startedAt: "2026-07-01T00:00:00.000Z",
        isCurrent: true,
      });

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="observe" />);

      await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
      screen.getByRole("button", { name: "Continuer" }).click();

      await waitFor(() => expect(advanceStepAction).toHaveBeenCalledWith(ATTEMPT_ID));
      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/analyze`));
    });

    it("AFR028-01: nunca muestra ejemplos modelo sin filtrar cuando la continuación no pertenece a este attemptId (mismo criterio AFR-015/016)", async () => {
      // continuationFixture.attempt.attemptId es "attempt-1" — se pide un
      // attemptId distinto, así que `matchedAttempt` es null y no existe
      // ningún `textType` de confianza. Antes de la corrección, esto
      // igualmente renderizaba el grid con `modelExampleFixture` (la
      // respuesta por defecto de EP-19, sin filtro real aplicado).
      renderContainer(<AttemptStepContainer attemptId="attempt-otro" step="observe" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Observer" })).toBeInTheDocument());
      expect(
        screen.getByText("Il n'y a pas encore d'exemples modèles pour ce type de texte"),
      ).toBeInTheDocument();
      expect(screen.queryByText(modelExampleFixture.curatorialComment)).not.toBeInTheDocument();
      // El paso sigue siendo avanzable (no se bloquea la navegación).
      expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    });
  });

  // Sprint 1.8 — P-07 (Practicar). Blueprint §12: mismos componentes/hooks/
  // estados que P-04 (StepContentPanel + StepAdvanceButton, sin gate).
  describe("paso PRACTICE (P-07)", () => {
    function mockPracticeContinuation() {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: "PRACTICE" },
          }),
        ),
      );
    }

    it("renderiza el heading, el tracker y StepAdvanceButton cuando el currentStep real es PRACTICE", async () => {
      mockPracticeContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="practice" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Pratiquer" })).toBeInTheDocument());
      const activeItem = screen.getAllByRole("listitem").find((item) => item.getAttribute("aria-current") === "step");
      expect(activeItem).toHaveTextContent("Pratiquer");
      expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
    });

    it("criterio de aceptación 1: al presionar StepAdvanceButton invoca advanceStepAction y navega a .../produce", async () => {
      mockPracticeContinuation();
      vi.mocked(advanceStepAction).mockResolvedValueOnce({
        attemptId: ATTEMPT_ID,
        unitId: continuationFixture!.attempt.unitId,
        currentStep: "PRODUCE",
        startedAt: "2026-07-01T00:00:00.000Z",
        isCurrent: true,
      });

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="practice" />);

      await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
      screen.getByRole("button", { name: "Continuer" }).click();

      await waitFor(() => expect(advanceStepAction).toHaveBeenCalledWith(ATTEMPT_ID));
      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/produce`));
    });

    it("criterio de aceptación 2: muestra StepContentPanel (contenido pendiente) sin bloquear el avance de paso", async () => {
      mockPracticeContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="practice" />);

      await waitFor(() =>
        expect(screen.getByText("Le contenu de cette étape n'est pas encore disponible.")).toBeInTheDocument(),
      );
      expect(screen.getByRole("button", { name: "Continuer" })).not.toBeDisabled();
    });

    it("muestra un banner de error inline cuando advanceStepAction falla, sin dejar de mostrar StepContentPanel", async () => {
      mockPracticeContinuation();
      vi.mocked(advanceStepAction).mockRejectedValueOnce(new Error("Fallo de la Server Action en PRACTICE"));

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="practice" />);

      await waitFor(() => expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument());
      screen.getByRole("button", { name: "Continuer" }).click();

      await waitFor(() => expect(screen.getByText("Fallo de la Server Action en PRACTICE")).toBeInTheDocument());
      expect(screen.getByText("Le contenu de cette étape n'est pas encore disponible.")).toBeInTheDocument();
    });
  });

  // Sprint 1.9 — P-08 (Producir / Reescribir). Blueprint §12: mismo screen
  // paramétrico para step ∈ {produce, rewrite}, mismos componentes/hooks.
  describe("pasos PRODUCE/REWRITE (P-08)", () => {
    function mockWritingContinuation(step: "PRODUCE" | "REWRITE" = "PRODUCE") {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: step },
          }),
        ),
      );
    }

    it("criterio de aceptación 1: el editor inicia con el contenido del borrador existente cuando el currentStep real es PRODUCE", async () => {
      mockWritingContinuation("PRODUCE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Produire" })).toBeInTheDocument());
      expect(screen.getByLabelText("Ta production")).toHaveValue(draftFixture.content);
      expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
    });

    it("renderiza el heading correcto cuando el currentStep real es REWRITE (mismo componente, Blueprint §12)", async () => {
      mockWritingContinuation("REWRITE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="rewrite" />);

      await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Réécrire" })).toBeInTheDocument());
      expect(screen.getByLabelText("Ta réécriture")).toBeInTheDocument();
    });

    it("criterio de aceptación 2: cuando EP-17 responde 404 (sin borrador previo) el editor inicia vacío, sin mostrar error", async () => {
      mockWritingContinuation("PRODUCE");
      server.use(
        http.get(`${BASE}/attempts/:attemptId/draft`, () =>
          HttpResponse.json(
            { code: "ACADEMY_NOT_FOUND", message: "Sin borrador", correlationId: "corr-1" },
            { status: 404 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByLabelText("Ta production")).toHaveValue(""));
      expect(screen.queryByText("Sin borrador")).not.toBeInTheDocument();
    });

    it("muestra el estado Error con reintento cuando EP-17 falla con un error real (no 404)", async () => {
      mockWritingContinuation("PRODUCE");
      server.use(
        http.get(`${BASE}/attempts/:attemptId/draft`, () =>
          HttpResponse.json(
            { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado de EP-17", correlationId: "corr-1" },
            { status: 500 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByText("Fallo simulado de EP-17")).toBeInTheDocument(), {
        timeout: 8000,
      });
    }, 10000);

    it("criterio de aceptación 3: tras 2000ms sin teclear se invoca autosaveDraftAction exactamente una vez", async () => {
      mockWritingContinuation("PRODUCE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByLabelText("Ta production")).toHaveValue(draftFixture.content));

      vi.useFakeTimers();
      fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Nuevo contenido tecleado." } });
      vi.advanceTimersByTime(2000);
      vi.useRealTimers();

      await waitFor(() => expect(autosaveDraftAction).toHaveBeenCalledTimes(1));
      expect(autosaveDraftAction).toHaveBeenCalledWith(ATTEMPT_ID, "Nuevo contenido tecleado.");
    });

    it("criterio de aceptación 4: un envío exitoso navega a .../feedback", async () => {
      mockWritingContinuation("PRODUCE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByLabelText("Ta production")).toHaveValue(draftFixture.content));
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() =>
        expect(submitVersionAction).toHaveBeenCalledWith(ATTEMPT_ID, draftFixture.content),
      );
      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/feedback`));
    });

    it("muestra el error inline cuando submitVersionAction falla genuinamente, sin navegar", async () => {
      mockWritingContinuation("PRODUCE");
      vi.mocked(submitVersionAction).mockRejectedValueOnce(new Error("Fallo real de envío"));

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByLabelText("Ta production")).toHaveValue(draftFixture.content));
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() => expect(screen.getByText("Fallo real de envío")).toBeInTheDocument());
      expect(routerPush).not.toHaveBeenCalled();
    });

    it("criterio de aceptación 5: al perder conectividad se muestra el banner Offline sin perder el contenido tecleado", async () => {
      mockWritingContinuation("PRODUCE");

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="produce" />);

      await waitFor(() => expect(screen.getByLabelText("Ta production")).toHaveValue(draftFixture.content));
      fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Texto mientras estoy offline." } });

      fireEvent(window, new Event("offline"));

      await waitFor(() =>
        expect(
          screen.getByText("Hors ligne. Ton texte n'est pas perdu ; l'enregistrement sera retenté à la reconnexion."),
        ).toBeInTheDocument(),
      );
      expect(screen.getByLabelText("Ta production")).toHaveValue("Texto mientras estoy offline.");
    });
  });

  describe("paso RECEIVE_FEEDBACK (P-09)", () => {
    function mockFeedbackContinuation() {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: "RECEIVE_FEEDBACK", versionCount: 1 },
          }),
        ),
      );
    }

    it("renderiza el heading y las observaciones cuando el feedback está READY", async () => {
      mockFeedbackContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1, name: "Recevoir la rétroaction" })).toBeInTheDocument(),
      );
      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument());
      expect(screen.getByText(feedbackFixture.observations[0]!.explanation)).toBeInTheDocument();
    });

    it("Loading: muestra el skeleton mientras se resuelve la consulta de feedback", async () => {
      mockFeedbackContinuation();
      server.use(
        http.get(`${BASE}/attempts/:attemptId/feedback`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          return HttpResponse.json(feedbackFixture);
        }),
      );

      const { container } = renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1, name: "Recevoir la rétroaction" })).toBeInTheDocument(),
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();

      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument());
    });

    it("criterio de aceptación 1: muestra ProcessingIndicator mientras status es PROCESSING", async () => {
      mockFeedbackContinuation();
      server.use(
        http.get(`${BASE}/attempts/:attemptId/feedback`, () =>
          HttpResponse.json({ ...feedbackFixture, status: "PROCESSING", observations: [] }),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      await waitFor(() => expect(screen.getByText("Génération de ta rétroaction...")).toBeInTheDocument());
      expect(screen.queryByText("Cohérence")).not.toBeInTheDocument();
    });

    it("criterio de aceptación 1: el polling reintenta hasta que status pasa a READY", async () => {
      mockFeedbackContinuation();
      let realVersionCallCount = 0;
      server.use(
        http.get(`${BASE}/attempts/:attemptId/feedback`, ({ request }) => {
          // `versionNumber=0` es la llamada "desperdiciada" que dispara este
          // mismo hook antes de que `useContinuation()` resuelva
          // `matchedAttempt` (trade-off ya aceptado, mismo criterio que
          // `useModelExamples` en P-06) — se ignora para el conteo real.
          const versionNumber = new URL(request.url).searchParams.get("versionNumber");
          if (versionNumber !== "1") {
            return HttpResponse.json({ ...feedbackFixture, status: "PROCESSING", observations: [] });
          }
          realVersionCallCount += 1;
          return HttpResponse.json(
            realVersionCallCount === 1
              ? { ...feedbackFixture, status: "PROCESSING", observations: [] }
              : feedbackFixture,
          );
        }),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      await waitFor(() => expect(screen.getByText("Génération de ta rétroaction...")).toBeInTheDocument());
      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument(), { timeout: 8000 });
      expect(realVersionCallCount).toBeGreaterThanOrEqual(2);
    }, 10000);

    it("muestra el estado Error con reintento cuando EP-18 falla con un error real", async () => {
      mockFeedbackContinuation();
      server.use(
        http.get(`${BASE}/attempts/:attemptId/feedback`, () =>
          HttpResponse.json(
            { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado de EP-18", correlationId: "corr-3" },
            { status: 500 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      await waitFor(() => expect(screen.getByText("Fallo simulado de EP-18")).toBeInTheDocument(), {
        timeout: 8000,
      });
    }, 10000);

    it("criterio de aceptación 2: muestra las observaciones ordenadas macro→micro según FEEDBACK_CATEGORY_PRIORITY", async () => {
      mockFeedbackContinuation();
      server.use(
        http.get(`${BASE}/attempts/:attemptId/feedback`, () =>
          HttpResponse.json({
            ...feedbackFixture,
            observations: [
              { category: "SPELLING", strength: "WEAKNESS", explanation: "E1", suggestion: "S1" },
              { category: "COMPREHENSION", strength: "STRENGTH", explanation: "E2", suggestion: "S2" },
            ],
          }),
        ),
      );

      const { container } = renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);

      // `getAllByRole("listitem")` también matchea los <li> de
      // `StepProgressTracker` (su propio <ol>, siempre presente) — se
      // escopea a la <ul aria-live="polite"> propia de
      // `VersionWithFeedbackPanel`, única con esa combinación.
      await waitFor(() =>
        expect(container.querySelectorAll('ul[aria-live="polite"] li')).toHaveLength(2),
      );
      const items = container.querySelectorAll('ul[aria-live="polite"] li');
      expect(items[0]).toHaveTextContent("Compréhension");
      expect(items[1]).toHaveTextContent("Orthographe");
    });

    it("Reescribir: navega directo a .../rewrite sin invocar useAdvancePhase (EP-04)", async () => {
      mockFeedbackContinuation();
      let phaseCallCount = 0;
      server.use(
        http.patch(`${BASE}/attempts/:attemptId/phase`, () => {
          phaseCallCount += 1;
          return HttpResponse.json(continuationFixture!.attempt);
        }),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);
      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "Réécrire" }));

      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/rewrite`));
      expect(phaseCallCount).toBe(0);
    });

    it("criterio de aceptación 4: Continuar a reflexión exitoso invoca useAdvancePhase y navega a .../reflect", async () => {
      mockFeedbackContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);
      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "Continuer vers la réflexion" }));

      await waitFor(() => expect(routerPush).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/reflect`));
    });

    it("criterio de aceptación 3: 409 en Continuar a reflexión no navega, muestra error inline, permanece en P-09", async () => {
      mockFeedbackContinuation();
      server.use(
        http.patch(`${BASE}/attempts/:attemptId/phase`, () =>
          HttpResponse.json(
            { code: "ACADEMY_CONFLICT", message: "Ciclo de reescritura no completado.", correlationId: "corr-2" },
            { status: 409 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="feedback" />);
      await waitFor(() => expect(screen.getByText("Cohérence")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "Continuer vers la réflexion" }));

      await waitFor(() => expect(screen.getByText("Ciclo de reescritura no completado.")).toBeInTheDocument());
      expect(routerPush).not.toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/reflect`);
      expect(screen.getByRole("heading", { level: 1, name: "Recevoir la rétroaction" })).toBeInTheDocument();
    });
  });

  describe("paso REFLECT (P-10)", () => {
    function mockReflectionContinuation() {
      server.use(
        http.get(`${BASE}/continuation`, () =>
          HttpResponse.json({
            ...continuationFixture,
            attempt: { ...continuationFixture!.attempt, currentStep: "REFLECT" },
          }),
        ),
      );
    }

    it("renderiza el heading y el formulario de reflexión cuando el currentStep real es REFLECT", async () => {
      mockReflectionContinuation();

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1, name: "Réfléchir" })).toBeInTheDocument(),
      );
      expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument();
    });

    it("criterio de aceptación 1: envía la reflexión (EP-05) y muestra el resumen de cierre en la misma pantalla", async () => {
      mockReflectionContinuation();
      server.use(
        http.post(`${BASE}/attempts/:attemptId/reflection`, () =>
          HttpResponse.json({ ...unitDetailFixture, state: "COMPLETED", repeatable: false }),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);
      await waitFor(() => expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument());

      fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Aprendí mucho." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() => expect(screen.getByText("Terminée")).toBeInTheDocument());
      expect(screen.queryByLabelText("Ta réflexion")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Retourner à la carte" })).toBeInTheDocument();
    });

    it("criterio de aceptación 3: repeatable:true muestra 'Repetir esta unidad', invoca repeatUnitAction y navega al nuevo intento", async () => {
      mockReflectionContinuation();
      server.use(
        http.post(`${BASE}/attempts/:attemptId/reflection`, () =>
          HttpResponse.json({ ...unitDetailFixture, state: "COMPLETED", repeatable: true }),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);
      await waitFor(() => expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Aprendí mucho." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));
      await waitFor(() => expect(screen.getByText("Terminée")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "Recommencer cette unité" }));

      await waitFor(() => expect(repeatUnitAction).toHaveBeenCalledWith(unitDetailFixture.unitId));
      await waitFor(() =>
        expect(routerPush).toHaveBeenCalledWith(
          `/academy/attempts/${continuationFixture!.attempt.attemptId}/contextualize`,
        ),
      );
    });

    it("'Volver al mapa' navega a /academy", async () => {
      mockReflectionContinuation();
      server.use(
        http.post(`${BASE}/attempts/:attemptId/reflection`, () =>
          HttpResponse.json({ ...unitDetailFixture, state: "COMPLETED" }),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);
      await waitFor(() => expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Aprendí mucho." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));
      await waitFor(() => expect(screen.getByText("Terminée")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: "Retourner à la carte" }));

      await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/academy"));
    });

    it("muestra el estado Error con reintento cuando EP-05 falla con un error real (no 409)", async () => {
      mockReflectionContinuation();
      server.use(
        http.post(`${BASE}/attempts/:attemptId/reflection`, () =>
          HttpResponse.json(
            { code: "ACADEMY_INTERNAL_ERROR", message: "Fallo simulado de EP-05", correlationId: "corr-4" },
            { status: 500 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);
      await waitFor(() => expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Aprendí mucho." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() => expect(screen.getByText("Fallo simulado de EP-05")).toBeInTheDocument());
      expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument();
    });

    it("criterio de aceptación 2: 409 refresca continuation y activa la redirección defensiva ya existente al paso real", async () => {
      // Precisión (releída fresca del Blueprint §12 P-10): a diferencia del
      // criterio 3 de P-09 ("no navega, permanece en pantalla"), el criterio
      // 2 de P-10 exige literalmente "se redirige al paso real" — por eso
      // este test NO afirma que el error permanezca visible (el propio
      // Container cambia `displayStep` en cuanto `matchedAttempt` se
      // actualiza, reemplazando el formulario por el contenido del paso
      // real) — solo que la redirección ocurre, vía el mecanismo genérico
      // ya existente (`continuationQuery.refetch()` + efecto de redirección
      // defensiva), sin lógica nueva.
      mockReflectionContinuation();
      let continuationCallCount = 0;
      server.use(
        http.get(`${BASE}/continuation`, () => {
          continuationCallCount += 1;
          return HttpResponse.json({
            ...continuationFixture,
            attempt: {
              ...continuationFixture!.attempt,
              // Primera llamada: REFLECT (coincide con la URL). Tras el 409,
              // el Container refresca continuation — aquí simulamos que el
              // paso real ya cambió, y el efecto de redirección defensiva
              // ya existente (sin modificar) debe reaccionar por sí solo.
              currentStep: continuationCallCount === 1 ? "REFLECT" : "CONTEXTUALIZE",
            },
          });
        }),
      );
      server.use(
        http.post(`${BASE}/attempts/:attemptId/reflection`, () =>
          HttpResponse.json(
            { code: "ACADEMY_CONFLICT", message: "El intento no está en fase de reflexión.", correlationId: "corr-5" },
            { status: 409 },
          ),
        ),
      );

      renderContainer(<AttemptStepContainer attemptId={ATTEMPT_ID} step="reflect" />);
      await waitFor(() => expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Aprendí mucho." } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

      await waitFor(() =>
        expect(routerReplace).toHaveBeenCalledWith(`/academy/attempts/${ATTEMPT_ID}/contextualize`),
      );
      expect(continuationCallCount).toBeGreaterThanOrEqual(2);
    });
  });
});
