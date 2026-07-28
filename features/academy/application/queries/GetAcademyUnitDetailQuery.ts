import type { GetAcademyUnitDetailRequestDto } from "../dto/QueryDto";

export class GetAcademyUnitDetailQuery {
  private constructor(public readonly request: GetAcademyUnitDetailRequestDto) {}

  public static fromRequest(request: GetAcademyUnitDetailRequestDto): GetAcademyUnitDetailQuery {
    return new GetAcademyUnitDetailQuery(request);
  }
}
