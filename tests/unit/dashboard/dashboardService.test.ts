// dashboardService — Redis Sprint (cache-aside de DashboardReadModel). Sin
// Redis/Upstash real: `@/lib/redis` y las lecturas de `services/*` van
// mockeadas — ver tests/unit/app/api/internal/academyReflectionProjectionRoute.test.ts
// para el mismo patrón de `vi.mock` con fn hoisteada por nombre.
import { describe, it, expect, vi, beforeEach } from "vitest";

const redisGet = vi.fn();
const redisSet = vi.fn();
const redisDel = vi.fn();
vi.mock("@/lib/redis", () => ({
  redis: {
    get: (...args: unknown[]) => redisGet(...args),
    set: (...args: unknown[]) => redisSet(...args),
    del: (...args: unknown[]) => redisDel(...args),
  },
}));

const getDashboardCoreData = vi.fn();
const persistDashboardConsolidation = vi.fn();
vi.mock("@/services/database", () => ({
  getDashboardCoreData: (...args: unknown[]) => getDashboardCoreData(...args),
  persistDashboardConsolidation: (...args: unknown[]) => persistDashboardConsolidation(...args),
}));

const getGamificationSnapshot = vi.fn();
vi.mock("@/services/gamification", () => ({
  getGamificationSnapshot: (...args: unknown[]) => getGamificationSnapshot(...args),
}));

const getAnalyticsSnapshot = vi.fn();
vi.mock("@/services/analytics", () => ({
  getAnalyticsSnapshot: (...args: unknown[]) => getAnalyticsSnapshot(...args),
}));

import {
  getDashboardReadModel,
  invalidateDashboardCache,
} from "@/features/dashboard/services/dashboardService";
import { DASHBOARD_CACHE_TTL_SECONDS } from "@/features/dashboard/constants/dashboard.constants";
import type { DashboardCoreData } from "@/services/database";
import type { GamificationSnapshot } from "@/services/gamification";
import type { AnalyticsSnapshot } from "@/services/analytics";
import type { DashboardReadModel } from "@/features/dashboard/types";

const EMPTY_CORE: DashboardCoreData = {
  identity: null,
  learningPlan: null,
  continuation: null,
  recommendation: null,
  coachContext: null,
  estimatedPerformance: null,
  storedDashboard: null,
};

const EMPTY_GAMIFICATION: GamificationSnapshot = {
  currentStreak: 0,
  longestStreak: 0,
  levelNumber: 0,
  totalXp: 0,
};

const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  competencies: [],
  learningAnalytics: null,
  studyFrequency: null,
  performance: null,
};

function mockCoreDataOnce(studentId: string) {
  getDashboardCoreData.mockResolvedValueOnce(EMPTY_CORE);
  getGamificationSnapshot.mockResolvedValueOnce(EMPTY_GAMIFICATION);
  getAnalyticsSnapshot.mockResolvedValueOnce(EMPTY_ANALYTICS);
  void studentId;
}

beforeEach(() => {
  redisGet.mockReset();
  redisSet.mockReset();
  redisDel.mockReset();
  getDashboardCoreData.mockReset();
  persistDashboardConsolidation.mockReset().mockResolvedValue(undefined);
  getGamificationSnapshot.mockReset();
  getAnalyticsSnapshot.mockReset();
});

describe("getDashboardReadModel — cache MISS", () => {
  it("si Redis no tiene la clave, construye el ReadModel desde Postgres y lo escribe en caché", async () => {
    redisGet.mockResolvedValueOnce(null);
    redisSet.mockResolvedValueOnce("OK");
    mockCoreDataOnce("student-1");

    const result = await getDashboardReadModel("student-1");

    expect(getDashboardCoreData).toHaveBeenCalledTimes(1);
    expect(getDashboardCoreData).toHaveBeenCalledWith("student-1");
    expect(result.studentId).toBe("student-1");
    expect(redisSet).toHaveBeenCalledTimes(1);
  });
});

