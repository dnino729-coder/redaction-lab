"use client";
// useMediaQuery — hook reutilizable (sección 5.4), base de los layouts
// responsive mobile-first (14.10, MUST: "ninguna funcionalidad se pierde por
// usar un dispositivo móvil"). SSR-safe: devuelve `false` hasta que el
// efecto se ejecuta en el cliente, evitando desajustes de hidratación.
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Breakpoints alineados con Tailwind (tailwind.config.ts no los redefine —
// usa los valores por defecto del framework: sm 640px, md 768px, lg 1024px),
// consistentes con los 3 layouts documentados (14.10): móvil, tablet, escritorio.
export const BREAKPOINTS = {
  tablet: "(min-width: 768px)",
  desktop: "(min-width: 1024px)",
} as const;
