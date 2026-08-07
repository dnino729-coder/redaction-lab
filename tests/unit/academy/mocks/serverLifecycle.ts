// Registra el ciclo de vida estándar del servidor MSW de Academia
// (listen/resetHandlers/close). Cada archivo de test de Fase 1 que necesite
// interceptar REST llama a `registerAcademyMswServer()` una vez, en el nivel
// superior del archivo — evita repetir el mismo `beforeAll/afterEach/afterAll`
// en cada suite. Deliberadamente sin prefijo `use` (no es un Hook de React;
// `react-hooks/rules-of-hooks` lo marcaría por el nombre al llamarse a nivel
// de módulo).
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

export function registerAcademyMswServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
