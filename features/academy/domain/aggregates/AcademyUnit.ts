import { AggregateRoot } from "../shared/AggregateRoot";
import type { AcademyUnitId } from "../value-objects/AcademyUnitId";
import type { StudentId } from "../value-objects/StudentId";
import type { AttemptId } from "../value-objects/AttemptId";
import { UnitState } from "../enums/UnitState";
import type { TextType } from "../enums/TextType";
import { OverrideAction } from "../enums/OverrideAction";
import type { TeacherOverride } from "../entities/TeacherOverride";
import { UnlockPolicy } from "../policies/UnlockPolicy";
import { MasteryPolicy } from "../policies/MasteryPolicy";
import { RepetitionPolicy } from "../policies/RepetitionPolicy";
import { TeacherOverridePolicy } from "../policies/TeacherOverridePolicy";
import { CompletionPolicy } from "../policies/CompletionPolicy";
import type { MasteryCriterion } from "../value-objects/MasteryCriterion";
import { InvalidUnitStateTransitionException } from "../exceptions/InvalidUnitStateTransitionException";
import { AttemptAlreadyActiveException } from "../exceptions/AttemptAlreadyActiveException";
import { UnitUnlockedEvent } from "../events/UnitUnlockedEvent";
import { UnitStartedEvent } from "../events/UnitStartedEvent";
import { UnitCompletedEvent } from "../events/UnitCompletedEvent";
import { UnitMasteredEvent } from "../events/UnitMasteredEvent";
import { UnitRepeatedEvent } from "../events/UnitRepeatedEvent";
import { ExternalActivityCompletedEvent } from "../events/ExternalActivityCompletedEvent";
import { TeacherOverrideAppliedEvent } from "../events/TeacherOverrideAppliedEvent";

// Aggregate Root (Domain Model v1.1, AR-1) — gobierna en exclusiva
// `UnitState` (la única máquina de estados autoritativa, invariante 6) de
// una Unidad DELF B2 para un Estudiante y un TextType. Decide, por sí
// misma, si el desbloqueo (`UnlockPolicy`), el dominio (`MasteryPolicy`) o
// una anulación docente (`TeacherOverridePolicy`) proceden — invocando la
// Policy correspondiente y aplicando el resultado sobre su propio estado
// (H-02: ninguna Policy muta el Aggregate directamente).
interface AcademyUnitProps {
  studentId: StudentId;
  textType: TextType;
  position: number;
  state: UnitState;
  activeAttemptId: AttemptId | null;
  completedAt: Date | null;
  masteredAt: Date | null;
  teacherOverrides: TeacherOverride[];
}

export class AcademyUnit extends AggregateRoot<AcademyUnitId> {
  private readonly unlockPolicy = new UnlockPolicy();
  private readonly masteryPolicy = new MasteryPolicy();
  private readonly repetitionPolicy = new RepetitionPolicy();
  private readonly teacherOverridePolicy = new TeacherOverridePolicy();
  private readonly completionPolicy = new CompletionPolicy();

  private props: AcademyUnitProps;

  private constructor(id: AcademyUnitId, props: AcademyUnitProps) {
    super(id);
    this.props = props;
  }

  /** Construcción de una AcademyUnit nueva — invocada exclusivamente por
   * `AcademyUnitFactory` durante CMD-15 ProvisionAcademyUnitsForStudent.
   * `initialState` la determina `UnitSequenceService.determineInitialState`
   * (UNLOCKED si `position === 1` de su TextType, LOCKED en cualquier
   * otro caso, RN-6). */
  public static provision(params: {
    id: AcademyUnitId;
    studentId: StudentId;
    textType: TextType;
    position: number;
    initialState: UnitState;
  }): AcademyUnit {
    return new AcademyUnit(params.id, {
      studentId: params.studentId,
      textType: params.textType,
      position: params.position,
      state: params.initialState,
      activeAttemptId: null,
      completedAt: null,
      masteredAt: null,
      teacherOverrides: [],
    });
  }

  public static reconstitute(params: {
    id: AcademyUnitId;
    studentId: StudentId;
    textType: TextType;
    position: number;
    state: UnitState;
    activeAttemptId: AttemptId | null;
    completedAt: Date | null;
    masteredAt: Date | null;
    teacherOverrides: TeacherOverride[];
  }): AcademyUnit {
    return new AcademyUnit(params.id, {
      studentId: params.studentId,
      textType: params.textType,
      position: params.position,
      state: params.state,
      activeAttemptId: params.activeAttemptId,
      completedAt: params.completedAt,
      masteredAt: params.masteredAt,
      teacherOverrides: [...params.teacherOverrides],
    });
  }

