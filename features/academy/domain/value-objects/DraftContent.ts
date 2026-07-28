// Value Object — contenido textual de un Draft/Version, junto con sus
// métricas derivadas (Domain Model v1.1, Sección 5: "Texto, conteo de
// palabras, conteo de caracteres"). Persistence Layer v1.0 §3.3: se
// descompone en `content`/`wordCount`/`characterCount` al persistirse.
export class DraftContent {
  private constructor(
    private readonly _text: string,
    private readonly _wordCount: number,
    private readonly _characterCount: number,
  ) {}

  public static create(rawText: string): DraftContent {
    const trimmed = (rawText ?? "").trim();
    if (trimmed.length === 0) {
      throw new Error(
        "DraftContent: el contenido no puede estar vacío tras normalizar espacios.",
      );
    }
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    return new DraftContent(trimmed, wordCount, trimmed.length);
  }

  /** Variante para `AutosaveDraft` (CMD-03): el contenido en curso puede
   * quedar vacío durante la edición — "el vaciado de un borrador en curso
   * no es un error" (Application Layer Spec v1.0, CMD-03). */
  public static createAllowingEmpty(rawText: string): DraftContent {
    const text = rawText ?? "";
    const wordCount = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
    return new DraftContent(text, wordCount, text.length);
  }

  public get text(): string {
    return this._text;
  }

  public get wordCount(): number {
    return this._wordCount;
  }

  public get characterCount(): number {
    return this._characterCount;
  }

  public equals(other: DraftContent): boolean {
    return this._text === other._text;
  }
}
