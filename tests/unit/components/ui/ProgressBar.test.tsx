import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/ui/ProgressBar";

describe("ProgressBar", () => {
  it("expone el valor vía aria-valuenow (accesibilidad, 14.9)", () => {
    render(<ProgressBar value={42} label="Progression" />);
    const bar = screen.getByRole("progressbar", { name: "Progression" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("recorta valores por debajo de 0", () => {
    render(<ProgressBar value={-20} label="Progression" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("recorta valores por encima de 100", () => {
    render(<ProgressBar value={150} label="Progression" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
