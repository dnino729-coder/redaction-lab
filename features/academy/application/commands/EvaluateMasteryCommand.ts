import type { EvaluateMasteryRequestDto } from "../dto/AcademyUnitDto";

export class EvaluateMasteryCommand {
  private constructor(public readonly request: EvaluateMasteryRequestDto) {}

  public static fromRequest(request: EvaluateMasteryRequestDto): EvaluateMasteryCommand {
    return new EvaluateMasteryCommand(request);
  }
}
