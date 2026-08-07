// ComprehensionGate es presentacional puro (Blueprint §11.2, resolución
// AFR2-01) — se testea sin MSW ni QueryClient, sin mockear ningún hook de
// datos (no invoca ninguno).
//
// `renderGate` (no `renderWithIntl`) se usa en el test que necesita
// `rerender` con el mismo `<NextIntlClientProvider>`: el `rerender` que
// devuelve RTL sustituye el árbol completo pasado a `render()` la primera
// vez, así que hay que reenvolver el nuevo elemento en el mismo proveedor
// manualmente para no perder el contexto de i18n.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { ComprehensionGate } from "@/features/academy/components/unit-attempt";
import type { ReactElement } from "react";

function renderGate(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("ComprehensionGate", () => {
  it("mantiene el botón deshabilitado mientras el campo está vacío (criterio de aceptación 4)", async () => {
    renderWithIntl(
      <ComprehensionGate onVerify={vi.fn()} isSubmitting={false} isInsufficient={false} submitError={null} />,
    );

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("habilita el botón e invoca onVerify con la respuesta al enviar", async () => {
    const onVerify = vi.fn();
    renderWithIntl(
      <ComprehensionGate onVerify={onVerify} isSubmitting={false} isInsufficient={false} submitError={null} />,
    );

    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Mi respuesta." } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("Mi respuesta."));
  });

  it("muestra el mensaje formativo vía aria-live='assertive' cuando isInsufficient es true, y desaparece al editar el campo", async () => {
    const { rerender } = renderGate(
      <ComprehensionGate onVerify={vi.fn()} isSubmitting={false} isInsufficient={false} submitError={null} />,
    );

    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta insuficiente" } });

    rerender(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <ComprehensionGate onVerify={vi.fn()} isSubmitting={false} isInsufficient submitError={null} />
      </NextIntlClientProvider>,
    );

    const message = await screen.findByText(
      "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
    );
    expect(message).toHaveAttribute("aria-live", "assertive");

    // Reintento sin límite (casos borde §11.2): editar el campo hace
    // desaparecer el mensaje aunque `isInsufficient` siga en `true`.
    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta insuficiente editada" } });
    await waitFor(() =>
      expect(
        screen.queryByText(
          "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
        ),
      ).not.toBeInTheDocument(),
    );
  });

  it("AFR024-02: el mensaje formativo NO reaparece al volver a escribir exactamente el mismo texto tras editar, sin una nueva verificación", async () => {
    const { rerender } = renderGate(
      <ComprehensionGate onVerify={vi.fn()} isSubmitting={false} isInsufficient={false} submitError={null} />,
    );

    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta A" } });

    rerender(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <ComprehensionGate onVerify={vi.fn()} isSubmitting={false} isInsufficient submitError={null} />
      </NextIntlClientProvider>,
    );

    await screen.findByText(
      "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
    );

    // Edita a otro texto (el mensaje debe desaparecer, comportamiento ya cubierto arriba).
    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Otro texto" } });
    await waitFor(() =>
      expect(
        screen.queryByText(
          "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
        ),
      ).not.toBeInTheDocument(),
    );

    // Vuelve a escribir exactamente "Respuesta A" (el texto original marcado
    // insuficiente) sin que haya ocurrido ninguna nueva verificación
    // (`isInsufficient` sigue en `true`, prop sin cambiar) — el mensaje debe
    // permanecer oculto: solo debe reaparecer tras un nuevo resultado real
    // del servidor (fix AFR024-02).
    fireEvent.change(screen.getByLabelText("Ta réponse"), { target: { value: "Respuesta A" } });
    await waitFor(() =>
      expect(
        screen.queryByText(
          "Ta réponse ne reflète pas encore une compréhension suffisante du contenu. Relis-le et réessaie.",
        ),
      ).not.toBeInTheDocument(),
    );
  });

  it("muestra submitError cuando la Server Action falla genuinamente", () => {
    renderWithIntl(
      <ComprehensionGate
        onVerify={vi.fn()}
        isSubmitting={false}
        isInsufficient={false}
        submitError={{ code: "ACADEMY_UNKNOWN_ERROR", message: "Fallo real de la Server Action", correlationId: "" }}
      />,
    );

    expect(screen.getByText("Fallo real de la Server Action")).toBeInTheDocument();
  });

  it("deshabilita el campo y el botón mientras isSubmitting es true", () => {
    renderWithIntl(
      <ComprehensionGate onVerify={vi.fn()} isSubmitting isInsufficient={false} submitError={null} />,
    );

    expect(screen.getByLabelText("Ta réponse")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });
});
