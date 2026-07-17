import { describe, expect, it } from "vitest";
import {
  dismissRecommendationSchema,
  markContinueClickedSchema,
} from "@/features/dashboard/schemas/dashboard.schemas";

describe("dismissRecommendationSchema", () => {
  it("acepta un UUID válido", () => {
    const result = dismissRecommendationSchema.safeParse({
      recommendationId: "5f8d0d55-1b6e-4b1d-9c1a-7f1a5c8e2f10",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un id que no es UUID", () => {
    const result = dismissRecommendationSchema.safeParse({ recommendationId: "no-es-un-uuid" });
    expect(result.success).toBe(false);
  });

  it("rechaza un input sin recommendationId", () => {
    const result = dismissRecommendationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("markContinueClickedSchema", () => {
  it("acepta un UUID válido", () => {
    const result = markContinueClickedSchema.safeParse({
      submissionId: "5f8d0d55-1b6e-4b1d-9c1a-7f1a5c8e2f10",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un id que no es UUID", () => {
    const result = markContinueClickedSchema.safeParse({ submissionId: "123" });
    expect(result.success).toBe(false);
  });
});
