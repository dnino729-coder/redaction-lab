// Value Object — límites de extensión de una Unidad (Domain Model v1.1,
// Sección 5). Pertenece al vocabulario compartido de `WritingTask`
// (§13.5, fuera del Bounded Context Academia) — Persistence Layer v1.0
// Sección 8 confirma que Academia lo consume como conocimiento de
// dominio, sin persistirlo en sus propias tablas. Se declara aquí como
// copia local del mismo Value Object compartido, consistente con el
// aislamiento de bounded context ya establecido en este proyecto
// (ninguna feature importa directamente de otra).
export class WordCountRange {
  private constructor(
    private readonly _min: number,
    private readonly _max: number,
  ) {}

  public static create(min: number, max: number): WordCountRange {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0) {
      throw new Error(
        `WordCountRange: límites inválidos (min=${min}, max=${max}).`,
      );
    }
    if (max < min) {
      throw new Error(
        `WordCountRange: max (${max}) no puede ser menor que min (${min}).`,
      );
    }
    return new WordCountRange(min, max);
  }

  public get min(): number {
    return this._min;
  }

  public get max(): number {
    return this._max;
  }

  public isSatisfiedBy(wordCount: number): boolean {
    return wordCount >= this._min && wordCount <= this._max;
  }
}
