# Migración `202607171200_constraint_naming_standardization`

**Módulo funcional:** ninguno (transversal, solo nomenclatura física — 13.14 exime explícitamente los cambios de mantenimiento sin impacto funcional de la regla "una migración, un módulo").

**Origen:** auditoría de nomenclatura de base de datos (rol: Database Architect / PostgreSQL Expert), cierre de la deuda técnica señalada explícitamente desde `202607161000_dashboard_read_schema` — las migraciones anteriores crearon PK/FK/UNIQUE/INDEX con la convención por defecto de Prisma en vez de los prefijos `pk_`/`fk_`/`uq_`/`idx_` que exige la sección 13.13 (MUST). Ver `docs/database/naming-convention-audit-2026-07-17.md` para la auditoría completa, la lista exhaustiva de los 78 objetos renombrados y la verificación empírica.

**Depende de:** `202607161000_dashboard_read_schema` y `202607170900_dashboard_rls_policies` (renombra objetos creados por ambas).

## Qué hace

Únicamente `ALTER TABLE ... RENAME CONSTRAINT` y `ALTER INDEX ... RENAME TO` — 22 Primary Keys, 11 Unique Constraints, 23 Foreign Keys y 22 Indexes. No crea ni elimina tablas, columnas, tipos ni datos. No toca los 11 `CHECK` constraints existentes (ya cumplían `ck_<tabla>_<regla>` desde el inicio). No toca RLS, policies, roles, GRANT, autenticación, Clerk ni Supabase.

## Por qué es segura

`RENAME CONSTRAINT`/`RENAME INDEX` son operaciones de catálogo puro en PostgreSQL: no reescriben la tabla, no afectan filas, no requieren locks distintos de un `ACCESS EXCLUSIVE` brevísimo sobre el catálogo. Las políticas de RLS y los `GRANT` de `202607170900` referencian nombres de tabla/columna, nunca nombres de constraint — verificado por lectura completa de ese archivo y confirmado empíricamente con PGlite (ver auditoría): mismas 23 policies, mismas 22 tablas con RLS habilitado, mismo aislamiento por estudiante, antes y después del rename.

## Cómo aplicar

```bash
npx prisma migrate deploy
```

Se aplica automáticamente después de `202607161000` y `202607170900` en el mismo flujo — sin pasos manuales adicionales.

## Reversibilidad

`rollback.sql` en este mismo directorio revierte cada rename al nombre original exacto (`<tabla>_pkey`, `<tabla>_<columna>_fkey`, etc.). Verificado con PGlite: aplicar rollback tras esta migración devuelve el conjunto completo de 230 nombres (constraints + índices) exactamente al estado previo — 0 diferencias.

## Cambio asociado en `schema.prisma`

Cada `@id`, `@unique`, `@relation` y `@@index` del esquema recibió un `map:` explícito con el nombre nuevo, para que `prisma migrate dev` genere automáticamente la convención correcta en toda migración futura. Verificado por comparación exacta (diff vacío) entre los 78 valores `map:` del esquema y los 78 nombres destino de este `migration.sql`.

## Riesgo residual documentado

El `RENAME CONSTRAINT` de cada Primary Key asume que Postgres asignó el nombre por defecto `<tabla>_pkey` (cierto para una `PRIMARY KEY` declarada inline sin `CONSTRAINT` explícito, como en `202607161000`). Si un entorno real difiere, el `RENAME` falla de forma explícita (error SQL), no silenciosa — verificar con `\d+ <tabla>` antes de aplicar en Staging/Production, igual que se recomienda para las migraciones anteriores.

## Hallazgo fuera de alcance (no accionado)

La auditoría detectó que PostgreSQL 17 registra cada columna `NOT NULL` como una entrada propia en `pg_constraint` (nombre autogenerado `<tabla>_<columna>_not_null`). La sección 13.13 define exactamente cinco categorías (PK/FK/UNIQUE/INDEX/CHECK) y no menciona `NOT NULL`; Prisma tampoco permite nombrarlas declarativamente. Se documenta para trazabilidad, sin acción — ver `docs/database/naming-convention-audit-2026-07-17.md`, sección 4.
