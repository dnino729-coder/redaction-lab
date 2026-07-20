import { describe, it, expect, vi } from "vitest";

const fakeTx = { marker: "uow-tx" };
const withServiceContextMock = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(fakeTx));
const withStudentContextMock = vi.fn(
  async (_studentId: string, callback: (tx: unknown) => Promise<unknown>) => callback(fakeTx),
);

vi.mock("@/database/repositories/withStudentContext", () => ({
  withServiceContext: withServiceContextMock,
  withStudentContext: withStudentContextMock,
}));

describe("PrismaUnitOfWork", () => {
  it("execute() propaga la MISMA transacción a todas las llamadas anidadas dentro de work()", async () => {
    const { PrismaUnitOfWork } = await import(
      "@/features/my-plan/infrastructure/persistence/unit-of-work/PrismaUnitOfWork"
    );
    const { withActiveClient } = await import("@/features/my-plan/infrastructure/persistence/PrismaClientContext");

    const unitOfWork = new PrismaUnitOfWork();
    const seenClients: unknown[] = [];

    const result = await unitOfWork.execute(async () => {
      const first = await withActiveClient(async (c) => c);
      const second = await withActiveClient(async (c) => c);
      seenClients.push(first, second);
      return "ok";
    });

    expect(result).toBe("ok");
    expect(seenClients[0]).toBe(fakeTx);
    expect(seenClients[1]).toBe(fakeTx);
    expect(seenClients[0]).toBe(seenClients[1]);
    expect(withServiceContextMock).toHaveBeenCalledTimes(1);
  });

  it("si work() lanza, execute() propaga el error (Postgres revertirá la transacción real)", async () => {
    const { PrismaUnitOfWork } = await import(
      "@/features/my-plan/infrastructure/persistence/unit-of-work/PrismaUnitOfWork"
    );
    const unitOfWork = new PrismaUnitOfWork();

    await expect(
      unitOfWork.execute(async () => {
        throw new Error("fallo de negocio dentro de la transacción");
      }),
    ).rejects.toThrow("fallo de negocio dentro de la transacción");
  });

  it("18.24: si se provee studentId, execute() usa withStudentContext (RLS real) en vez de withServiceContext", async () => {
    withServiceContextMock.mockClear();
    withStudentContextMock.mockClear();
    const { PrismaUnitOfWork } = await import(
      "@/features/my-plan/infrastructure/persistence/unit-of-work/PrismaUnitOfWork"
    );
    const unitOfWork = new PrismaUnitOfWork();

    const result = await unitOfWork.execute(async () => "ok-student-scoped", "student-abc-123");

    expect(result).toBe("ok-student-scoped");
    expect(withStudentContextMock).toHaveBeenCalledTimes(1);
    expect(withStudentContextMock).toHaveBeenCalledWith("student-abc-123", expect.any(Function));
    expect(withServiceContextMock).not.toHaveBeenCalled();
  });

  it("18.24: si NO se provee studentId, execute() conserva withServiceContext (BYPASSRLS)", async () => {
    withServiceContextMock.mockClear();
    withStudentContextMock.mockClear();
    const { PrismaUnitOfWork } = await import(
      "@/features/my-plan/infrastructure/persistence/unit-of-work/PrismaUnitOfWork"
    );
    const unitOfWork = new PrismaUnitOfWork();

    const result = await unitOfWork.execute(async () => "ok-service-scoped");

    expect(result).toBe("ok-service-scoped");
    expect(withServiceContextMock).toHaveBeenCalledTimes(1);
    expect(withStudentContextMock).not.toHaveBeenCalled();
  });
});
