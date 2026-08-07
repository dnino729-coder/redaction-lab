# REDACTION LAB — DEVELOPMENT MASTER PLAN v1.0

**Fecha:** 2026-08-03
**Autor:** Lead Software Architect / Technical Product Manager / Engineering Manager
**Naturaleza de este documento:** documento operativo de producto y planificación. No es un Architecture Change Proposal, no está sujeto al proceso ACP del Architecture Change Management Standard (§2: "Documentación operativa interna... notas de trabajo... que nunca llegan a congelarse" y "documentos en estado DRAFT... su propio autor puede modificarlos libremente"). Es la única referencia de planificación de producto para el desarrollo hasta la demo de noviembre de 2026; se actualiza libremente conforme avanza el trabajo, sin necesidad de nueva versión formal por cada ajuste menor.
**Reemplaza, como plan de trabajo vigente:** ningún documento de gobernanza (Standard, ACP, Domain/Application/Infrastructure Models) — todos ellos permanecen como fuente de verdad arquitectónica. Este documento organiza el trabajo, no redefine la arquitectura.

---

## 0. Confirmación de cierre de gobernanza

Verificado directamente contra el repositorio en la fecha de este documento:

| Documento | Estado verificado |
|---|---|
| Architecture Change Management Standard | `FROZEN` (`redaction-lab-architecture-change-management-standard-v1.5.1-2026-08-02.md`) |
| ACP-010 (última versión, v1.4) | `APROBADO` |
| ACP-011 (última versión, v1.1) | `APROBADO` |
| Architecture Review de ACP-010 v1.3 | `EMITIDA` |
| Architecture Review de ACP-011 | `EMITIDA` |
| Registro de Ejecución de ACP-010 | Persistido |
| Registro de Ejecución de ACP-011 | Persistido |

**No existe ningún ACP pendiente que bloquee el desarrollo funcional.** Se registran como **Technical Debt** (documental, no bloqueante) los siguientes hallazgos, ya conocidos y explícitamente no reabiertos en este documento:

- ACP-005, ACP-006 (v1.0/v1.1) y ACP-007 (v1.0–v1.2) permanecen en su propio campo "Estado del ACP" como `PENDIENTE DE APROBACIÓN` — el trabajo funcional que dependía de ellos (Academia consumiendo Organization Management, reapertura del Domain Model de Academia) ya fue ejecutado y está en producción de código; la falta de cierre formal de esos tres ACP es deuda de bookkeeping, no un bloqueador técnico.
- Los cinco archivos históricos del Standard (v1.1 a v1.5) conservan citas obsoletas a "ACP-008"/"ACP-009" en su propio texto — snapshots históricos, sin efecto sobre el documento vigente (`v1.5.1`, ya corregido).

**Conclusión de la Sección 0: el proyecto puede entrar en `PRODUCT DEVELOPMENT PHASE`.**

---

## 1. Visión del producto

**Propósito.** Redaction Lab es una plataforma web de entrenamiento de la producción escrita para el examen DELF B2 (francés), mediante retroalimentación asistida por IA sobre ejercicios de escritura reales, con seguimiento de progreso individual y supervisión docente.

**Usuarios.**
- **Estudiante** (rol primario de la demo): completa unidades de escritura estructuradas (contextualizar → comprender → observar/analizar → practicar → producir/reescribir → recibir retroalimentación → reflexionar), consulta su historial de intentos y una biblioteca de modelos de referencia.
- **Profesor**: supervisa el progreso de sus estudiantes, revisa intentos y retroalimentación generada.
- **Administrador**: gestiona la biblioteca de modelos y (en fases futuras) la estructura organizacional multi-institución.

**Propuesta de valor.** Sustituir la corrección manual, lenta y no escalable de ejercicios DELF B2 por retroalimentación instantánea, pedagógicamente estructurada y basada en IA, sin sacrificar la supervisión docente ni el rigor del marco DELF.

**Objetivos de negocio.** Validar ante la Universidad, mediante una demo funcional en noviembre de 2026, que la plataforma puede sostener un ciclo completo de aprendizaje real (no una maqueta) — como paso previo a una decisión institucional de adopción y a la eventual comercialización del producto.

