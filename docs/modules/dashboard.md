# Módulo Dashboard — Diseño completo

> Fuente de verdad: `02_Conocimiento_Consolidado_Resuelto.md`. Referencias de
> sección entre paréntesis. Este documento es diseño; el código real vive en
> `features/dashboard/` (ruta `app/[locale]/(app)/dashboard/`), implementado
> exactamente conforme a este diseño.
>
> **Estado:** ✅ Auditado (Software Architect / Tech Lead / QA Lead) y
> ✅ **implementado** (código de producción). Ver "17. Historial de
> auditoría" al final de este documento para el detalle de las 3 rondas
> (diseño, propagación de i18n, implementación).

## 1. Objetivo

"Dar al estudiante una visión clara de su progreso y orientarlo sobre qué
hacer a continuación" (1.4, 6.3). No es un menú de navegación: es "el centro
de control desde el cual el estudiante organiza todo su proceso de
aprendizaje" (6.3, Doc 6).

Debe responder en menos de 5 segundos a las 4 preguntas fundamentales (8.3):
¿Dónde estoy? ¿Cómo voy? ¿Qué debo hacer hoy? ¿Qué tan cerca estoy de mi
objetivo?

## 2. Funcionalidades

Los 7 bloques obligatorios, en este orden exacto (6.3/8.4, Doc 8 Cap. 4):

1. **Bienvenida** — saludo personalizado, avatar del Coach IA, mensaje
   motivador contextual, fecha/hora de la última sesión.
2. **Mi objetivo** — fecha prevista del examen, días restantes, % general de
   preparación, nivel estimado de desempeño, avance hacia la meta.
3. **Mi Plan (resumen)** — horas recomendadas semanales, sesiones
   completadas/pendientes, objetivo diario, progreso semanal.
4. **Continúa donde te quedaste** — última unidad, última actividad, último
   texto escrito, retroalimentaciones pendientes, simulaciones incompletas.
   Acceso obligatorio "mediante un único clic" (6.3, MUST).
