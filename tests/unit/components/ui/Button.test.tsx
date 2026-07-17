import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza el contenido", () => {
    render(<Button>Continuer</Button>);
    expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
  });

  it("invoca onClick al hacer clic", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continuer</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("se deshabilita cuando disabled=true", () => {
    render(<Button disabled>Continuer</Button>);
    expect(screen.getByRole("button", { name: "Continuer" })).toBeDisabled();
  });

  it("usa type='button' por defecto (nunca envía un formulario por accidente)", () => {
    render(<Button>Continuer</Button>);
    expect(screen.getByRole("button", { name: "Continuer" })).toHaveAttribute("type", "button");
  });
});
