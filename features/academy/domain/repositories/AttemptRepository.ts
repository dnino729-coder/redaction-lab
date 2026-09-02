import type { Attempt } from "../aggregates/Attempt";
import type { AttemptId } from "../value-objects/AttemptId";
import type { AcademyUnitId } from "../value-objects/AcademyUnitId";

// Puerto de repositorio (Domain Model v1.1 / Persistence Layer v1.0 §3) —
// implementado por PrismaAttemptRepository en infraestructura. H-06:
// `findById` carga con partial load (solo la Version/Feedback vigente,
// `take` acotado); `findByIdWithFullHistory` carga el historial completo,
// usado solo por QRY-04/QRY-10.
export interface AttemptRepository {
  findById(id: AttemptId): Promise<Attempt | null>;
  findByIdWithFullHistory(id: AttemptId): Promise<Attempt | null>;
  findActiveByUnitId(unitId: AcademyUnitId): Promise<Attempt | null>;
  findAllByUnitId(unitId: AcademyUnitId): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<void>;
}
