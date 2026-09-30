import type { GetUnitStepContentQuery } from "../queries/GetUnitStepContentQuery";
import type { UnitStepContentResponseDto } from "../dto/QueryDto";
import { validateGetUnitStepContentRequest } from "../validators/queryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// Academy Content v1 (Bloque 3A) — lectura de contenido editorial
// PUBLISHED de un step. Mismo patrón que `GetAcademyUnitDetailHandler`:
// `null` del Read Model = `unitId` inexistente o de otro estudiante ->
// 404 (H-01). Ausencia de contenido PUBLISHED para un slot que sí existe
// NO es un 404 ni un error: el Read Model ya devuelve `{ step, blocks: [] }`
// en ese caso, que este Handler propaga tal cual (200) — el fallback
// visual hacia el placeholder existente se decide en la UI, fuera de
// alcance de este bloque.
export class GetUnitStepContentHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: GetUnitStepContentQuery): Promise<UnitStepContentResponseDto> {
    const { request } = query;
    validateGetUnitStepContentRequest(request);
    const content = await this.readModelPort.getUnitStepContent(
      request.unitId,
      request.studentId,
      request.step,
      request.locale,
    );
    if (!content) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
    }
    return content;
  }
}
