import type { RecordFeedbackDeliveredRequestDto } from "../dto/FeedbackDto";

export class RecordFeedbackDeliveredCommand {
  private constructor(public readonly request: RecordFeedbackDeliveredRequestDto) {}

  public static fromRequest(request: RecordFeedbackDeliveredRequestDto): RecordFeedbackDeliveredCommand {
    return new RecordFeedbackDeliveredCommand(request);
  }
}
