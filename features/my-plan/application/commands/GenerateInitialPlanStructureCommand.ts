import type { GenerateInitialPlanStructureRequestDto } from "../dto/GenerateInitialPlanStructureDto";

export class GenerateInitialPlanStructureCommand {
  private constructor(public readonly request: GenerateInitialPlanStructureRequestDto) {}

  public static fromRequest(
    request: GenerateInitialPlanStructureRequestDto,
  ): GenerateInitialPlanStructureCommand {
    return new GenerateInitialPlanStructureCommand(request);
  }
}