---

## 2. Estado actual del proyecto

**Gobernanza:** cerrada (Sección 0). Metodología DDD/Clean Architecture con Architecture Change Management Standard `FROZEN`, gobernando Domain/Application/Infrastructure Models por módulo.

**Arquitectura:** Next.js 14 App Router, Feature-Driven Architecture (`features/*`), sin backend separado — Route Handlers y Server Actions. Ver Sección 6.

**Backend / Dominio:** el Bounded Context **Academia** está implementado en profundidad (392 archivos): Domain, Application, Infrastructure y API Contract completos, con Aggregate `Attempt`, Value Objects, Domain Events, Policies, y un `AcademyFeedbackGateway` con adaptadores reales para Claude y OpenAI ya cableados (`features/academy/infrastructure/ai/`). **Organization Management** está `FROZEN` como Domain/Application/Infrastructure Model, consumido por Academia vía el patrón Bounded Context Query Gateway (Platform Core Foundation v1.2). **My Plan** tiene su capa de datos, dominio, aplicación e infraestructura recién finalizadas (Sprints 3.3.1–3.3.4, commits más recientes del repositorio). El resto de módulos (`analytics`, `coach`, `daily-training`, `gamification`, `laboratory`, `notifications`, `profile`, `settings`, `simulator`) son scaffolding (10 archivos cada uno) — sin Domain/Application/Infrastructure implementados todavía.

**Frontend:** Academia tiene el recorrido completo del Estudiante implementado y verificado (P-01 Mapa de unidades → P-11 Biblioteca de Modelos, incluyendo el contenedor paramétrico único `AttemptStepContainer` para los pasos P-04–P-10), con tests unitarios/componente (Vitest + RTL + MSW) y verificación manual en navegador en cada sprint. Existe scaffolding de rutas para `academy/admin` (biblioteca de modelos, administrador) pero **no existe todavía ningún panel de Profesor** funcional. Dashboard tiene 39 archivos (parcialmente construido, sin confirmar wiring completo a datos reales de progreso agregado).

**IA:** el contrato `AIProvider` (Platform Core, `services/ai/provider.interface.ts`) está definido; Academia ya implementa adaptadores reales para Anthropic Claude y OpenAI (`ClaudeProvider.ts`, `OpenAIProvider.ts`), seleccionables por variable de entorno (`ACADEMY_AI_PROVIDER`), con un `FeedbackPromptBuilder` dedicado. **La integración de IA no es un riesgo pendiente — ya existe y es funcional**, sujeta a contar con credenciales de API activas en el entorno de demo.

**Base de datos:** PostgreSQL vía Supabase + Prisma (esquema de 1108 líneas). Migraciones reales existen para `dashboard`, `my_plan` y `academy` (incluidas políticas RLS) — los demás módulos no tienen todavía esquema físico.

**Documentación:** exhaustiva a nivel de gobernanza y de Bounded Context (Domain/Application/Infrastructure Models, API Contracts, Blueprints) para Academia y Organization Management; nula a nivel de módulo para el resto de `features/*`.

---

## 3. Alcance del MVP para noviembre

**Hará el MVP (demo funcional real, no maqueta):**

1. **Autenticación** — Clerk, con los roles ya definidos (`STUDENT`, `TEACHER`, `ADMIN` como mínimo funcional para la demo); redirect por rol ya contemplado en el diseño de Academia (P-01).
2. **Dashboard del estudiante** — vista de progreso agregado (unidades completadas, intentos recientes, continuar donde quedó) — reutilizando datos ya existentes vía Academia.
3. **Editor de escritura** (`WritingEditor`, P-08) — con autosave, contador de palabras, envío de versión.
4. **Análisis mediante IA + Retroalimentación automática** (P-09) — ya implementado end-to-end sobre Claude/OpenAI; foco de esta fase es **validación real con contenido DELF B2 auténtico**, no reconstrucción.
5. **Seguimiento del estudiante** — Historial de intentos por unidad (P-03, ya implementado) + una vista agregada mínima (progreso por tipo de texto).
6. **Panel básico para profesor** (nuevo, mayor esfuerzo de esta fase) — lista de estudiantes asignados, ver intentos y retroalimentación ya generada por estudiante. **Sin** edición/override de retroalimentación, **sin** mensajería, **sin** analítica agregada de grupo.
7. Biblioteca de Modelos para estudiante (P-11, ya implementada) — se mantiene por ser demostrable con bajo esfuerzo adicional.

