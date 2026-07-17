# Auditoría técnica — Módulo Dashboard

**Fecha:** 2026-07-16
**Alcance:** `features/dashboard/` (29 archivos, ~1067 líneas) y la infraestructura compartida que ese módulo consume directamente: `database/`, `services/{database,gamification,analytics,auth}/`, `components/ui/`, `components/coach/`, `providers/QueryProvider.tsx`, `hooks/useMediaQuery.ts`, `stores/dashboardStore.ts`, `prisma/schema.prisma`, `docs/database/rls-policies.sql` (~60 archivos adicionales).
**Método:** lectura completa de código fuente, verificación de fronteras ESLint, análisis estático de dependencias circulares (`madge --circular`, 116 archivos, 0 ciclos), verificación de exports muertos (`ts-prune`, con validación manual caso por caso vía `grep` porque el barrel-flagging de la herramienta produce falsos positivos), comparación de claves de traducción fr/es, y trazado manual de las rutas críticas (autenticación Clerk → RLS → Redis → render).
**No incluido:** no se ejecutaron pruebas de integración contra una base de datos real ni `prisma validate` (bloqueado por restricciones de red del entorno de generación, igual que en la fase de implementación).
**Nota:** este informe es solo diagnóstico. No se ha modificado ningún archivo del módulo.

---

## Resumen ejecutivo

El módulo está bien estructurado a nivel de arquitectura (capas, aislamiento de features, RLS, i18n, accesibilidad de los primitivos) y no tiene dependencias circulares. Sin embargo, se identificaron **tres hallazgos críticos que impiden que el Dashboard funcione en producción tal como está configurado**: un `GRANT` faltante en las políticas RLS que rompe la resolución de identidad Clerk→estudiante, un placeholder SQL sin sustituir en el mismo script, y la ausencia total de un mecanismo que cree el registro `User`/`clerkUserId` al registrarse un estudiante (el webhook de Clerk es un stub `501`). Ninguno de los tres fue señalado como bloqueante en `docs/modules/dashboard.md`. El resto de hallazgos (rendimiento, escalabilidad, accesibilidad, código muerto) son reales pero de severidad media/baja y no impiden el funcionamiento básico una vez resueltos los tres críticos.

| Categoría | Crítico | Alto | Medio | Bajo |
|---|---|---|---|---|
| Errores | 3 | 1 | 2 | 2 |
| Duplicaciones | — | — | 1 | 3 |
| Código muerto | — | — | 2 | 2 |
| SOLID | — | — | 3 | 2 |
| Dependencias circulares | 0 encontradas | | | |
| Rendimiento | — | 1 | 3 | 3 |
| Seguridad | 2 | — | 2 | 2 |
| Accesibilidad | — | — | 2 | 3 |
| Escalabilidad | — | — | 4 | 1 (positivo) |

---

## 1. Errores

### 1.1 [CRÍTICO] `GRANT` incompleto rompe la resolución de identidad Clerk → estudiante
`docs/database/rls-policies.sql`, líneas 195-207, otorga `SELECT` sobre todas las tablas de lectura a `dashboard_app_role`, pero a `dashboard_service_role` (el rol `BYPASSRLS` usado por `withServiceContext`) solo le otorga `INSERT, UPDATE, SELECT ON "student_dashboard"`. `BYPASSRLS` exime de la evaluación de políticas de fila, **no** de los `GRANT` de nivel de tabla, que en Postgres son un mecanismo independiente. `database/queries/user.ts` → `queryStudentIdByClerkId` se ejecuta bajo `withServiceContext` para leer la tabla `"user"` (`database/repositories/userRepository.ts:15`), pero `dashboard_service_role` nunca recibió `SELECT` sobre `"user"`. Resultado: `findStudentIdByClerkId` fallará con `permission denied for table user` en cuanto la política se aplique tal cual está escrita, y esta función es el único puente entre Clerk y el `studentId` interno usado en absolutamente todas las lecturas del Dashboard.

### 1.2 [CRÍTICO] Placeholder sin sustituir en el script de RLS
`docs/database/rls-policies.sql:214`: `GRANT dashboard_app_role, dashboard_service_role TO <db_connection_role>;` — `<db_connection_role>` es texto literal, no una variable de plantilla que algún proceso sustituya automáticamente. El script no es ejecutable como está y no hay ningún marcador (`-- TODO` con instrucciones de CI, variable de entorno, etc.) que lo convierta en un paso verificable de despliegue.

