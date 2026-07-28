import type { GetAcademyUnitDetailQuery } from "../queries/GetAcademyUnitDetailQuery";
import type { AcademyUnitDetailResponseDto } from "../dto/AcademyUnitDto";
import { validateGetAcademyUnitDetailRequest } from "../validators/queryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-02 GetAcademyUnitDetail.
export class GetAcademyUnitDetailHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: GetAcademyUnitDetailQuery): Promise<AcademyUnitDetailResponseDto> {
    const { request } = query;
    validateGetAcademyUnitDetailRequest(request);
    // Sprint 6.3.2 (remediacion H-01): propaga studentId como filtro de
    // ownership -- una fila que exista pero no pertenezca a request.studentId
    // se recibe como null y se trata igual que "no existe" (404), abajo.
    const detail = await this.readModelPort.getUnitDetail(request.unitId, request.studentId);
    if (!detail) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
    }
    return detail;
  }
}
