import { Entity } from "../shared/Entity";
import { assertTransitionAllowed } from "../shared/statusTransitions";
import { AutoCompletionStatusCalculator } from "../services/AutoCompletionStatusCalculator";
import { LearningGoalId } from "../value-objects/LearningGoalId";
import { LearningPlanId } from "../value-objects/LearningPlanId";
import { LearningGoalStatus } from "../enums/LearningGoalStatus";
import { GoalPriority } from "../enums/GoalPriority";
import type { LearningObjectiveStatus } from "../enums/LearningObjectiveStatus";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";
import { assertCompletedAtInvariant } from "../shared/completedAtInvariant";

interface LearningGoalProps {
  learningPlanId: LearningPlanId;
  title: string;
  description: string | null;
  priority: GoalPriority;
  targetDate: Date | null;
  completedAt: Date | null;
  status: LearningGoalStatus;
}

// Entidad — 13.4 ("Tabla LearningGoal"). `status` se calcula
// automáticamente a partir de sus `LearningObjective` hijos (18.21, punto
// 2: "LearningGoal.status ... se calcula a partir de sus
// LearningObjective... COMPLETED cuando el 100% de sus objetivos no
// CANCELLED están en COMPLETED") — nunca expone `complete()`/`start()`
// manuales, solo `recalculateStatus()`.
//
// `cancel()` sí es una operación explícita permitida — formalizado en la
// resolución 18.22, punto 2 (previamente una inferencia del
// implementador, señalada por la auditoría DDD del Sprint 3.3.2 y cerrada
// sin cambios de comportamiento): CANCELLED es una decisión externa
// explícita (p. ej. una reprogramación, 18.20.2), de naturaleza distinta
// al cálculo de COMPLETED/IN_PROGRESS/NOT_STARTED — no contradice "nunca
// se editan manualmente" (18.21), que se refiere específicamente a ese
// cálculo de progreso, no a esta transición de ciclo de vida.
export class LearningGoal extends Entity<LearningGoalId> {
  private _title: string;
  private _description: string | null;
  private _priority: GoalPriority;
  private _targetDate: Date | null;
  private _completedAt: Date | null;
  private _status: LearningGoalStatus;
  private readonly _learningPlanId: LearningPlanId;

  private constructor(id: LearningGoalId, props: LearningGoalProps) {
    super(id);
    LearningGoal.validateTitle(props.title);
    assertCompletedAtInvariant("LearningGoal", props.status, props.completedAt);

    this._learningPlanId = props.learningPlanId;
    this._title = props.title.trim();
    this._description = props.description;
    this._priority = props.priority;
    this._targetDate = props.targetDate;
    this._completedAt = props.completedAt;
    this._status = props.status;
  }

  public static create(params: {
    id: LearningGoalId;
    learningPlanId: LearningPlanId;
    title: string;
    description?: string | null;
    priority?: GoalPriority;
    targetDate?: Date | null;
  }): LearningGoal {
    return new LearningGoal(params.id, {
      learningPlanId: params.learningPlanId,
      title: params.title,
      description: params.description ?? null,
      priority: params.priority ?? GoalPriority.MEDIUM,
      targetDate: params.targetDate ?? null,
      completedAt: null,
      status: LearningGoalStatus.NOT_STARTED,
    });
  }

  public static restore(params: {
    id: LearningGoalId;
    learningPlanId: LearningPlanId;
    title: string;
    description: string | null;
    priority: GoalPriority;
    targetDate: Date | null;
    completedAt: Date | null;
    status: LearningGoalStatus;
  }): LearningGoal {
    return new LearningGoal(params.id, params);
  }

  public get learningPlanId(): LearningPlanId {
    return this._learningPlanId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | null {
    return this._description;
  }

  public get priority(): GoalPriority {
    return this._priority;
  }

  public get targetDate(): Date | null {
    return this._targetDate;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get status(): LearningGoalStatus {
    return this._status;
  }

  /**
   * Recalcula `status` a partir de los `status` actuales de sus
   * `LearningObjective` hijos (18.21, punto 2). Es la única vía para que
   * esta entidad alcance COMPLETED/IN_PROGRESS — nunca se asigna
   * directamente. `completedAt` se asigna/limpia automáticamente en la
   * misma operación, preservando el invariante.
   */
  public recalculateStatus(objectiveStatuses: readonly LearningObjectiveStatus[], now: Date): void {
    if (this._status === LearningGoalStatus.CANCELLED) {
      // Estado terminal — 18.21: "cualquier transición desde CANCELLED"
      // está prohibida sin excepción, ni siquiera por recálculo.
      return;
    }

    const calculated = AutoCompletionStatusCalculator.calculate(objectiveStatuses);
    if (calculated === this._status) return;

    this._status = calculated;
    this._completedAt = calculated === LearningGoalStatus.COMPLETED ? now : null;
  }

  public cancel(): void {
    assertTransitionAllowed("LearningGoal", this._status, LearningGoalStatus.CANCELLED);
    this._status = LearningGoalStatus.CANCELLED;
  }

  private static validateTitle(title: string): void {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new DomainInvariantViolationException("LearningGoal.title no puede estar vacío.");
    }
  }

}
