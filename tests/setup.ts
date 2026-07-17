// Configuración global de Vitest (referenciada desde vitest.config.ts,
// `test.setupFiles`). Registra los matchers de @testing-library/jest-dom
// (toBeInTheDocument, toHaveTextContent, etc.) — sin esto, ningún test de
// componente puede usar esas aserciones. Corrige un vacío de la
// configuración inicial (vitest.config.ts declaraba jsdom + Testing Library
// como dependencias, pero nunca registraba los matchers).
import "@testing-library/jest-dom/vitest";
