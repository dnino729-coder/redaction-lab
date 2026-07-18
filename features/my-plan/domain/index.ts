// Punto de entrada único de la capa de dominio de Mi Plan (Sprint 3.3.2).
// Cero dependencias hacia Prisma/PostgreSQL/Next.js/React/Supabase/APIs
// externas — ver docs/audits/ para la auditoría de dependencia cero.
export * from "./shared/Entity";
export * from "./shared/AggregateRoot";

export * from "./exceptions";
export * from "./enums";
export * from "./value-objects";
export * from "./events";
export * from "./entities";
export * from "./services";
export * from "./repositories";
