// WritingEditor es presentacional puro (Blueprint §11.2, resolución
// AFR2-01) — se testea sin MSW ni QueryClient, sin mockear ningún hook de
// datos (no invoca ninguno).
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";
import { WritingEditor, type WritingEditorProps } from "@/features/academy/components/unit-attempt";
import type { ReactElement } from "react";

function renderEditor(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages} now={new Date("2026-07-01T00:00:00.000Z")}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const baseProps: WritingEditorProps = {
  attemptId: "attempt-1",
  initialContent: "Contenido inicial.",
  mode: "produce",
  onAutosave: vi.fn(),
  autosaveState: "idle",
  lastSavedAt: null,
  onSubmit: vi.fn(),
  isSubmitting: false,
  submitError: null,
};

describe("WritingEditor", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicia con el contenido recibido y el conteo de palabras correspondiente", () => {
    renderEditor(<WritingEditor {...baseProps} />);

    expect(screen.getByLabelText("Ta production")).toHaveValue("Contenido inicial.");
    expect(screen.getByText("2 mots")).toBeInTheDocument();
  });

  it("AFR-criterio 3 (debounce): tras 2000ms sin teclear invoca onAutosave exactamente una vez con el contenido más reciente", () => {
    const onAutosave = vi.fn();
    renderEditor(<WritingEditor {...baseProps} onAutosave={onAutosave} />);

    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Primer cambio" } });
    vi.advanceTimersByTime(1000);
    // Un segundo cambio antes de que se cumplan los 2000ms reinicia el debounce.
    fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Segundo cambio, el definitivo" } });
    vi.advanceTimersByTime(1999);
    expect(onAutosave).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onAutosave).toHaveBeenCalledTimes(1);
    expect(onAutosave).toHaveBeenCalledWith("Segundo cambio, el definitivo");
  });

  it("cola de 1: si autosaveState ya es 'saving' cuando el debounce se cumple, no dispara un onAutosave inmediato — lo hace en cuanto se asienta", () => {
    const onAutosave = vi.fn();
    const { rerender } = renderEditor(
      <WritingEditor {...baseProps} onAutosave={onAutosave} autosaveState="saving" />,
    );

    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Mientras se guarda otra cosa" } });
    vi.advanceTimersByTime(2000);
    vi.useRealTimers();

    // Todavía en vuelo — no debe dispararse un segundo autosave superpuesto.
    expect(onAutosave).not.toHaveBeenCalled();

    // Se asienta (pasa a "saved") — el intento encolado se dispara ahora.
    rerender(
      <NextIntlClientProvider locale="fr" messages={messages} now={new Date("2026-07-01T00:00:00.000Z")}>
        <WritingEditor {...baseProps} onAutosave={onAutosave} autosaveState="saved" />
      </NextIntlClientProvider>,
    );

    expect(onAutosave).toHaveBeenCalledTimes(1);
    expect(onAutosave).toHaveBeenCalledWith("Mientras se guarda otra cosa");
  });

  it("invoca onSubmit con el contenido actual al presionar el botón de envío", () => {
    const onSubmit = vi.fn();
    renderEditor(<WritingEditor {...baseProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit).toHaveBeenCalledWith("Contenido inicial.");
  });

  it("deshabilita el botón de envío cuando el contenido está vacío", () => {
    renderEditor(<WritingEditor {...baseProps} initialContent="" />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("muestra el mensaje de error real cuando submitError no es null", () => {
    renderEditor(
      <WritingEditor
        {...baseProps}
        submitError={{ code: "ACADEMY_UNKNOWN_ERROR", message: "Fallo real de envío", correlationId: "" }}
      />,
    );

    expect(screen.getByText("Fallo real de envío")).toBeInTheDocument();
  });

  it("beforeunload fuerza un último intento de onAutosave con el contenido más reciente", () => {
    const onAutosave = vi.fn();
    renderEditor(<WritingEditor {...baseProps} onAutosave={onAutosave} />);

    fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Texto sin guardar todavía" } });
    window.dispatchEvent(new Event("beforeunload"));

    expect(onAutosave).toHaveBeenCalledWith("Texto sin guardar todavía");
  });

  it("criterio de aceptación 5 (Offline): muestra el banner al perder conectividad y lo oculta al reconectar, sin perder el contenido", () => {
    renderEditor(<WritingEditor {...baseProps} />);

    fireEvent.change(screen.getByLabelText("Ta production"), { target: { value: "Texto offline" } });
    fireEvent(window, new Event("offline"));

    expect(
      screen.getByText("Hors ligne. Ton texte n'est pas perdu ; l'enregistrement sera retenté à la reconnexion."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Ta production")).toHaveValue("Texto offline");

    fireEvent(window, new Event("online"));

    expect(
      screen.queryByText("Hors ligne. Ton texte n'est pas perdu ; l'enregistrement sera retenté à la reconnexion."),
    ).not.toBeInTheDocument();
  });

  it("AFR035-01: el panel lateral (contador de palabras + autosave) existe como región independiente del editor", () => {
    renderEditor(<WritingEditor {...baseProps} />);

    const sidePanel = screen.getByRole("complementary");
    expect(sidePanel).toContainElement(screen.getByText("2 mots"));
    expect(sidePanel).not.toContainElement(screen.getByLabelText("Ta production"));
  });

  it("AFR035-01: el contenedor del editor y el panel lateral son hijos directos hermanos con clases responsive de dos columnas", () => {
    const { container } = renderEditor(<WritingEditor {...baseProps} />);

    const sidePanel = screen.getByRole("complementary");
    const wrapper = sidePanel.parentElement;
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("lg:flex-row");
    expect(wrapper?.children).toHaveLength(2);
    expect(sidePanel).toHaveClass("lg:flex-col");
    expect(sidePanel).toHaveClass("lg:w-48");
    expect(container.querySelector("label")?.closest("div")).not.toBe(sidePanel);
  });

  it("AFR035-01: en mobile (sin modificador lg:) el editor conserva ancho completo y el panel se apila debajo", () => {
    renderEditor(<WritingEditor {...baseProps} />);

    const sidePanel = screen.getByRole("complementary");
    const wrapper = sidePanel.parentElement;
    // Sin prefijo `lg:`, `flex-col` apila el bloque del editor y el panel
    // lateral en una sola columna (mobile) — el bloque del editor no lleva
    // ningún ancho fijo, por lo que ocupa el 100% del contenedor.
    expect(wrapper).toHaveClass("flex-col");
    expect(sidePanel).not.toHaveClass("w-48");
  });
});
