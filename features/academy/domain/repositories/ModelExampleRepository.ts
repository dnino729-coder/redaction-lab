import type { ModelExample } from "../aggregates/ModelExample";
import type { ModelExampleId } from "../value-objects/ModelExampleId";
import type { TextType } from "../enums/TextType";

// Puerto de repositorio (Domain Model v1.1 / Persistence Layer v1.0 §4) —
// implementado por PrismaModelExampleRepository en infraestructura.
export interface ModelExampleRepository {
  findById(id: ModelExampleId): Promise<ModelExample | null>;
  findActiveByTextType(textType: TextType): Promise<ModelExample[]>;
  save(modelExample: ModelExample): Promise<void>;
}