### 1.3 [CRÍTICO] No existe mecanismo de aprovisionamiento de `User.clerkUserId`
`app/api/webhooks/clerk/route.ts` es un stub que devuelve `501` sin lógica. No hay ningún otro punto en el código (Server Action, middleware, cron) que cree una fila en `"user"` con `clerk_user_id` poblado cuando alguien se registra en Clerk. Sin esa fila, `findStudentIdByClerkId` devuelve `null` para cualquier usuario real, `requireAuthenticatedStudentId()` lanza `StudentProfileNotFoundError`, y `DashboardPage` redirige a `/sign-in` — un bucle funcional que hace el Dashboard inalcanzable de extremo a extremo para cualquier cuenta nueva. Este gap pertenece formalmente al módulo de Autenticación (`02_authentication`, fuera de alcance de esta fase), pero el Dashboard depende de él en su ruta crítica y **ese acoplamiento no está documentado como bloqueador** en `docs/modules/dashboard.md` (la sección "Actualización 3" solo documenta gaps de esquema, no este gap de flujo).

### 1.4 [ALTO] `DashboardView` puede ocultar datos válidos por un error transitorio
`features/dashboard/pages/DashboardView.tsx:29`: `if (isError || !data) return <DashboardErrorState .../>`. Como `useDashboardData` (features/dashboard/hooks/useDashboardData.ts) usa `initialData`, TanStack Query conserva el último `data` bueno aunque una revalidación en segundo plano falle; en ese caso `isError` puede ser `true` mientras `data` sigue siendo el consolidado ya renderizado. La condición actual reemplaza los 7 bloques completos por la pantalla de error ante un solo fallo transitorio de red (p. ej. al pulsar "actualizar"), contradiciendo el propio principio de diseño citado en el código: "mensajes de error tranquilos, nunca alarmantes" (sección 14.7 del documento consolidado).

### 1.5 [MEDIO] Comentario y comportamiento no coinciden en `queryStudentCompetencies`
`database/queries/competency.ts:8-21`: el comentario afirma "Últimas 7 competencias evaluadas del estudiante", pero la consulta (`findMany` sin `take`) no limita el número de filas devueltas. Trae el historial completo de `student_competency` del estudiante en cada lectura.

### 1.6 [MEDIO] Persistencia del consolidado se omite silenciosamente
`features/dashboard/services/dashboardService.ts:103`: `persistDashboardConsolidation` solo se invoca `if (readModel.goal.currentLevel)`. Un estudiante sin `StudentProfile`/`currentLevel` (p. ej. onboarding incompleto) nunca genera su fila `student_dashboard`, sin ningún log ni aviso de que la materialización fue omitida.

### 1.7 [BAJO] Salto de contenido tras la hidratación en `EvolutionSummaryPanel`
`features/dashboard/components/EvolutionSummaryPanel.tsx:22-26` usa `useMediaQuery`, que devuelve `false` en el primer render (correcto para evitar desajustes de hidratación — `hooks/useMediaQuery.ts:9`), por lo que en escritorio/tablet el panel primero muestra 3 competencias y, tras el `useEffect`, salta a 4 o 5. Es un CLS real que ocurre después del montaje, fuera de la ventana que cubre `DashboardSkeleton`.

### 1.8 [BAJO] `StudentCompetency` sin restricción de unicidad
`prisma/schema.prisma:421-437`: el modelo `StudentCompetency` no tiene `@@unique([studentId, competencyId])`. Nada a nivel de esquema impide dos filas para la misma combinación (estudiante, competencia); si el proceso que las alimenta (futuro módulo) no es idempotente, el bloque 6 podría mostrar la misma competencia duplicada.

---

## 2. Duplicaciones

### 2.1 [MEDIO] Barrel `database/queries/index.ts` duplica innecesariamente la superficie pública de `database/repositories/index.ts`
Ambos barrels existen como "punto de entrada" de su capa, pero en la práctica solo uno se usa (ver sección 3.1). Mantener dos superficies públicas para la misma capa de datos, cuando solo una está viva, es una duplicación de diseño que puede confundir a quien integre un nuevo módulo.

### 2.2 [BAJO] Comentario de seguridad repetido casi verbatim en `withStudentContext.ts`
`database/repositories/withStudentContext.ts` repite la misma justificación ("Nunca se usa el cliente Prisma 'pelado'...") tanto en el comentario de cabecera del archivo (líneas 1-8) como en el JSDoc de `withStudentContext` (líneas 19-25). Redundancia de documentación, no de lógica.

