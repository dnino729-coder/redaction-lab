import { describe, it, expect } from "vitest";
import { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { SessionDuration } from "@/features/my-plan/domain/value-objects/SessionDuration";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";
import { FIXTURE_IDS } from "./fixtures";

function buildSession(startedAt = new Date("2026-07-17T08:00:00Z")) {
  return StudySession.start({
    id: StudySessionId.create(FIXTURE_IDS.session),
    studentId: StudentId.create(FIXTURE_IDS.student),
    learningTaskId: LearningTaskId.create(FIXTURE_IDS.task),
    startedAt,
  });
}

describe("StudySession (13.4 — completed: BOOLEAN, no ENUM de 18.21)", () => {
  it("nace abierta: completed=false, finishedAt=null", () => {
    const session = buildSession();
    expect(session.completed).toBe(false);
    expect(session.finishedAt).toBeNull();
  });

  it("finish() cierra la sesión con duración válida", () => {
    const session = buildSession(new Date("2026-07-17T08:00:00Z"));
    const finishedAt = new Date("2026-07-17T08:30:00Z");
    session.finish(finishedAt, SessionDuration.create(30));

    expect(session.completed).toBe(true);
    expect(session.finishedAt).toEqual(finishedAt);
    expect(session.duration?.minutes).toBe(30);
  });

  it("rechaza finalizar dos veces la misma sesión", () => {
    const session = buildSession();
    session.finish(new Date("2026-07-17T08:30:00Z"), null);
    expect(() => session.finish(new Date("2026-07-17T09:00:00Z"), null)).toThrow(
      DomainInvariantViolationException,
    );
  });

  it("rechaza finished_at anterior a started_at", () => {
    const session = buildSession(new Date("2026-07-17T08:00:00Z"));
    expect(() => session.finish(new Date("2026-07-17T07:00:00Z"), null)).toThrow(
      DomainInvariantViolationException,
    );
  });

  it("SessionDuration rechaza minutos negativos (ck_study_session_duration_minutes)", () => {
    expect(() => SessionDuration.create(-1)).toThrow(DomainInvariantViolationException);
  });

  it("SessionDuration acepta 0 (NULL OR >= 0)", () => {
    expect(SessionDuration.create(0).minutes).toBe(0);
  });
});
