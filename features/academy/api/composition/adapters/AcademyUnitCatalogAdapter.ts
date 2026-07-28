import { TextType } from "@/features/academy/domain/enums/TextType";
import type {
  AcademyUnitCatalogPort,
  AcademyUnitCatalogEntry,
} from "@/features/academy/domain/ports/AcademyUnitCatalogPort";

// Implementación de `AcademyUnitCatalogPort` (Domain Layer, puerto ya
// Frozen), consumido por `UnitSequenceService`/`AcademyUnitFactory` durante
// CMD-15 ProvisionAcademyUnitsForStudent — Command explícitamente excluido
// de endpoint público (API Contract v1.3, Sección 4, "Exclusiones
// deliberadas": disparado por el proceso de alta/matriculación del
// estudiante, fuera del límite de contexto de Academia).
//
// Hallazgo de este Sprint (disclosed, no BLOCKER): ningún documento Frozen
// fija el tamaño exacto del catálogo curricular (cuántas `AcademyUnit` por
// `TextType`) — el único dato real disponible es el propio seed de
// Infraestructura (Sprint 6.2, `prisma/seeds/academy.seed.ts`), que siembra
// exactamente `position: 1` por cada uno de los 5 `TextType`. Este
// adaptador reproduce ese mismo catálogo mínimo (una posición por
// `TextType`) en vez de inventar un número de posiciones sin respaldo
// documental — ampliar el catálogo curricular es una decisión de Platform
// Core/Organización Académica, no de este Sprint de API.
const MINIMAL_CATALOG: readonly AcademyUnitCatalogEntry[] = Object.values(TextType).map(
  (textType): AcademyUnitCatalogEntry => ({ textType, position: 1 }),
);

export class AcademyUnitCatalogAdapter implements AcademyUnitCatalogPort {
  public async listCurriculum(): Promise<readonly AcademyUnitCatalogEntry[]> {
    return MINIMAL_CATALOG;
  }
}