### 2.3 [BAJO] `formatMinutesAsHoursLabel` es una utilidad genérica aislada dentro de una sola feature
`features/dashboard/utils/dashboard.utils.ts:4-10` formatea minutos como "Xh Ym" — un formateo que Mi Plan y Entrenamiento (que también manejan minutos, según el propio documento consolidado) necesitarán igualmente. Al vivir dentro de `features/dashboard/utils` (aislada por la regla de la sección 5.4), esos módulos futuros no podrán reutilizarla y tendrán que reimplementarla, produciendo una duplicación previsible en cuanto se construyan.

### 2.4 [BAJO] Patrón boilerplate repetido sin abstraer en los 9 repositorios
Los 9 archivos `database/repositories/*Repository.ts` siguen exactamente el mismo patrón (`await query(...)`; `if (!x) return null`; mapear campo a campo a un DTO) sin ningún helper compartido. No es un error, pero es una duplicación estructural consistente que un helper (`mapOrNull`) reduciría.

---

## 3. Código muerto

### 3.1 [MEDIO] `database/queries/index.ts` — barrel completo sin un solo importador
Verificado con `grep` sobre todo el proyecto: nada importa `"@/database/queries"` (sin subruta). Los 9 repositorios importan directamente de los archivos individuales (`@/database/queries/user`, `@/database/queries/coach`, etc.), nunca del barrel. Las 15 líneas de re-exports de `database/queries/index.ts` no son alcanzadas por ningún código del proyecto.

### 3.2 [MEDIO] `DashboardViewState` sin ningún uso
`features/dashboard/types/dashboard.types.ts:99`: `export type DashboardViewState = "loading" | "ready" | "error" | "stale-refreshing";` no aparece referenciado en ningún otro archivo (verificado con `grep` recursivo). El estado `stale-refreshing` que describe tampoco está implementado: `DashboardView` no distingue una revalidación en curso (`isFetching`) de una carga inicial (`isLoading`).

### 3.3 [BAJO] Variantes de bienvenida traducidas pero inalcanzables en esta fase
`WelcomeVariant` (dashboard.types.ts) incluye `progress-improved`, `high-score` y `struggling`, con traducciones completas en `messages/fr.json` y `messages/es.json`. La única función que produce un `WelcomeVariant` (`selectWelcomeVariant`, `dashboardService.logic.ts`) solo puede devolver `empty-first-visit`, `reactivation` o `ready`. Es intencional y está documentado (reservado para el futuro Motor Pedagógico Adaptativo), pero en el estado actual del código es contenido traducido sin ruta de código que lo alcance.

### 3.4 [BAJO] Campos leídos y descartados sin usar
`metricsRepository.ts` calcula `completedSessions` y `completedTasks` en `StudentDashboardConsolidation` → `StudyFrequencySnapshot`, pero `dashboardService.ts:84-89` los descarta al construir `evolution.studyFrequency` (solo usa `studyTimeMinutes`/`activeDays`). Datos leídos de la base de datos en cada carga y nunca expuestos al read model final.

---

## 4. Problemas SOLID

### 4.1 [MEDIO] SRP — `buildReadModel` mezcla orquestación, transformación y efecto secundario
`features/dashboard/services/dashboardService.ts:22-117` (~95 líneas) hace tres cosas con razones de cambio distintas: (a) orquestar 3 fuentes de datos en paralelo, (b) transformar cada bloque del `DashboardReadModel`, y (c) disparar y manejar errores de una persistencia fire-and-forget. Un cambio en cómo se calcula un bloque y un cambio en cómo se persiste el consolidado tocan la misma función.

### 4.2 [MEDIO] SRP/ISP — `getDashboardCoreData` es una "God query" sin cohesión de dominio
`services/database/index.ts:53-76` agrupa bajo una sola función 7 lecturas de dominios sin relación de negocio entre sí (identidad, plan, continuación, coach, evaluación, consolidado). Su única cohesión es "todo lo que el Dashboard necesita", no una responsabilidad de dominio única; cualquier cambio en cualquiera de esos 7 dominios obliga a tocar este archivo compartido.

### 4.3 [MEDIO] DIP — capa inferior (`database/queries`) depende de un tipo definido en la capa superior (`database/repositories`)
Los 9 archivos de `database/queries/*.ts` importan `StudentScopedClient` desde `database/repositories/withStudentContext.ts` (p. ej. `database/queries/coach.ts:8`). Según `ARCHITECTURE.md` sección 2.1, la dirección declarada es `queries → repositories → services`; este import de tipo invierte esa dirección (confirmado que no genera un ciclo real en tiempo de ejecución vía `madge`, pero sí una dependencia arquitectónica "hacia arriba").

