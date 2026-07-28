import type { GetContinuationStateQuery } from "../queries/GetContinuationStateQuery";
import type { ContinuationStateResponseDto } from "../dto/QueryDto";
import { validateGetContinuationStateRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-03 GetContinuationState (A-06, "Continúa donde te quedaste") —
// retorna `null` si no hay ningún Attempt activo (caso válido, no error).
export class GetContinuationStateHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(
    query: GetContinuationStateQuery,
  ): Promise<ContinuationStateResponseDto | null> {
    const { request } = query;
    validateGetContinuationStateRequest(request);
    return this.readModelPort.getContinuationState(request.studentId);
  }
}
