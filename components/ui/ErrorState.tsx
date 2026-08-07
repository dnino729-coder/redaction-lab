// ErrorState — error genérico de carga/mutación. Deliberadamente ajeno a
// `AcademyErrorHttp` (vive en `components/ui/`, primitivo de plataforma):
// cada feature mapea su propio tipo de error a `message`/`onRetry` al
// consumirlo (sección 3.1/5.11).
import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { StatusPanel, type StatusPanelProps } from "./StatusPanel";
import { Button } from "./Button";

export interface ErrorStateProps extends Omit<StatusPanelProps, "title" | "action"> {
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Ocurrió un error",
  onRetry,
  retryLabel = "Reintentar",
  icon,
  ...props
}: ErrorStateProps) {
  return (
    <StatusPanel
      title={title}
      icon={icon ?? <AlertTriangle className="h-8 w-8 text-danger-500" />}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
      {...props}
    />
  );
}
