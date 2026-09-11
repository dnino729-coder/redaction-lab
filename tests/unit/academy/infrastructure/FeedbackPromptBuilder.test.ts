// FeedbackPromptBuilder — construcción del prompt y parseo de la
// respuesta cruda del proveedor de IA (Coach IA). Lógica pura, sin red:
// se prueba directamente, sin mockear Claude/OpenAI.
import { describe, it, expect } from "vitest";
import { FeedbackPromptBuilder } from "@/features/academy/infrastructure/ai/FeedbackPromptBuilder";
import { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";

const builder = new FeedbackPromptBuilder();

describe("FeedbackPromptBuilder.build()", () => {
  it("construye un mensaje system con instrucción de formato JSON y un mensaje user con el texto del estudiante y su textType", () => {
    const request = builder.build({ content: "Mon texte DELF B2.", textType: "ESSAY" });

    expect(request.messages).toHaveLength(2);
    expect(request.messages[0]?.role).toBe("system");
    expect(request.messages[0]?.content).toContain("JSON");
    expect(request.messages[1]?.role).toBe("user");
    expect(request.messages[1]?.content).toContain("ESSAY");
    expect(request.messages[1]?.content).toContain("Mon texte DELF B2.");
  });
});

describe("FeedbackPromptBuilder.parse() — respuesta del proveedor de IA", () => {
  it("parsea un array JSON válido de observaciones", () => {
    const raw = JSON.stringify([
      {
        category: FeedbackCategory.GRAMMAR,
        strength: "WEAKNESS",
        explanation: "Error de concordancia.",
        suggestion: "Revisar el género.",
      },
    ]);
    expect(builder.parse(raw)).toEqual([
      {
        category: "GRAMMAR",
        strength: "WEAKNESS",
        explanation: "Error de concordancia.",
        suggestion: "Revisar el género.",
      },
    ]);
  });

  it("extrae el array JSON aunque venga rodeado de texto adicional del modelo", () => {
    const raw = `Voici le résultat:\n${JSON.stringify([
      {
        category: "VOCABULARY",
        strength: "STRENGTH",
        explanation: "Buen léxico.",
        suggestion: "Mantenerlo.",
      },
    ])}\nMerci.`;
    expect(builder.parse(raw)).toHaveLength(1);
  });

  it("retorna un array vacío si la respuesta no contiene JSON", () => {
    expect(builder.parse("Lo siento, no puedo ayudar con eso.")).toEqual([]);
  });

  it("retorna un array vacío si el JSON no parsea (malformado)", () => {
    expect(builder.parse("[{ category: GRAMMAR, sin comillas }]")).toEqual([]);
  });

  it("retorna un array vacío si el JSON parsea pero no es un array", () => {
    expect(builder.parse('{"category": "GRAMMAR"}')).toEqual([]);
  });

  it("descarta entradas que no tengan los 4 campos requeridos con el tipo correcto", () => {
    const raw = JSON.stringify([
      { category: "GRAMMAR", strength: "WEAKNESS", explanation: "ok", suggestion: "ok" },
      { category: "GRAMMAR", strength: "INVALID_STRENGTH", explanation: "ok", suggestion: "ok" },
      { category: "GRAMMAR", strength: "WEAKNESS", explanation: "ok" }, // sin suggestion
    ]);
    expect(builder.parse(raw)).toHaveLength(1);
  });
});
