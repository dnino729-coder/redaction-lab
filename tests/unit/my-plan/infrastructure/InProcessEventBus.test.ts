import { describe, it, expect, vi } from "vitest";
import { InProcessEventBus } from "@/features/my-plan/infrastructure/events/InProcessEventBus";
import { PlanCreatedEvent } from "@/features/my-plan/domain/events/PlanCreatedEvent";

describe("InProcessEventBus", () => {
  it("publish() entrega el evento a los subscribers del eventName correspondiente", async () => {
    const bus = new InProcessEventBus();
    const handler = vi.fn();
    bus.subscribe("PLAN_CREATED", handler);

    const event = new PlanCreatedEvent({
      aggregateId: "plan-1",
      payload: { studentId: "student-1", learningPlanId: "plan-1" },
    });
    await bus.publish([event]);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("publish() también entrega al canal comodín '*' y no llama a subscribers de otro eventName", async () => {
    const bus = new InProcessEventBus();
    const wildcardHandler = vi.fn();
    const otherHandler = vi.fn();
    bus.subscribe("*", wildcardHandler);
    bus.subscribe("PLAN_TASK_COMPLETED", otherHandler);

    const event = new PlanCreatedEvent({
      aggregateId: "plan-1",
      payload: { studentId: "student-1", learningPlanId: "plan-1" },
    });
    await bus.publish([event]);

    expect(wildcardHandler).toHaveBeenCalledTimes(1);
    expect(otherHandler).not.toHaveBeenCalled();
  });

  it("publish([]) no falla y no invoca ningún handler", async () => {
    const bus = new InProcessEventBus();
    const handler = vi.fn();
    bus.subscribe("PLAN_CREATED", handler);
    await bus.publish([]);
    expect(handler).not.toHaveBeenCalled();
  });
});
