# MVP Freeze v2 — Estado real del repositorio (post Sprint 5A/5B)

Clasificación MoSCoW actualizada. "Estado real" verificado por código, no supuesto.

---

## Must (congelado — no tocar antes de noviembre)

| Elemento | Estado real verificado |
|---|---|
| Login / roles (Clerk + redirect por rol) | Código completo, redirect post-login ya corregido (Sprint 2) |
| Dashboard | Servicios reales conectados, sin datos mockeados, ancho visual unificado con Academia (Sprint 3) |
| Academia — recorrido completo (P-01 a P-11) | Construido y probado exhaustivamente en Sprints anteriores |
| Writing Editor | Maduro — autosave, offline, cola de reintentos, fix de layout responsive ya aplicado |
| Feedback IA (adaptadores Claude/OpenAI) | Código completo; sin ejecución real todavía (bloqueado por credencial) |
| Panel de Profesor de solo lectura (P-12/13/15) | Construido con datos reales, con breadcrumbs y componentes ya unificados (Sprint 3) |
| Navegación Login↔Dashboard↔Academia↔Profesor | Cerrada de extremo a extremo (Sprints 2-3) |
| Contenido de la Unidad 1 (Lettre formelle) para la demo | Completo (`01-unidad-1-lettre-formelle.md`) |
| Guion de demo | Completo (`07-demo-script-final.md`) |

## Should (vale la pena resolver antes de noviembre)

- Cargar las 3 credenciales reales (`DATABASE_URL`/`DIRECT_URL`, `CLERK_WEBHOOK_SECRET`, clave de IA) y ejecutar el recorrido real por primera vez — **único bloqueador que impide que todo lo anterior sea demostrable hoy**.
- Crear las cuentas reales de demo (Camille, Sofía, Mateo) y configurar `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS`.
- Diseñar (estructura ya lista) y redactar el contenido completo de la Unidad 2 (Essai argumentatif), como respaldo si el tiempo de la demo lo permite o como continuidad narrativa post-demo.
- Ensayar el guion completo al menos una vez, cronometrado.
- Confirmar un despliegue real y estable (no local).
- Grabar el video de respaldo del recorrido completo.

## Could (si sobra tiempo)

- Ejecutar la auditoría de accesibilidad ya instrumentada (`axe-core`/Playwright, nunca corrida en este proceso).
- Pulir identidad visual de `landing`/`sign-in`/`sign-up` (hoy deliberadamente sin Design System aplicado).
- Preparar un segundo texto de estudiante (perfil de error distinto) como respaldo narrativo.

## Won't (fuera de alcance, no tocar antes de noviembre)

- Resolución permanente de PND-04 (Organización Académica real) — la whitelist temporal (Sprint 1C) es suficiente y correcta para la demo.
- Gamificación, Coach IA, Daily Training, Simulador, Analytics real — scaffolding, sin necesidad de avance para la demo.
- Edición/override de retroalimentación por el profesor.
- Facturación, planes comerciales, multi-institución.
- Limpieza de deuda técnica no bloqueante (29 errores heredados de My Plan, 138 de ESLint, reportes legado en la raíz del repositorio).
