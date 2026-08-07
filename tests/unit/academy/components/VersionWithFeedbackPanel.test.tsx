// VersionWithFeedbackPanel es presentacional puro (Blueprint §11.2,
// resolución AFR2-01) — se testea sin MSW ni QueryClient, sin mockear
// ningún hook de datos (no invoca ninguno).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";
import {
  VersionWithFeedbackPanel,
  type VersionWithFeedbackPanelProps,
} from "@/features/academy/components/unit-attempt";
import type { ReactElement } from "react";
import type { FeedbackObservationHttp } from "@/features/academy/types";

function renderPanel(ui: ReactElement) {
  return render(<NextIntlClientProvider locale="fr" messages={messages}>{ui}</NextIntlClientProvider>);
}

const baseProps: VersionWithFeedbackPanelProps = {
  status: "READY",
  observations: [],
  timedOut: false,
  onRetryProcessing: vi.fn(),
  onRewrite: vi.fn(),
  onContinueToReflection: vi.fn(),
  isAdvancingPhase: false,
  advancePhaseError: null,
};

const spellingObservation: FeedbackObservationHttp = {
  category: "SPELLING",
  strength: "WEAKNESS",
  explanation: "Explication orthographe.",
  suggestion: "Suggestion orthographe.",
};

const comprehensionObservation: FeedbackObservationHttp = {
  category: "COMPREHENSION",
  strength: "STRENGTH",
  explanation: "Explication compréhension.",
  suggestion: "Suggestion compréhension.",
};

describe("VersionWithFeedbackPanel", () => {
  it("renderiza las observaciones cuando status es READY", () => {
    renderPanel(<VersionWithFeedbackPanel {...baseProps} observations={[comprehensionObservation]} />);

    expect(screen.getByText("Compréhension")).toBeInTheDocument();
    expect(screen.getByText("Explication compréhension.")).toBeInTheDocument();
    expect(screen.getByText("Suggestion compréhension.")).toBeInTheDocument();
    expect(screen.getByText("Point fort")).toBeInTheDocument();
  });

  it("muestra ProcessingIndicator (no las observaciones) cuando status es PROCESSING", () => {
    renderPanel(
      <VersionWithFeedbackPanel {...baseProps} status="PROCESSING" observations={[comprehensionObservation]} />,
    );

    expect(screen.getByText("Génération de ta rétroaction...")).toBeInTheDocument();
    expect(screen.queryByText("Compréhension")).not.toBeInTheDocument();
  });

  it("criterio de aceptación 2: ordena las observaciones macro→micro según FEEDBACK_CATEGORY_PRIORITY, sin importar el orden recibido", () => {
    renderPanel(
      <VersionWithFeedbackPanel {...baseProps} observations={[spellingObservation, comprehensionObservation]} />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Compréhension");
    expect(items[1]).toHaveTextContent("Orthographe");
  });

  it("Reescribir: invoca onRewrite al hacer click", () => {
    const onRewrite = vi.fn();
    renderPanel(<VersionWithFeedbackPanel {...baseProps} onRewrite={onRewrite} />);

    fireEvent.click(screen.getByRole("button", { name: "Réécrire" }));

    expect(onRewrite).toHaveBeenCalledTimes(1);
  });

  it("Continuar a reflexión: invoca onContinueToReflection al hacer click", () => {
    const onContinueToReflection = vi.fn();
    renderPanel(<VersionWithFeedbackPanel {...baseProps} onContinueToReflection={onContinueToReflection} />);

    fireEvent.click(screen.getByRole("button", { name: "Continuer vers la réflexion" }));

    expect(onContinueToReflection).toHaveBeenCalledTimes(1);
  });

  it("criterio de aceptación 3: muestra el error real de advancePhase sin bloquear la lectura del feedback ya mostrado", () => {
    renderPanel(
      <VersionWithFeedbackPanel
        {...baseProps}
        observations={[comprehensionObservation]}
        advancePhaseError={{ code: "ACADEMY_UNKNOWN_ERROR", message: "Fallo real de advancePhase", correlationId: "" }}
      />,
    );

    expect(screen.getByText("Fallo real de advancePhase")).toBeInTheDocument();
    expect(screen.getByText("Compréhension")).toBeInTheDocument();
  });

  it("deshabilita 'Continuar a reflexión' mientras isAdvancingPhase está en curso", () => {
    renderPanel(<VersionWithFeedbackPanel {...baseProps} isAdvancingPhase />);

    expect(screen.getByRole("button", { name: "Continuer vers la réflexion" })).toBeDisabled();
  });

  it("muestra el banner de reintento manual cuando timedOut es true, en vez del spinner", () => {
    renderPanel(<VersionWithFeedbackPanel {...baseProps} status="PROCESSING" timedOut />);

    expect(screen.getByText("Cela prend plus de temps que prévu. Essaie de vérifier à nouveau.")).toBeInTheDocument();
    expect(screen.queryByText("Génération de ta rétroaction...")).not.toBeInTheDocument();
  });

  it("invoca onRetryProcessing al presionar el botón de reintento manual", () => {
    const onRetryProcessing = vi.fn();
    renderPanel(
      <VersionWithFeedbackPanel {...baseProps} status="PROCESSING" timedOut onRetryProcessing={onRetryProcessing} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(onRetryProcessing).toHaveBeenCalledTimes(1);
  });
});
