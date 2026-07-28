import type { UpdateModelExampleRequestDto } from "../dto/ModelExampleDto";

export class UpdateModelExampleCommand {
  private constructor(public readonly request: UpdateModelExampleRequestDto) {}

  public static fromRequest(request: UpdateModelExampleRequestDto): UpdateModelExampleCommand {
    return new UpdateModelExampleCommand(request);
  }
}
