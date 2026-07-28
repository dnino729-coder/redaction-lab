import type { Prisma, AcademyTextType } from "@prisma/client";
import type { ModelExampleRepository } from "@/features/academy/domain/repositories/ModelExampleRepository";
import { ModelExample } from "@/features/academy/domain/aggregates/ModelExample";
import { ModelExampleId } from "@/features/academy/domain/value-objects/ModelExampleId";
import { ModelExampleStatus } from "@/features/academy/domain/enums/ModelExampleStatus";
import type { TextType } from "@/features/academy/domain/enums/TextType";

import { withActiveClient } from "../PrismaClientContext";
import { ModelExamplePersistenceMapper } from "../mappers/ModelExamplePersistenceMapper";
import { translatePrismaError } from "@/features/academy/infrastructure/exceptions/PrismaExceptionTranslator";

// Implementa `ModelExampleRepository` (Domain Model v1.1 / Application
// Layer, Sprint 6.1 — firma real: findById/findActiveByTextType/save, sin
// método `retire()` dedicado). CMD-14 invoca `ModelExample.retire()`
// (Domain) y luego `save()` — este Repository resuelve `retiredAt` aquí
// (columna de infraestructura pura, el Aggregate no la modela como prop),
// fijándola solo la primera vez que el estado pasa a RETIRED (guard
// `retiredAt: null` en el `updateMany` — operación idempotente, CMD-14).
export class PrismaModelExampleRepository implements ModelExampleRepository {
  public async findById(id: ModelExampleId): Promise<ModelExample | null> {
    const row = await withActiveClient((client) =>
      client.modelExample.findUnique({ where: { id: id.value } }),
    );
    return row ? ModelExamplePersistenceMapper.toDomain(row) : null;
  }

  public async findActiveByTextType(textType: TextType): Promise<ModelExample[]> {
    const rows = await withActiveClient((client) =>
      client.modelExample.findMany({
        where: { textType: textType as unknown as AcademyTextType, status: "ACTIVE" },
      }),
    );
    return rows.map((row) => ModelExamplePersistenceMapper.toDomain(row));
  }

  public async save(example: ModelExample): Promise<void> {
    const data = ModelExamplePersistenceMapper.toPersistence(example);
    try {
      await withActiveClient(async (client) => {
        await client.modelExample.upsert({
          where: { id: example.id.value },
          create: data as Prisma.ModelExampleUncheckedCreateInput,
          update: data as Prisma.ModelExampleUncheckedUpdateInput,
        });
        if (example.status === ModelExampleStatus.RETIRED) {
          await client.modelExample.updateMany({
            where: { id: example.id.value, retiredAt: null },
            data: { retiredAt: new Date() },
          });
        }
      });
    } catch (error) {
      translatePrismaError(error, "ModelExample", example.id.value);
    }
  }
}
