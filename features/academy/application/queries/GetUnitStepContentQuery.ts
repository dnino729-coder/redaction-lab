import type { GetUnitStepContentRequestDto } from "../dto/QueryDto";

// Academy Content v1 (Bloque 3A) — mismo patrón Query que el resto de
// Query Handlers de Academia (envoltorio inmutable del Request DTO ya
// validado por el Handler, nunca por este Query).
export class GetUnitStepContentQuery {
  private constructor(public readonly request: GetUnitStepContentRequestDto) {}

  public static fromRequest(request: GetUnitStepContentRequestDto): GetUnitStepContentQuery {
    return new GetUnitStepContentQuery(request);
  }
}
