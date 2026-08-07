// Ruta: Academia / P-11 Biblioteca de Modelos (Blueprint §4/§12). Sin lógica
// de producto en app/ (sección 5.4) — solo importa y renderiza la superficie
// pública de la feature (features/academy/pages), tal como exige
// .eslintrc.cjs (import/no-restricted-paths). Importa el archivo específico
// (no el barrel) porque el barrel de `pages/` ya tiene su propio `default`
// (`UnitMapPage`, Sprint 1.2) — mismo criterio ya usado por la ruta de P-02.
import ModelLibraryPage from "@/features/academy/pages/ModelLibraryPage";

export default ModelLibraryPage;
