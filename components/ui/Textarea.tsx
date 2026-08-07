// Textarea — primitivo compartido (sección 5.4/14.6, catálogo shadcn/ui,
// ya listado en el README de esta carpeta). Añadido por Sprint 1.6 de
// Academia (Blueprint §11.1: "Necesario para... WritingEditor (P-08),
// reflexión (P-10)") — se adelanta aquí porque `ComprehensionGate` (P-05)
// también necesita una respuesta de texto libre y no existía todavía en el
// Design System. Wrapper mínimo sobre `<textarea>` nativo, mismo patrón
// CVA/forwardRef que `Select.tsx`/`Button.tsx`.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const textareaVariants = cva(
  "flex w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-800 " +
    "placeholder:text-neutral-400 transition-colors duration-150 ease-delf-ease focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      resize: {
        vertical: "resize-y",
        none: "resize-none",
      },
    },
    defaultVariants: {
      resize: "vertical",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize, rows = 5, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(textareaVariants({ resize }), className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
