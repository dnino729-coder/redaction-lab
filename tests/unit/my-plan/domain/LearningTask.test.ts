import { describe, it, expect } from "vitest";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskStatus } from "@/features/my-plan/domain/enums/LearningTaskStatus";
import { LearningTaskSource } from "@/features/my-plan/domain/enums/LearningTaskSource";
import { InvalidTaskSourceOperationException } from "@/features/my-plan/domain/exceptions/InvalidTaskSourceOperationException";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";
import { PlanTaskCompletedEvent } from "@/features/my-plan/domain/events/PlanTaskCompletedEvent";
import { FIXTURE_IDS } from "./fixtures";

function buildTask(source: LearningTaskSource = LearningTaskSource.SELF_DIRECTED) {
  return LearningTask.create({
    id: LearningTaskId.create(FIXTURE_IDS.task),
    learningPhaseId: LearningPhaseId.create(FIXTURE_IDS.phase),
    title: "Redactar un párrafo argumentativo",
    estimatedMinutes: 30,
    source,
  });
}

const studentId = StudentId.create(FIXTURE_IDS.student);

describe("LearningTask — regla de origen (18.20.5 / 18.21)", () => {
  it("SELF_DIRECTED: complete() manual funciona y emite PLAN_TASK_COMPLETED", () => {
    const task = buildTask(LearningTaskSource.SELF_DIRECTED);
    task.start();
    const now = new Date("2026-07-17T09:00:00Z");
    task.complete(studentId, now);

    expect(task.status).toBe(LearningTaskStatus.COMPLETED);
    expect(task.completedAt).toEqual(now);

    const events = task.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlanTaskCompletedEvent);
    const event = events[0] as PlanTaskCompletedEvent;
    expect(event.payload).toEqual({
      studentId: studentId.value,
      learningTaskId: task.id.value,
      source: LearningTaskSource.SELF_DIRECTED,
    });
  });

  it("SELF_DIRECTED: completeFromExternalEvent() está prohibido", () => {
    const task = buildTask(LearningTaskSource.SELF_DIRECTED);
    task.start();
    expect(() => task.completeFromExternalEvent(studentId, new Date())).toThrow(
      InvalidTaskSourceOperationException,
    );
  });

  it("ACADEMY: completeFromExternalEvent() funciona y emite PLAN_TASK_COMPLETED con el source correcto", () => {
    const task = buildTask(LearningTaskSource.ACADEMY);
    task.start();
    task.completeFromExternalEvent(studentId, new Date());

    expect(task.status).toBe(LearningTaskStatus.COMPLETED);
    const events = task.pullDomainEvents();
    expect((events[0] as PlanTaskCompletedEvent).payload.source).toBe(LearningTaskSource.ACADEMY);
  });

  it("ACADEMY: complete() manual está prohibido", () => {
    const task = buildTask(LearningTaskSource.ACADEMY);
    task.start();
    expect(() => task.complete(studentId, new Date())).toThrow(InvalidTaskSourceOperationException);
  });

  it("pullDomainEvents() vacía la cola tras leerla", () => {
    const task = buildTask();
    task.start();
    task.complete(studentId, new Date());
    expect(task.pullDomainEvents()).toHaveLength(1);
    expect(task.pullDomainEvents()).toHaveLength(0);
  });

  it("revert() solo está permitido para SELF_DIRECTED", () => {
    const academyTask = buildTask(LearningTaskSource.ACADEMY);
    academyTask.start();
    academyTask.completeFromExternalEvent(studentId, new Date());
    expect(() => academyTask.revert()).toThrow(InvalidTaskSourceOperationException);

    const selfTask = buildTask(LearningTaskSource.SELF_DIRECTED);
    selfTask.start();
    selfTask.complete(studentId, new Date());
    selfTask.revert();
    expect(selfTask.status).toBe(LearningTaskStatus.IN_PROGRESS);
    expect(selfTask.completedAt).toBeNull();
  });

  it("cancel() está permitido independientemente del source", () => {
    const task = buildTask(LearningTaskSource.LABORATORY);
    task.cancel();
    expect(task.status).toBe(LearningTaskStatus.CANCELLED);
  });

  it("CANCELLED es terminal incluso para completeFromExternalEvent()", () => {
    const task = buildTask(LearningTaskSource.SIMULATOR);
    task.cancel();
    expect(() => task.completeFromExternalEvent(studentId, new Date())).toThrow(
      InvalidStatusTransitionException,
    );
  });

  it("source por defecto es SELF_DIRECTED (mismo default que Prisma en Sprint 3.3.1)", () => {
    const task = LearningTask.create({
      id: LearningTaskId.create(FIXTURE_IDS.task2),
      learningPhaseId: LearningPhaseId.create(FIXTURE_IDS.phase),
      title: "Tarea sin source explícito",
      estimatedMinutes: 15,
    });
    expect(task.source).toBe(LearningTaskSource.SELF_DIRECTED);
    expect(task.isManuallyCompletable).toBe(true);
  });
});
