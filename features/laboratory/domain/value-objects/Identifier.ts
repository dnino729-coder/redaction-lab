const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export abstract class Identifier<TBrand extends string> {
  private readonly _value: string;
  private readonly _brand!: TBrand;

  protected constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new Error(`${new.target.name}: el identificador no puede estar vacío.`);
    }
    if (!UUID_V4_REGEX.test(value)) {
      throw new Error(`${new.target.name}: "${value}" no es un UUID v4 válido.`);
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Identifier<TBrand> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof Identifier)) return false;
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
