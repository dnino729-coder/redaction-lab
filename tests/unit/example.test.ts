// Prueba de humo — confirma que el entorno de Vitest está correctamente
// configurado antes de que existan módulos de producto (sección 15.6: cobertura
// mínima 90%; esta prueba no cuenta como cobertura funcional).
import { describe, expect, it } from "vitest";

describe("infraestructura de pruebas", () => {
  it("ejecuta correctamente", () => {
    expect(true).toBe(true);
  });
});
