import { Attempt } from "../aggregates/Attempt";
import { AttemptId } from "../value-objects/AttemptId";
import { AcademyUnitId } from "../value-objects/AcademyUnitId";
import { StudentId } from "../value-objects/StudentId";

// Factory (Domain Model v1.1, Sección 3) — "paso inicial siempre
// CONTEXTUALIZE, Draft vacío, referencia correcta a AcademyUnit,
// numeración secuencial del Intento respecto a los anteriores". Invocada
// por CMD-01 StartUnit (primer Attempt, `attemptNumber: 1`) y por CMD-09
// RepeatUnit/CMD-10 FORCE_RESTART (repetición, `attemptNumber` siguiente
// al mayor ya registrado para esa AcademyUnit, RN-12).
export class AttemptFactory {
  public create(params: {
    newId: () => string;
    unitId: string;
    studentId: string;
    attemptNumber: number;
  }): Attempt {
    return Attempt.start({
      id: AttemptId.create(params.newId()),
      unitId: AcademyUnitId.create(params.unitId),
      studentId: StudentId.create(params.studentId),
      attemptNumber: params.attemptNumber,
    });
  }
}
