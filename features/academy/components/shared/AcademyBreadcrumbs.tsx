// AcademyBreadcrumbs — Blueprint sección 19 (resolución AFR-F07). Recibe la
// lista de items ya resuelta por cada `Page` (P-02, P-03, P-12, P-13, P-14,
// P-15 — P-01/P-11/P-04–P-10 no lo usan, ver sección 19). El último item
// nunca es un link (representa la pantalla actual); usa los wrappers de
// `i18n/navigation.ts` (resolución 18.18), nunca `next/link`.
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface AcademyBreadcrumbItem {
  label: string;
  href?: string;
}

export interface AcademyBreadcrumbsProps {
  items: AcademyBreadcrumbItem[];
}

export function AcademyBreadcrumbs({ items }: AcademyBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden="true" /> : null}
            {isLast || !item.href ? (
              <span aria-current={isLast ? "page" : undefined} className="font-medium text-neutral-900">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-neutral-700 hover:underline">
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
