import { describe, it, expect } from "vitest";
import { CompletionProgress } from "@/features/my-plan/domain/value-objects/CompletionProgress";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";

describe("CompletionProgress — 0-100 (13.4 MUST)", () => {
  it("calcula el porcentaje a partir de conteos", () => {
    expect(CompletionProgress.fromCounts(3, 4).percentage).toBe(75);
  });

  it("zero() y total=0 dan 0%, no NaN/Infinity", () => {
    expect(CompletionProgress.zero().percentage).toBe(0);
    expect(CompletionProgress.fromCounts(0, 0).percentage).toBe(0);
  });

  it("rechaza completed > total", () => {
    expect(() => CompletionProgress.fromCounts(5, 4)).toThrow(DomainInvariantViolationException);
  });

  it("isComplete solo es true en 100%", () => {
    expect(CompletionProgress.fromCounts(4, 4).isComplete).toBe(true);
    expect(CompletionProgress.fromCounts(3, 4).isComplete).toBe(false);
  });
});
