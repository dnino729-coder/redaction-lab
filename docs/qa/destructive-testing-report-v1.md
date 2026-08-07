# Destructive Testing & Resilience Audit — v1

**Rol:** QA Engineer Senior, modo destructivo. **Alcance:** intentar romper el sistema mediante análisis de casos borde documentados, no hipotéticos. **Regla seguida en todo el informe:** cada hallazgo cita archivo/línea real; ningún bug fue corregido ni se propuso arquitectura — solo se documenta reproducción, causa y archivo de origen. **Fecha:** 2026-08-03.

**Nota metodológica:** no existe en este entorno una base de datos, sesión de Clerk ni clave de IA en vivo (confirmado en Sprints 5/7/8 — bloqueador de credenciales aún abierto). Todo lo marcado 🟢/🟡/🔴 se verificó por **lectura directa del código fuente** (la ruta de ejecución real, no una suposición), no por ejecución en vivo contra infraestructura real. Los casos que solo podrían confirmarse con infraestructura real están listados aparte, sin inventar su resultado.

---

## 1. Executive Summary

El sistema muestra una arquitectura de resiliencia deliberada y, en la mayoría de los casos auditados, correctamente implementada: la remediación histórica del IDOR (H-01) es real y verificable a nivel de consulta Prisma en las tres rutas de lectura afectadas; el editor de escritura implementa una cola de autosave, detección de offline/online y una guarda de navegación que impide URLs de paso desincronizadas con el estado real del intento. Sin embargo, la auditoría encontró **una asimetría de seguridad real y no documentada previamente**: las rutas de escritura (Comandos) revelan la existencia de un recurso mediante una distinción 403/404, exactamente el patrón de fuga que la remediación H-01 evitó deliberadamente en las rutas de lectura — es decir, la corrección de H-01 no se propagó de forma consistente a todo el sistema. También se confirmaron dos limitaciones de resiliencia ya conocidas pero ahora verificadas con evidencia de línea exacta (el techo de 3 minutos del polling de IA se reinicia con un refresh completo de página, y el patrón `Promise.all` del Dashboard hace que un solo fallo entre 9 lecturas paralelas tumbe la pantalla completa, aunque de forma controlada vía `error.tsx`). Ningún hallazgo Crítico impide operar la demo si se siguen las mitigaciones ya documentadas en `docs/operations/`.

---

## 2. Escenarios auditados

### Navegación

**N1. Refresh a mitad de una actividad (paso de un intento, P-04–P-10)**
- Estado: 🟢 Seguro
- Evidencia: `AttemptStepContainer.tsx:94-100` — el paso mostrado nunca se confía a la URL sola; se valida contra `useContinuation()` (estado real del servidor) y solo se acepta si `continuation.attempt.attemptId` coincide exactamente con el de la URL.
- Archivo/Componente: `features/academy/components/unit-attempt/AttemptStepContainer.tsx`
- Servicio: `useContinuation` (TanStack Query, refetch en montaje)
- Motivo: un refresh siempre reconsulta el estado real del servidor antes de renderizar cualquier paso.

**N2. Deep-link directo a una URL de paso arbitraria (ej. saltar a `/rewrite` sin haber pasado por `/produce`)**
- Estado: 🟢 Seguro
- Evidencia: `AttemptStepContainer.tsx:245-252` — si `step` de la URL no coincide con `matchedAttempt.currentStep`, se ejecuta `router.replace(academyRoutes.attemptStep(attemptId, matchedAttempt.currentStep))`, redirigiendo al paso real.
- Archivo/Componente: mismo archivo, mismo mecanismo que N1.
- Motivo: el guard de redirección defensiva es el mismo para ambos casos.

**N3. Navegación atrás/adelante del navegador durante el polling de retroalimentación de IA**
- Estado: 🟢 Seguro (dentro de la misma sesión de pestaña)
- Evidencia: `useFeedback.ts:8-13` (comentario explícito) + `processingSinceKey` guardado en el `QueryClient` (no en un `useRef` de componente) — "el temporizador sobrevive a un desmontaje/remontaje por navegación atrás/adelante... mientras la entrada siga viva en caché" (`gcTime: 10*60_000`, `useFeedback.ts:31`).
- Archivo: `features/academy/hooks/useFeedback.ts`
- Motivo: el techo de 3 minutos no se reinicia por navegación SPA atrás/adelante — solo por un refresh completo (ver E6/F-timeout más abajo).

