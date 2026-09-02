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
import {
  getDashboardReadModel,
  isDashboardDevModeEnabled,
  buildMockDashboardReadModel,
} from "../services";
import { DashboardView } from "./DashboardView";

export async function DashboardPage() {
  console.log("1️⃣ Entré a DashboardPage");

  // Modo temporal de desarrollo (DASHBOARD_DEV_MODE=true) — visualiza el
  // Dashboard con un DashboardReadModel simulado, sin llamar a
  // requireAuthenticatedStudentId() ni a getDashboardReadModel() (sin
  // sesión, sin base de datos). Guard de retorno anticipado: el flujo de
  // producción de abajo queda intacto, sin modificar; reversible por
  // completo quitando la variable de entorno.
  if (isDashboardDevModeEnabled()) {
    console.log(
      "🧪 DASHBOARD_DEV_MODE=true: usando DashboardReadModel simulado (sin sesión, sin base de datos)",
    );

    return (
      <>
        <div
          role="status"
          className="mx-auto mb-0 mt-4 max-w-5xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-6 lg:mx-8"
        >
          <p className="font-semibold uppercase tracking-wide">Modo desarrollo</p>
          <p>Datos simulados</p>
        </div>
        <DashboardView initialData={buildMockDashboardReadModel()} />
      </>
    );
  }

  let studentId: string;

  try {
    console.log("2️⃣ Voy a requireAuthenticatedStudentId");

    studentId = await requireAuthenticatedStudentId();

    console.log("3️⃣ studentId:", studentId);
  } catch (error) {
    console.error("❌ ERROR requireAuthenticatedStudentId");
    console.error(error);

    redirect("/sign-in");
  }

  console.log("4️⃣ Voy a getDashboardReadModel");

  let readModel;

  try {
    readModel = await getDashboardReadModel(studentId);
    console.log("5️⃣ ReadModel obtenido");
  } catch (error) {
    console.error("❌ ERROR getDashboardReadModel");
    console.error(error);
    throw error;
  }

  console.log("6️⃣ Voy a renderizar DashboardView");

  return <DashboardView initialData={readModel} />;
}
export default DashboardPage;
