// resolvePlatformRole — Sprint 2 (cierre del recorrido Login → Dashboard).
import { describe, expect, it } from "vitest";
import {
  resolvePlatformRoleFromClaims,
  resolvePostAuthRedirectPath,
} from "@/services/auth/resolvePlatformRole";

describe("resolvePlatformRoleFromClaims", () => {
  it("resuelve null cuando no hay claims", () => {
    expect(resolvePlatformRoleFromClaims(null)).toBeNull();
    expect(resolvePlatformRoleFromClaims(undefined)).toBeNull();
  });

  it("resuelve el rol desde publicMetadata.role", () => {
    expect(resolvePlatformRoleFromClaims({ publicMetadata: { role: "TEACHER" } })).toBe("TEACHER");
  });

  it("resuelve el rol desde metadata.role", () => {
    expect(resolvePlatformRoleFromClaims({ metadata: { role: "ADMIN" } })).toBe("ADMIN");
  });

  it("resuelve el rol directo", () => {
    expect(resolvePlatformRoleFromClaims({ role: "STUDENT" })).toBe("STUDENT");
  });

  it("resuelve null ante un valor no reconocido (fail-closed, nunca asume STUDENT)", () => {
    expect(resolvePlatformRoleFromClaims({ role: "SUPERUSER" })).toBeNull();
  });
});

describe("resolvePostAuthRedirectPath", () => {
  it("dirige a /dashboard cuando el rol es STUDENT", () => {
    expect(resolvePostAuthRedirectPath({ publicMetadata: { role: "STUDENT" } })).toBe("/dashboard");
  });

  it("dirige a /dashboard cuando no hay rol reconocido (default seguro, sin operaciones privilegiadas)", () => {
    expect(resolvePostAuthRedirectPath(null)).toBe("/dashboard");
  });

  it("dirige a /academy/teacher cuando el rol es TEACHER", () => {
    expect(resolvePostAuthRedirectPath({ publicMetadata: { role: "TEACHER" } })).toBe("/academy/teacher");
  });

  it("dirige a /academy/admin/model-examples cuando el rol es ADMIN", () => {
    expect(resolvePostAuthRedirectPath({ publicMetadata: { role: "ADMIN" } })).toBe(
      "/academy/admin/model-examples",
    );
  });
});
