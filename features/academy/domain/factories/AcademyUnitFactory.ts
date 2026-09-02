import { AcademyUnit } from "../aggregates/AcademyUnit";
import { AcademyUnitId } from "../value-objects/AcademyUnitId";
import { StudentId } from "../value-objects/StudentId";
import type { TextType } from "../enums/TextType";
import type { UnitState } from "../enums/UnitState";

// Factory (Domain Model v1.1, Sección 3) — punto único de construcción de
// una AcademyUnit nueva, invocada por CMD-15 ProvisionAcademyUnitsForStudent
// (Application Layer Spec v1.0). El estado inicial (`UNLOCKED` para
// `position === 1` de cada TextType, `LOCKED` en cualquier otro caso,
// RN-6) lo determina `UnitSequenceService.determineInitialState` — la
// Factory solo construye el Aggregate con el estado ya decidido, sin
// duplicar esa lógica.
export class AcademyUnitFactory {
  public create(params: {
    newId: () => string;
    studentId: string;
    textType: TextType;
    position: number;
    initialState: UnitState;
  }): AcademyUnit {
    return AcademyUnit.provision({
      id: AcademyUnitId.create(params.newId()),
      studentId: StudentId.create(params.studentId),
      textType: params.textType,
      position: params.position,
      initialState: params.initialState,
    });
  }
}
