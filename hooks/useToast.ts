"use client";
// useToast — hook reutilizable (sección 5.4), consume el contexto de
// providers/ToastProvider.tsx. Lanza un error explícito si se usa fuera del
// árbol de providers, en vez de fallar en silencio.
import { useContext } from "react";
import { ToastContext, type ToastContextValue } from "@/providers/ToastProvider";

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider> (ver providers/index.tsx).");
  }
  return context;
}
