// Dialog — primitivo compartido (sección 5.4/14.6, catálogo shadcn/ui).
// Añadido por Sprint P-14 de Academia (Blueprint §11.1/§12 P-14: "Dialog con
// foco atrapado antes de retirar").
//
// Implementación manual (div + role="dialog") en vez de `<dialog
// open>`/`showModal()` nativo: el entorno de test de este proyecto (jsdom
// 24.1.0, verificado empíricamente) no implementa `HTMLDialogElement
// .showModal()`/`.close()` — ambos lanzan "is not a function". Un Dialog
// construido sobre esa API nativa sería imposible de probar con Vitest/RTL
// en este proyecto. El patrón manual (foco atrapado por `keydown` propio,
// restauración de foco por `useRef`) cubre exactamente los mismos cuatro
// requisitos de WCAG 2.1 AA exigidos (foco atrapado, Escape, aria-modal,
// restauración del foco) sin depender de una API no soportada.
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Foco: al abrir, recuerda el elemento con foco previo y mueve el foco
  // dentro del diálogo; al cerrar (o desmontar), restaura el foco original.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? container)?.focus();

    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  // Escape cierra; Tab/Shift+Tab quedan atrapados dentro del diálogo.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-0 p-6 shadow-lg",
          className,
        )}
      >
        <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
