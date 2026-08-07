// Helpers de construcción de ruta — mecánicos, derivados 1:1 de las 9 rutas
// ya congeladas en el Blueprint §3/§12/§19 (Frontend Contract v1.1 §3). No
// introducen ninguna ruta nueva; solo evitan construir template strings a
// mano en cada componente. Usar siempre junto a los wrappers de
// `i18n/navigation.ts` (Blueprint §2.6, punto 1), nunca `next/navigation`.
import type { UnitStep } from "../types/enums";
import { STEP_TO_URL_SLUG } from "./steps";

export const academyRoutes = {
  unitMap: () => "/academy",
  modelLibrary: () => "/academy/model-examples",
  unitDetail: (unitId: string) => `/academy/units/${unitId}`,
  unitHistory: (unitId: string) => `/academy/units/${unitId}/history`,
  attemptStep: (attemptId: string, step: Exclude<UnitStep, "UNLOCK">) =>
    `/academy/attempts/${attemptId}/${STEP_TO_URL_SLUG[step]}`,
  teacherPanel: () => "/academy/teacher",
  studentDetail: (studentId: string) => `/academy/teacher/students/${studentId}`,
  studentUnitHistory: (studentId: string, unitId: string) =>
    `/academy/teacher/students/${studentId}/units/${unitId}/history`,
  adminModelLibrary: () => "/academy/admin/model-examples",
} as const;