### 4.4 [BAJO] OCP — colores fijados en JSX en vez de expuestos como variante
A diferencia de los primitivos de `components/ui` (que usan `cva` y están abiertos a extensión vía props de variante), `SuggestionCard` (`components/coach/SuggestionCard.tsx:20`) y `DashboardErrorState` (`features/dashboard/components/DashboardErrorState.tsx:17`) fijan clases de color directamente (`border-primary-200 bg-primary-50`, `border-neutral-200 bg-neutral-50`) sin una prop `tone`/`variant` — cualquier ajuste de tono exige editar el componente en vez de extenderlo.

### 4.5 [BAJO] Falta una capa de "mapper" aislable en los repositorios
Cada `*Repository.ts` mezcla, en la misma función, el acceso a datos y el mapeo a DTO. A esta escala (9 repositorios) no es grave, pero impide testear el mapeo puro por separado del acceso a datos sin mockear Prisma.

---

## 5. Dependencias circulares

**No se encontraron dependencias circulares.** Se ejecutó `madge --circular --ts-config tsconfig.json` sobre `features/dashboard`, `database`, `services`, `components`, `providers`, `hooks`, `stores`, `lib` y `app` (116 archivos procesados, resolución de alias `@/*` vía `tsconfig.json`): `✔ No circular dependency found!`.

El único hallazgo relacionado (no es un ciclo, pero es una anomalía direccional) es el DIP descrito en 4.3.

---

## 6. Problemas de rendimiento

### 6.1 [ALTO] Tres transacciones Postgres independientes por carga en vez de una
`buildReadModel` combina `getDashboardCoreData`, `getGamificationSnapshot` y `getAnalyticsSnapshot` con `Promise.all` a nivel de JavaScript, pero cada una abre su **propio** `withStudentContext` (`services/database/index.ts:54`, `services/gamification/index.ts:16`, `services/analytics/index.ts:31`), es decir, su propia transacción/conexión Postgres y su propio `SET LOCAL app.current_student_id`. Cada carga con caché fría abre 3 transacciones en vez de 1.

### 6.2 [MEDIO] Paralelismo ilusorio dentro de una misma transacción interactiva de Prisma
Dentro de cada `withStudentContext`, las lecturas internas se lanzan con `Promise.all` sobre el mismo `tx` (p. ej. `getDashboardCoreData` lanza 7 queries "en paralelo" sobre una única transacción interactiva — `services/database/index.ts:55-64`). Las transacciones interactivas de Prisma usan una única conexión; las queries enviadas "en paralelo" sobre esa conexión se serializan en el servidor sin ganancia real de latencia, con el riesgo adicional (documentado por Prisma) de contención bajo carga alta.

### 6.3 [MEDIO] Agregación completa de `xp_transaction` en cada cache-miss
`database/queries/gamification.ts:20-26`: `queryTotalXp` ejecuta `SUM` sobre toda la tabla `xp_transaction` del estudiante, sin ventana de tiempo ni materialización incremental. Es una regla de negocio explícita (11.4: "el XP total se calcula como la suma de todas las transacciones"), pero el costo crece sin límite con la antigüedad de cada estudiante y se recalcula por completo cada 60s (TTL de caché) mientras esté activo.

### 6.4 [MEDIO] `queryStudentCompetencies` transfiere más datos de los que se muestran
Ver 1.5 — el historial completo se lee, serializa y cachea en Redis aunque `EvolutionSummaryPanel` solo muestra 3-5 elementos.

### 6.5 [BAJO] Ausencia de "singleflight" en la caché
`getDashboardReadModel` no implementa ningún candado: si varias peticiones concurrentes llegan con caché fría para el mismo `studentId` (arranque, expiración de TTL, `invalidateDashboardCache`), todas fallan el `redis.get`, ejecutan `buildReadModel` completo en paralelo y escriben el mismo resultado — trabajo de base de datos redundante bajo concurrencia.

### 6.6 [BAJO] Persistencia fire-and-forget sin garantía en entornos serverless
`dashboardService.ts:104-113`: `persistDashboardConsolidation(...).catch(...)` es una promesa en segundo plano sin mecanismo tipo `waitUntil`. En un runtime serverless, el proceso puede terminar en cuanto se envía la respuesta HTTP, sin garantizar que la escritura del consolidado llegue a completarse.

