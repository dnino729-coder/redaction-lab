import { Entity } from "../shared/Entity";
import { assertTransitionAllowed } from "../shared/statusTransitions";
import { LearningObjectiveId } from "../value-objects/LearningObjectiveId";
import { LearningGoalId } from "../value-objects/LearningGoalId";
import { LearningObjectiveStatus } from "../enums/LearningObjectiveStatus";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";
import { assertCompletedAtInvariant } from "../shared/completedAtInvariant";

interface LearningObjectiveProps {
  learningGoalId: LearningGoalId;
  title: string;
  description: string | null;
  orderNumber: number;
  completedAt: Date | null;
  status: LearningObjectiveStatus;
}

// Entidad — 13.4 ("Tabla LearningObjective"). Siempre se completa
// manualmente por el estudiante: "no existe campo `source` para esta
// entidad ni ningún evento documentado que la complete automáticamente;
// es, por eliminación, la única de las 4 entidades sin vía automática"
// (18.21, punto 2). Es, junto con `LearningTask` (solo si
// `source = SELF_DIRECTED`), una de las dos únicas entidades de las 4 con
// reversión `COMPLETED → IN_PROGRESS` permitida.
export class LearningObjective extends Entity<LearningObjectiveId> {
  private _title: string;
  private _description: string | null;
  private _orderNumber: number;
  private _completedAt: Date | null;
  private _status: LearningObjectiveStatus;
  private readonly _learningGoalId: LearningGoalId;

  private constructor(id: LearningObjectiveId, props: LearningObjectiveProps) {
    super(id);
    LearningObjective.validateTitle(props.title);
    LearningObjective.validateOrderNumber(props.orderNumber);
    assertCompletedAtInvariant("LearningObjective", props.status, props.completedAt);

    this._learningGoalId = props.learningGoalId;
    this._title = props.title.trim();
    this._description = props.description;
    this._orderNumber = props.orderNumber;
    this._completedAt = props.completedAt;
    this._status = props.status;
  }

  /** Crea un objetivo nuevo — siempre nace en NOT_STARTED (13.4/18.21:
   * estado inicial de toda meta/objetivo/fase/tarea al crearse). */
  public static create(params: {
    id: LearningObjectiveId;
    learningGoalId: LearningGoalId;
    title: string;
    description?: string | null;
    orderNumber: number;
  }): LearningObjective {
    return new LearningObjective(params.id, {
      learningGoalId: params.learningGoalId,
      title: params.title,
      description: params.description ?? null,
      orderNumber: params.orderNumber,
      completedAt: null,
      status: LearningObjectiveStatus.NOT_STARTED,
    });
  }

  /** Reconstruye un objetivo ya persistido — no dispara ninguna
   * validación de transición (los datos ya son válidos por construcción
   * previa), solo revalida invariantes estructurales. */
  public static restore(params: {
    id: LearningObjectiveId;
    learningGoalId: LearningGoalId;
    title: string;
    description: string | null;
    orderNumber: number;
    completedAt: Date | null;
    status: LearningObjectiveStatus;
  }): LearningObjective {
    return new LearningObjective(params.id, params);
  }

  public get learningGoalId(): LearningGoalId {
    return this._learningGoalId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | null {
    return this._description;
  }

  public get orderNumber(): number {
    return this._orderNumber;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get status(): LearningObjectiveStatus {
    return this._status;
  }

  public start(): void {
    assertTransitionAllowed("LearningObjective", this._status, LearningObjectiveStatus.IN_PROGRESS);
    this._status = LearningObjectiveStatus.IN_PROGRESS;
  }

  /** Completa manualmente el objetivo (18.21: "LearningObjective.status se
   * actualiza siempre manualmente"). `completedAt` siempre lo asigna el
   * servidor en el instante de la transición, nunca un valor externo
   * (18.21, punto 2). */
  public complete(completedAt: Date): void {
    assertTransitionAllowed("LearningObjective", this._status, LearningObjectiveStatus.COMPLETED);
    this._status = LearningObjectiveStatus.COMPLETED;
    this._completedAt = completedAt;
  }

  /** Revierte una finalización accidental (18.21: reversión permitida en
   * entidades de transición manual). Limpia `completed_at` en la misma
   * operación, preservando el invariante status/completed_at. */
  public revert(): void {
    assertTransitionAllowed(
      "LearningObjective",
      this._status,
      LearningObjectiveStatus.IN_PROGRESS,
      { allowReversionFromCompleted: true },
    );
    this._status = LearningObjectiveStatus.IN_PROGRESS;
    this._completedAt = null;
  }

  public cancel(): void {
    assertTransitionAllowed("LearningObjective", this._status, LearningObjectiveStatus.CANCELLED);
    this._status = LearningObjectiveStatus.CANCELLED;
  }

  private static validateTitle(title: string): void {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new DomainInvariantViolationException("LearningObjective.title no puede estar vacío.");
    }
  }

  private static validateOrderNumber(orderNumber: number): void {
    if (!Number.isInteger(orderNumber) || orderNumber < 0) {
      throw new DomainInvariantViolationException(
        `LearningObjective.order_number debe ser un entero >= 0 (recibido: ${orderNumber}).`,
      );
    }
  }

}