**NO hará el MVP (`Won't Have` antes de noviembre):**

- Módulos `coach`, `daily-training`, `simulator`, `gamification`, `notifications`, `laboratory`, `analytics` (más allá de lo ya cableado en Dashboard) — permanecen como scaffolding.
- Panel de administración multi-organización (Organization Management con interfaz propia) — el Bounded Context existe y está `FROZEN`, pero no tendrá UI en la demo.
- Edición/override docente de retroalimentación de IA.
- Notificaciones push/email.
- Internacionalización más allá de ES/FR ya existentes.
- Aplicación móvil nativa.
- Facturación/planes comerciales.
- Onboarding self-service de nuevas instituciones.

---

## 4. Roadmap (organizado por Sprints semanales, 12h/semana)

Cada Sprint asume 2h/día × 6 días = 12h. Fechas indicativas desde 2026-08-03; ajustables sin nueva versión de este documento (Sección de encabezado).

| Sprint | Semana (aprox.) | Objetivo | Dependencias | Definition of Done | Entregables |
|---|---|---|---|---|---|
| **S0 — Consolidación técnica** | 04–09 ago | Verificar que todo lo ya construido (Academia, My Plan, Dashboard) compila, pasa lint/tests, y corre en un entorno desplegado (Vercel preview + Supabase) con datos semilla realistas. | Ninguna | `tsc`/`eslint`/`vitest` limpios en todo el repo; app accesible en URL de staging; seed data DELF B2 real cargado. | Reporte de estado técnico consolidado; entorno de staging operativo. |
| **S1 — Auth y rutas por rol** | 11–16 ago | Confirmar flujo Clerk completo (sign-up/sign-in), redirect por rol (`STUDENT` → `/academy`, `TEACHER` → panel nuevo), roles reales asignables en Supabase/Clerk metadata. | S0 | Un usuario STUDENT y un usuario TEACHER de prueba pueden iniciar sesión y llegar a su vista correspondiente. | Guía de creación de usuarios demo; roles verificados. |
| **S2–S3 — Panel de Profesor (dominio + aplicación)** | 18–30 ago | Diseñar y construir el Domain/Application mínimo para que un Profesor consulte estudiantes asignados y sus intentos — reutilizando Aggregates ya existentes de Academia (`Attempt`), sin nuevo Aggregate si es evitable. | S1 | Query `GetTeacherStudentAttemptsQuery` (o equivalente) probada con datos reales; sin nuevo Command (solo lectura). | Domain/Application Model incremental (documentación mínima, no ACP — ver Sección 8). |
| **S4–S5 — Panel de Profesor (frontend)** | 01–13 sep | `TeacherDashboardPage`, `StudentListContainer`, `StudentAttemptDetailContainer` — mismo patrón Container/Presentational ya usado en Academia. | S2–S3 | Un Profesor de prueba ve la lista de sus estudiantes y puede abrir el detalle de un intento con su retroalimentación real. | Panel de Profesor funcional en staging. |
| **S6 — Dashboard del estudiante (cierre)** | 15–20 sep | Confirmar/completar el wiring de Dashboard a datos reales de Academia (progreso, continuar unidad) — no rediseñar. | S0 | Dashboard muestra datos reales de al menos 3 usuarios estudiante de prueba con distintos niveles de avance. | Dashboard demostrable. |
| **S7 — Validación de contenido DELF B2 real** | 22–27 sep | Cargar unidades reales (no placeholders) para al menos 2 tipos de texto DELF B2; validar que la retroalimentación de IA es pedagógicamente coherente con contenido real. | S0 | Al menos 2 unidades completas, con al menos 5 intentos de prueba end-to-end (envío → feedback → reflexión) revisados manualmente por criterio pedagógico. | Set de contenido demo aprobado. |
| **S8 — Endurecimiento y bugs** | 29 sep–04 oct | Cerrar bugs detectados en S0–S7; revisar estados Loading/Empty/Error/Forbidden en las pantallas de la demo. | S1–S7 | Cero errores bloqueantes conocidos en el recorrido completo Estudiante + Profesor. | Lista de bugs cerrados. |
| **S9 — Pulido UX de la demo** | 06–11 oct | Pulir las pantallas que verán los directivos: Dashboard, Editor, Feedback, Panel de Profesor — sin tocar módulos fuera de alcance. | S8 | Revisión visual aprobada por el propio equipo, en desktop y mobile. | Checklist de pulido UX. |
| **S10 — Performance y despliegue de demo** | 13–18 oct | Verificar tiempos de respuesta de la IA, cachear lo cacheable, confirmar despliegue estable en el entorno que se usará el día de la demo. | S9 | Recorrido completo demo-ready ejecutado 3 veces sin fallos en el entorno final. | Entorno de demo congelado. |
| **S11 — Datos y guion de demo** | 20–25 oct | Preparar cuentas demo, datos semilla definitivos, guion narrativo de la presentación (qué mostrar, en qué orden, qué decir). | S10 | Guion de demo escrito y ensayado una vez. | Guion + cuentas demo listas. |
| **S12 — Buffer de contingencia** | 27 oct–01 nov | Reservado explícitamente para lo que salga mal en S0–S11 — no se planifica trabajo nuevo aquí. | Todas | N/A (buffer) | N/A |
| **S13 — Ensayo general** | 03–08 nov | Ensayo completo de la demo, cronometrado, con al menos una persona externa al equipo como "público". | S10–S12 | Ensayo completado sin intervención manual de emergencia. | Feedback del ensayo incorporado. |
| **S14 — Cierre final** | 10–15 nov | Últimos ajustes menores, congelar el entorno de demo, preparar respaldo (video grabado) por si falla el entorno en vivo. | S13 | Video de respaldo grabado; entorno final verificado el mismo día o el anterior a la presentación. | Demo lista para presentar. |

