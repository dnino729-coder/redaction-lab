// TeacherDashboardPage — Panel del Profesor (P-12), superficie pública de la
// feature. Server Component: ensambla Layout + Container, sin lógica propia
// (mismo criterio que `UnitMapPage`).
import { TeacherAcademyLayout } from "../components/layouts";
import { TeacherDashboardContainer } from "../components/teacher-panel";

export function TeacherDashboardPage() {
  return (
    <TeacherAcademyLayout>
      <TeacherDashboardContainer />
    </TeacherAcademyLayout>
  );
}

export default TeacherDashboardPage;
