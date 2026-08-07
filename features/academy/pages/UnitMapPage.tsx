// UnitMapPage — Blueprint §12 (P-01), superficie pública de la feature (la
// única que `app/` puede importar, mismo aislamiento que
// `features/dashboard/pages`). Server Component: solo resuelve
// `initialTextTypeFilter` desde `searchParams` (Blueprint §10.1: "derivado de
// `searchParams` por la Page") y ensambla Layout + Container — sin fetch de
// datos propio (a diferencia de Dashboard, Academia obtiene sus datos vía
// los hooks de React Query del Container, Blueprint §3/§8).
import { StudentAcademyLayout } from "../components/layouts";
import { UnitMapContainer } from "../components/unit-map";
import { ALL_TEXT_TYPES } from "../constants";
import type { TextType } from "../types";

function resolveTextTypeFilter(value: string | string[] | undefined): TextType | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ALL_TEXT_TYPES.includes(candidate as TextType) ? (candidate as TextType) : undefined;
}

export interface UnitMapPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export function UnitMapPage({ searchParams }: UnitMapPageProps) {
  const initialTextTypeFilter = resolveTextTypeFilter(searchParams?.textType);

  return (
    <StudentAcademyLayout>
      <UnitMapContainer initialTextTypeFilter={initialTextTypeFilter} />
    </StudentAcademyLayout>
  );
}

export default UnitMapPage;
