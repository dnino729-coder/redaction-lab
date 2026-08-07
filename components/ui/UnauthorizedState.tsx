// UnauthorizedState — 401 (sin sesión). En Academia, `middleware.ts` (Clerk)
// ya impide que un usuario sin sesión llegue a renderizar cualquiera de las
// 15 pantallas (Blueprint, sección 15.1) — este componente se provee por
// completitud del catálogo de estados y para features futuras sin ese
// mismo middleware, no porque Academia lo consuma hoy.
import * as React from "react";
import { Lock } from "lucide-react";
import { StatusPanel, type StatusPanelProps } from "./StatusPanel";

export interface UnauthorizedStateProps extends Omit<StatusPanelProps, "title"> {
  title?: string;
}

export function UnauthorizedState({ title = "Inicia sesión para continuar", icon, ...props }: UnauthorizedStateProps) {
  return <StatusPanel title={title} icon={icon ?? <Lock className="h-8 w-8 text-neutral-400" />} {...props} />;
}
