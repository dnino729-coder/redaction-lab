// Configuración del proveedor de IA de Academia — nombres de variable de
// entorno ya anticipados por el Infrastructure Model v1.1, Sección 9
// (proveedor concreto: PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA, heredado,
// no resuelto por este Sprint — se deja como parámetro de configuración,
// intercambiable en tiempo de despliegue sin reescribir código).
export interface AcademyAIConfig {
  readonly provider: "claude" | "openai";
  readonly claudeEndpoint: string;
  readonly claudeApiKey: string;
  readonly claudeModel: string;
  readonly openAiEndpoint: string;
  readonly openAiApiKey: string;
  readonly openAiModel: string;
  readonly feedbackTimeoutTargetMs: number;
  readonly feedbackTimeoutMaxMs: number;
  readonly feedbackRetryMaxAttempts: number;
}

export function loadAcademyAIConfig(env: NodeJS.ProcessEnv = process.env): AcademyAIConfig {
  return {
    provider: (env.ACADEMY_AI_PROVIDER as "claude" | "openai") ?? "claude",
    claudeEndpoint: env.ACADEMY_CLAUDE_ENDPOINT ?? "https://api.anthropic.com",
    claudeApiKey: env.ACADEMY_CLAUDE_API_KEY ?? "",
    claudeModel: env.ACADEMY_CLAUDE_MODEL ?? "claude-sonnet-5",
    openAiEndpoint: env.ACADEMY_OPENAI_ENDPOINT ?? "https://api.openai.com",
    openAiApiKey: env.ACADEMY_OPENAI_API_KEY ?? "",
    openAiModel: env.ACADEMY_OPENAI_MODEL ?? "gpt-4.1",
    feedbackTimeoutTargetMs: Number(env.ACADEMY_FEEDBACK_TIMEOUT_TARGET_MS ?? 60_000),
    feedbackTimeoutMaxMs: Number(env.ACADEMY_FEEDBACK_TIMEOUT_MAX_MS ?? 180_000),
    feedbackRetryMaxAttempts: Number(env.ACADEMY_FEEDBACK_RETRY_MAX_ATTEMPTS ?? 3),
  };
}