describe("getDashboardReadModel — cache HIT", () => {
  it("si Redis tiene la clave, devuelve el valor cacheado sin leer Postgres", async () => {
    const cached: DashboardReadModel = {
      studentId: "student-1",
      welcome: { variant: "ready", firstName: "Ana", avatarUrl: null, lastLoginAt: null },
      goal: {
        currentLevel: null,
        targetLevel: null,
        targetExamDate: null,
        daysUntilExam: null,
        overallPreparationPercentage: null,
        estimatedPerformance: null,
      },
      plan: {
        hasActivePlan: false,
        weeklyRecommendedMinutes: null,
        weeklyCompletedMinutes: null,
        weeklyCompletionPercentage: null,
        dailyGoalMinutes: null,
        dailyCompletedMinutes: null,
      },
      continuation: {
        available: false,
        submissionId: null,
        status: null,
        lastDraftWordCount: null,
        lastActivityAt: null,
      },
      recommendation: { available: false, recommendationId: null, text: null, priority: null },
      evolution: {
        competencies: [],
        studyFrequency: null,
        performance: null,
        analytics: null,
        currentStreak: 0,
      },
      ecosystems: [],
      generatedAt: "2026-07-18T00:00:00.000Z",
    };
    redisGet.mockResolvedValueOnce(JSON.stringify(cached));

    const result = await getDashboardReadModel("student-1");

    expect(result).toEqual(cached);
    expect(getDashboardCoreData).not.toHaveBeenCalled();
    expect(redisSet).not.toHaveBeenCalled();
  });
});

describe("getDashboardReadModel — degradación ante fallos de Redis", () => {
  it("si redis.get falla, se degrada a lectura directa de Postgres (nunca bloquea la carga)", async () => {
    redisGet.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    redisSet.mockResolvedValueOnce("OK");
    mockCoreDataOnce("student-1");

    const result = await getDashboardReadModel("student-1");

    expect(getDashboardCoreData).toHaveBeenCalledTimes(1);
    expect(result.studentId).toBe("student-1");
  });

  it("si redis.set falla, igual devuelve el resultado ya calculado", async () => {
    redisGet.mockResolvedValueOnce(null);
    redisSet.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    mockCoreDataOnce("student-1");

    const result = await getDashboardReadModel("student-1");

    expect(result.studentId).toBe("student-1");
  });
});

describe("getDashboardReadModel — aislamiento por estudiante", () => {
  it("usa una clave de caché distinta por estudiante — nunca comparten valor cacheado", async () => {
    redisGet.mockResolvedValueOnce(null);
    redisSet.mockResolvedValueOnce("OK");
    mockCoreDataOnce("student-a");

    await getDashboardReadModel("student-a");

    redisGet.mockResolvedValueOnce(null);
    redisSet.mockResolvedValueOnce("OK");
    mockCoreDataOnce("student-b");

    await getDashboardReadModel("student-b");

    expect(redisGet.mock.calls[0]![0]).toBe("dashboard:read-model:student-a");
    expect(redisGet.mock.calls[1]![0]).toBe("dashboard:read-model:student-b");
    expect(redisGet.mock.calls[0]![0]).not.toBe(redisGet.mock.calls[1]![0]);
  });
});

describe("getDashboardReadModel — TTL", () => {
  it("escribe en caché con EX = DASHBOARD_CACHE_TTL_SECONDS (60)", async () => {
    redisGet.mockResolvedValueOnce(null);
    redisSet.mockResolvedValueOnce("OK");
    mockCoreDataOnce("student-1");

    await getDashboardReadModel("student-1");

    expect(redisSet).toHaveBeenCalledWith(
      "dashboard:read-model:student-1",
      expect.any(String),
      "EX",
      DASHBOARD_CACHE_TTL_SECONDS,
    );
    expect(DASHBOARD_CACHE_TTL_SECONDS).toBe(60);
  });
});

describe("invalidateDashboardCache", () => {
  it("borra únicamente la clave del estudiante indicado", async () => {
    redisDel.mockResolvedValueOnce(1);

    await invalidateDashboardCache("student-a");

    expect(redisDel).toHaveBeenCalledTimes(1);
    expect(redisDel).toHaveBeenCalledWith("dashboard:read-model:student-a");
  });

  it("no lanza si Redis falla al borrar (no crítico — el TTL natural refleja el cambio)", async () => {
    redisDel.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(invalidateDashboardCache("student-a")).resolves.toBeUndefined();
  });
});
