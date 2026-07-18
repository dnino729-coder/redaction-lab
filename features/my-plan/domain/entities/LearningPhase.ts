import { Entity } from "../shared/Entity";
import { assertTransitionAllowed } from "../shared/statusTransitions";
import { AutoCompletionStatusCalculator } from "../services/AutoCompletionStatusCalculator";
import { LearningPhaseId } from "../value-objects/LearningPhaseId";
import { LearningPlanId } from "../value-objects/LearningPlanId";
import { LearningPhaseStatus } from "../enums/LearningPhaseStatus";
import type { LearningTaskStatus } from "../enums/LearningTaskStatus";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";
import { assertCompletedAtInvariant } from "../shared/completedAtInvariant";

interface LearningPhaseProps {
  learningPlanId: LearningPlanId;
  name: string;
  phaseOrder: number;
  startDate: Date;
  endDate: Date | null;
  completedAt: Date | null;
  status: LearningPhaseStatus;
}

// Entidad — 13.4 ("Tabla LearningPhase"). Misma filosofía que
// `LearningGoal`: `status` se calcula automáticamente a partir de sus
// `LearningTask` hijas (18.21, punto 2). `cancel()` sí es una operación
// explícita permitida — ver entities/LearningGoal.ts y resolución 18.22,
// punto 2, para la formalización completa.
export class LearningPhase extends Entity<LearningPhaseId> {
  private _name: string;
  private _phaseOrder: number;
  private _startDate: Date;
  private _endDate: Date | null;
  private _completedAt: Date | null;
  private _status: LearningPhaseStatus;
  private readonly _learningPlanId: LearningPlanId;

  private constructor(id: LearningPhaseId, props: LearningPhaseProps) {
    super(id);
    LearningPhase.validateName(props.name);
    LearningPhase.validatePhaseOrder(props.phaseOrder);
    LearningPhase.validateDateRange(props.startDate, props.endDate);
    assertCompletedAtInvariant("LearningPhase", props.status, props.completedAt);

    this._learningPlanId = props.learningPlanId;
    this._name = props.name.trim();
    this._phaseOrder = props.phaseOrder;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._completedAt = props.completedAt;
    this._status = props.status;
  }

  public static create(params: {
    id: LearningPhaseId;
    learningPlanId: LearningPlanId;
    name: string;
    phaseOrder: number;
    startDate: Date;
    endDate?: Date | null;
  }): LearningPhase {
    return new LearningPhase(params.id, {
      learningPlanId: params.learningPlanId,
      name: params.name,
      phaseOrder: params.phaseOrder,
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      completedAt: null,
      status: LearningPhaseStatus.NOT_STARTED,
    });
  }

  public static restore(params: {
    id: LearningPhaseId;
    learningPlanId: LearningPlanId;
    name: string;
    phaseOrder: number;
    startDate: Date;
    endDate: Date | null;
    completedAt: Date | null;
    status: LearningPhaseStatus;
  }): LearningPhase {
    return new LearningPhase(params.id, params);
  }

  public get learningPlanId(): LearningPlanId {
    return this._learningPlanId;
  }

  public get name(): string {
    return this._name;
  }

  public get phaseOrder(): number {
    return this._phaseOrder;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get status(): LearningPhaseStatus {
    return this._status;
  }

  /** Recalcula `status` a partir de los `status` actuales de sus
   * `LearningTask` hijas (18.21, punto 2). Ver LearningGoal.recalculateStatus
   * para la misma lógica aplicada a la rama Goal→Objective. */
  public recalculateStatus(taskStatuses: readonly LearningTaskStatus[], now: Date): void {
    if (this._status === LearningPhaseStatus.CANCELLED) {
      return;
    }

    const calculated = AutoCompletionStatusCalculator.calculate(taskStatuses);
    if (calculated === this._status) return;

    this._status = calculated;
    this._completedAt = calculated === LearningPhaseStatus.COMPLETED ? now : null;
  }

  public cancel(): void {
    assertTransitionAllowed("LearningPhase", this._status, LearningPhaseStatus.CANCELLED);
    this._status = LearningPhaseStatus.CANCELLED;
  }

  private static validateName(name: string): void {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainInvariantViolationException("LearningPhase.name no puede estar vacío.");
    }
  }

  private static validatePhaseOrder(phaseOrder: number): void {
    if (!Number.isInteger(phaseOrder) || phaseOrder < 0) {
      throw new DomainInvariantViolationException(
        `LearningPhase.phase_order debe ser un entero >= 0 (recibido: ${phaseOrder}).`,
      );
    }
  }

  private static validateDateRange(startDate: Date, endDate: Date | null): void {
    if (endDate !== null && endDate.getTime() < startDate.getTime()) {
      throw new DomainInvariantViolationException(
        "LearningPhase.end_date no puede ser anterior a start_date.",
      );
    }
  }

}
