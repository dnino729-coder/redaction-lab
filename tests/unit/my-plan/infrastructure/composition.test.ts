import { describe, it, expect } from "vitest";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";

describe("createMyPlanContainer (DI)", () => {
  it("construye el grafo completo sin lanzar y sin tocar ninguna base de datos real", () => {
    const container = createMyPlanContainer();

    expect(Object.keys(container.repositories)).toHaveLength(7);
    expect(Object.keys(container.queryServices)).toHaveLength(3);
    expect(Object.keys(container.ports)).toHaveLength(6);
    expect(Object.keys(container.handlers)).toHaveLength(14);
  });

  it("cada llamada produce una instancia nueva e independiente (sin estado compartido accidental)", () => {
    const containerA = createMyPlanContainer();
    const containerB = createMyPlanContainer();
    expect(containerA.repositories.learningPlan).not.toBe(containerB.repositories.learningPlan);
  });
});
