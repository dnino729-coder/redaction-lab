// AttemptActionButton — Blueprint §4 (`components/unit-attempt/`, Feature
// Module 2), §12 (P-02). Presentacional puro: cero hooks de datos, recibe
// todo por props. Envoltorio delgado sobre `Button` (Fase 0) — no reinventa
// estilos, solo añade el estado `isLoading` (spinner + `aria-busy`) que
// `Button` no expone por sí solo.
"use client";

import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";

export interface AttemptActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonProps["variant"];
}

export function AttemptActionButton({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  variant = "primary",
}: AttemptActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {label}
    </Button>
  );
}
