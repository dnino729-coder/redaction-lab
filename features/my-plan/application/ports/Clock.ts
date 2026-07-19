// Puerto — instante actual del servidor. Los Handlers nunca llaman a
// `new Date()` directamente (mismo criterio de determinismo/testabilidad
// ya aplicado en el Domain Layer, p. ej. `InactivityPolicy.now`
// inyectado) — siempre piden la hora a este puerto, para poder
// inyectar un reloj fijo en pruebas unitarias.
export interface Clock {
  now(): Date;
}
