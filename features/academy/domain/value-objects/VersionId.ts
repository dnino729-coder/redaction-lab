import { Identifier } from "./Identifier";

// Identificador fuertemente tipado — Domain Model v1.1 / Persistence Layer
// v1.0 Sección 8 (mapeo 1:1 a columna `id UUID` en su tabla propietaria).
export class VersionId extends Identifier<"VersionId"> {
  public static create(value: string): VersionId {
    return new VersionId(value);
  }
}
