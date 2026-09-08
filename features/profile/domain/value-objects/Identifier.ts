import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Base compartida de los Value Object de identificador de Profile — mismo
// patrón que features/my-plan/domain/value-objects/Identifier.ts (copia
// propia del módulo, nunca importada de otra feature).
export abstract class Identifier<TBrand extends string> {
  protected abstract readonly brand: TBrand;
  public readonly value: string;

  protected constructor(value: string) {
    if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
      throw new DomainInvariantViolationException(
        `Identificador inválido: "${String(value)}" no es un UUID válido.`,
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
