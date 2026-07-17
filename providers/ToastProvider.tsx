"use client";
// ToastProvider — notificaciones efímeras de interacción (sección 5.4:
// providers/). Requerido por el módulo Dashboard (hook global `useToast`,
// docs/modules/dashboard.md sección 9) para confirmar acciones ligeras
// como descartar una recomendación. Región ARIA live para accesibilidad
// (14.9, WCAG 2.2 AA) — los mensajes se anuncian a lectores de pantalla sin
// robar el foco.

import * as React from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Duración en ms antes de auto-descartarse. Por defecto 4000ms. */
  durationMs?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastTone, string> = {
  neutral: "border-neutral-200 bg-neutral-0 text-neutral-800",
  success: "border-success-200 bg-success-50 text-success-800",
  warning: "border-warning-200 bg-warning-50 text-warning-800",
  danger: "border-danger-200 bg-danger-50 text-danger-800",
};

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      const durationMs = options.durationMs ?? 4000;
      setToasts((current) => [...current, { ...options, id }]);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-md border p-3 shadow-md transition-all duration-300 ease-delf-ease",
              toneClasses[item.tone ?? "neutral"],
            )}
          >
            <p className="text-sm font-medium">{item.title}</p>
            {item.description ? <p className="text-xs opacity-80">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
