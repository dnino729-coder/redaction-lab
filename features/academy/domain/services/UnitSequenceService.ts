import { UnitState } from "../enums/UnitState";
import type { AcademyUnitCatalogPort } from "../ports/AcademyUnitCatalogPort";

// Domain Service (Domain Model v1.1) — resuelve dos operaciones distintas
// de secuenciación curricular, ambas por `TextType` (la progresión de
// Academia es independiente por cada uno de los 5 TextType, no una
// secuencia global):
//
// 1. `determineInitialState` (CMD-15 ProvisionAcademyUnitsForStudent):
//    la primera posición (`position === 1`) de cada `TextType` se
//    provisiona `UNLOCKED`; el resto, `LOCKED` (RN-6).
// 2. `resolveCurriculum` (CMD-15): expone el catálogo curricular completo
//    a provisionar, delegado a `AcademyUnitCatalogPort` (fuente externa,
//    fuera del propio dominio).
//
// La búsqueda de "la Unidad siguiente ya provisionada" (CMD-07
// CompleteReflection) se resuelve directamente contra
// `AcademyUnitRepository` por Application Layer (Sección 7.18) — no es
// responsabilidad de este Domain Service, que no depende de Repositories
// de escritura.
export class UnitSequenceService {
  public constructor(private readonly catalogPort: AcademyUnitCatalogPort) {}

  public async resolveCurriculum() {
    return this.catalogPort.listCurriculum();
  }

  public determineInitialState(position: number): UnitState {
    return position === 1 ? UnitState.UNLOCKED : UnitState.LOCKED;
  }
}
