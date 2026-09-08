import { ApplicationException } from "./ApplicationException";

// Se lanza cuando el onboarding ya fue completado (StudentProfile +
// LearningPlan activo ya existen) — el estado "perfil sin plan" NO lanza
// esta excepción, se trata como recuperable (ver CompleteStudentOnboardingHandler).
export class ConflictException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}
