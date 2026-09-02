// LaboratoryPage — Server Component, superficie pública de la feature.
// Renderiza directamente el contenido real (mismo patrón que AcademyPage):
// sin bypass de autenticación ni datos simulados — el middleware exige
// sesión de Clerk para /laboratory y cada bloque obtiene sus propios datos
// reales vía la API HTTP del módulo (ver LaboratoryView).
import { LaboratoryView } from "./LaboratoryView";

export async function LaboratoryPage() {
  return <LaboratoryView />;
}

export default LaboratoryPage;
