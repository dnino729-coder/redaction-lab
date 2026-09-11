// Block 2D — parseo del payload de ACADEMY_REFLECTION_COMPLETED leído de
// academy_outbox. Cubre §14.2 (extraer studentId) y §14.10 (studentId/
// aggregateId se resuelve correctamente).
import { describe, expect, it } from "vitest";
import {
  parseReflectionCompletedOutboxPayload,
  InvalidReflectionCompletedPayloadError,
} from "@/services/academyAnalytics/reflectionCompletedPayload";

const STUDENT = "33333333-3333-4333-8333-333333333333";
const ATTEMPT = "11111111-1111-4111-8111-111111111111";
const UNIT = "22222222-2222-4222-8222-222222222222";

/** Forma real de academy_outbox.payload (la fija PrismaAcademyOutboxPort). */
function outboxPayload(inner: Record<string, unknown>) {
  return {
    eventName: "ACADEMY_REFLECTION_COMPLETED",
    aggregateId: ATTEMPT,
    occurredAt: "2026-09-10T10:00:00.000Z",
    payload: inner,
    metadata: {},
  };
}

describe("parseReflectionCompletedOutboxPayload", () => {
  it("extrae studentId/attemptId/unitId del payload anidado", () => {
    const parsed = parseReflectionCompletedOutboxPayload(
      outboxPayload({
        attemptId: ATTEMPT,
        unitId: UNIT,
        studentId: STUDENT,
        comprehensionVerified: true,
      }),
    );
    expect(parsed).toEqual({ studentId: STUDENT, attemptId: ATTEMPT, unitId: UNIT });
  });

  it("rechaza un payload que no es objeto", () => {
    expect(() => parseReflectionCompletedOutboxPayload(null)).toThrow(
      InvalidReflectionCompletedPayloadError,
    );
    expect(() => parseReflectionCompletedOutboxPayload("x")).toThrow(
      InvalidReflectionCompletedPayloadError,
    );
  });

  it("rechaza un payload sin el objeto `payload` anidado", () => {
    expect(() =>
      parseReflectionCompletedOutboxPayload({ eventName: "ACADEMY_REFLECTION_COMPLETED" }),
    ).toThrow(InvalidReflectionCompletedPayloadError);
  });

  it("rechaza si studentId falta o no tiene forma de UUID", () => {
    expect(() =>
      parseReflectionCompletedOutboxPayload(outboxPayload({ attemptId: ATTEMPT, unitId: UNIT })),
    ).toThrow(/studentId/);
    expect(() =>
      parseReflectionCompletedOutboxPayload(
        outboxPayload({ attemptId: ATTEMPT, unitId: UNIT, studentId: "no-es-uuid" }),
      ),
    ).toThrow(/studentId/);
  });

  it("rechaza si attemptId o unitId no tienen forma de UUID", () => {
    expect(() =>
      parseReflectionCompletedOutboxPayload(
        outboxPayload({ attemptId: "bad", unitId: UNIT, studentId: STUDENT }),
      ),
    ).toThrow(/attemptId/);
    expect(() =>
      parseReflectionCompletedOutboxPayload(
        outboxPayload({ attemptId: ATTEMPT, unitId: 42, studentId: STUDENT }),
      ),
    ).toThrow(/unitId/);
  });
});
