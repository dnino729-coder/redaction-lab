import type { AIProvider, AIProviderRequest, AIProviderResponse } from "@/services/ai";
import type { AcademyAIConfig } from "./AcademyAIConfig";

// Adaptador — implementa el contrato compartido `AIProvider` (services/ai/
// provider.interface.ts, sección 9.4) para Anthropic Claude. Solo
// adaptación (traduce `AIProviderRequest` a la forma HTTP del proveedor y
// la respuesta de vuelta a `AIProviderResponse`) — sin lógica pedagógica ni
// de negocio (esa vive en Application/Domain, no aquí).
export class ClaudeProvider implements AIProvider {
  public readonly name = "anthropic" as const;

  constructor(private readonly config: AcademyAIConfig) {}

  public async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    const systemMessage = request.messages.find((m) => m.role === "system")?.content;
    const otherMessages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await fetch(`${this.config.claudeEndpoint}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.config.claudeApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.claudeModel,
        system: systemMessage,
        messages: otherMessages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`ClaudeProvider: la API respondió ${response.status}.`);
    }

    const body = (await response.json()) as {
      content: readonly { type: string; text?: string }[];
      usage: { input_tokens: number; output_tokens: number };
    };
    const text = body.content.find((block) => block.type === "text")?.text ?? "";

    return {
      content: text,
      promptTokens: body.usage.input_tokens,
      completionTokens: body.usage.output_tokens,
    };
  }
}
