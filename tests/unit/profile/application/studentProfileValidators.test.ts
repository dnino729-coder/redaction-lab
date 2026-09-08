import { describe, it, expect } from "vitest";
import { validateCompleteStudentOnboardingRequest } from "@/features/profile/application/validators/studentProfileValidators";
import { ValidationException } from "@/features/profile/application/exceptions/ValidationException";
import type { CompleteStudentOnboardingRequestDto } from "@/features/profile/application/dto/CompleteStudentOnboardingDto";

const VALID_REQUEST: CompleteStudentOnboardingRequestDto = {
  studentId: "11111111-1111-4111-8111-111111111111",
  currentLevel: "A2",
  targetLevel: "B2",
  nativeLanguage: "Español",
  learningGoal: "Aprobar el DELF B2",
  daysPerWeek: 3,
  sessionsPerDay: 1,
  minutesPerSession: 30,
};

describe("validateCompleteStudentOnboardingRequest", () => {
  it("acepta un payload válido sin lanzar", () => {
    expect(() => validateCompleteStudentOnboardingRequest(VALID_REQUEST)).not.toThrow();
  });

  it("acepta un payload válido con recordatorio y fecha de examen futura", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    expect(() =>
      validateCompleteStudentOnboardingRequest({
        ...VALID_REQUEST,
        reminderHour: 19,
        reminderMinute: 30,
        targetExamDate: futureDate,
      }),
    ).not.toThrow();
  });

  it("rechaza currentLevel inválido", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, currentLevel: "Z9" }),
    ).toThrow(ValidationException);
  });

  it("rechaza targetLevel inválido", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, targetLevel: "" }),
    ).toThrow(ValidationException);
  });

  it("rechaza nativeLanguage vacío", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, nativeLanguage: "" }),
    ).toThrow(ValidationException);
  });

  it("rechaza learningGoal vacío", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, learningGoal: "   " }),
    ).toThrow(ValidationException);
  });

  it("rechaza targetExamDate con formato inválido", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({
        ...VALID_REQUEST,
        targetExamDate: "no-es-una-fecha",
      }),
    ).toThrow(ValidationException);
  });

  it("rechaza targetExamDate pasada", () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, targetExamDate: pastDate }),
    ).toThrow(ValidationException);
  });

  it("rechaza disponibilidad inválida (daysPerWeek fuera de rango)", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, daysPerWeek: 8 }),
    ).toThrow(ValidationException);
  });

  it("rechaza disponibilidad inválida (minutesPerSession no entero)", () => {
    expect(() =>
      validateCompleteStudentOnboardingRequest({ ...VALID_REQUEST, minutesPerSession: 30.5 }),
    ).toThrow(ValidationException);
  });
});
