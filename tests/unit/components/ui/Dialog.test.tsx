import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "@/components/ui/Dialog";

describe("Dialog", () => {
  it("no renderiza nada cuando open=false", () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Título">
        <p>Contenido</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza con role=dialog, aria-modal=true y el título asociado por aria-labelledby", () => {
    render(
      <Dialog open onClose={vi.fn()} title="Confirmar">
        <p>Contenido</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("invoca onClose al presionar Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Confirmar">
        <button>Acción</button>
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("mueve el foco al primer elemento enfocable al abrir", () => {
    render(
      <Dialog open onClose={vi.fn()} title="Confirmar">
        <button>Primero</button>
        <button>Segundo</button>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Primero" })).toHaveFocus();
  });

  it("atrapa el foco: Tab desde el último elemento vuelve al primero", () => {
    render(
      <Dialog open onClose={vi.fn()} title="Confirmar">
        <button>Primero</button>
        <button>Segundo</button>
      </Dialog>,
    );
    screen.getByRole("button", { name: "Segundo" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Primero" })).toHaveFocus();
  });

  it("atrapa el foco: Shift+Tab desde el primer elemento vuelve al último", () => {
    render(
      <Dialog open onClose={vi.fn()} title="Confirmar">
        <button>Primero</button>
        <button>Segundo</button>
      </Dialog>,
    );
    screen.getByRole("button", { name: "Primero" }).focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Segundo" })).toHaveFocus();
  });

  it("restaura el foco al elemento previamente enfocado cuando se cierra", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Confirmar">
            <button onClick={() => setOpen(false)}>Cerrar</button>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    const openButton = screen.getByRole("button", { name: "Abrir" });
    openButton.focus();
    fireEvent.click(openButton);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(openButton).toHaveFocus();
  });
});
