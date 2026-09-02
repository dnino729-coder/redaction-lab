export abstract class DomainEvent<TPayload = Record<string, unknown>> {
  public readonly occurredAt: Date;

  protected constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: TPayload,
    public readonly metadata: Record<string, unknown> = {},
  ) {
    this.occurredAt = new Date();
  }
}
