import type { Prisma } from "@prisma/client";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import type { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import type { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import type { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";

import { withActiveClient } from "../PrismaClientContext";
import { AttemptPersistenceMapper, type AttemptRow } from "../mappers/AttemptPersistenceMapper";
import { translatePrismaError } from "@/features/academy/infrastructure/exceptions/PrismaExceptionTranslator";

const LATEST_VERSION_INCLUDE = {
  draft: true,
  academyUnit: { select: { studentId: true } },
  versions: {
    orderBy: { versionNumber: "desc" as const },
    take: 1,
    include: { feedback: { include: { observations: true } } },
  },
} satisfies Prisma.AttemptInclude;

const FULL_HISTORY_INCLUDE = {
  draft: true,
  academyUnit: { select: { studentId: true } },
  versions: {
    orderBy: { versionNumber: "asc" as const },
    include: { feedback: { include: { observations: true } } },
  },
} satisfies Prisma.AttemptInclude;

type RowWithUnit = { academyUnit: { studentId: string } } & Record<string, unknown>;

function toAttemptRow(row: RowWithUnit): AttemptRow {
  const { academyUnit, ...rest } = row;
  return { ...rest, studentId: academyUnit.studentId } as unknown as AttemptRow;
}

// Implementa `AttemptRepository` (Domain Model v1.1 / Application Layer,
// Sprint 6.1). Cierre de H-06: `findById` carga PARCIAL (solo la Version
// vigente, `take: 1`) — el historial completo (`findByIdWithFullHistory`)
// se reserva para QRY-04/QRY-10 vía el Read Model (nunca invocado desde un
// Command Handler).
export class PrismaAttemptRepository implements AttemptRepository {
  public async findById(id: AttemptId): Promise<Attempt | null> {
    const row = await withActiveClient((client) =>
      client.attempt.findUnique({ where: { id: id.value }, include: LATEST_VERSION_INCLUDE }),
    );
    return row ? AttemptPersistenceMapper.toDomain(toAttemptRow(row as unknown as RowWithUnit)) : null;
  }

  public async findByIdWithFullHistory(id: AttemptId): Promise<Attempt | null> {
    const row = await withActiveClient((client) =>
      client.attempt.findUnique({ where: { id: id.value }, include: FULL_HISTORY_INCLUDE }),
    );
    return row ? AttemptPersistenceMapper.toDomain(toAttemptRow(row as unknown as RowWithUnit)) : null;
  }

  public async findActiveByUnitId(unitId: AcademyUnitId): Promise<Attempt | null> {
    const row = await withActiveClient((client) =>
      client.attempt.findFirst({
        where: { academyUnitId: unitId.value, isCurrent: true },
        include: LATEST_VERSION_INCLUDE,
      }),
    );
    return row ? AttemptPersistenceMapper.toDomain(toAttemptRow(row as unknown as RowWithUnit)) : null;
  }

  public async findAllByUnitId(unitId: AcademyUnitId): Promise<Attempt[]> {
    // Uso exclusivo de orquestación de Commands (p. ej. verificación de
    // unicidad de Intento activo antes de CMD-01/CMD-09) — no es el camino
    // de QRY-04 (responsabilidad del Read Model).
    const rows = await withActiveClient((client) =>
      client.attempt.findMany({
        where: { academyUnitId: unitId.value },
        include: LATEST_VERSION_INCLUDE,
        orderBy: { attemptNumber: "asc" },
      }),
    );
    return rows.map((row) => AttemptPersistenceMapper.toDomain(toAttemptRow(row as unknown as RowWithUnit)));
  }

  public async save(attempt: Attempt): Promise<void> {
    const { attemptRow, draft, clearDraft, versions } = AttemptPersistenceMapper.toPersistence(attempt);
    try {
      await withActiveClient(async (client) => {
        await client.attempt.upsert({
          where: { id: attempt.id.value },
          create: attemptRow as Prisma.AttemptUncheckedCreateInput,
          update: attemptRow as Prisma.AttemptUncheckedUpdateInput,
        });

        if (draft) {
          await client.draft.upsert({
            where: { attemptId: draft.attemptId },
            create: draft.data as Prisma.DraftUncheckedCreateInput,
            update: draft.data as Prisma.DraftUncheckedUpdateInput,
          });
        } else if (clearDraft) {
          // El Draft se "reemplaza en cada autoguardado" y se congela en
          // Version al enviarse (Domain Model v1.1) — si el Aggregate ya no
          // tiene Draft en memoria, la fila persistida (si existe) queda
          // obsoleta y se elimina (nunca queda un Draft huérfano de un ciclo
          // ya congelado en Version).
          await client.draft.deleteMany({ where: { attemptId: attempt.id.value } });
        }

        for (const version of versions) {
          await client.version.upsert({
            where: { id: (version.data as { id: string }).id },
            create: version.data as Prisma.VersionUncheckedCreateInput,
            update: version.data as Prisma.VersionUncheckedUpdateInput,
          });

          if (version.feedback) {
            await client.feedback.upsert({
              where: { id: (version.feedback.data as { id: string }).id },
              create: version.feedback.data as Prisma.FeedbackUncheckedCreateInput,
              update: version.feedback.data as Prisma.FeedbackUncheckedUpdateInput,
            });
            // FeedbackObservation es inmutable y se genera una única vez
            // por Feedback (Domain Model v1.1) — reemplazar el conjunto
            // completo en cada `save()` es idempotente (mismo contenido) y
            // evita duplicar filas si `save()` se invoca más de una vez
            // sobre el mismo Attempt dentro de la misma transacción.
            await client.feedbackObservation.deleteMany({
              where: { feedbackId: (version.feedback.data as { id: string }).id },
            });
            if (version.feedback.observations.length > 0) {
              await client.feedbackObservation.createMany({ data: [...version.feedback.observations] });
            }
          }
        }
      });
    } catch (error) {
      translatePrismaError(error, "Attempt", attempt.id.value);
    }
  }
}
