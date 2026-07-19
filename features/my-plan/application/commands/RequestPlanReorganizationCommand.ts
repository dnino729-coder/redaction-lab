import type { RequestPlanReorganizationRequestDto } from "../dto/PlanReorganizationDto";

export class RequestPlanReorganizationCommand {
  private constructor(public readonly request: RequestPlanReorganizationRequestDto) {}

  public static fromRequest(request: RequestPlanReorganizationRequestDto): RequestPlanReorganizationCommand {
    return new RequestPlanReorganizationCommand(request);
  }
}