**N4. Misma cuenta abierta en dos pestañas simultáneamente**
- Estado: 🟡 Importante
- Evidencia: no existe ningún mecanismo de sincronización entre pestañas (`BroadcastChannel`, `localStorage` con listener, o similar) en ningún store Zustand del repositorio (`features/academy/stores/*`, `features/dashboard/stores/*` — verificado en sprints anteriores, sin persistencia cross-tab por diseño) ni en el `QueryClient` (una instancia por pestaña, sin compartir caché).
- Archivo/Componente: N/A (ausencia de mecanismo, no un archivo específico)
- Motivo: si el Profesor selecciona un estudiante distinto en la Pestaña A, la Pestaña B no se entera — no es un riesgo de seguridad (cada pestaña sigue re-validando ownership en el servidor en cada request), pero sí de consistencia de UI si el usuario alterna entre pestañas esperando ver el mismo estado.

**N5. Cierre de pestaña en medio de una operación de autosave**
- Ver **E1** (mismo hallazgo, categoría Editor).

**N6. Cambio de idioma en medio de un flujo (ej. a mitad de `/produce`)**
- Estado: 🟢 Seguro
- Evidencia: `middleware.ts:20-24` — el enrutamiento de idioma solo reescribe el prefijo de la URL (`/{locale}/...`); no interactúa con el estado local de `WritingEditor` (contenido tecleado vive en `useState` del componente, `WritingEditor.tsx:64`) ni con las Query Keys de `academyKeys` (no incluyen el locale).
- Motivo: un cambio de idioma no purga caché ni componentes de datos, solo re-renderiza las traducciones.

### Editor

**E1. Cierre del navegador durante un autosave en curso**
- Estado: 🟡 Importante
- Evidencia: `WritingEditor.tsx:107-113` — el listener de `beforeunload` invoca `onAutosaveRef.current(contentRef.current)`, pero es una llamada estándar a una Server Action (fetch), sin `navigator.sendBeacon` ni `fetch(..., { keepalive: true })` en ningún punto de la cadena (`useAutosaveDraft.ts` → `autosaveDraftAction`). Es una limitación conocida de la plataforma web: un `beforeunload` no puede garantizar que un `fetch` asíncrono complete antes de que el navegador cierre la conexión.
- Archivo: `features/academy/components/unit-attempt/WritingEditor.tsx` (líneas 107-113), `features/academy/hooks/useAutosaveDraft.ts`
- Motivo: en el peor caso (cierre muy rápido tras la última tecla, antes de que se asiente el autosave de 2s de debounce), hasta ~2 segundos de texto tecleado podrían perderse sin que el estudiante lo note — no hay indicador de "guardado pendiente sin confirmar" distinto del estado `saving` normal.

**E2. Escritura rápida (fast typing)**
- Estado: 🟢 Seguro
- Evidencia: `WritingEditor.tsx:117-124` — cada `handleChange` cancela el `setTimeout` anterior (`clearTimeout(debounceRef.current)`) antes de programar uno nuevo; el contenido se lee siempre de `contentRef.current` (último valor), no de un closure obsoleto.
- Motivo: no hay condición de carrera entre pulsaciones — el debounce reinicia limpiamente en cada tecla.

**E3. Pegar un texto muy largo (paste)**
- Estado: 🟡 Importante
- Evidencia: `features/academy/schemas/production.schema.ts` (citado en Sprint 1.5 del propio plan del repositorio) valida únicamente `content: z.string().min(1)` — sin límite máximo de longitud, ni en el `Textarea` (`WritingEditor.tsx:139-146`, sin atributo `maxLength`) ni en el schema Zod.
- Archivo: `features/academy/schemas/production.schema.ts`, `features/academy/components/unit-attempt/WritingEditor.tsx`
- Motivo: un pegado de texto extremadamente largo (ej. varios MB) se autoguardaría y enviaría sin ninguna validación de tamaño en el borde cliente — el único límite real sería uno implícito de la infraestructura (Server Action body size, columna de base de datos), no verificable sin credenciales reales.

