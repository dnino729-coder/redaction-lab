// Repositorio: Producción Escrita (13.5), subconjunto para "Continúa donde
// te quedaste" (bloque 4). Envuelve database/queries con una interfaz
// orientada a entidad; no contiene reglas de negocio — ver ARCHITECTURE.md,
// sección 2.1.

import { queryLatestIncompleteSubmission } from "@/database/queries/writing";
import type { StudentScopedClient } from "./withStudentContext";

export interface ContinuationTarget {
  submissionId: string;
  status: string;
  updatedAt: Date;
  lastDraftWordCount: number | null;
  lastDraftAutosavedAt: Date | null;
}

export async function findContinuationTarget(
  tx: StudentScopedClient,
  studentId: string,
): Promise<ContinuationTarget | null> {
  const submission = await queryLatestIncompleteSubmission(tx, studentId);
  if (!submission) return null;

  const lastDraft = submission.drafts[0];

  return {
    submissionId: submission.id,
    status: submission.status,
    updatedAt: submission.updatedAt,
    lastDraftWordCount: lastDraft?.wordCount ?? null,
    lastDraftAutosavedAt: lastDraft?.autosavedAt ?? null,
  };
}
