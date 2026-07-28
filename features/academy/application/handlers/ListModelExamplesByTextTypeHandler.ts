import type { ListModelExamplesByTextTypeQuery } from "../queries/ListModelExamplesByTextTypeQuery";
import type { ModelExampleResponseDto } from "../dto/ModelExampleDto";
import { validateListModelExamplesByTextTypeRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";

// QRY-06 ListModelExamplesByTextType — filtra únicamente `status: ACTIVE`
// (los retirados vía CMD-14 quedan excluidos de esta proyección).
export class ListModelExamplesByTextTypeHandler {
  constructor(private readonly readModelPort: AcademyReadModelPort) {}

  public async handle(query: ListModelExamplesByTextTypeQuery): Promise<ModelExampleResponseDto[]> {
    const { request } = query;
    validateListModelExamplesByTextTypeRequest(request);
    return this.readModelPort.listModelExamplesByTextType(request.textType);
  }
}
