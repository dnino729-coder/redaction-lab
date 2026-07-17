// Utilidad compartida `cn()` — combina clsx (clases condicionales) con
// tailwind-merge (resuelve conflictos de utilidades Tailwind, ej. dos
// clases de padding). Usada por todos los componentes de components/ui
// (sección 14.6). Sin lógica de negocio.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
