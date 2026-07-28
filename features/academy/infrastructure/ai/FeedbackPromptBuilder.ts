import type { AIProviderRequest, AIProviderMessage } from "@/services/ai";
import type { FeedbackObservationInputDto } from "@/features/academy/application/dto/FeedbackDto";
import { FEEDBACK_CATEGORY_PRIORITY } from "@/features/academy/domain/enums/FeedbackCategory";

// Adaptación pura — construye el `AIProviderRequest` para retroalimentación
// formativa y traduce la respuesta cruda del modelo al contrato
// `FeedbackObservationInputDto[]` que CMD-04 ya espera (Application Layer,
// Sprint 6.1). Formato exacto de prompt: PENDIENTE DE DECISIÓN DE
// INFRAESTRUCTURA (Infrastructure Model v1.1, Sección 6) — esta
// implementación fija una estructura mínima suficiente para producir una
// observación por cada una de las 10 `FeedbackCategory` aplicables, sin
// decidir el pendiente de forma irreversible (intercambiable sin tocar
// ningún otro archivo de este Sprint).
export class FeedbackPromptBuilder {
  public build(input: { content: string; textType: string }): AIProviderRequest {
    const categories = Object.keys(FEEDBACK_CATEGORY_PRIORITY).join(", ");
    const messages: AIProviderMessage[] = [
      {
        role: "system",
        content:
          "Eres un asistente de retroalimentación formativa para producción escrita DELF B2. " +
          `Responde EXCLUSIVAMENTE con un array JSON de observaciones, cada una con la forma ` +
          `{"category": una de [${categories}], "strength": "STRENGTH"|"WEAKNESS", "explanation": string, "suggestion": string}. ` +
          "Sin texto adicional fuera del JSON.",
      },
      {
        role: "user",
        content: `Tipo de texto: ${input.textType}.\n\nTexto del estudiante:\n${input.content}`,
      },
    ];
    return { messages, temperature: 0.3, maxTokens: 1024 };
  }

  public parse(rawContent: string): FeedbackObservationInputDto[] {
    const jsonText = this.extractJsonArray(rawContent);
    if (!jsonText) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is FeedbackObservationInputDto =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as Record<string, unknown>).category === "string" &&
          ((entry as Record<string, unknown>).strength === "STRENGTH" ||
            (entry as Record<string, unknown>).strength === "WEAKNESS") &&
          typeof (entry as Record<string, unknown>).explanation === "string" &&
          typeof (entry as Record<string, unknown>).suggestion === "string",
      )
      .map((entry) => ({
        category: entry.category,
        strength: entry.strength,
        explanation: entry.explanation,
        suggestion: entry.suggestion,
      }));
  }

  private extractJsonArray(text: string): string | null {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1 || end < start) return null;
    return text.slice(start, end + 1);
  }
}
