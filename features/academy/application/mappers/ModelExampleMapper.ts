import type { ModelExample } from "@/features/academy/domain/aggregates/ModelExample";
import type { ModelExampleResponseDto } from "../dto";

export class ModelExampleMapper {
  public static toDto(example: ModelExample): ModelExampleResponseDto {
    return {
      id: example.id.value,
      textType: example.textType,
      content: example.content,
      rating: example.rating,
      curatorialComment: example.curatorialComment,
      status: example.status,
    };
  }
}
