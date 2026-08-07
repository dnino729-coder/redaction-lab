// UnitHistoryPage — Blueprint §12 (P-03), superficie pública de la feature.
// Server Component: solo resuelve `unitId` desde `params` y ensambla
// Layout + Container — sin fetch de datos propio (mismo criterio que
// `UnitMapPage`/`UnitDetailPage`, AFR-011 decisión #7).
import { StudentAcademyLayout } from "../components/layouts";
import { AttemptHistoryContainer } from "../components/unit-attempt";

export interface UnitHistoryPageProps {
  params: { unitId: string };
}

export function UnitHistoryPage({ params }: UnitHistoryPageProps) {
  return (
    <StudentAcademyLayout>
      <AttemptHistoryContainer unitId={params.unitId} />
    </StudentAcademyLayout>
  );
}

export default UnitHistoryPage;
