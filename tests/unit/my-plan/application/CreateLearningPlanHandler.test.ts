import { describe, it, expect } from "vitest";
import { CreateLearningPlanHandler } from "@/features/my-plan/application/handlers/CreateLearningPlanHandler";
import { CreateLearningPlanCommand } from "@/features/my-plan/application/commands/CreateLearningPlanCommand";
import { DomainEventPublisher } from "@/features/my-plan/application/services/DomainEventPublisher";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeLearningPlanRepository,
  makeLearningGoalRepository,
  makeStudyScheduleRepository,
  makeUnitOfWork,
  makeUuidGenerator,
  makeEventBus,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function baseRequest() {
  return {
    studentId: APP_FIXTURE_IDS.student,
    name: "Preparación C1",
    targetLevel: "C1",
    startDate: "2026-07-18T00:00:00.000Z",
    initialGoals: [{ title: "Dominar el subjuntivo" }],
    studySchedule: { daysPerWeek: 5, sessionsPerDay: 1, minutesPerSession: 30 },
  };
}

function buildHandler() {
  const learningPlanRepository = makeLearningPlanRepository();
  const learningGoalRepository = makeLearningGoalRepository();
  const studyScheduleRepository = makeStudyScheduleRepository();
  const unitOfWork = makeUnitOfWork();
  const uuidGenerator = makeUuidGenerator([APP_FIXTURE_IDS.plan, APP_FIXTURE_IDS.goal, APP_FIXTURE_IDS.schedule]);
  const eventBus = makeEventBus();
  const logger = makeLogger();
  const domainEventPublisher = new DomainEventPublisher(eventBus as never);

  const handler = new CreateLearningPlanHandler(
    learningPlanRepository as never,
    learningGoalRepository as never,
    studyScheduleRepository as never,
    unitOfWork as never,
    uuidGenerator as never,
    domainEventPublisher,
    logger as never,
  );

  return { handler, learningPlanRepository, learningGoalRepository, studyScheduleRepository, unitOfWork, eventBus, logger };
}

describe("CreateLearningPlanHandler", () => {
  it("crea el plan, sus metas iniciales y su horario, y publica PLAN_CREATED tras el commit", async () => {
    const { handler, learningPlanRepository, learningGoalRepository, studyScheduleRepository, unitOfWork, eventBus } =
      buildHandler();

    const result = await handler.handle(CreateLearningPlanCommand.fromRequest(baseRequest()));

    expect(result.id).toBe(APP_FIXTURE_IDS.plan);
    expect(result.status).toBe("ACTIVE");
    expect(unitOfWork.execute).toHaveBeenCalledTimes(1);
    expect(learningPlanRepository.save).toHaveBeenCalledTimes(1);
    expect(learningGoalRepository.save).toHaveBeenCalledTimes(1);
    expect(studyScheduleRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = eventBus.publish.mock.calls[0]![0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("PLAN_CREATED");
  });

  it("rechaza con ConflictException si el estudiante ya tiene un plan activo (13.4 MUST)", async () => {
    const { handler, learningPlanRepository, unitOfWork, eventBus } = buildHandler();
    const existingPlan = LearningPlan.create({
      id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
      studentId: StudentId.create(APP_FIXTURE_IDS.student),
      name: "Plan previo",
      targetLevel: "B2" as never,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
    });
    learningPlanRepository.findActiveByStudentId.mockResolvedValueOnce(existingPlan);

    await expect(handler.handle(CreateLearningPlanCommand.fromRequest(baseRequest()))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(unitOfWork.execute).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("rechaza con ValidationException si initialGoals está vacío (validación sintáctica, no de dominio)", async () => {
    const { handler } = buildHandler();
    const request = { ...baseRequest(), initialGoals: [] };

    await expect(handler.handle(CreateLearningPlanCommand.fromRequest(request))).rejects.toBeInstanceOf(
      ValidationException,
    );
  });
});
