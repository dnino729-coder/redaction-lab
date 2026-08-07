// TeacherStudentDemoWhitelist — Sprint 1C (MVP de noviembre 2026).
// Verifica el comportamiento acotado de la whitelist temporal: por
// defecto (sin variable de entorno) debe seguir siendo fail-closed,
// idéntico al adaptador original.
import { describe, expect, it } from "vitest";
import { isTeacherStudentDemoWhitelisted } from "@/features/academy/api/composition/adapters/TeacherStudentDemoWhitelist";
import { TeacherStudentRelationshipAdapter } from "@/features/academy/api/composition/adapters/TeacherStudentRelationshipAdapter";

describe("isTeacherStudentDemoWhitelisted", () => {
  it("deniega por defecto cuando la variable de entorno no está configurada (fail-closed, sin cambio de comportamiento)", () => {
    expect(isTeacherStudentDemoWhitelisted("teacher-1", "student-1", {} as NodeJS.ProcessEnv)).toBe(false);
  });

  it("deniega cuando el par no está en la whitelist", () => {
    expect(
      isTeacherStudentDemoWhitelisted("teacher-1", "student-2", {
        ...process.env,
        ACADEMY_DEMO_TEACHER_STUDENT_PAIRS: "teacher-1:student-1",
      }),
    ).toBe(false);
  });

  it("autoriza únicamente el par exacto enumerado", () => {
    expect(
      isTeacherStudentDemoWhitelisted("teacher-1", "student-1", {
        ...process.env,
        ACADEMY_DEMO_TEACHER_STUDENT_PAIRS: "teacher-1:student-1,teacher-1:student-2",
      }),
    ).toBe(true);
    expect(
      isTeacherStudentDemoWhitelisted("teacher-2", "student-1", {
        ...process.env,
        ACADEMY_DEMO_TEACHER_STUDENT_PAIRS: "teacher-1:student-1,teacher-1:student-2",
      }),
    ).toBe(false);
  });
});

describe("TeacherStudentRelationshipAdapter", () => {
  it("deniega por defecto (comportamiento fail-closed preservado sin configuración explícita)", async () => {
    const adapter = new TeacherStudentRelationshipAdapter();
    await expect(adapter.hasRelationship("teacher-1", "student-1")).resolves.toBe(false);
  });
});
