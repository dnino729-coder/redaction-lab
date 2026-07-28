import type { Prisma, ModelExample as PrismaModelExample } from "@prisma/client";
import { ModelExample } from "@/features/academy/domain/aggregates/ModelExample";
import { ModelExampleId } from "@/features/academy/domain/value-objects/ModelExampleId";
import type { TextType } from "@/features/academy/domain/enums/TextType";
import type { ModelExampleRating } from "@/features/academy/domain/enums/ModelExampleRating";
import type { ModelExampleStatus } from "@/features/academy/domain/enums/ModelExampleStatus";

// Persistence Mapper — ModelExample <-> Prisma (Persistence Layer
// Specification v1.0, Sección 4.3). Mapeo 1:1 de escalares — Aggregate más
// simple de los tres (sin Value Objects compuestos, sin colecciones).
export class ModelExamplePersistenceMapper {
  public static toDomain(row: PrismaModelExample): ModelExample {
    return ModelExample.reconstitute({
      id: ModelExampleId.create(row.id),
      textType: row.textType as unknown as TextType,
      content: row.content,
      rating: row.rating as unknown as ModelExampleRating,
      curatorialComment: row.curatorialComment,
      status: row.status as unknown as ModelExampleStatus,
    });
  }

  public static toPersistence(
    example: ModelExample,
  ): Prisma.ModelExampleUncheckedCreateInput | Prisma.ModelExampleUncheckedUpdateInput {
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
