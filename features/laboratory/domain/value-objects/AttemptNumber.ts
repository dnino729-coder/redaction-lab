export class AttemptNumber {
  private constructor(private readonly _value: number) {}

  public static create(value: number): AttemptNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`AttemptNumber: "${value}" debe ser un entero >= 1.`);
    }
    return new AttemptNumber(value);
  }

  public static first(): AttemptNumber {
    return new AttemptNumber(1);
  }

  public next(): AttemptNumber {
    return new AttemptNumber(this._value + 1);
  }

  public get value(): number {
    return this._value;
  }

  public equals(other: AttemptNumber): boolean {
    return this._value === other._value;
  }
}