**Total: 15 semanas (S0–S14), objetivo de presentación: semana del 16 de noviembre de 2026.**

---

## 5. Priorización (MoSCoW)

| Funcionalidad | Prioridad |
|---|---|
| Autenticación con roles (Estudiante/Profesor) | **Must Have** |
| Editor de escritura + autosave | **Must Have** |
| Análisis IA + retroalimentación automática (ya implementado) | **Must Have** |
| Historial de intentos por unidad | **Must Have** |
| Panel básico de Profesor (solo lectura) | **Must Have** |
| Dashboard del estudiante con datos reales | **Must Have** |
| Contenido DELF B2 real (mínimo 2 unidades) | **Must Have** |
| Biblioteca de Modelos (estudiante) | **Should Have** |
| Reflexión de cierre de intento (P-10) | **Should Have** |
| Panel de administración de Biblioteca de Modelos | **Could Have** |
| Vista agregada de progreso por grupo (Profesor) | **Could Have** |
| Gamificación, Coach, Daily Training, Simulator | **Won't Have** (antes de noviembre) |
| Notificaciones | **Won't Have** |
| Multi-organización con UI propia | **Won't Have** |

---

## 6. Arquitectura (resumen de la vigente — no se rediseña)

- **Patrón:** Feature-Driven Architecture (`ARCHITECTURE.md`, resolución 18.2). Cada módulo pedagógico es un ecosistema independiente bajo `features/`, con estructura interna uniforme (`components/ pages/ hooks/ services/ types/ schemas/ utils/ constants/ actions/`).
- **Backend:** sin servicio separado — Next.js App Router (Route Handlers + Server Actions).
- **DDD por Bounded Context:** cada módulo funcional con reglas de negocio propias (Academia, Organization Management, My Plan) implementa Domain/Application/Infrastructure Model completos, gobernados por el Architecture Change Management Standard.
- **Comunicación entre módulos:** nunca directa entre `features/*` — siempre vía `services/` compartidos o, para integración BC-a-BC, el patrón **Bounded Context Query Gateway** (Platform Core Foundation v1.2, autorizado por ACP-005).
- **Capa de IA:** único punto de entrada autorizado, `services/ai` (contrato `AIProvider`); Academia ya implementa adaptadores concretos (Claude, OpenAI).
- **Autenticación:** Clerk, RBAC con 7 roles definidos (`SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE, SYSTEM`).
- **Base de datos:** PostgreSQL 17 (Supabase) + Prisma ORM, con migraciones y RLS por módulo.
- **Frontend:** Container/Presentational estricto — solo componentes `*Container` invocan hooks de datos (`useQuery`/`useMutation`/Zustand); `app/**` solo puede importar `features/*/pages`.
- **i18n:** `next-intl`, francés como fuente primaria, español como segundo idioma.

