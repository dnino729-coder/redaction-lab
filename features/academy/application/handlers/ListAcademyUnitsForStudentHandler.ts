import type { ListAcademyUnitsForStudentQuery } from "../queries/ListAcademyUnitsForStudentQuery";
import type { AcademyUnitListItemDto } from "../dto/QueryDto";
import { validateListAcademyUnitsForStudentRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-01 ListAcademyUnitsForStudent — lectura pura, exclusivamente vía
// `AcademyReadModelPort` (Application Layer Spec v1.0, Sección 8).
export class ListAcademyUnitsForStudentHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: ListAcademyUnitsForStudentQuery): Promise<AcademyUnitListItemDto[]> {
    const { request } = query;
    validateListAcademyUnitsForStudentRequest(request);
    return this.readModelPort.listUnitsForStudent(request.studentId, request.textType);
  }
}
