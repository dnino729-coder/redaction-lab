import { UnitState } from "../enums/UnitState";
import { OverrideAction } from "../enums/OverrideAction";
import { OverrideNotValidForStateException } from "../exceptions/OverrideNotValidForStateException";

// Policy (Domain Model v1.1, RN-13, A-10) — matriz de acciones de
// anulación docente válidas por UnitState. Invocada por
// `AcademyUnit.applyTeacherOverride()` sobre sí misma (H-02).
//
// `FORCE_LOCK`: válido desde "cualquier estado activo" (Sección 9, tabla
// de transiciones) — es decir, cualquier estado salvo `LOCKED` (ya
// bloqueada), `COMPLETED`/`MASTERED` (RN-13: no aplica sobre estados
// terminales, invariante 10).
//
// `FORCE_RESTART`: válido desde `LOCKED` (desbloquea la unidad
// previamente forzada a bloqueo, Sección 9) o desde `COMPLETED`/`MASTERED`
// (reutiliza internamente el mismo comportamiento de repetición de
// CMD-09, Application Layer Spec v1.0, CMD-10).
const ACTIVE_NON_TERMINAL_STATES: ReadonlySet<UnitState> = new Set([
  UnitState.UNLOCKED,
  UnitState.IN_PROGRESS,
  UnitState.AWAITING_FEEDBACK,
  UnitState.REVISION,
  UnitState.REFLECTION,
]);

export class TeacherOverridePolicy {
  public isValidForState(state: UnitState, action: OverrideAction): boolean {
    if (action === OverrideAction.FORCE_LOCK) {
      return ACTIVE_NON_TERMINAL_STATES.has(state);
    }
    // FORCE_RESTART
    return (
      state === UnitState.LOCKED ||
      state === UnitState.COMPLETED ||
      state === UnitState.MASTERED
    );
  }

  public assertActionValidForState(
    unitId: string,
    state: UnitState,
    action: OverrideAction,
  ): void {
    if (!this.isValidForState(state, action)) {
      throw new OverrideNotValidForStateException(unitId, action);
    }
  }
}
