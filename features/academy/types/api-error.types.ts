// Envoltorio uniforme de error — Blueprint §5.11. Nativo en REST; para las 6
// Server Actions, los hooks normalizan cualquier excepción a esta misma forma
// (Blueprint §3.1) para que ningún componente tenga que distinguir transporte.
export interface AcademyErrorHttp {
  /** Vocabulario PENDIENTE (Blueprint §14, ítem 4) — no diseñar lógica
   * condicional sobre `code` todavía. */
  code: string;
  /** Único campo seguro para mostrar al usuario. */
  message: string;
  /** Incluir en telemetría/soporte, nunca mostrar crudo al usuario. */
  correlationId: string;
  details?: Record<string, unknown>;
}
