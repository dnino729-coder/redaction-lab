export class GuidedPrompt {
  private constructor(private readonly _value: string) {}

  public static create(value: string): GuidedPrompt {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("GuidedPrompt: la consigna no puede estar vacía.");
    }
    return new GuidedPrompt(trimmed);
  }

  public get value(): string {
    return this._value;
  }
}
