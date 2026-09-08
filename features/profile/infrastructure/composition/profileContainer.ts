import { PrismaStudentProfileRepository } from "../persistence/repositories/PrismaStudentProfileRepository";
import { CryptoUuidGenerator } from "../adapters/CryptoUuidGenerator";
import { ConsoleLogger } from "../adapters/ConsoleLogger";

import { CompleteStudentOnboardingHandler } from "@/features/profile/application/handlers/CompleteStudentOnboardingHandler";

// Reutiliza el composition root ya existente de My Plan — único punto de
// todo el módulo Profile que conoce My Plan (ver comentario en
// CompleteStudentOnboardingHandler.ts). No se crea un segundo container de
// My Plan ni se duplica su wiring.
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";

export interface ProfileContainer {
  readonly repositories: {
    readonly studentProfile: PrismaStudentProfileRepository;
  };
  readonly ports: {
    readonly uuidGenerator: CryptoUuidGenerator;
    readonly logger: ConsoleLogger;
  };
  readonly handlers: {
    readonly completeStudentOnboarding: CompleteStudentOnboardingHandler;
  };
}

let cachedContainer: ProfileContainer | null = null;

export function createProfileContainer(): ProfileContainer {
  if (cachedContainer) return cachedContainer;

  const repositories = {
    studentProfile: new PrismaStudentProfileRepository(),
  };

  const ports = {
    uuidGenerator: new CryptoUuidGenerator(),
    logger: new ConsoleLogger(),
  };

  const myPlan = createMyPlanContainer();

  const handlers = {
    completeStudentOnboarding: new CompleteStudentOnboardingHandler(
      repositories.studentProfile,
      myPlan.repositories.learningPlan,
      myPlan.handlers.createLearningPlan,
      myPlan.handlers.generateInitialPlanStructure,
      ports.uuidGenerator,
      ports.logger,
    ),
  };

  cachedContainer = { repositories, ports, handlers };
  return cachedContainer;
}
