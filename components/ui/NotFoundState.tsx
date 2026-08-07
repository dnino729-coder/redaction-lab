// NotFoundState — 404 (recurso inexistente o ya no accesible).
import * as React from "react";
import { SearchX } from "lucide-react";
import { StatusPanel, type StatusPanelProps } from "./StatusPanel";

export interface NotFoundStateProps extends Omit<StatusPanelProps, "title"> {
  title?: string;
}

export function NotFoundState({ title = "No se encontró lo que buscas", icon, ...props }: NotFoundStateProps) {
  return <StatusPanel title={title} icon={icon ?? <SearchX className="h-8 w-8 text-neutral-400" />} {...props} />;
}
