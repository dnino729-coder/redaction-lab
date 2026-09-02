// Copia propia del bounded context de Laboratoire — ningún módulo importa
// esta clase de otro (mismo criterio ya en producción en Academia/Mi Plan).
export abstract class Entity<TId extends { equals(other: TId): boolean }> {
  protected constructor(public readonly id: TId) {}

  public equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this.id.equals(other.id as TId);
  }
}
