import type { AIProvider, AIProviderRequest, AIProviderResponse } from "@/services/ai";
import type { AcademyAIConfig } from "./AcademyAIConfig";

// Adaptador — implementa el contrato compartido `AIProvider` para OpenAI.
// Solo adaptación, mismo criterio que `ClaudeProvider`.
export class OpenAIProvider implements AIProvider {
  public readonly name = "openai" as const;

  constructor(private readonly config: AcademyAIConfig) {}

  public async generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse> {
    const response = await fetch(`${this.config.openAiEndpoint}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.openAiApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.openAiModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAIProvider: la API respondió ${response.status}.`);
    }

    const body = (await response.json()) as {
      choices: readonly { message: { content: string } }[];
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      content: body.choices[0]?.message.content ?? "",
      promptTokens: body.usage.prompt_tokens,
      completionTokens: body.usage.completion_tokens,
    };
  }
}
