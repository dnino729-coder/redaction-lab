// Avatar — primitivo compartido (sección 5.4/14.6). Implementación simple
// (sin dependencia @radix-ui, no incluida en el stack resuelto — 18.1) con
// fallback a iniciales cuando no hay imagen o falla la carga.
"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  /** Iniciales a mostrar si no hay imagen (ej. "MD"). */
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = "md", className, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false);
    const showImage = Boolean(src) && !imageFailed;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {showImage ? (
          <Image
            src={src as string}
            alt={alt}
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{fallback}</span>
        )}
        <span className="sr-only">{alt}</span>
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
