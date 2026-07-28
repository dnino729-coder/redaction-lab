// Barrel de la API Layer de Academia (Sprint 6.3). Los Route Handlers
// reales viven en `app/api/v1/academy/**/route.ts` (requisito técnico de
// Next.js App Router — no pueden vivir dentro de `features/`); cada uno es
// un archivo delgado que importa y delega en las funciones de
// `handlers/*.ts` exportadas aquí, consistente con el resto del proyecto
// (`features/*` concentra la lógica real, `app/*` solo la conecta al
// framework).
export * from "./composition";
export * from "./http";
export * from "./request-mappers";
export * from "./response-mappers";
export * from "./handlers";
export * from "./openapi";
