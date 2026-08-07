# Limitaciones Conocidas de Producción

Lista honesta y completa, sin ocultar nada, de todo lo que hoy es una limitación real del sistema — verificada por código, no supuesta. Clasificada en tres categorías según su naturaleza, no según su severidad.

---

## Temporales

*(Soluciones provisionales con una ruta de reemplazo ya identificada — no decisiones definitivas de producto.)*

1. **El Panel de Profesor usa una whitelist manual (`ACADEMY_DEMO_TEACHER_STUDENT_PAIRS`) en vez de una verificación real de relación docente-estudiante.** Implementado en Sprint 1C como resolución temporal y explícitamente reversible de PND-04. La ruta de reemplazo real (Organización Académica) ya está diseñada a nivel documental (`docs/platform/organization-management-*`), sin código todavía.
2. **Sentry está instalado (`@sentry/nextjs` en `package.json`) pero completamente sin inicializar.** `app/global-error.tsx` lo reconoce explícitamente como pendiente. Ruta de reemplazo: crear los archivos de configuración estándar de Sentry (`sentry.client/server/edge.config.ts`) y activar `SENTRY_DSN`.
3. **La validación de entorno (`lib/env.ts`) está definida con Zod pero `envSchema.parse()` nunca se invoca.** Los errores de configuración fallan de forma tardía y opaca (en el primer uso real) en vez de al arrancar. Ruta de reemplazo: invocar la validación en el arranque del servidor.
4. **No existe reintento automático de la llamada de IA si la primera falla** (`AcademyFeedbackGateway.ts` retorna `PROCESSING` ante cualquier error, sin reintentar la generación en sí). Ruta de reemplazo: implementar un mecanismo de reintento/backoff explícito, ya anticipado por el propio comentario del archivo como "fuera de alcance" de un Sprint anterior.
5. **Las dos migraciones más recientes de Academia no tienen `rollback.sql` ni `migration.md`**, a diferencia de las 5 anteriores. Ruta de reemplazo: redactar ambos archivos siguiendo el mismo formato ya usado.
6. **Cinco variables de entorno reales (`ACADEMY_EVENT_OUTBOX_*` ×3, `ACADEMY_FF_*` ×2) no están documentadas en `.env.example`.** Ruta de reemplazo: añadirlas, con sus valores por defecto ya conocidos.

## Aceptadas

*(Decisiones de alcance ya tomadas y documentadas explícitamente en el código — no se planea cambiarlas antes de la conversión a producto comercial.)*

1. **`/landing`, `/sign-in` y `/sign-up` no tienen identidad visual propia** — usan el widget genérico de Clerk y una pantalla de verificación técnica, por decisión ya documentada ("sin Design System aplicado todavía... corresponde a la fase de desarrollo del módulo de Autenticación").
2. **Sin mecanismo para que un Profesor enumere automáticamente a sus estudiantes** — selección manual por ID, consciente y disclosed (PND-04). No se resuelve con más código, requiere el módulo de Organización Académica.
3. **Sin mecanismo para que un Profesor enumere las unidades de un estudiante arbitrario** — se introduce manualmente el `unitId` en el Panel de Profesor, mismo criterio de honestidad que el punto anterior.
4. **`ThemeProvider`, `CoachProvider`, `AnalyticsProvider` y los hooks raíz `useTheme`/`useProgress`/`useDebounce` son placeholders vacíos**, sin ningún consumidor — infraestructura reservada para módulos que todavía no se han desarrollado.
5. **`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` no tienen ningún consumidor real** — el módulo de Storage no se necesita todavía para el MVP.
6. **`REDIS_URL` no tiene ningún consumidor downstream real** — reservada para cuando se necesite caché explícita.
7. **`PRIVATE_ROUTES` (`config/routes.ts`) es una constante sin uso real** — la protección de rutas usa una lista blanca (`PUBLIC_ROUTES`), un mecanismo distinto y ya verificado como correcto.

## Post-MVP

*(Explícitamente fuera de alcance para noviembre, según el MVP Freeze — `docs/product/demo-content/08-mvp-freeze-v2.md`.)*

1. Organización Académica como Bounded Context real y completo (multi-institución, matrícula, cohortes).
2. Gamificación, Coach IA, Daily Training, Simulador, Analytics real — todos en estado de scaffolding (10 archivos cada uno, sin Domain/Application/Infrastructure).
3. Edición/override de retroalimentación de IA por parte del profesor (hoy el Panel de Profesor es de solo lectura).
4. Facturación, planes comerciales, onboarding self-service de nuevas instituciones.
5. Limpieza de los 29 errores de TypeScript heredados en tests de My Plan y de los 138 errores de ESLint (119 auto-corregibles).
6. Ejecución real de la auditoría de accesibilidad (`axe-core`/Playwright ya configurado como dependencia, nunca ejecutado).
7. Contenido pedagógico más allá de la Unidad 1 completa (la Unidad 2 tiene su estructura diseñada, sin el contenido completo redactado; las unidades 3 en adelante no están ni siquiera estructuradas).
