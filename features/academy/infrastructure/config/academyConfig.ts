// Configuración de Infrastructure de Academia — objeto plano, sin
// `@nestjs/config`/`registerAs` (el proyecto no usa NestJS, resolución de
// Sprint 6.0/6.2). Únicamente variables ya anticipadas por el
// Infrastructure Model v1.1, Sección 9 — no se inventan
// `ACADEMY_REDIS_*`/`ACADEMY_SMTP_*`/`ACADEMY_JWT_SECRET` (el encargo lo
// prohíbe explícitamente y ningún documento Frozen los exige: Academia no
// introduce autenticación, colas Redis ni SMTP propios).
export interface AcademyInfrastructureConfig {
  readonly ai: {
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
  };
  readonly events: {
    readonly outboxPollIntervalMs: number;
    readonly outboxMaxRetries: number;
  };
  readonly featureFlags: {
    readonly masteryEvaluationEnabled: boolean;
    readonly asyncFeedbackOnly: boolean;
  };
}

export function loadAcademyInfrastructureConfig(
  env: NodeJS.ProcessEnv = process.env,
): AcademyInfrastructureConfig {
  return {
    ai: {
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
    },
    events: {
      outboxPollIntervalMs: Number(env.ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS ?? 2000),
      outboxMaxRetries: Number(env.ACADEMY_EVENT_OUTBOX_MAX_RETRIES ?? 5),
    },
    featureFlags: {
      masteryEvaluationEnabled: env.ACADEMY_FF_MASTERY_EVALUATION_ENABLED === "true",
      asyncFeedbackOnly: env.ACADEMY_FF_ASYNC_FEEDBACK_ONLY === "true",
    },
  };
}
