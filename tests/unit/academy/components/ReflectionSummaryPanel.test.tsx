// ReflectionSummaryPanel es presentacional puro (Blueprint §11.2) — se
// testea sin MSW ni QueryClient, sin mockear ningún hook de datos.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";
import {
  ReflectionSummaryPanel,
  type ReflectionSummaryPanelProps,
} from "@/features/academy/components/unit-attempt";
import type { ReactElement } from "react";
import type { AcademyUnitDetailHttp } from "@/features/academy/types";

function renderPanel(ui: ReactElement) {
  return render(<NextIntlClientProvider locale="fr" messages={messages}>{ui}</NextIntlClientProvider>);
}

const completedUnit: AcademyUnitDetailHttp = {
  unitId: "unit-1",
  studentId: "student-1",
  textType: "ESSAY",
  position: 1,
  state: "COMPLETED",
  activeAttemptId: null,
  completedAt: "2026-07-29T00:00:00.000Z",
  masteredAt: null,
  eligibleForUnlock: false,
  repeatable: false,
  teacherOverrideCount: 0,
};

const baseProps: ReflectionSummaryPanelProps = {
  unit: completedUnit,
  onBackToMap: vi.fn(),
  onRepeat: vi.fn(),
  isRepeating: false,
};

describe("ReflectionSummaryPanel", () => {
  it("muestra el estado de la unidad (UnitStatusBadge) y el botón Volver al mapa", () => {
    renderPanel(<ReflectionSummaryPanel {...baseProps} />);

    expect(screen.getByText("Terminée")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retourner à la carte" })).toBeInTheDocument();
  });

  it("no muestra el botón Repetir cuando repeatable es false", () => {
    renderPanel(<ReflectionSummaryPanel {...baseProps} unit={{ ...completedUnit, repeatable: false }} />);

    expect(screen.queryByRole("button", { name: "Recommencer cette unité" })).not.toBeInTheDocument();
  });

  it("criterio de aceptación 3: muestra el botón Repetir cuando repeatable es true, e invoca onRepeat", () => {
    const onRepeat = vi.fn();
    renderPanel(
      <ReflectionSummaryPanel {...baseProps} unit={{ ...completedUnit, repeatable: true }} onRepeat={onRepeat} />,
    );

    const repeatButton = screen.getByRole("button", { name: "Recommencer cette unité" });
    fireEvent.click(repeatButton);

    expect(onRepeat).toHaveBeenCalledTimes(1);
  });

  it("invoca onBackToMap al hacer click", () => {
    const onBackToMap = vi.fn();
    renderPanel(<ReflectionSummaryPanel {...baseProps} onBackToMap={onBackToMap} />);

    fireEvent.click(screen.getByRole("button", { name: "Retourner à la carte" }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });
});
