# Runbook — Primer Despliegue de Redaction Lab

Basado exclusivamente en el código real del repositorio (`package.json`, `prisma/`, `.github/workflows/`, `app/api/webhooks/clerk/route.ts`, `features/academy/infrastructure/`). Ningún paso aquí es una suposición — donde el código no confirma algo, se indica explícitamente.

---

## Prerrequisitos

- Node.js **20** (`.nvmrc`) — usar `nvm use` o equivalente antes de cualquier comando.
- Una cuenta y proyecto de **Supabase** (o cualquier PostgreSQL 17 accesible con connection string — el proyecto no depende de ninguna característica exclusiva de Supabase más allá del hosting de Postgres).
- Una aplicación de **Clerk** ya creada, con las claves de API disponibles.
- Una clave de API de **Anthropic (Claude)** u **OpenAI** — al menos una.
- Una cuenta de **Vercel** con un proyecto ya vinculado al repositorio (si se usa el despliegue automatizado de `deploy.yml`) — o, alternativamente, un despliegue manual (`vercel deploy` desde local).

## Variables necesarias (mínimo indispensable para un primer arranque funcional)

| Variable | Obligatoria para... |
|---|---|
| `DATABASE_URL` | Conexión de la aplicación en tiempo de ejecución |
| `DIRECT_URL` | Migraciones de Prisma (`prisma migrate deploy`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Autenticación cliente |
| `CLERK_SECRET_KEY` | Autenticación servidor |
| `CLERK_WEBHOOK_SECRET` | Sincronización de usuarios (sin esto, ningún usuario nuevo queda provisto en la base) |
| `ACADEMY_AI_PROVIDER` | Selección de proveedor de IA (`"claude"` u `"openai"`, default `"claude"`) |
| `ACADEMY_CLAUDE_API_KEY` o `ACADEMY_OPENAI_API_KEY` | Al menos una, según el proveedor elegido |

Ver `docs/operations/04-production-environment-reference.md` para la lista exhaustiva de todas las variables, incluidas las opcionales.

## Orden correcto de configuración

**El orden importa — evidencia directa en `prisma/seeds/academy.seed.ts`: el seed de Academia busca el primer `User` ya existente y omite silenciosamente la siembra de unidades si no encuentra ninguno.** Ejecutar los pasos fuera de este orden produce un sistema que "funciona" sin errores visibles, pero con datos incompletos.

### Paso 1 — Variables de entorno base

Configurar `DATABASE_URL`, `DIRECT_URL`, las tres variables de Clerk y la clave de IA elegida, en el entorno de despliegue (o en `.env.local` para desarrollo).

### Paso 2 — Migraciones

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

`prisma:migrate:deploy` (no `prisma:migrate:dev`) es el comando seguro para un entorno ya existente — no genera migraciones nuevas ni hace preguntas interactivas, solo aplica las 7 migraciones ya versionadas en `prisma/migrations/`, en orden cronológico (dashboard → my_plan → academy, con sus políticas RLS correspondientes).

**Nota de riesgo ya documentada en el propio `deploy.yml`:** `DIRECT_URL` es obligatoria para este paso — sin ella, Prisma falla al cargar el esquema y **ninguna migración se aplica, incluidas las de RLS**, sin que el paso lo reporte como un fallo evidente en todos los casos.

### Paso 3 — Seed inicial (catálogo, sin unidades todavía)

```bash
npm run db:seed
```

En este punto, `seedCompetencies` sembrará el catálogo de competencias correctamente. `seedAcademy` **no sembrará ninguna unidad todavía** — no existe aún ningún `User` en la base. Esto es esperado, no un error.

### Paso 4 — Webhook de Clerk

En el Clerk Dashboard: **Webhooks → Add Endpoint**.

- **URL:** `https://<dominio-del-despliegue>/api/webhooks/clerk`
- **Eventos a suscribir** (confirmado por el código real de `app/api/webhooks/clerk/route.ts`, que solo maneja estos tres): `user.created`, `user.updated`, `user.deleted`.
- Copiar el **Signing Secret** generado y configurarlo como `CLERK_WEBHOOK_SECRET`.

Sin este paso, un usuario puede iniciar sesión en Clerk, pero nunca queda provisto en la tabla `user` — el Dashboard y Academia serán inalcanzables para esa cuenta (`requireAuthenticatedStudentId` lanzará `StudentProfileNotFoundError`).

### Paso 5 — Primer usuario real

Registrar (sign-up) al menos un usuario real a través de la aplicación ya desplegada. Verificar en la base de datos que la tabla `user` tiene una fila con `clerk_user_id` poblado (el webhook del Paso 4 debe haberla creado).

### Paso 6 — Re-ejecutar el seed de Academia

```bash
npm run db:seed
```

Ahora sí, `seedAcademy` encontrará el usuario del Paso 5 y sembrará la Biblioteca de Modelos (5 filas, una por `TextType`) y la primera `AcademyUnit` por tipo de texto para ese usuario.

### Paso 7 — Configuración de IA

Confirmar `ACADEMY_AI_PROVIDER` y la clave correspondiente. No hay paso de "activación" adicional — el primer intento de envío de una versión (P-08) disparará la primera llamada real.

### Paso 8 — Validación

Verificar, en este orden:

1. `GET /api/v1/academy/health/liveness` y `/readiness` responden 200 (rutas públicas, confirmadas en `middleware/auth.ts` y en el build real de Sprint 5).
2. Iniciar sesión con el usuario del Paso 5 → el Dashboard debe cargar sin error.
3. Entrar a Academia → debe verse al menos una unidad por tipo de texto (sembrada en el Paso 6).
4. Completar un envío de texto real en la Unidad 1 → confirmar que la retroalimentación de IA llega (ver `docs/operations/03-demo-day-runbook.md` para qué hacer si esto falla).

### Rollback

Cada una de las 5 migraciones más antiguas incluye su propio `rollback.sql` (`prisma/migrations/*/rollback.sql`) — **las 2 migraciones más recientes de Academia (`202607211500_academy_schema`, `202607211600_academy_rls_policies`) no tienen `rollback.sql`** (inconsistencia ya señalada en el Sprint 7, sin corregir). Si es necesario revertir el esquema de Academia, no existe un script ya preparado — se debe escribir a mano contra el `migration.sql` real de esas dos carpetas antes de ejecutarlo.

## Checklist final

- [ ] Variables de entorno base configuradas (Paso 1)
- [ ] Migraciones aplicadas con `prisma:migrate:deploy` (Paso 2)
- [ ] Seed inicial ejecutado (Paso 3)
- [ ] Webhook de Clerk configurado con los 3 eventos correctos (Paso 4)
- [ ] Al menos un usuario real registrado y confirmado en la tabla `user` (Paso 5)
- [ ] Seed de Academia re-ejecutado con éxito (Paso 6)
- [ ] Clave de IA configurada (Paso 7)
- [ ] Los 4 puntos de validación del Paso 8 confirmados
