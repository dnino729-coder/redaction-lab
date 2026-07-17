// Button — primitivo compartido (sección 5.4/14.6, catálogo shadcn/ui).
// Toda propiedad visual referencia los Design Tokens de tailwind.config.ts
// (14.12.1 MUST) — ningún valor HEX/RGB/tamaño crudo.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium " +
    "transition-colors duration-150 ease-delf-ease focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-neutral-0 hover:bg-primary-700",
        secondary: "bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
        outline: "border border-neutral-300 bg-neutral-0 text-neutral-800 hover:bg-neutral-50",
        ghost: "text-neutral-700 hover:bg-neutral-100",
        danger: "bg-danger-600 text-neutral-0 hover:bg-danger-700",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
