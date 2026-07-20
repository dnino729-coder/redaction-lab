import { describe, it, expect, vi } from "vitest";

const withServiceContextMock = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({ marker: "service-context-tx" }),
);

vi.mock("@/database/repositories/withStudentContext", () => ({
  withServiceContext: withServiceContextMock,
}));

describe("PrismaClientContext", () => {
  it("withActiveClient() reutiliza la transacción activa si existe (dentro de runWithActiveTransaction) sin abrir una nueva", async () => {
    const { withActiveClient, runWithActiveTransaction } = await import(
      "@/features/my-plan/infrastructure/persistence/PrismaClientContext"
    );
    const fakeTx = { marker: "active-tx" } as never;

    await runWithActiveTransaction(fakeTx, async () => {
      const client = await withActiveClient(async (c) => c);
      expect(client).toBe(fakeTx);
    });

    expect(withServiceContextMock).not.toHaveBeenCalled();
  });

  it("withActiveClient() abre una transacción de servicio propia cuando no hay ninguna activa", async () => {
    const { withActiveClient } = await import("@/features/my-plan/infrastructure/persistence/PrismaClientContext");

    const client = await withActiveClient(async (c) => c);
    expect((client as { marker: string }).marker).toBe("service-context-tx");
    expect(withServiceContextMock).toHaveBeenCalledTimes(1);
  });
});
