// Academy Content v1 (Bloque 3A). Deliberadamente sin createdBy/createdAt/
// updatedAt/publishedAt/status/version/ids internos — mismo alcance mínimo
// que la respuesta HTTP real (ver features/academy/api/response-mappers/
// unitResponseMappers.ts, toUnitStepContentHttp).
import type { UnitStep } from "./enums";

export interface UnitContentBlockHttp {
  order: number;
  type: string;
  data: unknown;
}

export interface UnitStepContentHttp {
  step: UnitStep;
  blocks: UnitContentBlockHttp[];
}
