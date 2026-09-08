// Clase base de toda entidad de dominio de Profile — mismo patrón que
// features/my-plan/domain/shared/Entity.ts (copia propia del módulo).
export abstract class Entity<TId extends { equals(other: TId): boolean }> {
  protected constructor(public readonly id: TId) {}

  public equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this.id.equals(other.id as TId);
  }
}
