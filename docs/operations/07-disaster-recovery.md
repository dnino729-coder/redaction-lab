# Disaster Recovery

Procedimientos generales de recuperación ante fallas de infraestructura — complementa (no repite) las acciones específicas del día de la demo ya cubiertas en `03-demo-day-runbook.md`.

## Si la base de datos falla

**Señales:** cualquier pantalla que dependa de datos (Dashboard, Academia, Panel de Profesor) muestra un estado de error; `/api/v1/academy/health/readiness` responde con `healthy: false` en el chequeo de `checkDatabaseHealth` (`academyHealthChecks.ts`).

1. Verificar el estado del proyecto de Supabase directamente en su panel — la causa más probable es una interrupción del proveedor, no del código de la aplicación.
2. Confirmar que `DATABASE_URL`/`DIRECT_URL` no cambiaron (rotación de credenciales, expiración) comparando contra el valor configurado en Vercel.
3. Si la base está caída del lado del proveedor: no hay mitigación de código posible — es exactamente el escenario para el que existe el video de respaldo (`03-demo-day-runbook.md`).
4. Si la base está arriba pero las migraciones parecen desincronizadas: **no ejecutar `prisma migrate reset`** (destructivo, borra todos los datos) — usar `prisma migrate status` para diagnosticar antes de cualquier acción.

## Si la IA falla

**Señales:** toda retroalimentación queda en `PROCESSING` indefinidamente (ver limitación ya documentada en `06-known-production-limitations.md`, punto 4 — no hay reintento automático).

1. Confirmar que la clave de API (`ACADEMY_CLAUDE_API_KEY`/`ACADEMY_OPENAI_API_KEY`) no expiró y que la cuenta del proveedor no alcanzó un límite de cuota — ambas causas producen el mismo síntoma (una excepción genérica capturada por `AcademyFeedbackGateway`, nunca distinguida por tipo).
2. Si el proveedor configurado (`ACADEMY_AI_PROVIDER`) falla pero la clave del otro proveedor está disponible, cambiar la variable y volver a desplegar — es un cambio de configuración, no de código.
3. **No existe hoy un mecanismo para "reintentar" un intento ya atascado en `PROCESSING`** salvo que el estudiante envíe una nueva versión del texto (lo cual dispara una nueva llamada real). Comunicar esto como procedimiento estándar de recuperación, no buscar un botón de reintento que no existe todavía.

## Si Clerk falla

**Señales:** la página de login no carga, o carga pero no completa la autenticación; el webhook deja de recibir eventos (usuarios nuevos no aparecen en la tabla `user`).

1. Verificar el estado de Clerk en su página de estado pública — es un servicio externo, no diagnosticable desde este repositorio.
2. Si el problema es específico del webhook (login funciona, pero usuarios nuevos no se provisionan): revisar los logs del endpoint `/api/webhooks/clerk` — el código ya distingue explícitamente entre error 400 (firma inválida, no reintentable) y 500 (error interno, Clerk reintentará automáticamente).
3. Si `CLERK_WEBHOOK_SECRET` fue rotado en el Clerk Dashboard sin actualizar la variable de entorno correspondiente, todo evento entrante fallará con firma inválida — confirmar que ambos valores coinciden.

## Si el despliegue falla

**Señales:** el workflow `deploy.yml` falla en GitHub Actions, o `vercel deploy` falla localmente.

1. Revisar en qué paso falló: `prisma:generate` (probablemente `DATABASE_URL`/`DIRECT_URL` ausentes o mal formadas — ver la nota ya documentada en el propio `deploy.yml` y en `ci.yml`), `prisma:migrate:deploy` (probablemente la base de destino no es alcanzable, o una migración ya fue aplicada parcialmente), o el paso de `vercel build`/`vercel deploy` (revisar `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`).
2. Si el fallo es en `prisma:migrate:deploy` a mitad de una migración: **no volver a ejecutar el comando sin antes revisar manualmente el estado de la base** — una migración parcialmente aplicada puede requerir intervención manual antes de reintentar.
3. Si el despliegue automático (`deploy.yml`) falla de forma no diagnosticable a tiempo antes de la demo, usar un despliegue manual directo (`vercel deploy --prod`) desde un entorno local con las variables ya configuradas, como camino alternativo — nunca como sustituto permanente del pipeline.

## Si la demo falla (en general, más allá de una causa técnica específica)

Ver `03-demo-day-runbook.md`, sección "Qué hacer si la demo falla de forma irrecuperable" — la recuperación general es siempre la misma: pasar al video de respaldo de forma transparente y continuar con la sesión de preguntas y respuestas, en vez de intentar diagnosticar un problema técnico en vivo frente a los directivos.
