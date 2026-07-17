// DashboardPage — Server Component, superficie pública de la feature
// (features/dashboard/pages), la única que app/ puede importar (sección
// 5.4, regla de aislamiento reforzada por .eslintrc.cjs). Ensambla los 7
// bloques en el orden exacto especificado (docs/modules/dashboard.md,
// sección 2/8.4) y realiza el fetch inicial vía Server Component (sección
// 11: "sin round-trip cliente-servidor adicional").
//
// Manejo de errores: si `getDashboardReadModel` falla, este componente deja
// que el `error.tsx` del segmento de ruta (app/[locale]/error.tsx) lo
// capture — es el mecanismo estándar de Next.js para errores de Server
// Component, coherente con el estado `error` documentado en la sección 6
// (mensaje tranquilo, nunca alarmante — ver también DashboardErrorState,
// reutilizado ahí mismo).

import { redirect } from "next/navigation";
import { requireAuthenticatedStudentId } from "@/services/auth";
import { getDashboardReadModel } from "../services";
import { DashboardView } from "./DashboardView";

export async function DashboardPage() {
  let studentId: string;
  try {
    studentId = await requireAuthenticatedStudentId();
  } catch {
    // Sesión inválida o perfil inexistente: middleware.ts ya debería haber
    // protegido esta ruta — este redirect es una salvaguarda adicional, no
    // el mecanismo primario de protección (sección 12.9). Se usa el
    // `redirect` sin localizar de next/navigation (no el de i18n/navigation)
    // a propósito: la petición vuelve a pasar por middleware.ts, que aplica
    // el prefijo de idioma correcto según la preferencia real de la sesión
    // en vez de asumir un locale fijo aquí.
    redirect("/sign-in");
    return null;
  }

  const readModel = await getDashboardReadModel(studentId);

  return <DashboardView initialData={readModel} />;
}

export default DashboardPage;
