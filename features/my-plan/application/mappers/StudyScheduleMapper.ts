import type { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import type { StudyScheduleResponseDto } from "../dto/StudyScheduleDto";

export class StudyScheduleMapper {
  public static toResponseDto(schedule: StudySchedule): StudyScheduleResponseDto {
    return {
      id: schedule.id.value,
      learningPlanId: schedule.learningPlanId.value,
      daysPerWeek: schedule.frequency.daysPerWeek,
      sessionsPerDay: schedule.frequency.sessionsPerDay,
      minutesPerSession: schedule.frequency.minutesPerSession,
      reminderHour: schedule.reminderTime ? schedule.reminderTime.hour : null,
      reminderMinute: schedule.reminderTime ? schedule.reminderTime.minute : null,
    };
  }
}