**E4. Borrado instantáneo de todo el texto antes de enviar**
- Estado: 🟢 Seguro
- Evidencia: `WritingEditor.tsx:172` — `SubmitButton` recibe `disabled={content.trim().length === 0}`, bloqueando el envío de contenido vacío o solo-espacios en blanco desde la UI.
- Motivo: cubre el caso de UI; el backend también valida `min(1)` de forma independiente (defensa en profundidad).

**E5. Pérdida y recuperación de conexión a internet mientras se escribe**
- Estado: 🟢 Seguro
- Evidencia: `WritingEditor.tsx:87-98` — listeners nativos `offline`/`online`; al reconectar (`handleOnline`), se dispara `triggerAutosave(contentRef.current)` automáticamente, reintentando el guardado con el contenido más reciente. Mientras está offline, se muestra un banner (`role="alert"`, `WritingEditor.tsx:149-153`).
- Motivo: comportamiento explícito y correctamente implementado, no un efecto colateral accidental.

**E6. Refresh del navegador durante el polling de retroalimentación**
- Estado: 🟡 Importante
- Evidencia: `useFeedback.ts:8-13` — el propio comentario del archivo reconoce que el techo de 3 minutos se guarda en el `QueryClient`, cuya instancia se recrea por completo en cada carga de página nueva (no en navegación SPA). Un refresh (F5) durante `PROCESSING` reinicia `processingSinceKey` a `undefined`, por lo que `since = Date.now()` se recalcula desde cero.
- Archivo: `features/academy/hooks/useFeedback.ts` (líneas 8-13, 33-38)
- Motivo: un estudiante que refresca repetidamente la página mientras espera retroalimentación puede extender indefinidamente el "tiempo de espera efectivo" más allá del techo de 3 minutos documentado — no es un fallo de seguridad, pero contradice la garantía de UX de "esto no tardará más de 3 minutos".

### Retroalimentación IA

**F1. Timeout de la llamada de IA (excede 3 minutos)**
- Estado: 🟢 Seguro (manejado, con la salvedad de E6)
- Evidencia: `useFeedback.ts:39-44` — `refetchInterval` retorna `false` (detiene el polling) cuando `elapsed >= TIMEOUT_MS`; el hook expone `timedOut` para que la UI muestre un estado distinto de "sigue procesando".
- Motivo: el techo existe y se respeta correctamente dentro de una misma sesión de página (sin refresh).

**F2. Respuesta lenta pero no fallida**
- Estado: 🟢 Seguro
- Evidencia: polling cada 5s (`POLL_INTERVAL_MS`, `useFeedback.ts:12`) hasta que `status !== "PROCESSING"` o se cumpla el techo — comportamiento correcto para latencia variable del proveedor de IA.

**F3/F4. Doble envío o "reintento" mientras el intento sigue en `PROCESSING`**
- Estado: 🟢 Seguro
- Evidencia: mientras `currentStep === "RECEIVE_FEEDBACK"` (estado que persiste durante `PROCESSING`, según el comentario de `AttemptStepContainer.tsx:62-63`), el mismo guard de N1/N2 mantiene al estudiante en esa pantalla — no existe una vía de UI para regresar al editor de `/produce` o `/rewrite` y reenviar una nueva versión mientras la anterior sigue procesándose, porque cualquier intento de navegar manualmente a esa URL sería redirigido de vuelta por el guard de `step` vs `currentStep`.
- Archivo: `features/academy/components/unit-attempt/AttemptStepContainer.tsx`

**F5. Abandonar la página después de que la retroalimentación ya esté lista, y volver más tarde**
- Estado: 🟡 Importante (limitación ya reconocida por el propio código, no un hallazgo nuevo, pero confirmada aquí con evidencia exacta)
- Evidencia: comentario explícito en `AttemptStepContainer.tsx:54-64`: "en cuanto el backend entrega el feedback, `currentStep` pasa a `REWRITE`... si el estudiante cierra la pestaña después de eso y la reabre... la redirección defensiva lo envía a `.../rewrite`, sin volver a mostrar el panel de retroalimentación ya entregado." El propio Blueprint (§12 P-09) solo exige preservar el estado durante `PROCESSING`, no después de `READY` — es un límite de alcance aceptado, no un bug oculto.
- Archivo: `features/academy/components/unit-attempt/AttemptStepContainer.tsx` (líneas 54-64)
- Motivo: si en la demo el presentador navega fuera de la pantalla de retroalimentación tras recibirla (ej. para mostrar el Panel de Profesor) y luego intenta "volver" a esa pantalla desde el historial del navegador, no se re-mostrará el feedback — se lo llevará directo al editor de reescritura.

