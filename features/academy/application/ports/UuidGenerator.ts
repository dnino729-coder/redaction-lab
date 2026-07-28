// Puerto — generación de identificadores (mismo patrón que Mi Plan). El
// dominio nunca genera sus propios IDs.
export interface UuidGenerator {
  generate(): string;
}
