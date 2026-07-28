import type { GetContinuationStateRequestDto } from "../dto/QueryDto";

export class GetContinuationStateQuery {
  private constructor(public readonly request: GetContinuationStateRequestDto) {}

  public static fromRequest(request: GetContinuationStateRequestDto): GetContinuationStateQuery {
    return new GetContinuationStateQuery(request);
  }
}
