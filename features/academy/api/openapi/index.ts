import academyOpenApiDocument from "./academy.openapi.json";

// OpenAPI (Alcance #13) — documentación técnica derivada del API Contract
// v1.3 (Sección 1: "la forma final serializada exacta... es un artefacto
// derivado, no producido [en el contrato]") — este módulo solo expone el
// documento estático ya generado; no reinterpreta ningún endpoint/DTO/
// código HTTP.
export { academyOpenApiDocument };
