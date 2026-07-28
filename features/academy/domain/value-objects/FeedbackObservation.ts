import { FeedbackCategory } from "../enums/FeedbackCategory";
import { FeedbackStrength } from "../enums/FeedbackStrength";

// Value Object (Domain Model v1.1, Sección 5) — una observación formativa
// dentro de una `Feedback`: categoría (una de las 10 `FeedbackCategory`),
// marca de fortaleza/debilidad (`FeedbackStrength`), explicación y
// sugerencia de mejora. Sin identidad propia — solo tiene sentido como
// parte del conjunto de observaciones de una `Feedback`.
export class FeedbackObservation {
  private constructor(
    private readonly _category: FeedbackCategory,
    private readonly _strength: FeedbackStrength,
    private readonly _explanation: string,
    private readonly _suggestion: string,
  ) {}

  public static create(params: {
    category: FeedbackCategory;
    strength: FeedbackStrength;
    explanation: string;
    suggestion: string;
  }): FeedbackObservation {
    const explanation = (params.explanation ?? "").trim();
    const suggestion = (params.suggestion ?? "").trim();
    if (explanation.length === 0) {
      throw new Error("FeedbackObservation: explanation no puede estar vacía.");
    }
    if (suggestion.length === 0) {
      throw new Error("FeedbackObservation: suggestion no puede estar vacía.");
    }
    return new FeedbackObservation(
      params.category,
      params.strength,
      explanation,
      suggestion,
    );
  }

  public get category(): FeedbackCategory {
    return this._category;
  }

  public get strength(): FeedbackStrength {
    return this._strength;
  }

  public get explanation(): string {
    return this._explanation;
  }

  public get suggestion(): string {
    return this._suggestion;
  }
}
