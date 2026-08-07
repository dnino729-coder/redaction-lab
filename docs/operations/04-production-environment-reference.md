# Referencia de Entorno de Producción

Tabla completa de todas las variables reales del proyecto, verificadas por lectura directa del código (no supuestas). Ver también `docs/product/redaction-lab-development-master-plan-v1.0-2026-08-03.md` y los hallazgos de Sprint 7 para el detalle de por qué algunas están documentadas pero sin consumidor real.

## Variables de aplicación (`.env` / plataforma de despliegue)

| Variable | Valor esperado | Dónde se configura | Quién la usa | Consecuencia si falta |
|---|---|---|---|---|
| `DATABASE_URL` | `postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true` | `.env.local` / Vercel Environment Variables | Prisma Client (todo el ORM, en runtime) | La aplicación no puede leer ni escribir ningún dato — toda pantalla que dependa de datos falla |
| `DIRECT_URL` | `postgresql://...pooler.supabase.com:5432/postgres` | Igual que arriba | Prisma CLI (`migrate deploy`/`migrate dev`) | Las migraciones no se pueden aplicar; `prisma generate` falla directamente si la variable no existe (aunque el valor no sea alcanzable) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` / `pk_test_...` | Igual que arriba | `ClerkProvider` (`providers/AuthProvider.tsx`) | La autenticación entera deja de funcionar |
| `CLERK_SECRET_KEY` | `sk_live_...` / `sk_test_...` | Igual que arriba | Clerk SDK server-side | Igual que arriba |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Igual que arriba | `app/api/webhooks/clerk/route.ts` | Ningún usuario nuevo queda provisto en la base de datos — login "funciona" pero Dashboard/Academia quedan inalcanzables para esa cuenta |
| `ACADEMY_AI_PROVIDER` | `"claude"` o `"openai"` | Igual que arriba | `AcademyAIConfig.ts` | Usa el default `"claude"` — no falla, pero puede no ser el proveedor cuya clave sí está configurada |
| `ACADEMY_CLAUDE_API_KEY` | `sk-ant-...` | Igual que arriba | `ClaudeProvider.ts` | Toda llamada a Claude falla con error de autenticación del proveedor — el estudiante ve "procesando" sin resolución (ver Sprint 7) |
| `ACADEMY_OPENAI_API_KEY` | `sk-...` | Igual que arriba | `OpenAIProvider.ts` | Igual que arriba, para OpenAI |
| `ACADEMY_CLAUDE_ENDPOINT` / `ACADEMY_OPENAI_ENDPOINT` | URL base del proveedor | Igual que arriba | `AcademyAIConfig.ts` | Usa el default oficial del proveedor — no requiere configuración salvo un proxy/gateway propio |
| `ACADEMY_CLAUDE_MODEL` / `ACADEMY_OPENAI_MODEL` | Ej. `"claude-sonnet-5"` | Igual que arriba | `AcademyAIConfig.ts` | Usa el default ya codificado |
| `ACADEMY_FEEDBACK_TIMEOUT_TARGET_MS` / `_MAX_MS` | `60000` / `180000` | Igual que arriba | `AcademyAIConfig.ts` | Usa los defaults (60s/180s) |
| `ACADEMY_FEEDBACK_RETRY_MAX_ATTEMPTS` | `3` | Igual que arriba | `AcademyAIConfig.ts` | Usa el default — **no aplica al reintento real de la llamada de IA** (ver limitación en el documento 06) |
| `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS` | `"<teacherId>:<studentId>,..."` | Igual que arriba | `TeacherStudentDemoWhitelist.ts` | Vacía = fail-closed: ningún Profesor puede ver a ningún Estudiante (403 en todo el Panel de Profesor) |
| `ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS` | `2000` | Igual que arriba | `academyConfig.ts` | Usa el default — **no documentada en `.env.example`** |
| `ACADEMY_EVENT_OUTBOX_MAX_RETRIES` | `5` | Igual que arriba | `academyConfig.ts` | Usa el default — **no documentada en `.env.example`** |
| `ACADEMY_OUTBOX_BACKLOG_ALERT_THRESHOLD` | `500` | Igual que arriba | `academyHealthChecks.ts` | Usa el default — **no documentada en `.env.example`** |
| `ACADEMY_FF_ASYNC_FEEDBACK_ONLY` / `ACADEMY_FF_MASTERY_EVALUATION_ENABLED` | `"true"`/`"false"` | Igual que arriba | Feature flags internos de Academia | Comportamiento por defecto del código — **no documentadas en `.env.example`** |
| `REDIS_URL` | `redis://...` | Igual que arriba | `lib/redis.ts` | Definida pero **sin ningún consumidor downstream real hoy** — no rompe nada si falta |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Panel de Supabase → Settings → API | Igual que arriba | `lib/supabase.ts` (Storage) | **Sin ningún importador real hoy** — no rompe nada si falta |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual que arriba | Igual que arriba | **Ningún archivo la consume** | Ninguna — documentada, no usada |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` | Panel de PostHog | Igual que arriba | `lib/analytics.ts` | No-op seguro si falta — sin analítica, sin error |
| `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` | Panel de Sentry | Igual que arriba | **Ningún archivo la consume** (Sentry sin inicializar, ver documento 06) | Ninguna — documentada, no usada |
| `NEXT_PUBLIC_APP_URL` | URL pública del despliegue | Igual que arriba | **Ningún archivo la consume** | Ninguna — documentada, no usada |
| `NODE_ENV` | `"development"` / `"production"` | Automática (Next.js/Vercel la define) | `WebVitalsReporter.tsx`, condicionales varios | Comportamiento estándar de Next.js si se omite |
| `ANALYZE` | `"true"` | Solo local, al ejecutar `npm run analyze` | `next.config.mjs` | Sin efecto — el build normal no cambia |

## Secretos de despliegue (GitHub Environment Secrets — no son variables de la aplicación)

Requeridos únicamente si se usa el workflow automatizado `.github/workflows/deploy.yml` — configurados en **GitHub → Settings → Environments → staging/production**, nunca en `.env`:

| Secreto | Dónde se obtiene | Consecuencia si falta |
|---|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens | El job de despliegue automático falla al autenticarse con Vercel |
| `VERCEL_ORG_ID` | Vercel → `vercel link` local, o Project Settings | Igual que arriba |
| `VERCEL_PROJECT_ID` | Igual que arriba | Igual que arriba |
| `DATABASE_URL` (por entorno) | Igual que la variable de aplicación, pero registrada como Secret de GitHub, no en `.env` | El job de migraciones de `deploy.yml` falla antes de desplegar |
| `DIRECT_URL` (por entorno) | Igual que arriba | Igual que arriba — **la nota ya documentada en el propio `deploy.yml` advierte que sin esta variable ninguna migración se aplica, incluida la de RLS, sin que el paso lo reporte como fallo evidente en todos los casos** |
