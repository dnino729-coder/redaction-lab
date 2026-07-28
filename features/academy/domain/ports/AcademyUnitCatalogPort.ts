import type { TextType } from "../enums/TextType";

// Puerto de dominio — catálogo curricular (qué TextType/posiciones deben
// provisionarse para un estudiante nuevo). Consultado por
// `UnitSequenceService`/`AcademyUnitFactory` únicamente durante CMD-15
// ProvisionAcademyUnitsForStudent (Application Layer Spec v1.0) — no
// existen todavía filas de `AcademyUnit` para ese estudiante en ese
// momento, por lo que no puede resolverse vía `AcademyUnitRepository`.
export interface AcademyUnitCatalogEntry {
  readonly textType: TextType;
  readonly position: number;
}

export interface AcademyUnitCatalogPort {
  listCurriculum(): Promise<readonly AcademyUnitCatalogEntry[]>;
}
