// Punto de entrada de consultas reutilizables (sección 5.4: database/queries/).
// El esquema Prisma vive en /prisma/schema.prisma por convención de la
// herramienta (nota de la resolución 18.1). Contiene únicamente consultas
// (lectura/escritura Prisma), sin reglas de negocio — ver el límite exacto
// entre /prisma, database/ y services/database en ARCHITECTURE.md, sección
// 2.1 (hallazgo 9 de la auditoría de infraestructura).
export * from "./user";
export * from "./learningPlan";
export * from "./writing";
export * from "./coach";
export * from "./competency";
export * from "./metrics";
export * from "./exam";
export * from "./gamification";
export * from "./studentDashboard";
