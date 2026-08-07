// AdminModelLibraryPage — Blueprint §12 (P-14), superficie pública de la
// feature. Sin `searchParams`/`params` propios (mismo criterio que
// `ModelLibraryPage`, P-11): el filtro de `textType` es estado local del
// Container.
import { TeacherAcademyLayout } from "../components/layouts";
import { AdminModelLibraryContainer } from "../components/model-library";

export function AdminModelLibraryPage() {
  return (
    <TeacherAcademyLayout>
      <AdminModelLibraryContainer />
    </TeacherAcademyLayout>
  );
}

export default AdminModelLibraryPage;
