// Punto de entrada público de la Infrastructure Layer de Mi Plan
// (Sprint 3.3.4). Reexporta persistence (mappers/repositories/UoW),
// query-services, events, adapters, exceptions y composition — la única
// capa de todo el módulo que conoce Prisma/Postgres/Node de forma
// directa. Domain y Application (Sprints 3.3.2/3.3.3) no importan nada
// de aquí — la dependencia va exclusivamente en un sentido:
// Infrastructure → Application → Domain.
export * from "./persistence";
export * from "./query-services";
export * from "./events";
export * from "./adapters";
export * from "./exceptions";
export * from "./composition";
