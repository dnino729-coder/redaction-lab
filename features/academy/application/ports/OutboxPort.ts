import type { DomainEvent } from "@/features/academy/domain/events/DomainEvent";

// Puerto — Outbox Pattern (Persistence Layer v1.0 §7): registra el
// Domain Event dentro de la misma transacción que persiste el Aggregate.
// Implementado por infraestructura (Sprint 6.2, `PrismaAcademyOutboxPort`).
export interface OutboxPort {
  append(event: DomainEvent<unknown>, aggregateType: string): Promise<void>;
}
