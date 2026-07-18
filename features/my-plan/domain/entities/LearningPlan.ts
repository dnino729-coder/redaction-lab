import { AggregateRoot } from "../shared/AggregateRoot";
import { LearningPlanId } from "../value-objects/LearningPlanId";
import { StudentId } from "../value-objects/StudentId";
import { LearningPlanStatus } from "../enums/LearningPlanStatus";
import { CefrLevel } from "../enums/CefrLevel";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";
import { InvalidStatusTransitionException } from "../exceptions/InvalidStatusTransitionException";
import { PlanCreatedEvent } from "../events/PlanCreatedEvent";

interface LearningPlanProps {
  studentId: StudentId;
  name: string;
  description: string | null;
  targetLevel: CefrLevel;
  startDate: Date;
  endDate: Date | null;
  status: LearningPlanStatus;
}

// Aggregate Root — 13.4 ("Tabla LearningPlan"). Es, junto con
// `LearningTask`, la única entidad de este dominio que dispara uno de los
// 5 eventos oficiales (`PLAN_CREATED`, al crearse) — de ahí que extienda
// `AggregateRoot`.
//
// **Transiciones de estado — formalizadas en la resolución 18.22, punto 1**
// (previamente una inferencia del implementador, señalada por la
// auditoría DDD del Sprint 3.3.2 y cerrada sin cambios de comportamiento):
// `ACTIVE ⇄ PAUSED`; `ACTIVE|PAUSED → COMPLETED`; `ACTIVE|PAUSED →
// CANCELLED`; `COMPLETED`/`CANCELLED` terminales, sin excepción. El
// disparador de negocio de `pause()` (cuándo y por qué se pausa un plan)
// permanece explícitamente fuera de alcance — ver 18.22, punto 1.
export class LearningPlan extends AggregateRoot<LearningPlanId> {
  private _name: string;
  private _description: string | null;
  private _targetLevel: CefrLevel;
  private _startDate: Date;
  private _endDate: Date | null;
  private _status: LearningPlanStatus;
  private readonly _studentId: StudentId;

  private constructor(id: LearningPlanId, props: LearningPlanProps) {
    super(id);
    LearningPlan.validateName(props.name);
    LearningPlan.validateDateRange(props.startDate, props.endDate);

    this._studentId = props.studentId;
    this._name = props.name.trim();
    this._description = props.description;
    this._targetLevel = props.targetLevel;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._status = props.status;
  }

  /** Crea un plan nuevo — nace siempre ACTIVE (13.4/12.4: todo plan creado
   * por el flujo de onboarding/sucesión es, por definición, el plan activo
   * del estudiante en ese momento). Emite `PLAN_CREATED`. */
  public static create(params: {
    id: LearningPlanId;
    studentId: StudentId;
    name: string;
    description?: string | null;
    targetLevel: CefrLevel;
    startDate: Date;
    endDate?: Date | null;
  }): LearningPlan {
    const plan = new LearningPlan(params.id, {
      studentId: params.studentId,
      name: params.name,
      description: params.description ?? null,
      targetLevel: params.targetLevel,
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      status: LearningPlanStatus.ACTIVE,
    });

    plan.addDomainEvent(
      new PlanCreatedEvent({
        aggregateId: plan.id.value,
        payload: {
          studentId: params.studentId.value,
          learningPlanId: plan.id.value,
        },
      }),
    );

    return plan;
  }

  public static restore(params: {
    id: LearningPlanId;
    studentId: StudentId;
    name: string;
    description: string | null;
    targetLevel: CefrLevel;
    startDate: Date;
    endDate: Date | null;
    status: LearningPlanStatus;
  }): LearningPlan {
    return new LearningPlan(params.id, params);
  }

  public get studentId(): StudentId {
    return this._studentId;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get targetLevel(): CefrLevel {
    return this._targetLevel;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get status(): LearningPlanStatus {
    return this._status;
  }

  public get isActive(): boolean {
    return this._status === LearningPlanStatus.ACTIVE;
  }

  public pause(): void {
    this.assertPlanTransition(LearningPlanStatus.PAUSED, [LearningPlanStatus.ACTIVE]);
    this._status = LearningPlanStatus.PAUSED;
  }

  public resume(): void {
    this.assertPlanTransition(LearningPlanStatus.ACTIVE, [LearningPlanStatus.PAUSED]);
    this._status = LearningPlanStatus.ACTIVE;
  }

  /** Cierra el plan como completado — 18.20.4: en la práctica siempre
   * ocurre en la misma operación atómica que la creación del plan
   * sucesor, pero esa orquestación es responsabilidad de un servicio de
   * aplicación (fuera de alcance de este sprint); esta entidad solo
   * garantiza que su propia transición es válida. */
  public complete(endDate: Date): void {
    this.assertPlanTransition(LearningPlanStatus.COMPLETED, [
      LearningPlanStatus.ACTIVE,
      LearningPlanStatus.PAUSED,
    ]);
    LearningPlan.validateDateRange(this._startDate, endDate);
    this._status = LearningPlanStatus.COMPLETED;
    this._endDate = endDate;
  }

  public cancel(endDate: Date): void {
    this.assertPlanTransition(LearningPlanStatus.CANCELLED, [
      LearningPlanStatus.ACTIVE,
      LearningPlanStatus.PAUSED,
    ]);
    LearningPlan.validateDateRange(this._startDate, endDate);
    this._status = LearningPlanStatus.CANCELLED;
    this._endDate = endDate;
  }

  private assertPlanTransition(
    to: LearningPlanStatus,
    allowedFrom: readonly LearningPlanStatus[],
  ): void {
    if (!allowedFrom.includes(this._status)) {
      throw new InvalidStatusTransitionException("LearningPlan", this._status, to);
    }
  }

  private static validateName(name: string): void {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainInvariantViolationException("LearningPlan.name no puede estar vacío.");
    }
  }

  private static validateDateRange(startDate: Date, endDate: Date | null): void {
    if (endDate !== null && endDate.getTime() < startDate.getTime()) {
      throw new DomainInvariantViolationException(
        "LearningPlan.end_date no puede ser anterior a start_date.",
      );
    }
  }
}
