// Puerto — generación de identificadores. Los Handlers que crean una
// entidad nueva (p. ej. `CreateLearningPlanHandler`) piden aquí el UUID
// que luego envuelven en el Value Object de identidad correspondiente
// (`LearningPlanId.create(...)`) — el dominio nunca genera sus propios
// IDs (ver domain/entities: todo `create()` recibe el `id` ya resuelto).
export interface UuidGenerator {
  generate(): string;
}
