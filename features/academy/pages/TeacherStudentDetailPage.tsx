// TeacherStudentDetailPage — Panel del Profesor (P-13), superficie pública
// de la feature. Server Component: solo resuelve `studentId` desde `params`
// y ensambla Layout + Container — mismo criterio que `UnitDetailPage`.
import { TeacherAcademyLayout } from "../components/layouts";
import { TeacherStudentDetailContainer } from "../components/teacher-panel";

export interface TeacherStudentDetailPageProps {
  params: { studentId: string };
}

export function TeacherStudentDetailPage({ params }: TeacherStudentDetailPageProps) {
  return (
    <TeacherAcademyLayout>
      <TeacherStudentDetailContainer studentId={params.studentId} />
    </TeacherAcademyLayout>
  );
}

export default TeacherStudentDetailPage;
