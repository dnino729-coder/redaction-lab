// ReflectionForm es presentacional puro (Blueprint §11.2, resolución
// AFR2-01) — se testea sin MSW ni QueryClient, sin mockear ningún hook de
// datos (no invoca ninguno).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";
import { ReflectionForm, type ReflectionFormProps } from "@/features/academy/components/unit-attempt";
import type { ReactElement } from "react";

function renderForm(ui: ReactElement) {
  return render(<NextIntlClientProvider locale="fr" messages={messages}>{ui}</NextIntlClientProvider>);
}

const baseProps: ReflectionFormProps = {
  onSubmit: vi.fn(),
  isSubmitting: false,
  submitError: null,
};

describe("ReflectionForm", () => {
  it("renderiza el campo y el botón de envío", () => {
    renderForm(<ReflectionForm {...baseProps} />);

    expect(screen.getByLabelText("Ta réflexion")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });

  it("deshabilita el envío mientras el campo está vacío", () => {
    renderForm(<ReflectionForm {...baseProps} />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("criterio de aceptación 1: invoca onSubmit con un arreglo de una respuesta al enviar", async () => {
    const onSubmit = vi.fn();
    renderForm(<ReflectionForm {...baseProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Ta réflexion"), { target: { value: "Mi reflexión final." } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(["Mi reflexión final."]));
  });

  it("muestra el mensaje de error real cuando submitError no es null", () => {
    renderForm(
      <ReflectionForm
        {...baseProps}
        submitError={{ code: "ACADEMY_UNKNOWN_ERROR", message: "Fallo real de envío", correlationId: "" }}
      />,
    );

    expect(screen.getByText("Fallo real de envío")).toBeInTheDocument();
  });

  it("deshabilita el campo y el botón mientras isSubmitting está en curso", () => {
    renderForm(<ReflectionForm {...baseProps} isSubmitting />);

    expect(screen.getByLabelText("Ta réflexion")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });
});
