import type { RetireModelExampleRequestDto } from "../dto/ModelExampleDto";

export class RetireModelExampleCommand {
  private constructor(public readonly request: RetireModelExampleRequestDto) {}

  public static fromRequest(request: RetireModelExampleRequestDto): RetireModelExampleCommand {
    return new RetireModelExampleCommand(request);
  }
}
