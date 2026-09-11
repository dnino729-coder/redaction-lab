// Block 2D — política de reintento del Outbox (ya definida por el schema).
// Cubre §14.7 (DEAD_LETTER no se procesa) y §14.9 (retryCount según la
// política existente).
import { describe, expect, it } from "vitest";
import { outboxAttemptExhaustsRetries } from "@/services/academyAnalytics/outboxRetryPolicy";

describe("outboxAttemptExhaustsRetries", () => {
  it("con maxRetries=5: los primeros 4 fallos dejan FAILED, el 5º agota los reintentos", () => {
    expect(outboxAttemptExhaustsRetries(0, 5)).toBe(false); // 1er fallo
    expect(outboxAttemptExhaustsRetries(1, 5)).toBe(false);
    expect(outboxAttemptExhaustsRetries(2, 5)).toBe(false);
    expect(outboxAttemptExhaustsRetries(3, 5)).toBe(false); // 4º fallo
    expect(outboxAttemptExhaustsRetries(4, 5)).toBe(true); // 5º fallo -> DEAD_LETTER
    expect(outboxAttemptExhaustsRetries(5, 5)).toBe(true);
  });

  it("refleja `retry_count + 1 >= maxRetries` (misma expresión que el CASE del UPDATE atómico)", () => {
    expect(outboxAttemptExhaustsRetries(2, 3)).toBe(true);
    expect(outboxAttemptExhaustsRetries(1, 3)).toBe(false);
  });

  it("con maxRetries=1, el primer fallo ya agota los reintentos", () => {
    expect(outboxAttemptExhaustsRetries(0, 1)).toBe(true);
  });
});
