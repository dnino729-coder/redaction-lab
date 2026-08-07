// EmptyState — estado "sin datos" (no es un error). Sección 5.4/14.6.
import * as React from "react";
import { Inbox } from "lucide-react";
import { StatusPanel, type StatusPanelProps } from "./StatusPanel";

export interface EmptyStateProps extends Omit<StatusPanelProps, "title"> {
  title?: string;
}

export function EmptyState({ title = "No hay nada para mostrar", icon, ...props }: EmptyStateProps) {
  return <StatusPanel title={title} icon={icon ?? <Inbox className="h-8 w-8 text-neutral-400" />} {...props} />;
}