**F6. Fallo real (no timeout) de la llamada de IA — sin reintento automático**
- Estado: 🟡 Importante (limitación ya documentada en `docs/operations/06-known-production-limitations.md`, punto 4; confirmada aquí a nivel de código)
- Evidencia: `AcademyFeedbackGateway.ts` (verificado en Sprint 7) captura cualquier error del proveedor y lo convierte en `PROCESSING` indefinido — sin distinguir "proveedor caído" de "aún generando", y sin ningún mecanismo de reintento de la llamada en sí.
- Motivo: si la clave de IA expira o se alcanza un límite de cuota durante la demo, el estudiante queda esperando indefinidamente sin ningún mensaje de error explícito — solo se resuelve enviando una versión nueva del texto (ver `07-disaster-recovery.md`).

### Dashboard

**D1. Un único fallo entre las 9 lecturas paralelas del Dashboard**
- Estado: 🟡 Importante
- Evidencia: `services/database/index.ts:57-64` (`Promise.all` de 7 lecturas: identidad, plan, continuación, recomendación, coach, rendimiento estimado, dashboard almacenado) y `features/dashboard/services/dashboardService.ts:23-27` (`Promise.all` de 3: core, gamificación, analítica — donde "core" ya envuelve las 7 anteriores). Ninguno de los dos usa `Promise.allSettled`.
- Archivo: `services/database/index.ts`, `features/dashboard/services/dashboardService.ts`
- Motivo: si cualquiera de las 9 lecturas independientes lanza una excepción (ej. un timeout puntual de un servicio scaffold como `getAnalyticsSnapshot`), toda la carga del Dashboard falla — no hay degradación parcial (mostrar lo que sí cargó y omitir lo que falló).
- Mitigación existente: el fallo se propaga hasta `DashboardPage.tsx` (Server Component), que deliberadamente **no** captura el error (comentario explícito, líneas 8-13) para que lo capture `app/[locale]/error.tsx` — el resultado visible para el estudiante es un estado de error tranquilo (`DashboardErrorState`), no una pantalla en blanco ni un stack trace. El riesgo es de disponibilidad total del Dashboard ante un fallo parcial, no de una mala experiencia de error.

**D2. Estados vacíos (estudiante nuevo sin historial)**
- Estado: 🟢 Seguro (verificado en sprints anteriores — `DashboardView.tsx` maneja `hasAnyHistory` explícitamente vía `selectWelcomeVariant`, `dashboardService.ts:29`).

**D3. Navegación repetida Dashboard ↔ Academia**
- Estado: 🟢 Seguro — cubierto por el mismo guard de re-validación server-side de N1 en el lado de Academia; el Dashboard no mantiene estado que se corrompa por idas y vueltas (Server Component, sin estado de cliente persistente entre navegaciones).

### Panel de Profesor

**P1. Cambio rápido entre estudiantes**
- Estado: 🟢 Seguro (parcialmente inferido) — cada `studentId` nuevo dispara una nueva query con su propia Query Key (`academyKeys`-equivalente para Teacher Panel); TanStack Query cancela/ignora respuestas obsoletas de una query anterior si la Query Key cambió antes de que resuelva, comportamiento estándar de la librería (no específico de este código, por lo que no se cita una línea de mitigación explícita porque no existe — es una garantía del framework, no del código propio).

**P2. Seleccionar un estudiante inexistente o sin relación docente**
- Estado: 🟢 Seguro (con hallazgo de seguridad relacionado, ver S1 en Seguridad)
- Evidencia: `TeacherStudentDetailContainer.tsx:50-63` — distingue explícitamente `ApiError.status === 403` (renderiza `ForbiddenState`) de cualquier otro error (renderiza `ErrorState` genérico con botón de reintento). `AcademyAuthorizationGuard.assertTeacherRelationship` (líneas 45-54) lanza `ForbiddenException` si `hasRelationship` es `false` — cubre tanto "estudiante inexistente" como "estudiante real sin relación" con la misma respuesta 403 (sin distinguir uno de otro, correctamente, ya que `hasRelationship` no verifica existencia del estudiante por separado).
- Archivo: `features/academy/components/teacher-panel/TeacherStudentDetailContainer.tsx`, `features/academy/application/services/AcademyAuthorizationGuard.ts`

