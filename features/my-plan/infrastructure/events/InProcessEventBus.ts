import { EventEmitter } from "node:events";
import type { EventBus } from "@/features/my-plan/application/ports/EventBus";
import type { DomainEvent } from "@/features/my-plan/domain/events/DomainEvent";

// Adaptador — implementa el puerto `EventBus` (Application Layer).
// "No utilizar EventEmitter directamente dentro del dominio" (encargo,
// punto 6) — el dominio nunca importa `node:events` ni conoce esta
// clase; solo acumula eventos vía `AggregateRoot.pullDomainEvents()`
// (Sprint 3.3.2) y Application los publica a través del puerto `EventBus`
// (Sprint 3.3.3, `DomainEventPublisher`). `EventEmitter` es exactamente
// infraestructura — el mecanismo de entrega real, aislado aquí.
//
// Alcance de este sprint: publicación in-process únicamente (un solo
// proceso Node/Next.js). El vocabulario cerrado de 5 eventos oficiales
// (18.20.10) ya define quién consume cada uno (p. ej. Gamificación
// consume `PLAN_TASK_COMPLETED`) — conectar esos consumidores reales
// (Servicio de Gamificación, Learning Planner) es responsabilidad de un
// sprint de integración futuro, fuera de alcance aquí ("Infrastructure
// únicamente adapta", no implementa servicios de otros módulos). Esta
// clase expone `subscribe()` como el punto de extensión donde ese
// sprint futuro registrará sus propios consumidores.
export class InProcessEventBus implements EventBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    // Los 5 eventos oficiales pueden llegar en ráfaga dentro de un mismo
    // Handler (p. ej. varias LearningTask completándose en cascada) —
    // se eleva el límite por defecto (10) para no emitir advertencias
    // falsas de "posible fuga de memoria" en un flujo legítimo.
    this.emitter.setMaxListeners(50);
  }

  public async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.emitter.emit(event.eventName, event);
      this.emitter.emit("*", event);
    }
  }

  /** Punto de extensión para consumidores in-process (fuera de alcance
   * de este sprint implementar los consumidores reales). */
  public subscribe(eventName: string, handler: (event: DomainEvent) => void): void {
    this.emitter.on(eventName, handler);
  }
}
