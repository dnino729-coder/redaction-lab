// AttemptActionButton es presentacional puro — se testea sin MSW ni
// QueryClient (no tiene hooks de datos).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AttemptActionButton } from "@/features/academy/components/unit-attempt";

describe("AttemptActionButton", () => {
  it("renderiza el label e invoca onClick al hacer click", () => {
    const onClick = vi.fn();
    render(<AttemptActionButton label="Comenzar" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Comenzar" });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("queda deshabilitado cuando disabled es true y no invoca onClick", () => {
    const onClick = vi.fn();
    render(<AttemptActionButton label="Unidad bloqueada" onClick={onClick} disabled />);

    const button = screen.getByRole("button", { name: "Unidad bloqueada" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("queda deshabilitado y con aria-busy cuando isLoading es true", () => {
    render(<AttemptActionButton label="Comenzar" onClick={vi.fn()} isLoading />);

    const button = screen.getByRole("button", { name: "Comenzar" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
