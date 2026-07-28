import type { ModelExampleResponseDto } from "@/features/academy/application/dto/ModelExampleDto";

// Response Mapper (Alcance #7) — `ModelExample` → `ModelExampleDTO`
// (Contrato v1.3, Sección 5): renombrado `id` → `modelExampleId`, resto de
// campos ya idénticos.
export interface ModelExampleHttp {
  readonly modelExampleId: string;
  readonly textType: string;
  readonly content: string;
  readonly rating: string;
  readonly curatorialComment: string;
  readonly status: string;
}

export function toModelExampleHttp(dto: ModelExampleResponseDto): ModelExampleHttp {
  return {
    modelExampleId: dto.id,
    textType: dto.textType,
    content: dto.content,
    rating: dto.rating,
    curatorialComment: dto.curatorialComment,
    status: dto.status,
  };
}
