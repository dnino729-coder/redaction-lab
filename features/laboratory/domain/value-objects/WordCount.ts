// Se deriva siempre de un contenido — nunca se acepta como input
// independiente (invariante de dominio, FASE 2 punto 4).
export class WordCount {
  private constructor(private readonly _value: number) {}

  public static zero(): WordCount {
    return new WordCount(0);
  }

  public static fromContent(content: string): WordCount {
    const trimmed = content.trim();
    if (trimmed.length === 0) return new WordCount(0);
    return new WordCount(trimmed.split(/\s+/).length);
  }

  /** Rehidrata un valor ya derivado y persistido — nunca recalcula. */
  public static reconstitute(value: number): WordCount {
    return new WordCount(value);
  }

  public get value(): number {
    return this._value;
  }
}
