export { UnitMapPage, default } from "./UnitMapPage";
// `UnitDetailPage` se exporta solo con nombre (sin re-exportar su `default`)
// porque un único barrel no puede tener dos `default` en conflicto — el
// `default` de este barrel sigue siendo `UnitMapPage` (Sprint 1.2, sin
// tocar). La ruta de P-02 importa `UnitDetailPage` directamente desde su
// archivo (`@/features/academy/pages/UnitDetailPage`), permitido por
// `import/no-restricted-paths` (la excepción cubre todo `features/academy/
// pages/`, no solo este barrel).
export { UnitDetailPage } from "./UnitDetailPage";
// Mismo criterio que `UnitDetailPage` — named-only, la ruta de P-03 importa
// el archivo directamente.
export { UnitHistoryPage } from "./UnitHistoryPage";
// Mismo criterio — named-only, la ruta de P-04 (y las futuras P-05 a P-10,
// mismo Page paramétrico) importa el archivo directamente.
export { AttemptStepPage } from "./AttemptStepPage";
// Mismo criterio — named-only, la ruta de P-11 importa el archivo
// directamente.
export { ModelLibraryPage } from "./ModelLibraryPage";
// Mismo criterio — named-only, la ruta de P-14 importa el archivo
// directamente.
export { AdminModelLibraryPage } from "./AdminModelLibraryPage";
// Mismo criterio — named-only, las rutas de P-12/P-13/P-15 importan cada
// archivo directamente.
export { TeacherDashboardPage } from "./TeacherDashboardPage";
export { TeacherStudentDetailPage } from "./TeacherStudentDetailPage";
export { TeacherStudentUnitHistoryPage } from "./TeacherStudentUnitHistoryPage";
