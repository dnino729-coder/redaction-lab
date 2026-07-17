// Helpers de navegación conscientes de idioma (Link, redirect, usePathname,
// useRouter, getPathname) — envuelven las APIs nativas de Next.js para que
// los componentes naveguen sin construir manualmente el prefijo de idioma.
// Uso obligatorio en vez de next/link y next/navigation dentro de features/
// y components/ (resolución 18.18).

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
