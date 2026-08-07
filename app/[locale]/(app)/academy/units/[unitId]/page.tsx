// Ruta: Academia / P-02 Detalle de unidad (Blueprint §4/§12). Sin lógica de
// producto en app/ (sección 5.4) — solo importa y renderiza la superficie
// pública de la feature (features/academy/pages), tal como exige
// .eslintrc.cjs (import/no-restricted-paths). Importa el archivo específico
// (no el barrel) porque el barrel de `pages/` ya tiene su propio `default`
// (`UnitMapPage`, Sprint 1.2) — ver comentario en `features/academy/pages/index.ts`.
import UnitDetailPage from "@/features/academy/pages/UnitDetailPage";

export default UnitDetailPage;
