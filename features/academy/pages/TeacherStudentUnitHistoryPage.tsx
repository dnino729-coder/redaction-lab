// TeacherStudentUnitHistoryPage — Panel del Profesor (P-15), superficie
// pública de la feature. Server Component: resuelve `studentId`/`unitId`
// desde `params` y ensambla Layout + Container — mismo criterio que
// `UnitHistoryPage`.
import { TeacherAcademyLayout } from "../components/layouts";
import { TeacherStudentUnitHistoryContainer } from "../components/teacher-panel";

export interface TeacherStudentUnitHistoryPageProps {
  params: { studentId: string; unitId: string };
}

export function TeacherStudentUnitHistoryPage({ params }: TeacherStudentUnitHistoryPageProps) {
  return (
    <TeacherAcademyLayout>
      <TeacherStudentUnitHistoryContainer studentId={params.studentId} unitId={params.unitId} />
    </TeacherAcademyLayout>
  );
}

export default TeacherStudentUnitHistoryPage;
