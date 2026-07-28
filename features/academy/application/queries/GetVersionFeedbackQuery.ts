import type { GetVersionFeedbackRequestDto } from "../dto/QueryDto";

export class GetVersionFeedbackQuery {
  private constructor(public readonly request: GetVersionFeedbackRequestDto) {}

  public static fromRequest(request: GetVersionFeedbackRequestDto): GetVersionFeedbackQuery {
    return new GetVersionFeedbackQuery(request);
  }
}
