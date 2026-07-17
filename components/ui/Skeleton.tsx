// Skeleton — primitivo compartido para estados de carga (sección 14.7,
// "Skeleton Screens" — nunca spinners bloqueantes de pantalla completa).
import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      {...props}
    />
  );
}
