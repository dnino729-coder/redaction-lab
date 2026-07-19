import type { CreateLearningPlanRequestDto } from "../dto/LearningPlanDto";

// Command — intención de escritura ya validada sintácticamente (el
// Handler llama al validator antes de construir el Command; ver
// handlers/CreateLearningPlanHandler.ts). Espeja el Request DTO porque,
// para este caso de uso, no existe transformación adicional entre "lo que
// pide el cliente" y "lo que necesita el caso de uso" — mantenerlos como
// tipos distintos, aunque hoy tengan la misma forma, preserva la
// separación Command/DTO exigida por el encargo (el DTO es un contrato de
// transporte; el Command es la intención ya validada del caso de uso).
export class CreateLearningPlanCommand {
  private constructor(public readonly request: CreateLearningPlanRequestDto) {}

  public static fromRequest(request: CreateLearningPlanRequestDto): CreateLearningPlanCommand {
    return new CreateLearningPlanCommand(request);
  }
}
