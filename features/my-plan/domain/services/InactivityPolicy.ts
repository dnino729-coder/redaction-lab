// Domain Service — umbral de inactividad de Mi Plan (resolución 18.20.3 /
// Vacío 3): "3 días consecutivos sin StudySession completada", constante
// de configuración de negocio (no columna de esquema), deliberadamente
// distinto del umbral de 1 día de `Streak` (11.4).
//
// Es la única parte *pura* (sin I/O) del "Servicio de reorganización
// automática" descrito en docs/modules/mi-plan.md, 2.4: decidir, dadas dos
// fechas, si el umbral se alcanzó. Consultar cuál fue la última
// `StudySession` completada de un estudiante requiere un repositorio
// (infraestructura) — por eso esa parte no vive aquí y queda para el
// job/servicio de aplicación de un sprint posterior; este servicio de
// dominio solo encapsula la regla de negocio en sí, para que sea
// reutilizable y probable sin ninguna dependencia.
export class InactivityPolicy {
  /** Días consecutivos sin sesión de estudio válida que disparan
   * PLAN_INACTIVITY_THRESHOLD_REACHED (18.20.3). */
  public static readonly INACTIVITY_THRESHOLD_DAYS = 3;

  /**
   * @param lastCompletedSessionAt Fecha de la última `StudySession` con
   *   `completed = true` del plan activo del estudiante, o `null` si no
   *   registra ninguna todavía.
   * @param now Instante de referencia (inyectado, nunca `new Date()`
   *   interno, para mantener el cálculo puro y determinista en pruebas).
   */
  public static isThresholdReached(
    lastCompletedSessionAt: Date | null,
    now: Date,
  ): boolean {
    return InactivityPolicy.daysInactive(lastCompletedSessionAt, now) >= InactivityPolicy.INACTIVITY_THRESHOLD_DAYS;
  }

  /**
   * Días completos transcurridos desde la última sesión de estudio válida.
   * Si nunca hubo ninguna, se considera inactivo desde siempre
   * (`Number.POSITIVE_INFINITY`) — un plan recién creado sin sesiones
   * todavía no debería, en la práctica, alcanzar este cálculo antes de su
   * primera sesión, pero el servicio no asume eso por sí mismo.
   */
  public static daysInactive(lastCompletedSessionAt: Date | null, now: Date): number {
    if (lastCompletedSessionAt === null) {
      return Number.POSITIVE_INFINITY;
    }
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - lastCompletedSessionAt.getTime();
    return Math.floor(elapsedMs / millisecondsPerDay);
  }
}