5. **Recomendación del Coach IA** — una única recomendación prioritaria con
   breve justificación, más **una acción primaria explícita** ("botón:
   comenzar entrenamiento", tal como aparece en el ejemplo textual de la
   sección 6.3) que lleva directamente a esa recomendación. El Coach nunca
   sobrecarga con más de una recomendación a la vez (9.2).
   > **Aclaración de auditoría (ver sección de auditoría más abajo):** el
   > ejemplo textual de 6.3 ("Hoy recomendamos: continuar Academia, escribir
   > una carta, realizar el reto diario") menciona tres actividades, en
   > apariencia en tensión con la regla "una única recomendación" del mismo
   > apartado. Se interpreta que las tres actividades componen el contenido
   > de **una única** recomendación/plan del día (un solo bloque, un solo
   > CTA "Comenzar entrenamiento"), no tres tarjetas de recomendación
   > independientes — así se preserva la regla explícita y la filosofía de
   > no sobrecargar (9.2: "la plataforma debe tener silencios").
6. **Evolución (resumen visual)** — calidad de escritura, organización
   textual, gramática, cohesión, vocabulario, frecuencia de estudio,
   autonomía.
7. **Acceso a los ecosistemas** — los 9 espacios de navegación (8.3,
   resolución 18.6).

Comportamiento transversal obligatorio:
- **Personalización real** (6.3): "dos estudiantes nunca tendrán exactamente
  el mismo Dashboard, aunque compartirán la misma estructura visual" — varía
  según progreso, dificultades, frecuencia, fecha del examen, resultados de
  simulaciones, hábitos.
- **Regla de continuidad** (6.3): al finalizar cualquier actividad en otro
  módulo, la plataforma no regresa automáticamente al Dashboard/menú
  principal — ofrece una transición natural a la siguiente etapa. El
  Dashboard debe diseñarse para ser un punto de partida, no un punto de
  retorno forzado.
- **Adaptación por autonomía** (8.10/9.2): el volumen de intervención del
  Coach IA en el Dashboard disminuye a medida que el estudiante gana
  autonomía.

## 3. Flujo del usuario

**Estudiante recurrente:** login (Clerk) → middleware valida sesión → sin
onboarding pendiente → redirección directa a `/dashboard` (6.2: "usuario
recurrente → directo al Dashboard Inteligente") → Server Component solicita
datos consolidados → se renderizan los 7 bloques → el estudiante decide su
siguiente acción (continuar, seguir recomendación del Coach, entrar a un
ecosistema).

**Primer ingreso:** tras completar onboarding (diagnóstico + Mi Plan inicial,
6.2) se crea el Dashboard personalizado (paso 6 del flujo de registro, 6.2)
→ primera visita al Dashboard sin historial de "continuar donde te
quedaste" (bloque 4 vacío/estado inicial) y sin datos de Evolución aún.

**Reactivación tras inactividad:** si han pasado varios días sin actividad,
Mi Plan se reorganiza y el Coach IA ofrece estrategias de retomar el ritmo
(5.6) — el Dashboard debe reflejar ese mensaje de reactivación con el tono
definido en 2.3 ("¡Qué bueno verte nuevamente!...").

**Tras completar una actividad en otro módulo:** el evento correspondiente
actualiza Evolución, Mi Plan y la memoria del Coach (5.6); la próxima vez
que el estudiante visite el Dashboard, ve el estado actualizado — el
Dashboard no participa activamente en ese flujo, solo lee el resultado.

## 4. Componentes

Ubicados en `features/dashboard/components/` (más componentes globales
reutilizados de `components/`, sección 14.6):

| Componente | Bloque | Reutiliza (`components/`) |
|---|---|---|
| `WelcomeHeader` | 1. Bienvenida | Avatar (Coach), texto |
| `GoalOverviewCard` | 2. Mi objetivo | Card, ProgressBar |
| `PlanSummaryCard` | 3. Mi Plan (resumen) | Card, ProgressBar |
| `ContinueWhereYouLeftOff` | 4. Continuar | Card, Botón "continuar" |
| `CoachRecommendationCard` | 5. Recomendación Coach IA | Componentes del Coach IA (14.6: tarjeta de sugerencia) |
| `PrimaryTrainingCTA` | 5. Botón "Comenzar entrenamiento" (acción primaria única, 6.3) | Botón primario (14.6) |
| `EvolutionSummaryPanel` | 6. Evolución | Charts (14.6) |
| `EcosystemAccessGrid` | 7. Acceso a ecosistemas | Card de ecosistema (14.6) |
| `DashboardSkeleton` | Estado de carga | Skeleton Screens (14.7) |
| `DashboardErrorState` | Estado de error | Mensaje de retroalimentación (14.6, "nunca deberá generar ansiedad") |

Regla de composición: `features/dashboard/pages` ensambla estos componentes;
ninguno de ellos importa directamente de otra feature (regla de aislamiento,
sección 5.4, reforzada por auditoría de infraestructura, hallazgo 1).

## 5. Rutas

- `/dashboard` (francés, idioma predeterminado, sin prefijo de URL) /
  `/es/dashboard` (español) — ruta privada (12.9), ya scaffoldeada en
  `app/[locale]/(app)/dashboard/page.tsx`, protegida por `middleware.ts`
  (Clerk + enrutamiento de idioma next-intl compuestos — resolución 18.18).
- No requiere sub-rutas: el Dashboard es una vista única y consolidada, no
  un conjunto de páginas (no hay evidencia en el documento de sub-secciones
  navegables dentro del propio Dashboard).
- `app/[locale]/(app)/layout.tsx` (ya existente) envuelve la ruta con el
  shell privado compartido por los 9 espacios.

## 6. Estados

| Estado | Descripción | Referencia |
|---|---|---|
| `loading` | Carga inicial de datos consolidados | Skeleton Screens (14.7) |
| `ready` | Datos disponibles, 7 bloques renderizados | — |
| `empty-first-visit` | Primera visita tras onboarding; bloque 4 y 6 sin historial | 6.2 |
| `reactivation` | Regreso tras varios días de inactividad; mensaje y tono específicos | 2.3, 5.6 |
| `progress-improved` | El estudiante mejoró recientemente; mensaje de bienvenida celebra el progreso ("¡Excelente progreso!...") | 2.3 |
| `high-score` | Obtuvo una excelente nota reciente; mensaje de bienvenida distinto al de mejora incremental | 2.3 |
| `struggling` | Errores/dificultad recurrente detectada; mensaje de apoyo, nunca de juicio | 2.3 |
| `error` | Fallo temporal de carga; mensaje tranquilo, nunca alarmante | 14.7 |
| `stale-refreshing` | Datos cacheados mostrados mientras se revalida en segundo plano | 15.1 |

Las variantes `reactivation`, `progress-improved`, `high-score` y
`struggling` son **estados del mensaje de bienvenida (bloque 1)**, no
estados de carga de toda la vista — se seleccionan a partir de la misma
tabla de tono por situación (2.3) y son mutuamente excluyentes por visita
(el Motor Pedagógico Adaptativo, 9.7, decide cuál aplica; el Dashboard no
decide la lógica, solo renderiza la variante indicada).

Gestión de estado: `stores/dashboardStore` (Zustand) para estado de UI
puramente de cliente (p. ej. qué recomendación fue descartada en esta
sesión); TanStack Query para los datos derivados del servidor (cache,
revalidación) — sección 5.2. El Dashboard no mantiene su propio estado de
negocio persistente más allá de `StudentDashboard` (sección 10).

## 7. Servicios

El Dashboard **nunca** llama directamente a otro ecosistema (Academia, Mi
Plan, Laboratorio, etc. — regla obligatoria de la sección 5.7: "el Dashboard
no consultará directamente la Academia"). Toda lectura pasa por:

- `services/database` → repositorios de `database/repositories` (lectura de
  `StudentDashboard`, `LearningPlan`, `WritingSubmission`, `CoachContext`,
  `StudentCompetency`, `Streak`, etc. — ver sección 10).
- `services/ai` → AI Orchestrator → Coach Service (genera/recupera la
  recomendación del bloque 5 — sección 9.4). El Dashboard consume el
  contrato `AIProvider` indirectamente, nunca un SDK de proveedor.
- `services/gamification` (racha, nivel, XP para el bloque 2/6 — 11.4).
- `services/analytics` (índices de Learning Analytics para el bloque 6 —
  13.8).
- Motor de Orquestación / Motor Pedagógico Adaptativo (9.7): decide "qué
  información destacar" en el Dashboard — el Dashboard es consumidor de esa
  decisión, no la calcula él mismo.

Un "Dashboard Service" (`features/dashboard/services`) actúa como única
fachada que agrega las llamadas anteriores en una sola respuesta
consolidada — este es el único punto de entrada de datos del módulo.

## 8. Eventos

El Dashboard **escucha/reacciona** a eventos generados por otros módulos
(sistema basado en eventos, 5.7), pero no participa en su emisión original:
`actividad_completada`, `produccion_enviada`, `retroalimentacion_generada`,
`simulacion_finalizada`, `objetivo_alcanzado`, `racha_actualizada`,
`cambio_configuracion`.

El Dashboard **sí emite** eventos propios de interacción/analítica (13.8,
15.5 — PostHog): `dashboard_viewed`, `dashboard_recommendation_dismissed`,
`dashboard_continue_clicked`, `dashboard_ecosystem_clicked`.

Regla obligatoria (5.6): "la información nunca deberá permanecer aislada
dentro de un único ecosistema" — cualquier evento relevante generado en otro
módulo debe reflejarse en el Dashboard en la siguiente carga (vía caché
invalidado/revalidado, no necesariamente en tiempo real dentro de la misma
sesión).

## 9. Hooks

En `features/dashboard/hooks/`:

- `useDashboardData` — TanStack Query; obtiene el consolidado del Dashboard
  Service.
- `useCoachRecommendation` — obtiene y permite descartar la recomendación
  del día.
- `useContinueWhereYouLeftOff` — resuelve el destino de un único clic
  (bloque 4).
- `useDashboardStore` — wrapper del store de Zustand (estado de UI).

Reutiliza hooks globales (`hooks/`): `useAuth`, `useToast`, `useMediaQuery`
(responsive, 14.10).

## 10. Base de datos involucrada

Entidad propia (13.8): **`StudentDashboard`** — `id, student_id,
current_level, total_xp, completed_activities, completed_plans,
current_streak, updated_at`. Regla MUST (13.8): "el Dashboard consolida
únicamente información derivada de otras tablas — no almacena información
duplicada".

Fuentes de solo lectura (el Dashboard nunca escribe en ellas):

| Entidad | Sección | Alimenta |
|---|---|---|
| `User` / `StudentProfile` | 13.1/13.2 | Bloque 1, 2 |
| `ExamAttempt`, `EvaluationResult` | 13.6 | Bloque 2 ("nivel estimado de desempeño" — equivalente a "Niveau estimé" de 10.2) |
| `LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress` | 13.4 | Bloque 3 |
| `WritingSubmission`, `WritingDraft` | 13.5 | Bloque 4 |
| `CoachRecommendation`, `CoachContext` | 13.7 | Bloque 5 |
| `StudentCompetency`, `CompetencyProgress`, `LearningAnalytics` | 13.8 | Bloque 6 (calidad de escritura, organización, gramática, cohesión, vocabulario, autonomía) |
| `LearningMetric`, `PerformanceMetric` | 13.8 | Bloque 6 ("frecuencia de estudio" — `study_time_minutes`, `active_days`; distinto de `LearningAnalytics`, que cubre los índices compuestos) |
| `Streak`, `StudentLevel`, `XPTransaction` | 11.4/13.9 | Bloque 2, 6 |

> **Corrección de auditoría:** la versión anterior de este documento omitía
> `ExamAttempt`/`EvaluationResult` como fuente del "nivel estimado de
> desempeño" (bloque 2) y omitía `LearningMetric`/`PerformanceMetric` como
> fuente de "frecuencia de estudio" (bloque 6) — ambos indicadores estaban
> declarados en la sección 2 sin una fuente de datos identificada. Corregido.

Optimización obligatoria (15.1): caché en Redis para Dashboard; Materialized
View "Student Dashboard" actualizada mediante procesos programados, en vez
de recalcular agregados en cada carga.

**Seguridad de datos (corrección de auditoría):** todas las tablas de
solo lectura listadas arriba deben tener Row Level Security activo en
Supabase, con política "el estudiante solo podrá acceder a su propia
información" (5.5, MUST) — el Dashboard Service debe ejecutar sus lecturas
en el contexto de sesión del estudiante autenticado, nunca con una
credencial de servicio de alcance global, salvo en procesos programados de
refresco de la Materialized View (que sí requieren un rol de servicio,
auditado — 13.11, `AuditLog`).

## 11. APIs

Conforme al stack resuelto (18.1: Next.js Route Handlers/Server Actions, sin
capa REST NestJS separada):

- **Server Component** (RSC): fetch inicial del consolidado del Dashboard —
  sin round-trip cliente-servidor adicional.
- **Server Actions**: `dismissRecommendation()`, `markContinueClicked()` —
  mutaciones ligeras de interacción.
- **Route Handler interno, opcional**: `GET /api/dashboard/refresh`, solo si
  se requiere un botón explícito de "actualizar" fuera del ciclo normal de
  revalidación de Next.js (`revalidatePath`/`revalidateTag`).
- No se expone ningún endpoint REST versionado públicamente — ese enfoque
  pertenece a la especificación descartada (Anexo D, sección 15.7, ver
  sección 17.1 del documento consolidado).

## 12. Dependencias

**De qué depende el Dashboard (upstream):** Autenticación (Clerk, sesión
activa — 12), Perfil pedagógico (12.2), Mi Plan (6.12), Producción Escrita
(6.6/13.5), Coach IA/Memoria (9, 13.7), Competencias/Analíticas (13.8),
Gamificación (11/13.9), Motor Pedagógico Adaptativo (9.7 — decide qué
destacar), Motor de Orquestación (5.7).

**Qué consume el Dashboard (downstream):** únicamente el estudiante final.
El Dashboard es un consumidor terminal de información — ningún otro módulo
depende de datos que el Dashboard calcule o posea (la relación es "Mi Plan
alimenta al Dashboard", nunca al revés — 6.12: "el Dashboard tomará la
información de aquí [Mi Plan] para decidir qué mostrar cada día").

**Riesgo de romper algo si se modifica:** alto acoplamiento de **lectura**
(depende de casi todos los dominios pedagógicos); bajo acoplamiento de
**escritura** (no debería escribir en dominios ajenos, solo en
`StudentDashboard` como consolidado). Cambios en el modelo de datos de Mi
Plan, Producción Escrita, Coach o Gamificación pueden romper el Dashboard si
no se coordina la migración correspondiente (13.14/13.15).

## 13. Casos de uso

1. Estudiante recurrente abre el Dashboard y ve su estado actualizado en
   menos de 5 segundos.
2. Estudiante nuevo ve el Dashboard por primera vez tras el onboarding (sin
   historial de "continuar", con Mi Plan recién creado).
3. Estudiante hace clic en la recomendación del Coach IA y es dirigido
   directamente a la actividad sugerida.
4. Estudiante hace clic en "Continúa donde te quedaste" y accede en un solo
   clic a la última actividad/producción/simulación incompleta.
5. Estudiante regresa tras varios días de inactividad y ve un mensaje de
   reactivación (tono de 2.3) junto con Mi Plan reorganizado.
6. Estudiante completa una actividad en Academia y, al volver al Dashboard,
   ve el progreso reflejado (evento `actividad_completada` propagado).
7. Estudiante navega desde el Dashboard a cualquiera de los 9 ecosistemas.
8. Ocurre un error temporal al cargar los datos del Dashboard: se muestra un
   mensaje tranquilo, nunca alarmante, y el resto de la interfaz no se
   bloquea (14.7).

## 14. Wireframes

Wireframe de baja fidelidad (escritorio) mostrado arriba en la conversación:
navegación lateral con los 9 espacios (dashboard fijo en primera posición,
8.3) y los 7 bloques apilados en el orden obligatorio.

**Layout móvil (mobile-first, 14.10):** una sola columna, desplazamiento
vertical continuo; navegación en barra inferior fija + menú desplegable;
los bloques 2 y 3 pasan de 2 columnas a apilados; el bloque 6 (Evolución)
reduce de 5 a 2-3 indicadores visibles con opción de "ver más"; el acceso a
ecosistemas (bloque 7) pasa de grid 4×2 a carrusel horizontal o lista de 2
columnas. Ninguna funcionalidad se pierde por usar un dispositivo móvil
(14.10, MUST).

**Layout tablet (corrección de auditoría — antes subdesarrollado):** menú
lateral colapsable + navegación superior (14.10). Los bloques 1, 4 y 5
ocupan el ancho completo (una columna); los bloques 2 y 3 se muestran en
2 columnas lado a lado, igual que en escritorio; el bloque 6 (Evolución)
muestra 3-4 indicadores (punto intermedio entre los 2-3 de móvil y los 5 de
escritorio); el bloque 7 usa grid de 3 columnas (en vez de 4 en escritorio o
carrusel/2 columnas en móvil). El Coach IA permanece accesible mediante
botón flotante o acceso fijo, igual que en el resto de dispositivos (14.10).

**Token de color del Dashboard (corrección de auditoría):** la tabla de
colores por ecosistema (14.3) no le asigna un color de acento propio al
Dashboard — a diferencia de Academia (azul), Laboratorio (violeta),
Entrenamiento (naranja), Simulador (granate), Evolución (verde) y Mi Plan
(turquesa). Esto es intencional, no una omisión: el Dashboard es "siempre
el punto central de navegación" (14.1) y debe usar los tokens neutros/
primarios del sistema (`Primary-*`, `Neutral-*`, sección 14.12.3), nunca un
acento de ecosistema — se deja explícito aquí para que la fase de
implementación no invente un color no especificado en el documento.

## 15. Navegación

- El Dashboard ocupa la primera posición, fija, en `NAVIGATION_ITEMS`
  (`config/navigation.ts`) — regla de posicionamiento estable (8.3): "los
  ecosistemas mantendrán siempre la misma posición dentro de la navegación
  principal".
- Es el destino tras login para usuarios recurrentes y tras onboarding para
  usuarios nuevos (6.2).
- Desde el Dashboard se accede a los 8 espacios restantes (bloque 7); el
  Dashboard mismo no tiene "salida" obligatoria — es un punto de partida.
- Regla de no-retorno forzado (6.3): otros módulos no deben redirigir
  automáticamente al Dashboard al completar una actividad; el diseño de
  navegación de salida de esos módulos debe ofrecer una transición natural,
  no un regreso al menú.

## 16. Criterios de aceptación

- Responde a las 4 preguntas fundamentales (8.3) en menos de 5 segundos
  (presupuesto de rendimiento medible).
- Los 7 bloques se muestran en el orden exacto especificado (6.3/8.4), sin
  omitir ninguno.
- Personalización verificable: dos estudiantes con historiales distintos
  ven contenido distinto en los mismos componentes.
- "Continúa donde te quedaste" es alcanzable en un único clic (6.3, MUST).
- Ninguna llamada directa del Dashboard a otro ecosistema — toda lectura
  pasa por servicios/repositorios (5.7, MUST; verificable con la regla de
  ESLint de aislamiento entre features, auditoría de infraestructura
  hallazgo 1).
- `StudentDashboard` no almacena datos duplicados de otras tablas (13.8,
  MUST).
- Datos servidos desde caché Redis / Materialized View cuando corresponda
  (15.1).
- Accesible (WCAG 2.2 AA): navegación por teclado, foco visible, contraste,
  iconografía siempre acompañada de texto (14.9).
- Responsive mobile-first sin pérdida de funcionalidad (14.10).
- Estados de carga/error conformes a 14.7: Skeleton Screens, mensajes de
  error tranquilos, nunca alarmantes.
- Tono del Coach IA en el Dashboard conforme a la tabla de tono por
  situación (2.3) — especialmente en bienvenida, reactivación y
  recomendación.
- **(Corrección de auditoría)** El Coach IA en el Dashboard respeta la
  regla de contención de la sección 9.2 ("cuándo NO aparece"): no felicita
  tras cada clic, no interrumpe constantemente, no repite explicaciones
  obvias — como máximo una intervención de bienvenida y una recomendación
  por visita, nunca más.
- **(Corrección de auditoría)** Row Level Security activo en todas las
  tablas de origen consultadas por el Dashboard Service (5.5, MUST).
- Cobertura de pruebas ≥90% al implementarse (15.6/16.2).
- **(Regla de idioma — resolución 18.18)** Todo texto de UI de los 7
  bloques, mensajes de bienvenida (variantes de tono, 2.3), estados vacíos
  y de error (14.7) se implementa mediante claves de `next-intl`
  (`useTranslations`/`getTranslations`), nunca como texto literal en el
  componente. El francés es el idioma en el que se redacta y valida
  primero cada cadena; la traducción a `messages/es.json` se añade en el
  mismo cambio o queda registrada como deuda pendiente explícita — nunca
  una clave sin traducir en silencio.

## 17. Historial de auditoría

**Auditoría 1 (Software Architect / Tech Lead / QA Lead)** — comparación
íntegra contra `02_Conocimiento_Consolidado_Resuelto.md`. 9 hallazgos
detectados y corregidos en este mismo documento (marcados inline como
"corrección de auditoría"):

1. Faltaba una acción primaria explícita ("botón: comenzar entrenamiento")
   en el bloque 5 — añadido componente `PrimaryTrainingCTA` (sección 4).
2. Tensión no aclarada entre "una única recomendación" (6.3) y el ejemplo
   con tres actividades del mismo apartado — aclarada la interpretación
   (sección 2).
3. Variantes del mensaje de bienvenida (bloque 1) no mapeadas a la tabla de
   tono por situación (2.3) más allá de "reactivación" — añadidas
   `progress-improved`, `high-score`, `struggling` (sección 6).
4. Regla de contención del Coach IA (9.2, "cuándo NO aparece") no traducida
   a criterio de aceptación — añadido (sección 16).
5. Sin mención explícita de Row Level Security (5.5, MUST) sobre las
   fuentes de datos del Dashboard — añadida (secciones 10 y 16).
6. Layout de tablet subdesarrollado frente a escritorio/móvil — expandido
   (sección 14).
7. Falta de fuente de datos para "frecuencia de estudio" (bloque 6) —
   añadidas `LearningMetric`/`PerformanceMetric` (sección 10).
8. Falta de fuente de datos para "nivel estimado de desempeño" (bloque 2) —
   añadidas `ExamAttempt`/`EvaluationResult` (sección 10).
9. Sin aclaración explícita de que el Dashboard no tiene color de acento de
   ecosistema propio (14.3) — aclarado para evitar que la implementación
   invente un valor no especificado (sección 14).

**Veredicto:** ✅ APROBADO PARA IMPLEMENTACIÓN (tras aplicar las 9
correcciones anteriores). No se detectaron funcionalidades faltantes,
duplicaciones, ni contradicciones sin resolver frente al documento
consolidado.

**Actualización 2 (propagación de la resolución 18.18 — regla de idioma /
arquitectura i18n)** — tras la incorporación de `next-intl` a la
infraestructura, se actualizó este documento para reflejar:

1. La ruta del Dashboard se sirve ahora desde
   `app/[locale]/(app)/dashboard/page.tsx` (antes `app/(app)/dashboard/page.tsx`)
   — sección 5.
2. Se añadió el criterio de aceptación de idioma: todo texto de UI del
   Dashboard usa claves de `next-intl`, redactadas primero en francés — sección 16.

Esta actualización no reabre el veredicto ✅ APROBADO PARA IMPLEMENTACIÓN:
es una propagación de una decisión de infraestructura ya resuelta (18.18),
no un hallazgo funcional nuevo sobre el diseño del módulo.

**Actualización 3 (implementación completa, código de producción)** — el
módulo quedó implementado exactamente conforme al diseño aprobado. Durante
la implementación se detectaron y resolvieron 3 vacíos reales del esquema
físico (documento consolidado, capítulo 13) que el diseño funcional ya
exigía pero que ninguna migración anterior cubría — documentados en
`prisma/schema.prisma` junto a cada campo, y resumidos aquí para
trazabilidad:

1. **`User.clerkUserId`** — la sección 13.1 nunca definió cómo enlazar la
   identidad de Clerk (12.3) con el `id` interno de `User`; sin esta
   columna, la integración que 12.3/12.4 ya exigen no podía implementarse.
   Añadida como clave de unión mínima, no como funcionalidad nueva.
2. **`StudentProfile.targetExamDate`** — contradicción entre 12.2 (el
   "Perfil pedagógico" incluye "fecha del examen") y 13.2 (la ficha física
   de `StudentProfile` omite esa columna). El bloque 2 del Dashboard
   ("fecha prevista del examen, días restantes") depende de ella — se cierra
   la omisión de 13.2 frente a su propia sección 12.2.
3. **Catálogo `Competency`** — el bloque 6 ("calidad de escritura,
   organización textual, gramática, cohesión, vocabulario... autonomía")
   necesita el nombre legible de cada competencia, no solo el UUID de
   `StudentCompetency.competency_id`. Se añadió el catálogo mínimo (id,
   code, name) sembrado con las 12 competencias iniciales ya listadas en
   13.8 (`prisma/seed_competencies.ts`) — es la única tabla de catálogo de
   otro dominio incluida en esta fase (Exam/Evaluator/WritingTask
   permanecen fuera de alcance, como columnas UUID sin relación Prisma).

Alcance de datos aplicado (resolución tomada con el usuario antes de
implementar): esquema de lectura real contra Prisma/PostgreSQL para las ~20
tablas que el Dashboard lee (sección 10), con Row Level Security real
(`prisma/migrations/202607170900_dashboard_rls_policies/migration.sql` —
ver Actualización 4 más abajo) — sin mocks. Se adelantan estas tablas
fuera del orden estricto de migraciones (13.14: fases 03-09) porque el
Dashboard, siendo un consumidor terminal de casi todos los dominios
pedagógicos (sección 12), no puede funcionar de forma realista sin ellas;
cada tabla se limita estrictamente a los campos que la sección 13
especifica para ese capítulo, sin lógica de negocio ni UI de los módulos
propietarios.

Deuda técnica señalada explícitamente (no silenciosa, ver también
`prisma/schema.prisma`): (a) ~~nombres de constraint con la convención por
defecto de Prisma en vez de los prefijos `pk_`/`fk_`/`idx_`/`uq_` de 13.13~~
— **resuelto, ver Actualización 5**; (b) `Competency.name` sembrado solo en francés, sin `name_es` — pendiente
para cumplir 18.18 por completo en datos de catálogo (no solo en texto
estático de UI); (c) cobertura de pruebas centrada en lógica pura, esquemas,
store y componentes sin dependencias externas — pruebas de integración
contra Prisma/Postgres real quedan pendientes de un entorno con base de
datos disponible.

Esta actualización no reabre el diseño funcional (secciones 1-16, ya
aprobadas): documenta decisiones de implementación tomadas para poder
construir el código real sobre un diseño que, en varios puntos de su propio
capítulo de datos, estaba incompleto frente a sí mismo.

**Actualización 4 (remediación de bloqueantes críticos de producción —
autenticación, RLS y permisos de base de datos)** — una auditoría técnica
posterior a la Actualización 3 identificó tres bloqueantes que impedían
considerar el módulo listo para producción, y una revisión de remediación
(rol: Software Architect / Full Stack / Security Engineer) los cerró junto
con dos hallazgos adicionales detectados durante esa misma revisión, no
reportados originalmente. Los cinco:

1. **Rol de Postgres nunca activado en `withStudentContext` (hallazgo nuevo,
   el más severo).** `withStudentContext` fijaba `app.current_student_id`
   pero nunca cambiaba el rol de Postgres activo — la consulta se ejecutaba
   con el rol de conexión crudo de Prisma. Si ese rol es el propietario de
   las tablas o un superusuario (caso por defecto de Supabase, rol
   `postgres`), Postgres ignora las políticas RLS por completo para ese rol,
   sin importar que `ENABLE ROW LEVEL SECURITY` esté activo: la restricción
   de fila nunca se aplicaba en la práctica, independientemente de cuán
   completo estuviera el script de políticas. Corregido añadiendo
   `SET LOCAL ROLE dashboard_app_role` antes de fijar la variable de sesión
   (database/repositories/withStudentContext.ts), simétrico a lo que
   `withServiceContext` ya hacía para su propio rol.
2. **`GRANT` incompleto sobre `"user"` para `dashboard_service_role`.**
   `BYPASSRLS` exime de las políticas de fila, nunca de los `GRANT` de nivel
   de tabla (mecanismo independiente en Postgres); faltaba el `GRANT` que
   `queryStudentIdByClerkId` necesita en cada petición autenticada.
   Corregido en la migración de RLS.
3. **Placeholder `<db_connection_role>` sin sustituir** en el script manual
   de RLS — no era ejecutable tal cual. Corregido con
   `GRANT ... TO CURRENT_USER`, autoconfigurado en el momento de aplicar la
   migración (ver razonamiento completo en el `migration.sql`
   correspondiente).
4. **Sin mecanismo de aprovisionamiento de `User.clerkUserId` (hallazgo
   nuevo).** `app/api/webhooks/clerk/route.ts` era un stub (`501`): ningún
   estudiante real llegaba a tener una fila en `"user"` al registrarse en
   Clerk, dejando el Dashboard inalcanzable de extremo a extremo pese a que
   el resto del módulo estaba completo. Implementado el webhook completo
   (verificación de firma Svix, `user.created`/`user.updated` como `upsert`
   idempotente frente a reintentos de entrega, `user.deleted` como
   desactivación/soft-delete) en `services/auth/clerkProvisioning.ts` +
   `database/queries/user.ts` + `app/api/webhooks/clerk/route.ts`.
5. **RLS nunca aplicada en CI (hallazgo nuevo).** `.github/workflows/ci.yml`
   nunca ejecutaba `prisma migrate deploy` antes de las pruebas de
   integración — el pipeline no detectaba si el SQL de las migraciones
   (incluida la de RLS) era siquiera aplicable. Corregido añadiendo el paso
   correspondiente al job `unit-integration-tests`.

Además, el script manual `docs/database/rls-policies.sql` se reubicó como
migración versionada de Prisma
(`prisma/migrations/202607170900_dashboard_rls_policies/`), para que su
aplicación sea automática y determinista (`prisma migrate deploy`) en vez de
depender de que un operador recuerde ejecutar un script aparte — ese archivo
se conserva solo como puntero histórico, sin SQL ejecutable.

**Riesgo residual documentado (no bloqueante, no resuelto en esta
remediación):** el `POSTGRES_USER` del contenedor de pruebas de
`.github/workflows/ci.yml` actúa como superusuario de ese Postgres efímero
(comportamiento por defecto de la imagen oficial), por lo que aplicar la
migración en CI valida que el SQL es sintácticamente correcto y aplicable,
pero no valida en negro (black-box) que un rol de bajo privilegio quede
efectivamente restringido por las políticas — esa verificación de extremo a
extremo requeriría un rol de prueba de menor privilegio en el pipeline, no
implementado en esta remediación por no ser parte de los tres bloqueantes
señalados ni de sus causas raíz directas.

Esta actualización tampoco reabre el diseño funcional (secciones 1-16): es
remediación de seguridad/infraestructura sobre una implementación ya
aprobada, sin cambios de producto ni de UI.

**Actualización 5 (estandarización de nomenclatura de constraints — cierre
previo a la Baseline 1.0)** — auditoría de nomenclatura de base de datos
(rol: Database Architect / PostgreSQL Expert) confirmó que las migraciones
202607161000 y 202607170900 crearon las `PRIMARY KEY`, `FOREIGN KEY`,
`UNIQUE` e `INDEX` con la convención por defecto de Prisma
(`<tabla>_pkey`, `<tabla>_<columna>_fkey`, `<tabla>_<columna>_key`,
`<tabla>_<columnas>_idx`) en vez de los prefijos `pk_`/`fk_`/`uq_`/`idx_`
que la sección 13.13 exige como MUST — deuda ya señalada explícitamente
desde la Actualización 3 (ver arriba) y en `prisma/schema.prisma`. Los
`CHECK` (`ck_<tabla>_<regla>`) ya cumplían desde el inicio, por escribirse a
mano en `migration.sql`.

Corregido con la migración dedicada
`prisma/migrations/202607171200_constraint_naming_standardization/`
(78 objetos renombrados: 22 PK + 11 UNIQUE + 23 FK + 22 INDEX; los 11 CHECK
existentes no se tocaron por ya ser conformes) y con `map:` explícito
añadido a cada `@id`/`@unique`/`@relation`/`@@index` de `schema.prisma`,
para que toda migración futura generada por Prisma respete la convención
automáticamente. Detalle completo, lista exhaustiva del renombrado y
verificación empírica (PGlite: RLS/policies/roles intactos, aislamiento por
estudiante sin cambios, rollback exacto) en
`docs/database/naming-convention-audit-2026-07-17.md`.

Hallazgo adicional de la auditoría, fuera del alcance de 13.13 (no
accionado): las restricciones `NOT NULL` generan en PostgreSQL 17 una
entrada propia en `pg_constraint` con nombre autogenerado
(`<tabla>_<columna>_not_null`), que 13.13 no contempla entre sus cinco
categorías (PK/FK/UNIQUE/INDEX/CHECK) y que Prisma no permite nombrar de
forma declarativa. Se documenta para que no se interprete como un
incumplimiento silencioso; no requiere acción salvo que se decida ampliar
13.13 explícitamente a esta categoría.

Esta actualización tampoco reabre el diseño funcional ni la remediación de
seguridad (Actualizaciones 1-4): es un renombrado físico sin efecto en
datos, RLS, roles, GRANT, autenticación ni lógica de negocio.