### 6.7 [BAJO] Caché deserializada sin validación de forma
`getDashboardReadModel`: `JSON.parse(cached) as DashboardReadModel` confía ciegamente en la forma del valor cacheado. Si el tipo cambia entre despliegues, una entrada de caché con TTL de 60s aún vigente podría devolver una forma obsoleta al cliente.

---

## 7. Problemas de seguridad

### 7.1 [CRÍTICO] Ver 1.1 — `GRANT` incompleto para `dashboard_service_role`
Además de ser un error funcional, es un hallazgo de seguridad: el modelo de permisos documentado en `rls-policies.sql` está incompleto y no fue validado de extremo a extremo contra el flujo que realmente lo usa.

### 7.2 [CRÍTICO] Ver 1.2 — placeholder `<db_connection_role>` sin sustituir
Riesgo adicional más allá de "no ejecuta": si alguien lo sustituye apresuradamente por un rol con privilegios más amplios de los necesarios (p. ej. el rol de administración de Supabase) para "hacerlo funcionar", el principio de mínimo privilegio de todo el diseño quedaría anulado sin que el propio script lo impida o lo advierta en tiempo de ejecución.

### 7.3 [MEDIO] Eventos de analítica falseables (spoofing) en las Server Actions
`dismissRecommendation` y `markContinueClicked` (`features/dashboard/actions/dashboard.actions.ts`) validan que `recommendationId`/`submissionId` tengan forma de UUID (Zod) pero nunca verifican que ese registro pertenezca al `studentId` autenticado antes de registrar el evento en PostHog. Un cliente autenticado podría enviar el UUID de una recomendación o entrega de otro estudiante y quedaría registrado como propio. No hay lectura ni escritura de datos ajenos (no hay fuga de información), pero sí integridad de analítica falseable.

### 7.4 [MEDIO] Superficie de `BYPASSRLS` ampliada a una ruta de alta frecuencia
`withServiceContext` (rol con `BYPASSRLS`, poder total sobre las tablas a las que tiene `GRANT`) se usa para `queryStudentIdByClerkId`, que se ejecuta en **cada** petición autenticada al Dashboard, no solo en los "procesos programados de refresco" a los que el propio comentario del archivo dice que debería limitarse (`database/repositories/withStudentContext.ts:39-47`). Es la única vía posible dado que el `studentId` aún no se conoce en ese punto, y está justificado y documentado, pero amplía la ventana de exposición de un rol de alto privilegio a la ruta más transitada del módulo.

### 7.5 [BAJO] Sin límite de tasa en `/api/dashboard/refresh`
`app/api/dashboard/refresh/route.ts` solo exige sesión válida; no hay rate limiting propio. Mitigado parcialmente por la caché Redis de 60s, pero cada llamada aún ejecuta `redis.get` y, si el TTL acaba de expirar, las 3 transacciones completas descritas en 6.1.

### 7.6 [BAJO] Sin validación de forma en la caché deserializada
Ver 6.7 — también tiene una lectura de seguridad: una entrada de caché corrupta o con forma inesperada se devuelve tal cual al cliente sin sanitizar.

---

## 8. Problemas de accesibilidad

### 8.1 [MEDIO] Posible `<h1>` duplicado por página
`WelcomeHeader` (`features/dashboard/components/WelcomeHeader.tsx:29`) renderiza un `<h1 id="dashboard-welcome-heading">`. No se verificó (fuera del alcance de los archivos de este módulo) si `app/[locale]/(app)/layout.tsx`, compartido por las 9 áreas de la aplicación, ya define su propio `<h1>` de página. Si lo hace, habría dos `<h1>` en la misma vista, lo que rompe la jerarquía de encabezado único recomendada por las prácticas de WCAG 2.2 para navegación por encabezados.

### 8.2 [MEDIO] Descarte de la recomendación sin anuncio para lectores de pantalla
Al pulsar "Descartar" en `CoachRecommendationCard`, la tarjeta desaparece por un cambio de estado de Zustand (`dismissLocally`) sin ningún `aria-live`. Un usuario de lector de pantalla no recibe confirmación audible de que la acción se completó ni de que el contenido cambió — el propio proyecto ya tiene el patrón correcto disponible (`ToastProvider` implementa una región `aria-live`) pero no se usa en esta interacción.

### 8.3 [BAJO] Cambio de contenido tras hidratación sin anuncio
Ver 1.7 — el salto de 3 a 4/5 competencias visibles en `EvolutionSummaryPanel` tras el montaje no va acompañado de `aria-live="polite"` que anuncie el cambio a un lector de pantalla ya enfocado en esa zona.

