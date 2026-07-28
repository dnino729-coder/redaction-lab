// Clase base de toda entidad de dominio de Academia — Sprint 6.0 (Domain
// Layer), siguiendo exactamente el mismo patrón ya establecido y en
// producción para Mi Plan (features/my-plan/domain/shared/Entity.ts).
//
// Una entidad se distingue de un Value Object por tener identidad propia
// (`id`) que persiste a través de cambios de estado; dos entidades son
// iguales si y solo si comparten identidad, sin importar el resto de sus
// atributos. No depende de Prisma, de una base de datos ni de ningún
// framework.
export abstract class Entity<TId extends { equals(other: TId): boolean }> {
  protected constructor(public readonly id: TId) {}

  public equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this.id.equals(other.id as TId);
  }
}
