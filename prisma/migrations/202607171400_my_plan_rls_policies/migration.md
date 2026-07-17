# Migración `202607171400_my_plan_rls_policies`

**Módulo funcional:** Mi Plan (Row Level Security, sección 5.5 MUST).

**Origen:** Sprint 3.3.1 (Modelo de Datos). Aplica sobre las 6 tablas creadas por `202607171300_my_plan_schema`, con el mismo patrón ya auditado en `202607170900_dashboard_rls_policies` (roles `dashboard_app_role`/`dashboard_service_role`, `SET LOCAL ROLE` + `current_student_id()`, `FORCE ROW LEVEL SECURITY`).

**Depende de:** `202607171300_my_plan_schema` (tablas) y `202607170900_dashboard_rls_policies` (roles y función `current_student_id()`, ya existentes).

## Matriz de acceso implementada

| Tabla | `dashboard_app_role` | `dashboard_service_role` |
|---|---|---|
| `learning_goal` | SELECT | SELECT, INSERT, UPDATE |
| `learning_phase` | SELECT | SELECT, INSERT, UPDATE |
| `learning_objective` | SELECT, UPDATE (propia, sin restricción de `source`) | SELECT, INSERT, UPDATE |
| `learning_task` | SELECT, UPDATE (propia, **solo si `source = SELF_DIRECTED`**, exigido en `USING` y `WITH CHECK`) | SELECT, INSERT, UPDATE |
| `study_schedule` | SELECT, UPDATE (propia) | SELECT, INSERT, UPDATE |
| `study_session` | SELECT, INSERT, UPDATE (propia) | SELECT, INSERT, UPDATE |
| `learning_plan` / `daily_plan` / `weekly_plan` / `learning_progress` (existentes) | SELECT (sin cambios) | **+ SELECT, INSERT, UPDATE (nuevo en esta migración)** |

Ningún rol recibe `DELETE` en ninguna tabla (18.20.7: las entidades de Mi Plan nunca se eliminan).

**Justificación del reparto:** `learning_goal`/`learning_phase` calculan su `status` automáticamente a partir de sus hijas (18.21) — el estudiante nunca las edita, igual que ya ocurre con `student_dashboard` (datos del propio estudiante, pero escritos exclusivamente por `dashboard_service_role`). `learning_objective`/`learning_task`/`study_schedule`/`study_session` sí tienen una acción documentada directamente atribuible al estudiante (completar un objetivo/tarea propia, reconfigurar su horario, registrar una sesión) — de ahí el `UPDATE`/`INSERT` para `dashboard_app_role`, siempre acotado por la política de fila correspondiente.

## Corrección aplicada sobre `202607170900`

Esa migración nunca otorgó a `dashboard_service_role` privilegios de escritura sobre `learning_plan`, `daily_plan`, `weekly_plan` ni `learning_progress` (solo sobre `"user"` y `"student_dashboard"`). Sin ese `GRANT`, ningún servicio de Mi Plan (creación de plan, reprogramación, recálculo de progreso) podría escribir en esas 4 tablas pese a tener `BYPASSRLS`, porque el `GRANT` de tabla es un mecanismo independiente de las políticas de fila. Se añade aquí `GRANT SELECT, INSERT, UPDATE ON "learning_plan", "daily_plan", "weekly_plan", "learning_progress" TO dashboard_service_role`, sin modificar ninguna política de lectura ya auditada ni ninguna columna de esas tablas.

**Corrección adicional detectada durante la verificación PGlite de este mismo sprint:** el diseño original de esta migración otorgaba solo `INSERT, UPDATE` (sin `SELECT`) a `dashboard_service_role` sobre esas 4 tablas. La verificación empírica demostró que un `UPDATE ... WHERE ...` (con o sin `RETURNING`) falla con `permission denied` si el rol no tiene también `SELECT` sobre la tabla, incluso con `BYPASSRLS` activo — Postgres exige `SELECT` para evaluar la cláusula `WHERE` y proyectar `RETURNING`. Corregido antes de cerrar el sprint: se añadió `SELECT` al `GRANT` (ver arriba) y al `REVOKE` correspondiente en `rollback.sql`.

## Cómo aplicar

```bash
npx prisma migrate deploy
```

Se aplica después de `202607171300_my_plan_schema`.

## Reversibilidad

`rollback.sql` revoca los `GRANT` añadidos y elimina las políticas y `RLS` de las 6 tablas nuevas, en orden inverso, sin afectar las políticas ya auditadas de las 4 tablas existentes.
