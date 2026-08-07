// ForbiddenState — 403 defensivo (ej. intento de otro estudiante, sin
// relación docente-estudiante). Nunca revela por qué existe el recurso.
import * as React from "react";
import { ShieldOff } from "lucide-react";
import { StatusPanel, type StatusPanelProps } from "./StatusPanel";

export interface ForbiddenStateProps extends Omit<StatusPanelProps, "title"> {
  title?: string;
}

export function ForbiddenState({ title = "No tienes acceso a este recurso", icon, ...props }: ForbiddenStateProps) {
  return <StatusPanel title={title} icon={icon ?? <ShieldOff className="h-8 w-8 text-danger-500" />} {...props} />;
}
