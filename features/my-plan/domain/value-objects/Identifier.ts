import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Base compartida de los Value Object de identificador (`LearningPlanId`,
// `LearningGoalId`, etc.). 13.4 declara explícitamente que toda entidad
// usa `id (PK) ... @db.Uuid` — validar el formato UUID es, por tanto, un
// hecho de dominio ya documentado, no un detalle de Postgres/Prisma que se
// esté filtrando hacia el dominio.
//
// El campo `brand` (fijado por cada subclase) fuerza distinción nominal:
// dos identificadores con el mismo `value` pero de entidades distintas
// (p. ej. un `LearningTaskId` y un `LearningPhaseId` que compartieran UUID
// por coincidencia) nunca se consideran intercambiables por el compilador
// ni por `equals()`.
export abstract class Identifier<TBrand extends string> {
  protected abstract readonly brand: TBrand;
  public readonly value: string;

  protected constructor(value: string) {
    if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
      throw new DomainInvariantViolationException(
        `Identificador inválido: "${String(value)}" no es un UUID válido (13.4: toda entidad usa id UUID).`,
      );
    }
    this.value = value;
  }

  public equals(other: Identifier<TBrand> | null | undefined): boolean {
    if (!other) return false;
    return this.brand === other.brand && this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
