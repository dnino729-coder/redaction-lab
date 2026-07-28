import type { AIProvider } from "@/services/ai";
import type { AcademyAIConfig } from "./AcademyAIConfig";
import { ClaudeProvider } from "./ClaudeProvider";
import { OpenAIProvider } from "./OpenAIProvider";

// Factory — selecciona el `AIProvider` activo según configuración
// (`ACADEMY_AI_PROVIDER`, PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA,
// Infrastructure Model v1.1 Sección 6). Sin lógica de negocio: solo
// selección entre dos adaptaciones ya implementadas.
export class AIProviderFactory {
  private readonly claude: ClaudeProvider;
  private readonly openAi: OpenAIProvider;

  constructor(private readonly config: AcademyAIConfig) {
    this.claude = new ClaudeProvider(config);
    this.openAi = new OpenAIProvider(config);
  }

  public create(): AIProvider {
    switch (this.config.provider) {
      case "claude":
        return this.claude;
      case "openai":
        return this.openAi;
      default:
        throw new Error(`AIProviderFactory: proveedor de IA no configurado ("${this.config.provider}").`);
    }
  }
}
