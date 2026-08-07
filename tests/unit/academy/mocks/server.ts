// Servidor MSW de Academia (Node, `setupServer`) — Blueprint Sección 16.2:
// "Component"/"Integration" usan MSW para REST. Import explícito por test
// (no registrado en `tests/setup.ts` global): así no intercepta peticiones
// de otras suites (Dashboard, Mi Plan) que no lo necesitan.
import { setupServer } from "msw/node";
import { academyHandlers } from "./handlers";

export const server = setupServer(...academyHandlers);
