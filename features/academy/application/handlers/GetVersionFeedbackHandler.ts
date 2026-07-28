import type { GetVersionFeedbackQuery } from "../queries/GetVersionFeedbackQuery";
import type { VersionFeedbackResponseDto } from "../dto/QueryDto";
import { validateGetVersionFeedbackRequest } from "../validators/queryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-05 GetVersionFeedback.
export class GetVersionFeedbackHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: GetVersionFeedbackQuery): Promise<VersionFeedbackResponseDto> {
    const { request } = query;
    validateGetVersionFeedbackRequest(request);
    // Sprint 6.3.2 (remediacion H-01): propaga studentId como filtro de
    // ownership.
    const result = await this.readModelPort.getVersionFeedback(
      request.attemptId,
      request.versionNumber,
      request.studentId,
    );
    if (!result) {
      throw new ResourceNotFoundException(
        "ACADEMY_NOT_FOUND_VERSION",
        "Version",
        `${request.attemptId}#${request.versionNumber}`,
      );
    }
    return result;
  }
}
