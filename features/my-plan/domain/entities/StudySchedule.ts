import { Entity } from "../shared/Entity";
import { StudyScheduleId } from "../value-objects/StudyScheduleId";
import { LearningPlanId } from "../value-objects/LearningPlanId";
import { StudyFrequency } from "../value-objects/StudyFrequency";
import { ReminderTime } from "../value-objects/ReminderTime";

interface StudyScheduleProps {
  learningPlanId: LearningPlanId;
  frequency: StudyFrequency;
  reminderTime: ReminderTime | null;
}

// Entidad — 13.4 ("Tabla StudySchedule"), relación 1:1 con `LearningPlan`.
// Sin campo `status` propio (13.4 no lo declara) — no es una unidad de
// trabajo con ciclo de vida, es configuración operativa. Es, por
// resolución 18.20.6, "la única fuente de verdad operativa de
// disponibilidad mientras el plan está activo" (`LearningPreference`,
// 13.2, solo la prellena una vez al crear el plan, sin sincronización
// posterior — esa copia unidireccional es responsabilidad de un servicio
// de aplicación, fuera de alcance de este sprint).
export class StudySchedule extends Entity<StudyScheduleId> {
  private _frequency: StudyFrequency;
  private _reminderTime: ReminderTime | null;
  private readonly _learningPlanId: LearningPlanId;

  private constructor(id: StudyScheduleId, props: StudyScheduleProps) {
    super(id);
    this._learningPlanId = props.learningPlanId;
    this._frequency = props.frequency;
    this._reminderTime = props.reminderTime;
  }

  public static create(params: {
    id: StudyScheduleId;
    learningPlanId: LearningPlanId;
    frequency: StudyFrequency;
    reminderTime?: ReminderTime | null;
  }): StudySchedule {
    return new StudySchedule(params.id, {
      learningPlanId: params.learningPlanId,
      frequency: params.frequency,
      reminderTime: params.reminderTime ?? null,
    });
  }

  public static restore(params: {
    id: StudyScheduleId;
    learningPlanId: LearningPlanId;
    frequency: StudyFrequency;
    reminderTime: ReminderTime | null;
  }): StudySchedule {
    return new StudySchedule(params.id, params);
  }

  public get learningPlanId(): LearningPlanId {
    return this._learningPlanId;
  }

  public get frequency(): StudyFrequency {
    return this._frequency;
  }

  public get reminderTime(): ReminderTime | null {
    return this._reminderTime;
  }

  /**
   * Reconfigura la disponibilidad — es el punto de entrada de dominio del
   * flujo de reprogramación (Vacío 2/18.20.2: "el estudiante modifica un
   * dato disparador ... vía StudySchedule"). Disparar la propuesta del
   * Learning Planner y la confirmación del estudiante son responsabilidad
   * del Servicio de reprogramación (aplicación, fuera de alcance).
   */
  public reschedule(newFrequency: StudyFrequency, newReminderTime: ReminderTime | null): void {
    this._frequency = newFrequency;
    this._reminderTime = newReminderTime;
  }
}
