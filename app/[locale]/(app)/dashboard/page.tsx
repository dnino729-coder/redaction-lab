// Ruta: Dashboard (sección 6.3, docs/modules/dashboard.md). Sin lógica de
// producto en app/ (sección 5.4) — solo importa y renderiza la superficie
// pública de la feature (features/dashboard/pages), tal como exige
// .eslintrc.cjs (import/no-restricted-paths).
import DashboardPage from "@/features/dashboard/pages";

export default DashboardPage;
