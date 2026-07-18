import { describe, it, expect } from "vitest";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { ReminderTime } from "@/features/my-plan/domain/value-objects/ReminderTime";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";
import { FIXTURE_IDS } from "./fixtures";

describe("StudySchedule — única fuente de verdad operativa (18.20.6)", () => {
  it("reschedule() reemplaza frecuencia y recordatorio (punto de entrada del Vacío 2)", () => {
    const schedule = StudySchedule.create({
      id: StudyScheduleId.create(FIXTURE_IDS.schedule),
      learningPlanId: LearningPlanId.create(FIXTURE_IDS.plan),
      frequency: StudyFrequency.create({ daysPerWeek: 3, sessionsPerDay: 1, minutesPerSession: 30 }),
    });

    const newFrequency = StudyFrequency.create({ daysPerWeek: 5, sessionsPerDay: 2, minutesPerSession: 20 });
    const newReminder = ReminderTime.create(19, 30);
    schedule.reschedule(newFrequency, newReminder);

    expect(schedule.frequency.weeklyMinutes).toBe(200);
    expect(schedule.reminderTime?.toString()).toBe("19:30");
  });
});

describe("StudyFrequency (Value Object)", () => {
  it("rechaza days_per_week fuera de 1-7", () => {
    expect(() =>
      StudyFrequency.create({ daysPerWeek: 8, sessionsPerDay: 1, minutesPerSession: 30 }),
    ).toThrow(DomainInvariantViolationException);
  });

  it("calcula weeklyMinutes correctamente", () => {
    const freq = StudyFrequency.create({ daysPerWeek: 5, sessionsPerDay: 2, minutesPerSession: 30 });
    expect(freq.weeklyMinutes).toBe(300);
  });
});

describe("ReminderTime (Value Object)", () => {
  it("rechaza hora fuera de 0-23", () => {
    expect(() => ReminderTime.create(24, 0)).toThrow(DomainInvariantViolationException);
  });

  it("formatea HH:mm con padding", () => {
    expect(ReminderTime.create(9, 5).toString()).toBe("09:05");
  });
});
