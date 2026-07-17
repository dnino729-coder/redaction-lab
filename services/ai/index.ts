// Servicio: ai — AI Orchestrator (sección 9.4 — único componente autorizado
// a hablar con proveedores de IA). "Los servicios nunca dependerán de
// componentes visuales" (sección 5.4).
//
// Expone únicamente el contrato (AIProvider) del que debe depender el resto
// de la plataforma (hallazgo 5 de la auditoría de infraestructura). La
// implementación del Orchestrator y de los proveedores concretos
// (OpenAI/Anthropic) se añade al desarrollar el módulo de IA.
export type { AIProvider, AIProviderMessage, AIProviderRequest, AIProviderResponse } from "./provider.interface";