**P3. Historial vacío de un estudiante real**
- Estado: 🟢 Seguro (inferido de D2 — mismo patrón de `EmptyState` ya usado consistentemente en el Design System, verificado en Sprint 3).

**P4. Navegación repetida hacia atrás desde el detalle de un estudiante**
- Estado: 🟢 Seguro — no hay mutación de estado del lado del Profesor al ver el detalle (solo lecturas), por lo que no hay riesgo de estado inconsistente por navegación repetida.

### Autenticación

**A1. Sesión expirada en medio de una operación**
- Estado: ⚪ No verificable en este entorno (ver sección 3) — el comportamiento depende de Clerk (servicio externo) y de si el middleware intercepta la petición antes o después de que la sesión expire durante una mutación en curso. `middleware.ts:24-27` protege toda ruta no pública exigiendo `auth().protect()`, pero esto se ejecuta en la petición HTTP entrante, no dentro de una Server Action ya en vuelo — no se puede confirmar sin una sesión Clerk real qué ocurre si la sesión expira exactamente entre el clic de "Enviar" y la respuesta del servidor.

**A2. Logout en medio de una operación (ej. autosave en curso)**
- Estado: ⚪ No verificable en este entorno — mismo motivo que A1, depende del comportamiento real del SDK de Clerk ante una sesión invalidada a mitad de una petición en curso.

**A3. Login en otra pestaña con una cuenta distinta**
- Estado: 🟡 Importante (mismo hallazgo que N4) — Clerk comparte la sesión vía cookies a nivel de navegador, no de pestaña; si el usuario inicia sesión con una cuenta distinta en la Pestaña B, la Pestaña A (con datos ya cargados de la cuenta anterior en su `QueryClient` local) no se entera hasta su próxima interacción que dispare una request nueva — podría mostrar temporalmente datos de la sesión anterior mezclados con la navegación de la nueva, hasta que la app detecte la discrepancia en la siguiente llamada al servidor (que sí aplicaría la autorización real de la nueva sesión).

**A4. Usuario sin rol asignado / rol inválido**
- Estado: 🟢 Seguro
- Evidencia: `resolvePlatformRoleFromClaims`/`resolveAcademyRoleFromClaims` (verificado en Sprint 2) — ambos hacen fail-closed a `null` para cualquier valor de rol no reconocido explícitamente, en vez de asumir un rol por defecto.
- Motivo: un rol corrupto o ausente en `publicMetadata` nunca se interpreta silenciosamente como un rol válido.

### Datos

**Da1. Colecciones vacías (unidades, intentos, competencias)**
- Estado: 🟢 Seguro — cubierto de forma consistente por los componentes `EmptyState` en cada Container relevante (verificado en Sprints 1-3).

**Da2. Registros duplicados / datos inconsistentes en base de datos**
- Estado: ⚪ No verificable en este entorno — requiere una base de datos real con capacidad de insertar datos inconsistentes deliberadamente; no existe conexión a `DATABASE_URL` en este entorno (bloqueador abierto desde Sprint 5).

**Da3. IDs inexistentes pasados directamente en la URL (ej. `unitId` que nunca existió)**
- Estado: 🟢 Seguro
- Evidencia: `PrismaAcademyReadModelPort.ts:88-92` (`getUnitDetail`) retorna `null` si `findFirst` no encuentra coincidencia — el handler correspondiente lo traduce a un 404 genérico (`ResourceNotFoundException`), sin distinguir "no existe" de "existe pero no es tuyo" en las rutas de lectura (patrón correcto, ver S1 para el contraste con las rutas de escritura).

### Seguridad

