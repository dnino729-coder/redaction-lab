import { Entity } from "./Entity";
import type { DomainEvent } from "../events/DomainEvent";

// Raíz de agregado: una `Entity` que, además, puede acumular Domain Events
// durante la ejecución de su propio comportamiento (nunca los publica ni
// los envía a ningún bus — eso es responsabilidad de infraestructura,
// fuera de alcance de este sprint). Solo extienden `AggregateRoot` las
// entidades cuyo comportamiento efectivamente dispara uno de los 5 eventos
// oficiales de la sección 2.9 de docs/modules/mi-plan.md: `LearningPlan`
// (`PLAN_CREATED`, al crearse) y `LearningTask` (`PLAN_TASK_COMPLETED`, al
// completarse por cualquiera de sus dos vías, 18.20.10). El resto de las
// entidades (`LearningGoal`, `LearningObjective`, `LearningPhase`,
// `StudySchedule`, `StudySession`) extienden `Entity` directamente, porque
// ninguno de los 5 eventos oficiales las tiene como emisor.
export abstract class AggregateRoot<
  TId extends { equals(other: TId): boolean },
> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Extrae y limpia los Domain Events acumulados. La capa de aplicación
   * (fuera de alcance de este sprint) es responsable de leerlos tras cada
   * operación y despacharlos a la infraestructura de eventos real.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }
}
