import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Fase 6 (Roadmap §24): al añadir specs E2E de Playwright bajo
    // `tests/e2e/` (mismo glob `.spec.ts` que Vitest ya reconoce por
    // defecto), Vitest intentaba recolectarlos también y fallaba
    // ("Playwright Test did not expect test.describe() to be called
    // here") — los excluye explícitamente, preservando además la lista de
    // exclusión por defecto de Vitest (nunca sobrescrita, solo extendida).
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      "tests/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        // Sección 15.6/16.2 (Fase 10): cobertura mínima de pruebas unitarias 90%.
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
