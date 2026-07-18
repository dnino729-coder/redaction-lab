import { AggregateRoot } from "../shared/AggregateRoot";
import { assertTransitionAllowed } from "../shared/statusTransitions";
import { LearningTaskId } from "../value-objects/LearningTaskId";
import { LearningPhaseId } from "../value-objects/LearningPhaseId";
import { StudentId } from "../value-objects/StudentId";
import { LearningTaskStatus } from "../enums/LearningTaskStatus";
import { LearningTaskSource } from "../enums/LearningTaskSource";
import { LearningTaskDifficulty } from "../enums/LearningTaskDifficulty";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";
import { assertCompletedAtInvariant } from "../shared/completedAtInvariant";
import { InvalidTaskSourceOperationException } from "../exceptions/InvalidTaskSourceOperationException";
import { PlanTaskCompletedEvent } from "../events/PlanTaskCompletedEvent";

interface LearningTaskProps {
  learningPhaseId: LearningPhaseId;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  difficulty: LearningTaskDifficulty;
  dueDate: Date | null;
  completedAt: Date | null;
  status: LearningTaskStatus;
  source: LearningTaskSource;
}

// Aggregate Root — 13.4 ("Tabla LearningTask") + extensión `source`
// (resolución 18.20.5). Es, junto con `LearningPlan`, la única entidad de
// este dominio que dispara uno de los 5 eventos oficiales
// (`PLAN_TASK_COMPLETED`, 18.20.10) — de ahí que extienda `AggregateRoot`
// en vez de `Entity`.
//
// Regla central (18.20.5 / 18.21, punto 2): una tarea `SELF_DIRECTED` se
// completa **exclusivamente** de forma manual (`complete()`); cualquier
// otro `source` se completa **exclusivamente** vía el evento externo
// (`completeFromExternalEvent()`) — ambas rutas son mutuamente
// excluyentes por diseño, nunca una alternativa de la otra para la misma
// tarea.
//
// `LearningTask` no tiene columna `student_id` propia en 13.4 (pertenece a
// `learning_phase_id` → `learning_plan_id` → `student_id`) — por eso
// `studentId` se recibe como parámetro en los métodos que lo necesitan
// (para construir el payload del evento) en vez de leerse de un campo
// interno inexistente; quien invoca estos métodos (capa de aplicación,
// fuera de este sprint) ya tiene ese contexto cargado.
export class LearningTask extends AggregateRoot<LearningTaskId> {
  private _title: string;
  private _description: string | null;
  private _estimatedMinutes: number;
  private _difficulty: LearningTaskDifficulty;
  private _dueDate: Date | null;
  private _completedAt: Date | null;
  private _status: LearningTaskStatus;
  private readonly _learningPhaseId: LearningPhaseId;
  private readonly _source: LearningTaskSource;

  private constructor(id: LearningTaskId, props: LearningTaskProps) {
    super(id);
    LearningTask.validateTitle(props.title);
    LearningTask.validateEstimatedMinutes(props.estimatedMinutes);
    assertCompletedAtInvariant("LearningTask", props.status, props.completedAt);

    this._learningPhaseId = props.learningPhaseId;
    this._title = props.title.trim();
    this._description = props.description;
    this._estimatedMinutes = props.estimatedMinutes;
    this._difficulty = props.difficulty;
    this._dueDate = props.dueDate;
    this._completedAt = props.completedAt;
    this._status = props.status;
    this._source = props.source;
  }

  public static create(params: {
    id: LearningTaskId;
    learningPhaseId: LearningPhaseId;
    title: string;
    description?: string | null;
    estimatedMinutes: number;
    difficulty?: LearningTaskDifficulty;
    dueDate?: Date | null;
    source?: LearningTaskSource;
  }): LearningTask {
    return new LearningTask(params.id, {
      learningPhaseId: params.learningPhaseId,
      title: params.title,
      description: params.description ?? null,
      estimatedMinutes: params.estimatedMinutes,
      difficulty: params.difficulty ?? LearningTaskDifficulty.MEDIUM,
      dueDate: params.dueDate ?? null,
      completedAt: null,
      status: LearningTaskStatus.NOT_STARTED,
      // Prisma default también es SELF_DIRECTED (Sprint 3.3.1) — mismo
      // valor por defecto, definido aquí de forma independiente.
      source: params.source ?? LearningTaskSource.SELF_DIRECTED,
    });
  }

