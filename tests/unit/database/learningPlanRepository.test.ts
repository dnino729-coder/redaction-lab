import { describe, expect, it } from "vitest";
import { findActiveLearningPlanSummary } from "@/database/repositories/learningPlanRepository";
import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

// Fix "dashboard current-plan inconsistency" — no existía ningún test para
// database/queries|repositories/learningPlan.ts (confirmado: ningún archivo
// bajo tests/ importaba de @/database/queries o @/database/repositories
// antes de este). Se crea este archivo nuevo, en vez de reutilizar el fake
// de tests/unit/my-plan/infrastructure/fakePrismaClient.ts (acoplado al
// TransactionClient de esa feature) — un doble de prueba local mínimo es
// suficiente: `queryActiveLearningPlan` (database/queries/learningPlan.ts)
// recibe el `tx` ya resuelto como parámetro, sin pasar por
// withStudentContext (que solo fija rol/RLS de Postgres, irrelevante para
// un doble de prueba en memoria).
const STUDENT_ID = "88888888-8888-4888-8888-888888888888";
const PLAN_ID = "11111111-1111-4111-8111-111111111111";

interface FakeLearningPlanRow {
  id: string;
  studentId: string;
  targetLevel: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  learningProgress: {
    completedTasks: number;
    totalTasks: number;
    completionPercentage: number;
  } | null;
  dailyPlans: Array<{ estimatedMinutes: number; completedMinutes: number }>;
  weeklyPlans: Array<{
    estimatedMinutes: number;
    completedMinutes: number;
    completionPercentage: number;
  }>;
}

function planRow(status: FakeLearningPlanRow["status"]): FakeLearningPlanRow {
  return {
    id: PLAN_ID,
    studentId: STUDENT_ID,
    targetLevel: "B2",
    status,
    learningProgress: { completedTasks: 3, totalTasks: 10, completionPercentage: 30 },
    dailyPlans: [],
    weeklyPlans: [],
  };
}

// Doble mínimo de `Prisma.TransactionClient` — solo implementa
// `learningPlan.findFirst({ where: { studentId, status } })`, que es
// exactamente (y únicamente) lo que `queryActiveLearningPlan` invoca. El
// operador `status` soporta tanto igualdad simple como `{ in: [...] }`
// (el que introduce este fix), replicando la semántica real de Prisma.
function createFakeClient(rows: readonly FakeLearningPlanRow[]): StudentScopedClient {
  return {
    learningPlan: {
      findFirst: async (args: {
        where?: { studentId?: string; status?: string | { in: readonly string[] } };
      }) => {
        const where = args.where ?? {};
        const match = rows.find((row) => {
          if (where.studentId !== undefined && row.studentId !== where.studentId) return false;
          if (where.status === undefined) return true;
          if (typeof where.status === "string") return row.status === where.status;
          return where.status.in.includes(row.status);
        });
        return match ?? null;
      },
    },
  } as unknown as StudentScopedClient;
}

describe("findActiveLearningPlanSummary (database/repositories/learningPlanRepository.ts)", () => {
  it.each([
    ["ACTIVE", true],
    ["PAUSED", true],
    ["COMPLETED", false],
    ["CANCELLED", false],
  ] as const)(
    "status=%s → ¿reconocido como plan actual del Dashboard? %s",
    async (status, shouldResolve) => {
      const tx = createFakeClient([planRow(status)]);

      const summary = await findActiveLearningPlanSummary(tx, STUDENT_ID);

      if (shouldResolve) {
        expect(summary).not.toBeNull();
        expect(summary?.planId).toBe(PLAN_ID);
      } else {
        expect(summary).toBeNull();
      }
    },
  );

  it("devuelve null si el estudiante no tiene ningún LearningPlan", async () => {
    const tx = createFakeClient([]);

    const summary = await findActiveLearningPlanSummary(tx, STUDENT_ID);

    expect(summary).toBeNull();
  });
});