**No se introduce ningún cambio arquitectónico en este documento.** Cualquier necesidad real de cambio arquitectónico durante la fase de desarrollo (p. ej., si el Panel de Profesor requiriera un nuevo componente de Platform Core) se resuelve puntualmente, con la documentación mínima necesaria (Sección 8), no con el proceso ACP completo salvo que el propio Standard lo exija de forma inequívoca (documento ya `FROZEN` que deba modificarse).

---

## 7. Stack tecnológico (consolidado)

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| UI | React 18, Tailwind CSS, `class-variance-authority`, `lucide-react`, `framer-motion` |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| Formularios | `react-hook-form` + `zod` |
| i18n | `next-intl` |
| Autenticación | Clerk |
| Base de datos | PostgreSQL 17 (Supabase) + Prisma ORM |
| IA | Adaptadores propios (Claude, OpenAI) sobre contrato `AIProvider` |
| Observabilidad | Sentry, OpenTelemetry/`@vercel/otel`, PostHog |
| Testing | Vitest + Testing Library + MSW (unit/integration), Playwright + axe-core (E2E/accesibilidad) |
| Calidad | ESLint, Prettier, Husky + lint-staged |
| CI/CD | GitHub Actions (`.github/workflows`) |

---

## 8. Convenciones de desarrollo

- **Código:** TypeScript estricto; Container/Presentational (solo `*Container` con hooks de datos); sin lógica de negocio en `app/`, `lib/` ni `utils/`.
- **Testing:** Vitest + RTL + MSW para unit/componente; Playwright para E2E; cobertura mínima ya exigida por el scaffolding existente (`tests/unit/academy/mocks/`) — reutilizar, no duplicar.
- **Git:** una rama por Sprint o por funcionalidad; commits descriptivos en español, formato ya usado (`feat(módulo): descripción`, `fix(módulo): descripción`, `docs: descripción`).
- **Commits:** ningún commit directo a `main` sin verificación de `tsc`/`eslint`/tests.
- **Documentación:** durante esta fase, documentación **mínima necesaria** — un breve resumen técnico por incremento significativo (p. ej. Panel de Profesor), no un Domain/Application/Infrastructure Model completo salvo que se modifique un documento ya `FROZEN`. Si un cambio requiere tocar un documento `FROZEN` (Academia Domain Model, Platform Core Foundation, el propio Standard), **entonces sí** corresponde el proceso ACP completo — decidido caso por caso, con proporcionalidad, no por defecto.
- **Arquitectura:** ninguna decisión de este Master Plan reinterpreta ninguna resolución arquitectónica ya aprobada.
- **Naming:** consistente con lo ya establecido en Academia (`*Container`, `*Page`, `use*` para hooks, `*Dto`/`*Query`/`*Command` en Application).

---

