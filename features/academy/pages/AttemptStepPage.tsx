// AttemptStepPage — Blueprint §4/§12 (P-04 a P-10, "un solo Page
// paramétrico"), superficie pública de la feature. Server Component: solo
// resuelve `attemptId`/`step` desde `params` y ensambla Layout + Container —
// sin fetch de datos propio (mismo criterio que `UnitMapPage`/`UnitDetailPage`,
// AFR-011 decisión #7).
import { StudentAcademyLayout } from "../components/layouts";
import { AttemptStepContainer } from "../components/unit-attempt";

export interface AttemptStepPageProps {
  params: { attemptId: string; step: string };
}

export function AttemptStepPage({ params }: AttemptStepPageProps) {
  return (
    <StudentAcademyLayout>
      <AttemptStepContainer attemptId={params.attemptId} step={params.step} />
    </StudentAcademyLayout>
  );
}

export default AttemptStepPage;