  /** Consulta pura (sin mutación) — usada por Application Layer (CMD-07)
   * antes de decidir si invocar `unlock()` sobre la Unidad siguiente. */
  public isEligibleForUnlock(params: {
    isFirstInSequence: boolean;
    predecessorState: UnitState | null;
  }): boolean {
    return this.unlockPolicy.isEligible({
      currentState: this.props.state,
      isFirstInSequence: params.isFirstInSequence,
      predecessorState: params.predecessorState,
    });
  }

  /** RN-6/RN-7 — desbloquea la Unidad (`LOCKED` -> `UNLOCKED`). Vuelve a
   * invocar `UnlockPolicy` internamente (H-02) como verificación
   * defensiva, aun cuando Application Layer ya llamó a
   * `isEligibleForUnlock()` antes de decidir invocar este método. */
  public unlock(params: {
    isFirstInSequence: boolean;
    predecessorState: UnitState | null;
  }): void {
    this.unlockPolicy.assertEligible(this.id.value, {
      currentState: this.props.state,
      isFirstInSequence: params.isFirstInSequence,
      predecessorState: params.predecessorState,
    });
    this.props.state = UnitState.UNLOCKED;
    this.addDomainEvent(
      new UnitUnlockedEvent(this.id.value, {
        studentId: this.props.studentId.value,
        unitId: this.id.value,
      }),
    );
  }