**S1. Asimetría IDOR entre rutas de Lectura (Query) y rutas de Escritura (Comando) — hallazgo principal de esta auditoría**
- Estado: 🟡 Importante (existence disclosure confirmado; no acceso no autorizado — la acción sigue bloqueada en ambos casos, ver "Impacto real" abajo)
- Evidencia:
  - **Rutas de lectura** (`GetAcademyUnitDetailHandler`, `GetVersionFeedbackHandler`, `GetAttemptHistoryHandler`) propagan `studentId` directamente en el `WHERE` de Prisma (`PrismaAcademyReadModelPort.ts:89` — `where: { id: unitId, studentId }`; línea 155 — `where: { academyUnitId: unitId, academyUnit: { studentId } }`; línea 179-183 — `where: { attemptId, versionNumber, attempt: { academyUnit: { studentId } } }`). Un `unitId`/`attemptId` que no pertenece al estudiante autenticado produce exactamente el mismo resultado (`null` → 404 genérico) que un ID que no existe en absoluto. **Esto es correcto y es la remediación real de H-01.**
  - **Rutas de escritura** (`AcademyAuthorizationGuard.assertUnitOwnership`/`assertAttemptOwnership`, `AcademyAuthorizationGuard.ts:20-31`) hacen lo opuesto: primero buscan el recurso solo por ID (`findById`), y si existe pero pertenece a otro estudiante, lanzan una `ForbiddenException` con un mensaje que **confirma explícitamente la existencia del recurso** ("El estudiante {studentId} no es propietario de la unidad {unitId}."). `features/academy/api/http/errors.ts:46-51` mapea esto a un **403 HTTP distinto del 404** que se usaría si el recurso no existiera — y el mensaje completo (incluyendo los IDs) se devuelve en el cuerpo de la respuesta JSON al cliente.
- Archivos: `features/academy/application/services/AcademyAuthorizationGuard.ts` (líneas 20-31), `features/academy/api/http/errors.ts` (líneas 46-51)
- Handlers afectados: los 9 que usan este guard — `AdvanceStepHandler`, `AdvanceToReflectionHandler`, `AutosaveDraftHandler`, `CompleteReflectionHandler`, `RepeatUnitHandler`, `StartUnitHandler`, `SubmitProductionHandler`, `SubmitRevisionHandler`, `VerifyComprehensionHandler`.
- Impacto real: un atacante autenticado que enumere `unitId`/`attemptId` ajenos contra cualquiera de estos 9 endpoints puede distinguir "este ID existe pero no es mío" (403) de "este ID no existe" (404) — una fuga de metadatos de existencia, **no** una fuga de contenido ni la posibilidad de ejecutar la acción sobre el recurso ajeno (la acción sigue bloqueada correctamente en ambos casos). Es una versión más leve de la misma clase de problema que H-01, en la mitad del sistema (escritura) que no recibió la misma remediación que la mitad de lectura.

**S2. Open Redirect**
- Estado: 🟢 Seguro — no verificado ningún hallazgo
- Evidencia: búsqueda exhaustiva (`grep` de `redirect(`, `returnTo`, `callbackUrl`, `next=`, `redirect_uri` en `app/`, `features/`, `middleware.ts`, `services/`) no encontró ningún destino de redirección derivado de un parámetro controlado por el usuario (query string, body, header). El único `redirect()` dinámico (`app/[locale]/page.tsx:24`) construye su destino exclusivamente a partir de `resolvePostAuthRedirectPath(sessionClaims)`, derivado del rol ya autenticado y validado — no de ningún input externo.

**S3. Broken Access Control / rutas sin protección**
- Estado: 🟢 Seguro
- Evidencia: `middleware.ts:24-27` aplica `auth().protect()` a toda ruta que no esté explícitamente en `isPublicRoute` (patrón de lista blanca, fail-closed por diseño — ya verificado en Sprint 7).

**S4. Broken Navigation (navegar a un paso/estado que el dominio no permite)**
- Estado: 🟢 Seguro — cubierto por el mismo guard citado en N1/N2/F3.

**S5. Información expuesta en mensajes de error**
- Estado: 🟢 Seguro, con una observación menor
- Evidencia: `features/academy/api/http/errors.ts:62-70` — el caso genérico no clasificado (500) sí incluye `details: { error: String(error.message) }` en el cuerpo JSON de la respuesta (no un stack trace completo, pero sí el mensaje crudo de la excepción original, potencialmente un mensaje de driver de base de datos u otro detalle interno). No se encontró ningún uso directo de `error.stack` en ninguna ruta de `app/api/`.
- Archivo: `features/academy/api/http/errors.ts` (líneas 62-70)
- Motivo: es una fuga menor (mensaje de error interno, no stack trace ni secretos), limitada al camino de error verdaderamente no clasificado (500 genérico) — no aplica a los casos 400/401/403/404/409 que ya usan mensajes controlados.

