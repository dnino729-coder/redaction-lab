// Loading — indicador genérico de carga (sección 5.4/14.6, catálogo
// shadcn/ui, README.md de esta carpeta). Distinto de `Skeleton`: `Skeleton`
// dibuja la forma del contenido final (14.7, "Skeleton Screens"); `Loading`
// es un indicador puntual (botón/fila/región pequeña), nunca un spinner
// bloqueante de pantalla completa.
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loadingVariants = cva("animate-spin text-neutral-400", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  label?: string;
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, label, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <Loader2 className={loadingVariants({ size })} />
      <span className={label ? "text-sm text-neutral-500" : "sr-only"}>{label ?? "Cargando"}</span>
    </div>
  ),
);
Loading.displayName = "Loading";
