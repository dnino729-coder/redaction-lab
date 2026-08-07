# Checklist de Liberación (Release Checklist)

Para usar antes de cualquier liberación hacia el entorno que se mostrará en la demostración institucional (o hacia producción real, más adelante). Basada en el estado verificado del repositorio a través de los Sprints 0-7.

## Código

- [ ] `npm run typecheck` — 0 errores en código de producción (histórico verificado: 29 errores, todos heredados en tests de My Plan, ninguno en `app/`, `features/*`, `services/`, `lib/`, `components/`)
- [ ] `npm run lint` — sin errores nuevos respecto al último baseline conocido (138)
- [ ] `npm run test` — 328/328 tests en verde (o el número vigente al momento de la liberación)
- [ ] `npm run build` — build de producción exitoso (exit code 0)
- [ ] Ninguna funcionalidad de los módulos fuera de alcance del MVP (Gamificación, Coach, Daily Training, Simulador, Analytics real) fue tocada

## Infraestructura

- [ ] `DATABASE_URL`/`DIRECT_URL` configuradas en el entorno de destino
- [ ] `npm run prisma:migrate:deploy` ejecutado sin errores contra ese entorno
- [ ] Endpoints de salud (`/api/v1/academy/health/liveness`, `/readiness`) responden 200
- [ ] Webhook de Clerk registrado y `CLERK_WEBHOOK_SECRET` configurado para ese entorno específico (no reutilizar el de otro entorno)
- [ ] Clave de IA configurada y probada con al menos una llamada real

## Datos

- [ ] Seed de competencias ejecutado (`npm run db:seed`, primera pasada)
- [ ] Al menos un usuario real existe en la tabla `user` antes de re-ejecutar el seed de Academia
- [ ] Seed de Academia re-ejecutado después de que exista ese usuario — confirmado que sembró unidades, no solo el catálogo
- [ ] Ninguna migración pendiente sin aplicar (`prisma migrate status` limpio, si se dispone de conexión para verificarlo)

## Contenido

- [ ] Contenido de la Unidad 1 (Lettre formelle) cargado y accesible desde la interfaz real
- [ ] Cuentas de demo (Profesor + 2 Estudiantes) creadas con los datos definidos en el escenario (`docs/product/demo-content/`)
- [ ] `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS` configurada con los `userId` reales de esas cuentas

## Seguridad

- [ ] `.env.local` no está commiteado (verificar `git status`/`git ls-files`)
- [ ] Ningún secreto hardcodeado en el código (sin coincidencias de patrones de clave conocidos — ya verificado en Sprint 7)
- [ ] Cabeceras de seguridad de `next.config.mjs` presentes en la respuesta real del entorno desplegado (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.)
- [ ] `CLERK_WEBHOOK_SECRET` del entorno de destino es distinto al de cualquier otro entorno (staging ≠ production, si aplica)

## Demo

- [ ] Guion (`07-demo-script-final.md`) ensayado al menos una vez contra el entorno que se usará el día de la presentación
- [ ] Video de respaldo grabado y disponible localmente, no solo en la nube
- [ ] Checklist de entorno de demo (`02-demo-environment-checklist.md`) completado al 100%
- [ ] Respuestas a preguntas difíciles (`06-preguntas-directivos.md`) repasadas por quien presenta