  /** CMD-01 StartUnit — `UNLOCKED` -> `IN_PROGRESS`, tras crear el primer
   * `Attempt` (Sección 9: "UnitStarted, creación de Attempt, paso
   * CONTEXTUALIZE"). */
  public startAttempt(attemptId: AttemptId): void {
    if (this.props.state !== UnitState.UNLOCKED) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.IN_PROGRESS,
      );
    }
    if (this.props.activeAttemptId !== null) {
      throw new AttemptAlreadyActiveException(this.id.value);
    }
    this.props.state = UnitState.IN_PROGRESS;
    this.props.activeAttemptId = attemptId;
    this.addDomainEvent(
      new UnitStartedEvent(this.id.value, {
        studentId: this.props.studentId.value,
        unitId: this.id.value,
        attemptId: attemptId.value,
      }),
    );
  }

  /** Regla de consistencia eventual 8.1 — sincroniza `UnitState` con la
   * posición macro alcanzada por el `Attempt` activo (`IN_PROGRESS` ->
   * `AWAITING_FEEDBACK` -> `REVISION` -> `REFLECTION`), aplicada por
   * Application Layer vía los manejadores de evento correspondientes
   * (`ProductionSubmitted`, `FeedbackDelivered`, `ReflectionStarted`).
   * Nunca es invocada directamente por el estudiante — no expone ningún
   * Command propio, solo estas transiciones internas. */
  public advanceToAwaitingFeedback(): void {
    if (this.props.state !== UnitState.IN_PROGRESS) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.AWAITING_FEEDBACK,
      );
    }
    this.props.state = UnitState.AWAITING_FEEDBACK;
  }

  public advanceToRevision(): void {
    if (this.props.state !== UnitState.AWAITING_FEEDBACK) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.REVISION,
      );
    }
    this.props.state = UnitState.REVISION;
  }

  public returnToAwaitingFeedback(): void {
    if (this.props.state !== UnitState.REVISION) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.AWAITING_FEEDBACK,
      );
    }
    this.props.state = UnitState.AWAITING_FEEDBACK;
  }

  public advanceToReflectionPhase(): void {
    if (this.props.state !== UnitState.REVISION) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.REFLECTION,
      );
    }
    this.props.state = UnitState.REFLECTION;
  }

  /** CMD-07 CompleteReflection (transacción 2, manejador de
   * `ReflectionCompleted`) — `REFLECTION` -> `COMPLETED`, y evalúa RN-10
   * (`CompletionPolicy`) para decidir si emite
   * `ExternalActivityCompletedEvent` (A-08, único contrato con Mi Plan). */
  public completeFromAttempt(params: {
    attemptId: AttemptId;
    linkedMiPlanTaskId: string | null;
  }): void {
    if (this.props.state !== UnitState.REFLECTION) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.COMPLETED,
      );
    }
    this.props.state = UnitState.COMPLETED;
    this.props.completedAt = new Date();
    this.addDomainEvent(
      new UnitCompletedEvent(this.id.value, {
        studentId: this.props.studentId.value,
        unitId: this.id.value,
        attemptId: params.attemptId.value,
      }),
    );

    if (this.completionPolicy.shouldEmitExternalActivityCompleted(params.linkedMiPlanTaskId !== null)) {
      this.addDomainEvent(
        new ExternalActivityCompletedEvent(this.id.value, {
          studentId: this.props.studentId.value,
          unitId: this.id.value,
          activityRef: params.linkedMiPlanTaskId as string,
        }),
      );
    }
  }

  /** Consulta pura — CMD-08 EvaluateMastery trata la no-elegibilidad como
   * no-op silencioso (Application Layer Spec v1.0), nunca como excepción. */
  public isEligibleForMastery(criterion: MasteryCriterion): boolean {
    return this.masteryPolicy.isEligible({
      currentState: this.props.state,
      criterionSatisfied: criterion.isSatisfied(),
    });
  }

  /** RN-8/RN-9 — `COMPLETED` -> `MASTERED` (invariante 3: nunca
   * retrocede). Solo se invoca tras confirmar `isEligibleForMastery()`. */
  public markAsMastered(): void {
    if (this.props.state !== UnitState.COMPLETED) {
      throw new InvalidUnitStateTransitionException(
        this.id.value,
        this.props.state,
        UnitState.MASTERED,
      );
    }
    this.props.state = UnitState.MASTERED;
    this.props.masteredAt = new Date();
    this.addDomainEvent(
      new UnitMasteredEvent(this.id.value, {
        studentId: this.props.studentId.value,
        unitId: this.id.value,
      }),
    );
  }

  /** CMD-09 RepeatUnit — RN-11/RN-12/H-03: `UnitState` **no cambia** (la
   * Unidad conserva `COMPLETED`/`MASTERED` como logro histórico); solo se
   * registra la intención de repetición y se emite `UnitRepeated`. La
   * creación del nuevo `Attempt` (paso `CONTEXTUALIZE`) es responsabilidad
   * de `AttemptFactory`, invocada por Application Layer tras esta
   * llamada. */
  public repeat(newAttemptId: AttemptId): void {
    this.repetitionPolicy.assertCanRepeat(this.id.value, { currentState: this.props.state });
    this.props.activeAttemptId = newAttemptId;
    this.addDomainEvent(
      new UnitRepeatedEvent(this.id.value, {
        studentId: this.props.studentId.value,
        unitId: this.id.value,
        newAttemptId: newAttemptId.value,
      }),
    );
  }

  /** CMD-10 ApplyTeacherOverride — RN-13, invariante 10 ("el Intento
   * activo, si existe, queda huérfano... un nuevo Attempt se crea
   * únicamente si el estudiante reinicia efectivamente la Unidad"). Este
   * método NUNCA toca el `Attempt` activo directamente — solo aplica el
   * efecto sobre el propio `UnitState` y registra el `TeacherOverride`.
   * `FORCE_RESTART` reutiliza el mismo efecto que `repeat()` cuando el
   * estado de origen es `COMPLETED`/`MASTERED`; si el origen es `LOCKED`,
   * simplemente desbloquea (Sección 9). */
  public applyTeacherOverride(override: TeacherOverride): void {
    this.teacherOverridePolicy.assertActionValidForState(
      this.id.value,
      this.props.state,
      override.action,
    );

    if (override.action === OverrideAction.FORCE_LOCK) {
      this.props.state = UnitState.LOCKED;
      this.props.activeAttemptId = null;
    } else {
      // FORCE_RESTART
      if (this.props.state === UnitState.LOCKED) {
        this.props.state = UnitState.UNLOCKED;
      }
      // Si el origen es COMPLETED/MASTERED, el estado permanece sin
      // cambio (H-03) — Application Layer invoca `repeat()` por
      // separado para registrar el nuevo Attempt, igual que CMD-09.
    }

    this.props.teacherOverrides.push(override);
    this.addDomainEvent(
      new TeacherOverrideAppliedEvent(this.id.value, {
        teacherId: override.teacherId,
        unitId: this.id.value,
        action: override.action,
        reason: override.reason,
      }),
    );
  }

  public get studentId(): StudentId {
    return this.props.studentId;
  }

  public get textType(): TextType {
    return this.props.textType;
  }

  public get position(): number {
    return this.props.position;
  }

  public get state(): UnitState {
    return this.props.state;
  }

  public get activeAttemptId(): AttemptId | null {
    return this.props.activeAttemptId;
  }

  public get completedAt(): Date | null {
    return this.props.completedAt;
  }

  public get masteredAt(): Date | null {
    return this.props.masteredAt;
  }

  public get teacherOverrides(): readonly TeacherOverride[] {
    return this.props.teacherOverrides;
  }
}