## 9. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Panel de Profesor (único componente completamente nuevo del MVP) no se termina a tiempo | Media | Alto | Priorizado en S2–S5, con buffer explícito en S12; alcance deliberadamente mínimo (solo lectura). |
| Créditos/límites de API de IA (Claude/OpenAI) insuficientes para pruebas + demo en vivo | Media | Alto | Verificar cuotas en S0; tener ambos proveedores configurados (ya soportado por `AIProviderFactory`) como respaldo mutuo. |
| Disponibilidad real del desarrollador (2h/día) se ve interrumpida por otras obligaciones | Alta | Alto | Buffer explícito (S12); recorte de alcance vía MoSCoW (degradar "Should/Could Have" primero, nunca "Must Have"). |
| Contenido DELF B2 real no está disponible o no es suficiente | Media | Medio | Validar disponibilidad de contenido en S0/S7, con margen para curar solo 2 unidades (no las 11 completas). |
| Entorno de demo falla el día de la presentación (red, servicio caído) | Baja | Crítico | Video de respaldo grabado (S14); ensayo en el entorno real (S13), no solo en local. |
| Deuda documental de gobernanza (ACP-005/006/007 pendientes) se malinterpreta como bloqueo | Baja | Bajo | Ya aclarado en Sección 0 de este documento — no requiere acción. |

---

## 10. Cronograma (mensual, agosto–noviembre 2026)

Disponibilidad asumida: 2h/día × 6 días/semana ≈ 12h/semana.

| Mes | Semanas | Horas estimadas | Foco principal |
|---|---|---|---|
| Agosto | S0–S4 (04–30 ago) | ~60h | Consolidación técnica, autenticación por rol, inicio del Panel de Profesor (dominio + aplicación). |
| Septiembre | S5–S8 (01–30 sep) | ~60h | Frontend del Panel de Profesor, cierre de Dashboard, contenido DELF B2 real, endurecimiento. |
| Octubre | S9–S12 (01 oct–01 nov) | ~60h | Pulido UX, performance, despliegue de demo, datos y guion, buffer de contingencia. |
| Noviembre (parcial) | S13–S14 (03–15 nov) | ~24h | Ensayo general y cierre final. |
| **Total** | **15 semanas** | **~204h** | — |

---

## 11. Recomendaciones (Lead Software Architect + Technical Product Manager)

1. **No tocar lo que ya funciona.** Academia (recorrido de Estudiante completo) y la integración de IA ya están construidos y probados — el mayor riesgo de esta fase es gastar tiempo "mejorando" lo ya sólido en vez de cerrar el único gran vacío real: el Panel de Profesor. Resistir la tentación de refactorizar Academia.
2. **El Panel de Profesor debe ser deliberadamente mínimo.** Solo lectura (lista de estudiantes + ver intentos/retroalimentación). Cualquier funcionalidad de edición, mensajería o analítica agregada de grupo se pospone sin excepción — es lo que más impresiona ver "vivo" en una demo, y lo que menos margen de error tolera si se sobre-diseña.
3. **Usar contenido DELF B2 real desde la semana 1**, no placeholders — la calidad percibida de la retroalimentación de IA depende enteramente de la calidad del contenido de origen; validar esto temprano evita descubrir el problema en octubre.
4. **Preparar el respaldo en video desde ya**, no como ocurrencia de última semana — es la mitigación de mayor impacto por menor esfuerzo ante cualquier falla de infraestructura el día de la demo.
5. **Congelar el alcance del MVP por escrito** (Sección 3 de este documento) y comunicarlo a cualquier stakeholder que pida "una cosa más" durante el desarrollo — la disciplina de alcance ya demostrada en la fase de gobernanza es exactamente el activo que hay que preservar ahora, aplicado a producto en vez de a documentos.
6. **Para la conversión futura a producto comercializable:** la arquitectura DDD/Bounded Context ya adoptada (Academia, Organization Management) es precisamente lo que permite escalar a múltiples instituciones sin reescritura — el trabajo de gobernanza ya invertido es un activo, no un costo hundido. Recomendación post-demo: usar la reacción de los directivos para decidir si el siguiente Bounded Context a construir es "Organization Management con UI real" (multi-institución) o profundizar Academia (más tipos de texto DELF, niveles adicionales) — no ambos a la vez.
