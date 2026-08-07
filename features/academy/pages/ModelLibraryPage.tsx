// ModelLibraryPage — Blueprint §12 (P-11), superficie pública de la
// feature. Sin `searchParams`/`params` propios (a diferencia de
// `UnitMapPage`/`UnitDetailPage`): el filtro de `textType` es estado local
// del Container (Blueprint §12 P-11 no exige que el filtro sea parte de la
// URL, a diferencia de P-01).
import { StudentAcademyLayout } from "../components/layouts";
import { ModelLibraryContainer } from "../components/model-library";

export function ModelLibraryPage() {
  return (
    <StudentAcademyLayout>
      <ModelLibraryContainer />
    </StudentAcademyLayout>
  );
}

export default ModelLibraryPage;