  public static restore(params: {
    id: LearningTaskId;
    learningPhaseId: LearningPhaseId;
    title: string;
    description: string | null;
    estimatedMinutes: number;
    difficulty: LearningTaskDifficulty;
    dueDate: Date | null;
    completedAt: Date | null;
    status: LearningTaskStatus;
    source: LearningTaskSource;
  }): LearningTask {
    return new LearningTask(params.id, params);
  }

  public get learningPhaseId(): LearningPhaseId {
    return this._learningPhaseId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | null {
    return this._description;
  }

  public get estimatedMinutes(): number {
    return this._estimatedMinutes;
  }

  public get difficulty(): LearningTaskDifficulty {
    return this._difficulty;
  }

  public get dueDate(): Date | null {
    return this._dueDate;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get status(): LearningTaskStatus {
    return this._status;
  }

  public get source(): LearningTaskSource {
    return this._source;
  }

  /** true si `source = SELF_DIRECTED` — única condición bajo la cual
   * `complete()`/`revert()` (manuales) están permitidos. */
  public get isManuallyCompletable(): boolean {
    return this._source === LearningTaskSource.SELF_DIRECTED;
  }

  public start(): void {
    assertTransitionAllowed("LearningTask", this._status, LearningTaskStatus.IN_PROGRESS);
    this._status = LearningTaskStatus.IN_PROGRESS;
  }

  /** Completa manualmente la tarea — únicamente válido si
   * `source = SELF_DIRECTED` (18.20.5). Emite `PLAN_TASK_COMPLETED`. */
  public complete(studentId: StudentId, completedAt: Date): void {
    if (!this.isManuallyCompletable) {
      throw new InvalidTaskSourceOperationException(
        `La tarea ${this.id.value} tiene source=${this._source}; no puede completarse manualmente — usar completeFromExternalEvent() (18.20.5).`,
      );
    }
    this.transitionToCompleted(studentId, completedAt);
  }

  /** Completa la tarea a partir del evento EXTERNAL_ACTIVITY_COMPLETED —
   * únicamente válido si `source != SELF_DIRECTED` (18.20.5). Emite
   * `PLAN_TASK_COMPLETED`. */
  public completeFromExternalEvent(studentId: StudentId, completedAt: Date): void {
    if (this.isManuallyCompletable) {
      throw new InvalidTaskSourceOperationException(
        `La tarea ${this.id.value} tiene source=SELF_DIRECTED; solo puede completarse manualmente mediante complete() (18.20.5).`,
      );
    }
    this.transitionToCompleted(studentId, completedAt);
  }

  /** Revierte una finalización accidental — 18.21: reversión únicamente
   * permitida en entidades de transición manual, es decir, solo si
   * `source = SELF_DIRECTED`. */
  public revert(): void {
    if (!this.isManuallyCompletable) {
      throw new InvalidTaskSourceOperationException(
        `La tarea ${this.id.value} tiene source=${this._source}; la reversión solo está permitida para source=SELF_DIRECTED (18.21).`,
      );
    }
    assertTransitionAllowed(
      "LearningTask",
      this._status,
      LearningTaskStatus.IN_PROGRESS,
      { allowReversionFromCompleted: true },
    );
    this._status = LearningTaskStatus.IN_PROGRESS;
    this._completedAt = null;
  }

  public cancel(): void {
    assertTransitionAllowed("LearningTask", this._status, LearningTaskStatus.CANCELLED);
    this._status = LearningTaskStatus.CANCELLED;
  }

  private transitionToCompleted(studentId: StudentId, completedAt: Date): void {
    assertTransitionAllowed("LearningTask", this._status, LearningTaskStatus.COMPLETED);
    this._status = LearningTaskStatus.COMPLETED;
    this._completedAt = completedAt;
    // occurredAt: se deja al valor por defecto del evento (instante de
    // construcción) — política única del dominio, ver events/DomainEvent.ts.
    this.addDomainEvent(
      new PlanTaskCompletedEvent({
        aggregateId: this.id.value,
        payload: {
          studentId: studentId.value,
          learningTaskId: this.id.value,
          source: this._source,
        },
      }),
    );
  }

  private static validateTitle(title: string): void {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new DomainInvariantViolationException("LearningTask.title no puede estar vacío.");
    }
  }

  private static validateEstimatedMinutes(estimatedMinutes: number): void {
    if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) {
      throw new DomainInvariantViolationException(
        `LearningTask.estimated_minutes debe ser un entero > 0 (recibido: ${estimatedMinutes}).`,
      );
    }
  }

}
