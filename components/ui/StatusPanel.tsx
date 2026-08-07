// StatusPanel — layout compartido por los estados terminales de pantalla
// (Empty/Error/Forbidden/Unauthorized/NotFound). Un único componente base con
// icono + título + descripción + acción opcional, para no repetir el mismo
// layout cinco veces; `EmptyState`/`ErrorState`/`ForbiddenState`/
// `UnauthorizedState`/`NotFoundState` son envoltorios semánticos delgados
// sobre este componente.
import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const StatusPanel = React.forwardRef<HTMLDivElement, StatusPanelProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-0 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon}
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      {description ? <p className="max-w-prose text-sm text-neutral-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  ),
);
StatusPanel.displayName = "StatusPanel";
