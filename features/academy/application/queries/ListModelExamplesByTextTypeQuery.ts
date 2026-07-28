import type { ListModelExamplesByTextTypeRequestDto } from "../dto/QueryDto";

export class ListModelExamplesByTextTypeQuery {
  private constructor(public readonly request: ListModelExamplesByTextTypeRequestDto) {}

  public static fromRequest(request: ListModelExamplesByTextTypeRequestDto): ListModelExamplesByTextTypeQuery {
    return new ListModelExamplesByTextTypeQuery(request);
  }
}