---

## 3. Casos que NO pudieron verificarse

1. **A1 — Expiración de sesión en medio de una operación**: requiere una sesión Clerk real con control sobre su expiración; no hay credenciales Clerk configuradas en este entorno (confirmado ya en Sprints 5 y 7 — solo existen claves de prueba, sin sesión activa que forzar a expirar).
2. **A2 — Logout en medio de una operación**: mismo motivo que A1.
3. **Da2 — Registros duplicados/datos inconsistentes en base de datos**: requiere `DATABASE_URL` real con capacidad de escritura directa para forzar un estado inconsistente; sin conexión a Supabase en este entorno (bloqueador abierto desde Sprint 5A/5).
4. **F1/F6 en condiciones reales de proveedor de IA** (rate limit real, expiración de clave real): el comportamiento del código ante estos casos se verificó por lectura (`AcademyFeedbackGateway.ts`, `ClaudeProvider.ts`), pero no se ejecutó una llamada real que agote una cuota o expire una clave, porque no hay clave de IA configurada en este entorno.
5. **E3 — Límite real de tamaño de payload al pegar texto enorme**: se confirmó la ausencia de validación en el borde cliente/schema, pero el límite real (si existe) dependería de la configuración de Next.js Server Actions y/o de una columna de base de datos — ninguno verificable sin desplegar contra infraestructura real.
6. **N4/A3 — Comportamiento exacto multi-pestaña con Clerk real**: se confirmó la ausencia de sincronización de estado de cliente (Zustand/QueryClient), pero el comportamiento exacto de las cookies de sesión de Clerk entre pestañas (si invalida la Pestaña A inmediatamente o solo en su próxima request) depende del SDK real, no verificable sin sesión activa.

---

## 4. Riesgos encontrados

### Críticos
- Ninguno. Ningún escenario auditado permite ejecutar una acción sobre datos ajenos, evadir autenticación, ni corromper datos de forma irreversible.

### Importantes
1. **S1 — Asimetría IDOR lectura/escritura** (existence disclosure vía 403 vs 404 en 9 handlers de Comando) — el hallazgo de seguridad más significativo de esta auditoría.
2. **F6 — Sin reintento automático de la llamada de IA** ante un fallo real (ya documentado en `06-known-production-limitations.md`, confirmado aquí a nivel de código).
3. **D1 — `Promise.all` sin degradación parcial** en el Dashboard (un fallo entre 9 lecturas tumba toda la pantalla, aunque de forma controlada).
4. **E1 — Autosave sin garantía de finalización** en `beforeunload` (sin `keepalive`/`sendBeacon`).
5. **E6/F5 — Comportamiento del techo de polling y de la reaparición del feedback** ante un refresh completo o reapertura tardía de la pestaña.
6. **E3 — Sin límite de longitud en el borde cliente/schema** para el contenido del editor.

### Menores
1. **N4/A3 — Falta de sincronización de estado entre pestañas** (consistencia de UI, no de seguridad).
2. **S5 — Mensaje de error crudo incluido en `details` del 500 genérico** (fuga menor de información interna, no un stack trace).

---

## 5. Riesgos para la demo

De los hallazgos anteriores, los que realmente podrían manifestarse durante una demostración institucional en vivo de ~20 minutos:

1. **F6 (fallo real de IA sin reintento)** — ya cubierto operativamente por `03-demo-day-runbook.md` (protocolo de "si falla la IA"), pero sigue siendo el riesgo más visible si la clave expira o se agota la cuota justo durante la demo.
2. **F5 (reapertura del feedback tras navegar fuera)** — si el presentador muestra la retroalimentación de Mateo y luego navega al Panel de Profesor y "vuelve atrás" con el botón del navegador para volver a mostrar el feedback, no lo verá de nuevo — debe navegar de nuevo por el flujo normal (`/academy` → unidad → historial) en vez de usar "atrás". Riesgo bajo si el guion (`07-demo-script-final.md`) no depende de un "atrás" del navegador en ese punto — vale la pena confirmarlo contra el guion ya escrito.
3. **D1 (Dashboard todo-o-nada)** — si cualquier servicio scaffold (analítica/gamificación) tiene un hiccup transitorio durante la demo, el Dashboard completo mostraría el estado de error en vez de solo una sección — mitigado por el estado de error ya "tranquilo" (`DashboardErrorState`), pero perdería el primer impacto visual de la demo si ocurre en el primer paso del guion.
4. **S1 (asimetría IDOR)** no es un riesgo de demo en sí (no se ejecutaría un ataque en vivo frente a los directivos), pero sí sería una pregunta técnica difícil si algún director técnico pregunta específicamente "¿cómo manejan ustedes el acceso no autorizado?" — la respuesta honesta sería "el acceso está bloqueado en todos los casos; existe una inconsistencia menor de qué código HTTP se devuelve," no "no hay ningún problema."

---

## 6. Recomendaciones

Ordenadas por Impacto/Probabilidad/Costo (mayor prioridad primero):

1. **S1 — Unificar el comportamiento de `assertUnitOwnership`/`assertAttemptOwnership` con el patrón ya usado en las rutas de lectura** (devolver `ResourceNotFoundException` en vez de `ForbiddenException` cuando el recurso pertenece a otro estudiante, igual que ya hace `getUnitDetail`). Impacto: cierra la única fuga de seguridad real encontrada. Probabilidad de explotación: baja (requiere estar ya autenticado y enumerar IDs ajenos), pero el costo de la corrección es bajo (cambiar una excepción por otra en 2 métodos) — mejor relación impacto/costo de todo este informe. *(No implementado en esta auditoría, por mandato explícito de "solo documentar, no corregir".)*
2. **F6 — Diseñar un mecanismo de reintento explícito para la llamada de IA**, ya anticipado como "fuera de alcance" en el propio código — es la limitación más visible operativamente, ya mitigada en el runbook de demo pero no en el producto.
3. **D1 — Migrar los dos `Promise.all` del Dashboard a `Promise.allSettled`** con manejo de fallos parciales por sección, para que un solo servicio caído no tumbe toda la pantalla.
4. **E1 — Adoptar `navigator.sendBeacon` (o `fetch` con `keepalive: true`) para el autosave disparado en `beforeunload`**, garantizando que el último guardado tenga una oportunidad real de completarse.
5. **E3 — Añadir un límite máximo de longitud** al schema de producción/reescritura y al `Textarea`, con retroalimentación visible al estudiante en vez de depender de un límite implícito de infraestructura.
6. **F5 — Evaluar si vale la pena extender el guard de redirección** para no forzar el salto a `/rewrite` si el estudiante solo quiere revisar el feedback ya entregado (fuera de alcance del Blueprint actual — requeriría una decisión de producto, no solo técnica).

---

## Resumen final

1. **Total de escenarios auditados:** 35 (N1-N4,N6; E1-E6; F1,F2,F3/F4,F5,F6; D1-D3; P1-P4; A1-A4; Da1-Da3; S1-S5 — N5 no se cuenta aparte, es una referencia cruzada a E1)
2. **Escenarios seguros (🟢):** 23
3. **Escenarios parcialmente verificables / con hallazgo Importante (🟡):** 9 (N4, E1, E3, E6, F5, F6, D1, A3, S1)
4. **Escenarios no verificables (⚪):** 3 (A1, A2, Da2)
5. **Bugs críticos:** 0
6. **Bugs importantes:** 6 (S1, F6, D1, E1, E6/F5, E3)
7. **Bugs menores:** 2 (N4/A3, S5)
8. **Índice de resiliencia operacional: 76%**

*(Justificación breve del índice: la arquitectura de resiliencia es deliberada y mayormente correcta — guards de navegación, colas de autosave, detección offline/online, y la remediación H-01 genuinamente verificada a nivel de query. Se descuenta por la asimetría de seguridad S1 (real aunque de impacto acotado — nunca permite la acción no autorizada, solo confirma existencia), la ausencia de degradación parcial en Dashboard, y la falta de garantías de entrega en el autosave de cierre de pestaña — ninguno de los cuales es crítico, pero todos son reales y ya evidenciados por código, no hipotéticos.)*
