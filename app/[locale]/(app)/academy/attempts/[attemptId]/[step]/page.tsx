// Ruta: Academia / P-04 a P-10 (Blueprint §4/§12, "un solo Page paramétrico").
// Sin lógica de producto en app/ (sección 5.4) — solo importa y renderiza la
// superficie pública de la feature (features/academy/pages), tal como exige
// .eslintrc.cjs (import/no-restricted-paths). Importa el archivo específico
// (no el barrel) — ver comentario en `features/academy/pages/index.ts`.
import AttemptStepPage from "@/features/academy/pages/AttemptStepPage";

export default AttemptStepPage;
