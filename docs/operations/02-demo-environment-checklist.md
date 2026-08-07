# Checklist — Entorno de Demostración

Marcar cada elemento antes del día de la demostración institucional. Basado en `docs/operations/01-first-deployment-runbook.md` y en el escenario definido en `docs/product/demo-content/`.

## Base de datos

☐ `DATABASE_URL` y `DIRECT_URL` configuradas y apuntando al mismo proyecto (no a entornos distintos)
☐ Las 7 migraciones aplicadas (`npm run prisma:migrate:deploy` ejecutado sin errores)
☐ Verificado con `prisma studio` (o una consulta directa) que las tablas de Academia/Dashboard/My Plan existen

## Clerk

☐ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` configuradas
☐ Cuenta de Camille Laurent (profesora demo) creada
☐ Cuentas de Sofía Reyes y Mateo Vargas (estudiantes demo) creadas
☐ `publicMetadata.role` asignado manualmente en el Clerk Dashboard: `"TEACHER"` para Camille, sin rol o `"STUDENT"` para Sofía y Mateo

## Webhook

☐ Endpoint `/api/webhooks/clerk` registrado en Clerk Dashboard
☐ Eventos suscritos: `user.created`, `user.updated`, `user.deleted`
☐ `CLERK_WEBHOOK_SECRET` configurada con el signing secret correcto
☐ Confirmado que las 3 cuentas demo (Camille, Sofía, Mateo) aparecen con fila real en la tabla `user`

## IA

☐ `ACADEMY_AI_PROVIDER` configurada (`"claude"` u `"openai"`)
☐ `ACADEMY_CLAUDE_API_KEY` o `ACADEMY_OPENAI_API_KEY` configurada, según el proveedor
☐ **Al menos una llamada real de IA ya probada con éxito antes del día de la demo** (ver hallazgo de Sprint 7: sin esto, un fallo en la primera llamada real durante la demo no tiene recuperación automática)

## Profesor demo

☐ Cuenta de Camille Laurent creada y accesible (Clerk)
☐ Rol `TEACHER` confirmado (redirige a `/academy/teacher` al iniciar sesión)
☐ `userId` real de Clerk de Camille anotado (necesario para la whitelist)

## Estudiantes demo

☐ Cuenta de Sofía Reyes creada, con al menos una unidad completada (progreso previo simulado antes de la demo, no en vivo)
☐ Cuenta de Mateo Vargas creada, lista para el envío en vivo de la Unidad 1
☐ `userId` real de Clerk de ambos estudiantes anotado

## Whitelist (`ACADEMY_DEMO_TEACHER_STUDENT_PAIRS`)

☐ Variable configurada con el formato exacto: `<userId-Camille>:<userId-Sofía>,<userId-Camille>:<userId-Mateo>`
☐ Verificado en el Panel de Profesor que Camille puede ver a ambos estudiantes (sin `403 Forbidden`)

## Contenido

☐ Unidad 1 (Lettre formelle) cargada — `docs/product/demo-content/01-unidad-1-lettre-formelle.md`
☐ Texto de Mateo listo para copiar/pegar en vivo — `docs/product/demo-content/02-mateo-produccion-escrita.md`
☐ Verificado que el texto real de Mateo produce observaciones de IA razonablemente parecidas a `03-feedback-ia-simulado.md` (no idénticas — la IA real puede variar, pero las categorías esperadas deben aparecer)

## Dashboard

☐ Inicio de sesión de Mateo → Dashboard carga sin error
☐ Bloques con datos reales visibles (bienvenida, objetivo, plan, continuación)
☐ Ancho visual consistente con Academia (ya verificado en Sprint 3 — solo confirmar que no hay regresión)

## Editor

☐ `/academy` → Unidad 1 → recorrido hasta el Writing Editor sin error
☐ Autoguardado visible al escribir
☐ Envío de versión funciona sin error

## Feedback

☐ Tras el envío, la pantalla de retroalimentación llega dentro del tiempo objetivo (~60 segundos, `ACADEMY_FEEDBACK_TIMEOUT_TARGET_MS`)
☐ Las observaciones mostradas usan las categorías reales esperadas (registro, cohesión, gramática — ver diseño de la Unidad 1)
☐ Reflexión de cierre (P-10) completa sin error

## Panel Profesor

☐ Inicio de sesión de Camille → redirige a `/academy/teacher`
☐ Tarjetas de Sofía y Mateo visibles con datos reales
☐ Detalle de Mateo (P-13) accesible
☐ Historial de la Unidad 1 de Mateo (P-15) muestra el texto y la retroalimentación reales, no un placeholder

## Video de respaldo

☐ Recorrido completo grabado de extremo a extremo, con audio narrado
☐ Video accesible sin depender de internet el día de la demo (descargado localmente, no solo en la nube)

## Internet

☐ Red del recinto probada al menos un día antes
☐ Hotspot personal de respaldo cargado y probado

## Cuenta Vercel

☐ Proyecto vinculado al repositorio
☐ Variables de entorno de producción configuradas en el proyecto de Vercel (no solo en `.env.local`)
☐ Último despliegue confirmado como exitoso (build verde)

## Dominio

☐ URL de acceso confirmada y anotada (dominio de Vercel o dominio propio)
☐ URL accesible desde una red distinta a la del equipo de desarrollo (probada "desde afuera")
