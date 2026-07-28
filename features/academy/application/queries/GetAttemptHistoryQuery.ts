import type { GetAttemptHistoryRequestDto } from "../dto/QueryDto";

export class GetAttemptHistoryQuery {
  private constructor(public readonly request: GetAttemptHistoryRequestDto) {}

  public static fromRequest(request: GetAttemptHistoryRequestDto): GetAttemptHistoryQuery {
    return new GetAttemptHistoryQuery(request);
  }
}
