// Ruta: Academia / P-12 Panel del Profesor (Blueprint §4/§12). Sin lógica
// de producto en app/ (sección 5.4) — solo importa y renderiza la
// superficie pública de la feature (features/academy/pages), tal como exige
// .eslintrc.cjs (import/no-restricted-paths). Importa el archivo específico
// (no el barrel) — mismo criterio ya usado por P-02/P-03/P-11/P-14.
import TeacherDashboardPage from "@/features/academy/pages/TeacherDashboardPage";

export default TeacherDashboardPage;
