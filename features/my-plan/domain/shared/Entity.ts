// Clase base de toda entidad de dominio de Mi Plan — Sprint 3.3.2.
//
// Una entidad se distingue de un Value Object por tener identidad propia
// (`id`) que persiste a través de cambios de estado; dos entidades son
// iguales si y solo si comparten identidad, sin importar el resto de sus
// atributos (a diferencia de un Value Object, que se compara por valor).
// No depende de Prisma, de una base de datos ni de ningún framework: el
// tipo `TId` es siempre un Value Object de identificador propio del
// dominio (p. ej. `LearningTaskId`), nunca un `string` crudo de Prisma.
export abstract class Entity<TId extends { equals(other: TId): boolean }> {
  protected constructor(public readonly id: TId) {}

  public equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this.id.equals(other.id as TId);
  }
}
