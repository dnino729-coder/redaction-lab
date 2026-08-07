// AttemptHistoryRow es presentacional puro — se testea sin MSW ni
// QueryClient. Se renderiza dentro de <table><tbody> (contexto HTML válido
// para un <tr>).
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { AttemptHistoryRow } from "@/features/academy/components/unit-attempt";
import { attemptSummaryFixture } from "../mocks/fixtures";

function renderRow(attempt: typeof attemptSummaryFixture) {
  return renderWithIntl(
    <table>
      <tbody>
        <AttemptHistoryRow attempt={attempt} />
      </tbody>
    </table>,
  );
}

describe("AttemptHistoryRow", () => {
  it("renderiza el paso traducido y la fecha, sin badge 'En cours' cuando isCurrent es false", () => {
    renderRow({ ...attemptSummaryFixture, isCurrent: false, currentStep: "OBSERVE" });

    expect(screen.getByText("Observer")).toBeInTheDocument();
    expect(screen.queryByText("En cours")).not.toBeInTheDocument();
  });

  it("muestra el badge 'En cours' cuando isCurrent es true", () => {
    renderRow({ ...attemptSummaryFixture, isCurrent: true });

    expect(screen.getByText("En cours")).toBeInTheDocument();
  });
});
