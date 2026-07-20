import { describe, it, expect, vi } from "vitest";
import { SystemClock } from "@/features/my-plan/infrastructure/adapters/SystemClock";
import { CryptoUuidGenerator } from "@/features/my-plan/infrastructure/adapters/CryptoUuidGenerator";
import { ConsoleLogger } from "@/features/my-plan/infrastructure/adapters/ConsoleLogger";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("SystemClock", () => {
  it("now() devuelve la hora actual real (Date)", () => {
    const before = Date.now();
    const now = new SystemClock().now();
    const after = Date.now();
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
    expect(now.getTime()).toBeLessThanOrEqual(after);
  });
});

describe("CryptoUuidGenerator", () => {
  it("generate() produce un UUID v4 válido, distinto en cada llamada", () => {
    const generator = new CryptoUuidGenerator();
    const a = generator.generate();
    const b = generator.generate();
    expect(a).toMatch(UUID_PATTERN);
    expect(b).toMatch(UUID_PATTERN);
    expect(a).not.toBe(b);
  });
});

describe("ConsoleLogger", () => {
  it("info()/warn()/debug() escriben JSON estructurado a console.log/warn", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    logger.info("mensaje info", { plan: "p1" });
    logger.warn("mensaje warn");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsedLog = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(parsedLog).toMatchObject({ level: "info", message: "mensaje info", context: { plan: "p1" } });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("error() serializa el Error (name/message/stack) en el contexto, sin escribirlo crudo", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const logger = new ConsoleLogger();

    logger.error("falló algo", new Error("boom"));

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(errorSpy.mock.calls[0]![0] as string);
    expect(parsed.context.error.message).toBe("boom");
    errorSpy.mockRestore();
  });
});
