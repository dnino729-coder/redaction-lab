import type { GetAttemptHistoryQuery } from "../queries/GetAttemptHistoryQuery";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { validateGetAttemptHistoryRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-04 GetAttemptHistory.
export class GetAttemptHistoryHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: GetAttemptHistoryQuery): Promise<AttemptSummaryResponseDto[]> {
    const { request } = query;
    validateGetAttemptHistoryRequest(request);
    // Sprint 6.3.2 (remediacion H-01): propaga studentId como filtro de
    // ownership.
    return this.readModelPort.listAttemptsByUnit(request.unitId, request.studentId);
  }
}
