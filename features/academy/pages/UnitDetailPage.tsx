// UnitDetailPage — Blueprint §12 (P-02), superficie pública de la feature.
// Server Component: solo resuelve `unitId` desde `params` (síncrono, ruta
// dinámica `[unitId]`) y ensambla Layout + Container — sin fetch de datos
// propio (mismo criterio que `UnitMapPage`, Sprint 1.2/AFR-011 decisión #7).
import { StudentAcademyLayout } from "../components/layouts";
import { UnitDetailContainer } from "../components/unit-attempt";

export interface UnitDetailPageProps {
  params: { unitId: string };
}

export function UnitDetailPage({ params }: UnitDetailPageProps) {
  return (
    <StudentAcademyLayout>
      <UnitDetailContainer unitId={params.unitId} />
    </StudentAcademyLayout>
  );
}

export default UnitDetailPage;
