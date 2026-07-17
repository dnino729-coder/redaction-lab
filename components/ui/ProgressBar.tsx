// ProgressBar — primitivo compartido (sección 5.4/14.6). Accesible (WCAG 2.2
// AA, sección 14.9: usa role="progressbar" + atributos ARIA de valor).
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor entre 0 y 100. */
  value: number;
  label?: string;
  tone?: "primary" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  primary: "bg-primary-600",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, label, tone = "primary", className, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        {label ? (
          <span className="text-xs font-medium text-neutral-600">{label}</span>
        ) : null}
        <div
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
        >
          <div
            className={cn("h-full rounded-full transition-all duration-400 ease-delf-ease", toneClasses[tone])}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
