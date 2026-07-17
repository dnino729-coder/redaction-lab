// Contrato de proveedor de IA (sección 9.4, resolución 18.1).
//
// Corrige el hallazgo 5 de la auditoría de infraestructura: la regla "el
// resto de la plataforma nunca deberá depender directamente de un proveedor
// específico" (sección 5.2) no tenía, hasta ahora, ningún límite expresado
// a nivel de tipos — solo existía como texto en el documento. Esta interfaz
// es ese límite: Coach Service, Feedback Engine, Evaluation Engine,
// Recommendation Engine, Learning Planner y Memory Engine (sección 9.4)
// deberán depender únicamente de `AIProvider`, nunca de un SDK concreto
// (OpenAI, Anthropic, Google) de forma directa.
//
// No contiene ninguna implementación (ni prompts, ni llamadas HTTP, ni
// lógica pedagógica) — es solo el contrato. Las implementaciones concretas
// (OpenAIProvider, AnthropicProvider) se añadirán al desarrollar el módulo
// de IA, junto con el propio AI Orchestrator que selecciona el proveedor
// activo (OpenAI y Anthropic activos; Gemini reservado — resolución 18.1).

export interface AIProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderRequest {
  messages: AIProviderMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIProviderResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Contrato que debe implementar cualquier proveedor de IA integrado a la
 * plataforma. El AI Orchestrator (sección 9.4) es el único componente
 * autorizado a instanciar/seleccionar una implementación concreta.
 */
export interface AIProvider {
  readonly name: "openai" | "anthropic" | "gemini";
  generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse>;
}
