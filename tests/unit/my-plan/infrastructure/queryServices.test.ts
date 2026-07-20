import { describe, it, expect } from "vitest";
import { PrismaDailyPlanReadPort } from "@/features/my-plan/infrastructure/query-services/PrismaDailyPlanReadPort";
import { PrismaWeeklyPlanReadPort } from "@/features/my-plan/infrastructure/query-services/PrismaWeeklyPlanReadPort";
import { PrismaLearningProgressReadPort } from "@/features/my-plan/infrastructure/query-services/PrismaLearningProgressReadPort";
import { runWithActiveTransaction } from "@/features/my-plan/infrastructure/persistence/PrismaClientContext";
import { createFakeTransactionClient } from "./fakePrismaClient";
import { Prisma } from "@prisma/client";

const PLAN_ID = "11111111-1111-4111-8111-111111111111";

describe("Query Services (CQRS) — read ports sin Entity de dominio", () => {
  it("PrismaDailyPlanReadPort devuelve el DTO de lectura (nunca una Entity)", async () => {
    const tx = createFakeTransactionClient({
      dailyPlan: [
        {
          id: "dp-1",
          learningPlanId: PLAN_ID,
          planDate: new Date("2026-07-19T00:00:00.000Z"),
          estimatedMinutes: 60,
          completedMinutes: 30,
          completionPercentage: new Prisma.Decimal(50),
        },
      ],
    });
    const port = new PrismaDailyPlanReadPort();

    await runWithActiveTransaction(tx as never, async () => {
      const result = await port.findByLearningPlanIdAndDate(PLAN_ID, new Date("2026-07-19T00:00:00.000Z"));
      expect(result).toEqual({
        id: "dp-1",
        learningPlanId: PLAN_ID,
        planDate: "2026-07-19T00:00:00.000Z",
        estimatedMinutes: 60,
        completedMinutes: 30,
        completionPercentage: 50,
      });
    });
  });

  it("PrismaWeeklyPlanReadPort devuelve null si no hay WeeklyPlan para esa semana", async () => {
    const tx = createFakeTransactionClient({ weeklyPlan: [] });
    const port = new PrismaWeeklyPlanReadPort();

    await runWithActiveTransaction(tx as never, async () => {
      const result = await port.findByLearningPlanIdAndWeekNumber(PLAN_ID, 3);
      expect(result).toBeNull();
    });
  });

  it("PrismaLearningProgressReadPort mapea Decimal.toNumber() correctamente", async () => {
    const tx = createFakeTransactionClient({
      learningProgress: [
        {
          id: "lp-1",
          learningPlanId: PLAN_ID,
          completedTasks: 4,
          totalTasks: 10,
          completionPercentage: new Prisma.Decimal(40),
          currentStreak: 2,
          updatedAt: new Date("2026-07-19T10:00:00.000Z"),
        },
      ],
    });
    const port = new PrismaLearningProgressReadPort();

    await runWithActiveTransaction(tx as never, async () => {
      const result = await port.findByLearningPlanId(PLAN_ID);
      expect(result?.completionPercentage).toBe(40);
      expect(result?.completedTasks).toBe(4);
    });
  });
});
