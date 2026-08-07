// Select — primitivo compartido (sección 5.4/14.6, catálogo shadcn/ui).
// Añadido por Sprint 1.2 de Academia (Blueprint §11.1: "Necesario para...
// Filtro textType (P-01, P-11, P-14)") — no existía en el Design System de
// Fase 0. Wrapper mínimo sobre `<select>` nativo, mismo patrón CVA/
// forwardRef que `Button.tsx`.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const selectVariants = cva(
  "flex h-10 w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 text-sm text-neutral-800 " +
    "transition-colors duration-150 ease-delf-ease focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        md: "h-10",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

// `size` de `VariantProps` colisiona con el atributo HTML nativo `size` de
// `<select>` (número de filas visibles, `React.SelectHTMLAttributes`) — se
// omite el nativo para que `size` signifique únicamente la variante visual,
// igual que en el resto del Design System (`Button.tsx`, `ButtonProps`).
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, ...props }, ref) => (
    <select ref={ref} className={cn(selectVariants({ size }), className)} {...props} />
  ),
);
Select.displayName = "Select";
