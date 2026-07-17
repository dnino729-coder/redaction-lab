# Migración `202607161000_dashboard_read_schema`

**Módulo funcional:** Dashboard (única responsabilidad de esta migración — 13.14: "cada migración deberá modificar únicamente un módulo funcional").

**Origen:** implementación completa del módulo Dashboard (`docs/modules/dashboard.md`), sección 10 "Base de datos involucrada".

## Qué crea

- Tabla propia del módulo: `student_dashboard`.
- Tablas de solo lectura (el Dashboard nunca escribe en ellas, salvo `student_dashboard`): `user`, `student_profile`, `learning_plan`, `daily_plan`, `weekly_plan`, `learning_progress`, `writing_submission`, `writing_draft`, `exam_attempt`, `evaluation_result`, `coach_recommendation`, `coach_context`, `student_competency`, `competency_progress`, `learning_metric`, `performance_metric`, `learning_analytics`, `streak`, `student_level`, `xp_transaction`.
- 7 tipos ENUM: `UserStatus`, `DelfLevel`, `LearningPlanStatus`, `WritingSubmissionStatus`, `ExamAttemptStatus`, `XpSource`, `Priority`.

## Qué NO crea (fuera de alcance, deliberado)

Catálogos que pertenecen a otros módulos, referenciados solo como columna UUID sin relación física: `exam` (07_delf_evaluation), `evaluator` (07_delf_evaluation), `competency` (Coach/Competencias), `writing_task` y `writing_version` (06_writing). Ver la nota de alcance en `prisma/schema.prisma`.

## Deuda técnica señalada (resuelta)

Nombres de constraint con la convención por defecto de Prisma, no con los prefijos `pk_`/`fk_`/`idx_`/`uq_` de la sección 13.13 — ver comentario en `schema.prisma`. **Corregida en `prisma/migrations/202607171200_constraint_naming_standardization/`**, sin impacto funcional (ver `docs/database/naming-convention-audit-2026-07-17.md`).

## Cómo aplicar

Este SQL fue escrito a mano (sin acceso de red a los binarios de Prisma en el entorno de generación). Antes de aplicarlo contra una base real:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/diff_check.sql
diff /tmp/diff_check.sql prisma/migrations/202607161000_dashboard_read_schema/migration.sql
```

Reconciliar cualquier diferencia antes de `prisma migrate deploy`. Ver también la migración `202607170900_dashboard_rls_policies` (Row Level Security, sección 5.5 MUST) y `202607171200_constraint_naming_standardization` (nomenclatura, sección 13.13), ambas dependientes de esta y aplicadas automáticamente a continuación en el mismo `prisma migrate deploy` — ya no requieren ningún paso manual separado.
