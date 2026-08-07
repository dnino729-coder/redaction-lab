# Experiencia del Profesor — Camille Laurent

Descripción exacta de lo que Camille ve al usar el Panel de Profesor ya construido (P-12, P-13, P-15), con los datos del escenario de demostración.

---

## Lo que ve en el Panel de Profesor (P-12)

Tras iniciar sesión, Camille llega a `/academy/teacher`. Ya tiene añadidos (por configuración previa a la demo) a sus dos estudiantes de seguimiento: Sofía Reyes y Mateo Vargas. Ve dos tarjetas de resumen, una por estudiante, cada una mostrando:

- El identificador del estudiante.
- El total de unidades y su distribución por estado (`unitsByState`): cuántas `COMPLETED`/`MASTERED`, cuántas `IN_PROGRESS`, cuántas `UNLOCKED` sin empezar.
- Un link directo al detalle de cada estudiante.

**Lectura inmediata de las dos tarjetas:**
- **Sofía Reyes:** 1 unidad `COMPLETED`, 1 unidad `IN_PROGRESS` — una trayectoria de avance sostenido.
- **Mateo Vargas:** 1 unidad `AWAITING_FEEDBACK` (justo el intento que Camille va a revisar) — actividad reciente, con retroalimentación ya generada, sin reflexión de cierre todavía.

## Lo que ve en el Detalle de Estudiante (P-13) — caso Mateo

Al abrir el detalle de Mateo, Camille ve:

- Su progreso agregado por estado y por tipo de texto.
- Una barra de progreso general (unidades completadas / total).
- Un formulario para consultar el historial de una unidad específica (por diseño actual, ella introduce el identificador de la unidad — ver limitación disclosed en Sprint 1B).

## Lo que ve en el Historial de Unidad (P-15) — caso Mateo, Unidad 1

Al consultar el historial de la Unidad 1 de Mateo, Camille ve, para el intento actual:

- El paso actual del intento y la fecha de inicio.
- La versión enviada por Mateo (el texto completo de `02-mateo-produccion-escrita.md`).
- Las 7 observaciones de retroalimentación generadas por la IA (`03-feedback-ia-simulado.md`), en el mismo orden y con las mismas categorías que vería el propio Mateo — **de solo lectura**, sin poder editarlas ni sobrescribirlas (comportamiento actual, documentado, no un límite oculto).

## Indicadores que aparecen

| Indicador | Sofía | Mateo |
|---|---|---|
| Unidades completadas | 1 | 0 |
| Unidades en progreso | 1 | 1 (esperando reflexión) |
| Última actividad | Hace 2 días | Hoy mismo |
| Observaciones de IA predominantes | (unidad 2, aún sin datos de demo) | Registro, cohesión, gramática |

## Conclusiones que Camille puede sacar sin leer una sola palabra por sí misma

1. **Mateo necesita intervención pedagógica puntual, no genérica.** No es un problema de comprensión del ejercicio (su `COMMUNICATIVE_INTENT` es una fortaleza) — es un patrón específico y recurrente: la transición registro formal/informal y la confusión "malgré"/"bien que". Camille puede decidir, con esa información exacta, dedicarle 5 minutos de retroalimentación oral dirigida a ESE punto, en vez de releer la carta completa desde cero.
2. **Sofía puede continuar de forma autónoma.** Su progreso ya muestra una unidad completada y avance sostenido en la siguiente — no hay ninguna señal en sus datos que sugiera que necesita una intervención activa esta semana.
3. **El patrón de Mateo es diagnosticable y accionable de inmediato** — Camille no tuvo que corregir el texto ella misma para llegar a esta conclusión; la retroalimentación ya categorizada se la dio en el tiempo que tardó en abrir dos pantallas.

## Estudiante que necesita intervención vs. estudiante que puede continuar solo

- **Necesita intervención (esta semana):** Mateo Vargas — patrón de registro y gramática ya identificado y accionable.
- **Puede continuar solo:** Sofía Reyes — progreso autónomo saludable, sin patrones de error recurrentes visibles en sus datos.
