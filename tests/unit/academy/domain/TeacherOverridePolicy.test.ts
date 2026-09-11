// TeacherOverridePolicy — RN-13/A-10: matriz de acciones de anulación
// docente válidas por UnitState. Cubre exhaustivamente los 8 UnitState x
// las 2 OverrideAction posibles (16 combinaciones), tal como documenta el
// propio archivo de producción, para dejar la matriz completa protegida
// ante cualquier cambio futuro. Test-only — no modifica
// features/academy/domain/policies/TeacherOverridePolicy.ts.
import { describe, it, expect } from "vitest";
import { TeacherOverridePolicy } from "@/features/academy/domain/policies/TeacherOverridePolicy";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import { OverrideAction } from "@/features/academy/domain/enums/OverrideAction";
import { OverrideNotValidForStateException } from "@/features/academy/domain/exceptions/OverrideNotValidForStateException";

const policy = new TeacherOverridePolicy();

describe("TeacherOverridePolicy.isValidForState() — FORCE_LOCK: cualquier estado activo no terminal", () => {
  it.each([
    [UnitState.UNLOCKED, true],
    [UnitState.IN_PROGRESS, true],
    [UnitState.AWAITING_FEEDBACK, true],
    [UnitState.REVISION, true],
    [UnitState.REFLECTION, true],
    [UnitState.LOCKED, false],
    [UnitState.COMPLETED, false],
    [UnitState.MASTERED, false],
  ])("FORCE_LOCK desde %s -> %s", (state, expected) => {
    expect(policy.isValidForState(state, OverrideAction.FORCE_LOCK)).toBe(expected);
  });
});

describe("TeacherOverridePolicy.isValidForState() — FORCE_RESTART: solo LOCKED o estados terminales", () => {
  it.each([
    [UnitState.LOCKED, true],
    [UnitState.COMPLETED, true],
    [UnitState.MASTERED, true],
    [UnitState.UNLOCKED, false],
    [UnitState.IN_PROGRESS, false],
    [UnitState.AWAITING_FEEDBACK, false],
    [UnitState.REVISION, false],
    [UnitState.REFLECTION, false],
  ])("FORCE_RESTART desde %s -> %s", (state, expected) => {
    expect(policy.isValidForState(state, OverrideAction.FORCE_RESTART)).toBe(expected);
  });
});

describe("TeacherOverridePolicy.assertActionValidForState()", () => {
  it("no lanza para una combinación válida (FORCE_LOCK sobre IN_PROGRESS)", () => {
    expect(() =>
      policy.assertActionValidForState("unit-1", UnitState.IN_PROGRESS, OverrideAction.FORCE_LOCK),
    ).not.toThrow();
  });

  it("lanza OverrideNotValidForStateException para una combinación inválida (FORCE_LOCK sobre estado terminal MASTERED)", () => {
    expect(() =>
      policy.assertActionValidForState("unit-1", UnitState.MASTERED, OverrideAction.FORCE_LOCK),
    ).toThrow(OverrideNotValidForStateException);
  });

  it("lanza OverrideNotValidForStateException para FORCE_RESTART sobre un estado activo no terminal (invariante 10: nunca sobre un Attempt en curso)", () => {
    expect(() =>
      policy.assertActionValidForState("unit-1", UnitState.REVISION, OverrideAction.FORCE_RESTART),
    ).toThrow(OverrideNotValidForStateException);
  });
});
