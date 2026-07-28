// Value Object — número secuencial de Version dentro de un Attempt.
// Domain Model v1.1: estrictamente positivo, incremental, sin huecos,
// asignado por AttemptFactory/Attempt.addVersion en el orden de creación.
export class VersionNumber {
  private constructor(private readonly _value: number) {}

  public static create(value: number): VersionNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(
        `VersionNumber: el número de versión debe ser un entero >= 1 (recibido: ${value}).`,
      );
    }
    return new VersionNumber(value);
  }

  public static first(): VersionNumber {
    return new VersionNumber(1);
  }

  public next(): VersionNumber {
    return new VersionNumber(this._value + 1);
  }

  public get value(): number {
    return this._value;
  }

  public equals(other: VersionNumber): boolean {
    return this._value === other._value;
  }

  public isFirst(): boolean {
    return this._value === 1;
  }
}