### 8.4 [BAJO] Enlaces del grid de ecosistemas sin contexto adicional
`EcosystemAccessGrid` (`features/dashboard/components/EcosystemAccessGrid.tsx:32-38`) renderiza cada `<Link>` con solo el nombre del espacio como texto accesible. Cumple el mínimo, pero no ofrece contexto (p. ej. "Ir a") que ayude a diferenciar destinos cuando se navega en modo "lista de enlaces" fuera del contexto visual del grid.

### 8.5 Aspectos positivos verificados (para balance del informe)
`ProgressBar`, `Skeleton`, `DashboardErrorState` y `DashboardSkeleton` implementan correctamente los patrones ARIA documentados: `role="progressbar"` con `aria-valuenow/min/max` y `aria-label`, `role="status"` con `aria-label` + texto `sr-only` redundante para máxima compatibilidad, `role="alert"` en el estado de error, y `aria-hidden="true"` en los elementos puramente decorativos (`Skeleton`, iniciales del `Avatar`, ícono "IA" de `SuggestionCard`). Verificado tanto por lectura de código como por los tests unitarios existentes (`Button.test.tsx`, `ProgressBar.test.tsx`, `DashboardSkeleton.test.tsx`, `DashboardErrorState.test.tsx`).

---

## 9. Problemas de escalabilidad

### 9.1 [MEDIO] `xp_transaction` sin materialización incremental
Ver 6.3 — el total de XP no está cubierto por la Materialized View prevista en 15.1 (esa vista cubre `student_dashboard`, y el XP total solo se replica ahí como snapshot cuando `buildReadModel` decide persistirlo, no como fuente de lectura). El costo de la agregación crece linealmente con la antigüedad y actividad de cada estudiante.

### 9.2 [MEDIO] 3 conexiones simultáneas por carga reducen el techo de concurrencia
El patrón descrito en 6.1 (3 transacciones RLS independientes por carga) consume 3 conexiones del pool de Postgres/Supabase por cada carga de Dashboard en vez de 1, reduciendo el número de peticiones concurrentes que el pool puede sostener antes de agotarse, bajo alta concurrencia de usuarios.

### 9.3 [MEDIO] "Thundering herd" agravado a escala
La ausencia de candado en la caché (6.5) se agrava cuantos más estudiantes concurrentes compartan una expiración de TTL cercana — por ejemplo, tras un despliegue que invalida la caché de forma masiva.

### 9.4 [MEDIO] Consulta de competencias sin límite crece con el tiempo de vida del estudiante
Ver 1.5/6.4 — sin `take` ni paginación, el costo de esta consulta crecerá indefinidamente con cada evaluación de competencia acumulada, sin que el modelo de datos lo anticipe.

### 9.5 Aspecto positivo verificado
Los índices Prisma (`@@index([studentId])`, y compuestos como `[studentId, status]`, `[studentId, createdAt]`, `[studentId, calculatedAt]`, `[studentId, evaluatedAt]`) están presentes de forma consistente en todas las tablas leídas por el Dashboard — buena base para escalar el patrón de acceso dominante del módulo (lectura por estudiante individual).

---

## Anexo — evidencia de verificación

- **Dependencias circulares:** `npx madge --circular --ts-config tsconfig.json --extensions ts,tsx features/dashboard database services components providers hooks stores lib app` → `Processed 116 files (1.2s) (22 warnings)` → `✔ No circular dependency found!`.
- **Fronteras ESLint (`import/no-restricted-paths`):** confirmado sin violaciones — ninguna feature importa de otra feature, `app/` (no-api) solo importa `features/dashboard/pages`, `app/api/dashboard/refresh` solo importa `features/dashboard/services`.
- **Barrel muerto:** `grep -rn '"@/database/queries"'` sobre todo el repo → 0 resultados; todos los repositorios importan de subrutas directas (`@/database/queries/<archivo>`).
- **`DashboardViewState`:** `grep -rn "DashboardViewState"` sobre todo el repo → 1 única ocurrencia (su propia declaración).
- **Consistencia de traducciones:** comparación programática de claves `dashboard.*` entre `messages/fr.json` y `messages/es.json` → 0 claves faltantes en ambos sentidos.
- **`GRANT` en `rls-policies.sql`:** lectura completa del archivo, líneas 195-214 — confirmado que `dashboard_service_role` solo recibe `GRANT` sobre `student_dashboard`, no sobre `"user"` ni el resto de tablas.
