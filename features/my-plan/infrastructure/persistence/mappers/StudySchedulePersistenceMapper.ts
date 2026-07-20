import type { StudyScheduleModel } from "@prisma/client";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { ReminderTime } from "@/features/my-plan/domain/value-objects/ReminderTime";

// `reminder_time` es una columna Postgres `TIME` (`@db.Time`, 13.4) — el
// cliente Prisma la representa como `Date`, anclada a la fecha base
// 1970-01-01T00:00:00Z, donde solo la hora/minuto UTC son significativos
// (comportamiento documentado del conector Prisma/Postgres para `TIME`).
// Este mapper es la única frontera que conoce ese detalle de
// representación — ni el dominio (`ReminderTime`, hora/minuto puros) ni
// Application lo conocen.
const REMINDER_TIME_BASE_DATE = { year: 1970, monthIndex: 0, day: 1 } as const;

function reminderTimeFromColumn(value: Date | null): ReminderTime | null {
  if (value === null) return null;
  return ReminderTime.create(value.getUTCHours(), value.getUTCMinutes());
}

function reminderTimeToColumn(value: ReminderTime | null): Date | null {
  if (value === null) return null;
  return new Date(
    Date.UTC(
      REMINDER_TIME_BASE_DATE.year,
      REMINDER_TIME_BASE_DATE.monthIndex,
      REMINDER_TIME_BASE_DATE.day,
      value.hour,
      value.minute,
      0,
    ),
  );
}

export class StudySchedulePersistenceMapper {
  public static toDomain(row: StudyScheduleModel): StudySchedule {
    return StudySchedule.restore({
      id: StudyScheduleId.create(row.id),
      learningPlanId: LearningPlanId.create(row.learningPlanId),
      frequency: StudyFrequency.create({
        daysPerWeek: row.daysPerWeek,
        sessionsPerDay: row.sessionsPerDay,
        minutesPerSession: row.minutesPerSession,
      }),
      reminderTime: reminderTimeFromColumn(row.reminderTime),
    });
  }

  public static toPersistenceData(schedule: StudySchedule): StudyScheduleModel {
    return {
      id: schedule.id.value,
      learningPlanId: schedule.learningPlanId.value,
      daysPerWeek: schedule.frequency.daysPerWeek,
      sessionsPerDay: schedule.frequency.sessionsPerDay,
      minutesPerSession: schedule.frequency.minutesPerSession,
      reminderTime: reminderTimeToColumn(schedule.reminderTime),
    };
  }
}
