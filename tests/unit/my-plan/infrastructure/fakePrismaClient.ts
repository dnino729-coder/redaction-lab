// Doble de prueba en memoria del `Prisma.TransactionClient` — punto 10
// del encargo: "No usar la base de datos real cuando no sea necesario.
// Usar dobles de prueba cuando aplique." Implementa únicamente los
// métodos de delegate que los Repositories/Query Services de este
// sprint realmente invocan (findUnique/findFirst/findMany/upsert),
// sobre `Map` en memoria — sin red, sin Postgres, sin Prisma real.
export function createFakeModelDelegate<T extends { id: string }>(seed: readonly T[] = []) {
  const rows = new Map<string, T>(seed.map((row) => [row.id, row]));

  function valuesEqual(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return a === b;
  }

  function matches(row: T, where: Record<string, unknown> | undefined): boolean {
    if (!where) return true;
    return Object.entries(where).every(([key, value]) =>
      valuesEqual((row as Record<string, unknown>)[key], value),
    );
  }

  return {
    _rows: rows,
    async findUnique(args: { where: { id: string } }) {
      return rows.get(args.where.id) ?? null;
    },
    async findFirst(args: { where?: Record<string, unknown>; orderBy?: { [key: string]: "asc" | "desc" } }) {
      let candidates = Array.from(rows.values()).filter((row) => matches(row, args.where));
      if (args.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]!;
        candidates = candidates.sort((a, b) => {
          const av = (a as Record<string, unknown>)[field] as unknown as { getTime?: () => number } | string | number;
          const bv = (b as Record<string, unknown>)[field] as unknown as { getTime?: () => number } | string | number;
          const an = av instanceof Date ? av.getTime() : av;
          const bn = bv instanceof Date ? bv.getTime() : bv;
          const cmp = an! < bn! ? -1 : an! > bn! ? 1 : 0;
          return direction === "desc" ? -cmp : cmp;
        });
      }
      return candidates[0] ?? null;
    },
    async findMany(args: { where?: Record<string, unknown> } = {}) {
      return Array.from(rows.values()).filter((row) => matches(row, args.where));
    },
    async create(args: { data: T }) {
      rows.set(args.data.id, args.data);
      return args.data;
    },
    async update(args: { where: { id: string }; data: Partial<T> }) {
      const existing = rows.get(args.where.id);
      if (!existing) {
        const { PrismaClientKnownRequestError } = getPrismaErrorCtor();
        throw new PrismaClientKnownRequestError("Record not found", { code: "P2025" });
      }
      const updated = { ...existing, ...args.data } as T;
      rows.set(updated.id, updated);
      return updated;
    },
    async upsert(args: { where: { id: string }; create: T; update: Partial<T> }) {
      const existing = rows.get(args.where.id);
      const next = existing ? ({ ...existing, ...args.update } as T) : args.create;
      rows.set(args.where.id, next);
      return next;
    },
    async delete(args: { where: { id: string } }) {
      const existing = rows.get(args.where.id);
      rows.delete(args.where.id);
      return existing as T;
    },
  };
}

// Import diferido (evita ciclo de módulos) — el stub runtime de
// `@prisma/client` (ver tests/unit/my-plan/infrastructure/setup, o el
// package.json del sandbox de verificación) expone `Prisma.
// PrismaClientKnownRequestError` como clase real, no solo de tipos.
function getPrismaErrorCtor(): { PrismaClientKnownRequestError: new (message: string, options: { code: string }) => Error & { code: string } } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("@prisma/client").Prisma;
}

export function createFakeTransactionClient(seed: {
  learningPlan?: Array<{ id: string; [key: string]: unknown }>;
  learningGoal?: Array<{ id: string; [key: string]: unknown }>;
  learningObjective?: Array<{ id: string; [key: string]: unknown }>;
  learningPhase?: Array<{ id: string; [key: string]: unknown }>;
  learningTask?: Array<{ id: string; [key: string]: unknown }>;
  studySchedule?: Array<{ id: string; [key: string]: unknown }>;
  studySession?: Array<{ id: string; [key: string]: unknown }>;
  dailyPlan?: Array<{ id: string; [key: string]: unknown }>;
  weeklyPlan?: Array<{ id: string; [key: string]: unknown }>;
  learningProgress?: Array<{ id: string; [key: string]: unknown }>;
} = {}) {
  return {
    learningPlan: createFakeModelDelegate(seed.learningPlan as never),
    learningGoal: createFakeModelDelegate(seed.learningGoal as never),
    learningObjective: createFakeModelDelegate(seed.learningObjective as never),
    learningPhase: createFakeModelDelegate(seed.learningPhase as never),
    learningTask: createFakeModelDelegate(seed.learningTask as never),
    studySchedule: createFakeModelDelegate(seed.studySchedule as never),
    studySession: createFakeModelDelegate(seed.studySession as never),
    dailyPlan: createFakeModelDelegate(seed.dailyPlan as never),
    weeklyPlan: createFakeModelDelegate(seed.weeklyPlan as never),
    learningProgress: createFakeModelDelegate(seed.learningProgress as never),
    async $executeRaw() {
      return 0;
    },
    async $executeRawUnsafe() {
      return 0;
    },
    async $queryRaw() {
      return [];
    },
  };
}
