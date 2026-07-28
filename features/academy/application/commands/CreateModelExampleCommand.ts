import type { CreateModelExampleRequestDto } from "../dto/ModelExampleDto";

export class CreateModelExampleCommand {
  private constructor(public readonly request: CreateModelExampleRequestDto) {}

  public static fromRequest(request: CreateModelExampleRequestDto): CreateModelExampleCommand {
    return new CreateModelExampleCommand(request);
  }
}
