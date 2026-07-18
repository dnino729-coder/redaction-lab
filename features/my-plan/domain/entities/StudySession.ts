import { Entity } from "../shared/Entity";
import { StudySessionId } from "../value-objects/StudySessionId";
import { StudentId } from "../value-objects/StudentId";
import { LearningTaskId } from "../value-objects/LearningTaskId";
import { SessionDuration } from "../value-objects/SessionDuration";
import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

interface StudySessionProps {
  studentId: StudentId;
  learningTaskId: LearningTaskId;
  startedAt: Date;
  finishedAt: Date | null;
  duration: SessionDuration | null;
  completed: boolean;
}

// Entidad — 13.4 ("Tabla StudySession"). Nótese que usa un campo
// `completed: boolean` (literal de 13.4: "completed (BOOLEAN)"), no uno de
// los 4 ENUM de estado de 18.21 — esa resolución aplica explícitamente
// solo a `LearningGoal`/`LearningObjective`/`LearningPhase`/`LearningTask`,
// nunca a `StudySession`, cuyo campo de finalización ya existía en 13.4
// como booleano desde antes de 18.21.
//
// No dispara ningún Domain Event propio: `PLAN_TASK_COMPLETED` lo emite
// `LearningTask` al completarse (18.20.10), no cada `StudySession`
// individual que contribuye a esa finalización — por eso extiende
// `Entity`, no `AggregateRoot`.
export class StudySession extends Entity<StudySessionId> {
  private _finishedAt: Date | null;
  private _duration: SessionDuration | null;
  private _completed: boolean;
  private readonly _studentId: StudentId;
  private readonly _learningTaskId: LearningTaskId;
  private readonly _startedAt: Date;

  private constructor(id: StudySessionId, props: StudySessionProps) {
    super(id);
    StudySession.validateTemporalConsistency(props.startedAt, props.finishedAt);
    StudySession.validateCompletionConsistency(props.completed, props.finishedAt);

    this._studentId = props.studentId;
    this._learningTaskId = props.learningTaskId;
    this._startedAt = props.startedAt;
    this._finishedAt = props.finishedAt;
    this._duration = props.duration;
    this._completed = props.completed;
  }

  /** Inicia una nueva sesión de estudio — nace siempre abierta
   * (`finishedAt = null`, `completed = false`). */
  public static start(params: {
    id: StudySessionId;
    studentId: StudentId;
    learningTaskId: LearningTaskId;
    startedAt: Date;
  }): StudySession {
    return new StudySession(params.id, {
      studentId: params.studentId,
      learningTaskId: params.learningTaskId,
      startedAt: params.startedAt,
      finishedAt: null,
      duration: null,
      completed: false,
    });
  }

  public static restore(params: {
    id: StudySessionId;
    studentId: StudentId;
    learningTaskId: LearningTaskId;
    startedAt: Date;
    finishedAt: Date | null;
    duration: SessionDuration | null;
    completed: boolean;
  }): StudySession {
    return new StudySession(params.id, params);
  }

  public get studentId(): StudentId {
    return this._studentId;
  }

  public get learningTaskId(): LearningTaskId {
    return this._learningTaskId;
  }

  public get startedAt(): Date {
    return this._startedAt;
  }

  public get finishedAt(): Date | null {
    return this._finishedAt;
  }

  public get duration(): SessionDuration | null {
    return this._duration;
  }

  public get completed(): boolean {
    return this._completed;
  }

  /** Cierra la sesión — el umbral de inactividad (18.20.3) solo cuenta
   * sesiones con `completed = true` (`StudySession.completed = true` en
   * ninguna tarea del plan activo"). */
  public finish(finishedAt: Date, duration: SessionDuration | null): void {
    if (this._completed) {
      throw new DomainInvariantViolationException(
        `La StudySession ${this.id.value} ya está finalizada (completed = true); no puede finalizarse de nuevo.`,
      );
    }
    StudySession.validateTemporalConsistency(this._startedAt, finishedAt);

    this._finishedAt = finishedAt;
    this._duration = duration;
    this._completed = true;
  }

  private static validateTemporalConsistency(startedAt: Date, finishedAt: Date | null): void {
    if (finishedAt !== null && finishedAt.getTime() < startedAt.getTime()) {
      throw new DomainInvariantViolationException(
        "StudySession.finished_at no puede ser anterior a started_at.",
      );
    }
  }

  private static validateCompletionConsistency(completed: boolean, finishedAt: Date | null): void {
    if (completed && finishedAt === null) {
      throw new DomainInvariantViolationException(
        "StudySession: completed = true exige finished_at no nulo.",
      );
    }
  }
}
