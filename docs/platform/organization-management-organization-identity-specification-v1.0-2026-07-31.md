# ORGANIZATION MANAGEMENT — ORGANIZATION IDENTITY SPECIFICATION v1.0

**Fecha:** 2026-07-31
**Autor:** Product Architect / DDD Expert, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Application Model v1.1; Organization Management Infrastructure Model v1.1; Organization Management API Contract v1.0; Domain Model v1.1, API Contract v1.4 (Academia).
**Origen:** vacío documental detectado durante la redacción de API Contract v1.0 — ningún documento anterior define la identidad mínima de una `Organization`, dejando su Request DTO incompleto.
**Naturaleza de este documento:** cierra exclusivamente ese vacío. No amplía alcance, no agrega funcionalidades, no modifica ningún documento previo — incluido el API Contract v1.0, que permanece sin cambios hasta un documento futuro independiente.

---

## 1. ¿Qué significa que una `Organization` exista?

**Definición mínima, sin describir funcionalidad:** una `Organization` existe cuando posee una identidad única y persistente que puede ser referenciada por una `Membership` (Domain Model v1.1 §4, §13). La existencia es puramente referencial — no está condicionada a ningún contenido, configuración ni estructura interna. Nada más define "que exista" — ni un nombre, ni una estructura, ni ninguna capacidad asociada (esas son responsabilidades ya diferidas, Organization Management Scope v1.0 §5).

---

## 2. ¿Qué atributos son obligatorios?

**Únicamente uno, respaldado con evidencia directa:** la identidad misma (`OrganizationId`, Value Object ya definido en Domain Model v1.1 §6). Es obligatoria porque, sin ella, `Membership` no tendría nada que referenciar (Domain Model v1.1 §13, Invariante 3 — "una `Membership` solo puede crearse referenciando una `Organization` ya registrada").

**Ningún otro atributo está respaldado como obligatorio por ningún documento — ni siquiera un nombre legible.** Se declara esto explícitamente, sin inventarlo: Functional Specification v1.0 §7 ya agrupó "nombre" junto con logo/idioma/zona horaria como *"atributos de identidad no especificados por ningún documento"* — la ambigüedad sobre "nombre" no se resuelve en este documento por fiat; ver Sección 4.

**Hallazgo que cierra el vacío del API Contract v1.0 (ver Auditoría interna, pregunta 10):** dado que `RegisterOrganizationHandler` (Application Model v1.1 §4) ya usa `UuidGenerator` para producir la identidad de la nueva `Organization` — es decir, la identidad **se genera del lado del servidor, nunca la suministra el cliente** — y dado que ningún otro atributo está evidenciado como obligatorio, la conclusión evidenciada (no inventada) es: **el registro de una `Organization` no requiere, hoy, ningún dato de entrada por parte del cliente.**

---

## 3. ¿Qué atributos son opcionales?

**Ninguno.** La ausencia de evidencia documental aplica de igual forma a atributos obligatorios y opcionales — no existe ningún documento que proponga, siquiera como posibilidad, un atributo opcional de `Organization`. No se inventa ninguno.

---

## 4. ¿Qué atributos NO pertenecen todavía a la identidad?

| Atributo | Clasificación | Evidencia |
|---|---|---|
| Logo, branding, colores, idioma, zona horaria | **Configuración, no Identidad** — explícitamente no especificados como identidad por ningún documento. | Functional Specification v1.0 §7: *"atributos de identidad no especificados por ningún documento como parte de la 'identidad mínima'"*. |
| Niveles educativos, estructura organizacional, periodos académicos, jerarquías | **Configuración diferida, no Identidad** — corresponden a la capacidad de `Organizational Unit`/`Structure` ya explícitamente diferida. | Organization Management Scope v1.0 §5 ("Estructura/Jerarquía configurable multi-nivel — diferida"); Ubiquitous Language v1.0 §3 (`Organizational Unit`, `Structure`: "responsabilidades: ninguna en la versión 1.0"). |
| Configuraciones (en general) | **Configuración por definición** — cualquier valor que una `Organization` concreta pudiera fijar para sí misma, distinto de su mera existencia. | Organization Strategy v1.0 §5 (principio de configurabilidad, nunca de identidad fija). |
| Permisos | **Ni Identidad ni Configuración de este Bounded Context — pertenece íntegramente a otro.** | Ubiquitous Language v1.0 §6: `Permission` ya excluido del vocabulario de Organization Management por colisión con el Platform Core (`Permission Catalog`) — no es una capacidad diferida de Organization Management, es una responsabilidad que nunca le perteneció. |

**Todos, sin excepción, quedan clasificados explícitamente como capacidades futuras (Configuración) o, en el caso de Permisos, como fuera de alcance permanente — ninguno se agrega a la identidad mínima.**

---

## 5. Identidad vs. Configuración

**Identity (Identidad):** el hecho mínimo, permanente y no editable de que una `Organization` existe y puede ser referenciada — hoy, exclusivamente `OrganizationId`. No cambia en el tiempo, no tiene versión, no se "edita".

**Configuration (Configuración):** cualquier valor asociado a una `Organization` que pueda variar, definirse después de su registro, o diferir legítimamente entre dos instancias del mismo tipo de organización (nombre visible, estructura, terminología, localización) — hoy, **ninguno de estos valores existe todavía en el modelo**; todos permanecen diferidos (Sección 4).

**No se mezclan:** este documento no propone ni un mecanismo de Configuración ni un formato de almacenamiento para ella — solo confirma que, conceptualmente, ninguno de los atributos evaluados pertenece a la Identidad, y que la Identidad, tal como existe hoy, no requiere ni admite ninguno de ellos.

---

## 6. Identidad vs. Organización educativa

**Verificado: la identidad permanece completamente genérica.** Ningún atributo de esta especificación menciona "universidad", "colegio", "instituto", "empresa" ni "ONG" — estos siguen siendo, exclusivamente, ejemplos de uso ya establecidos en el Contexto de documentos anteriores (Organization Strategy v1.0, ADR-001), nunca atributos, tipos ni valores del modelo. La identidad de una `Organization` universitaria y la de una `Organization` empresarial son, hoy, indistinguibles entre sí — ambas se reducen exactamente al mismo `OrganizationId` — consistente con la Decisión de genericidad ya congelada en ADR-001 §3.

---

## 7. Compatibilidad

| Documento | ¿Contradicción? |
|---|---|
| Product Architecture v1.0 | Ninguna. |
| Organization Strategy v1.0 | Ninguna — refuerza el principio de configurabilidad ya establecido. |
| ADR-001 | Ninguna — la genericidad permanece intacta (Sección 6). |
| Scope v1.0 | Ninguna — no se amplía ninguna de las cinco capacidades ya congeladas. |
| Functional Specification v1.0 | Ninguna — resuelve, sin contradecir, el vacío ya señalado en su propia §7. |
| Ubiquitous Language v1.0 | Ninguna — no se introduce ningún término nuevo; se reutilizan `Organization`, `Organizational Unit`, `Structure` ya congelados. |
| Domain Model v1.1 | Ninguna — no se modifica ningún Aggregate ni Value Object; solo se confirma, con evidencia, que `OrganizationId` es el único atributo ya definido. |
| Application Model v1.1 | Ninguna — se reutiliza la evidencia ya existente sobre `UuidGenerator` sin alterar ningún Command. |
| Infrastructure Model v1.1 | Ninguna. |
| API Contract v1.0 | **No se modifica todavía** — este documento deja la evidencia lista para que un futuro API Contract v1.1 complete `RegisterOrganizationRequest`, pero no edita el documento actual. |

---

## Auditoría interna

1. **¿Introduce capacidades nuevas?** No.
2. **¿Introduce conceptos nuevos del dominio?** No — no se define ninguna Entity, Value Object ni atributo nuevo; solo se confirma, con evidencia ya existente, que no hay ninguno más allá de `OrganizationId`.
3. **¿Contradice ADR-001?** No.
4. **¿Contradice Scope?** No.
5. **¿Modifica el Domain Model?** No.
6. **¿Modifica el Application Model?** No.
7. **¿Modifica el Infrastructure Model?** No.
8. **¿Resuelve únicamente el vacío detectado por el API Contract?** Sí — sin tocar ningún otro aspecto de los documentos previos.
9. **¿Existe algún atributo inventado?** No — se declara explícitamente la ausencia de evidencia en cada caso, incluido el de "nombre".
10. **¿El API Contract podría ahora completar `RegisterOrganizationRequest` únicamente con esta evidencia?** **Sí, de la única forma que la evidencia permite:** el cuerpo de la solicitud puede quedar vacío — la identidad se genera del lado del servidor (`UuidGenerator`, ya establecido en Application Model v1.1) y ningún otro atributo está evidenciado. No se puede completar con ningún campo adicional (p. ej. `name`) sin inventar uno.

---

## Informe obligatorio

### 1. Archivo creado
`docs/platform/organization-management-organization-identity-specification-v1.0-2026-07-31.md`

### 2. Vacío documental resuelto
La identidad mínima de `Organization` queda definida: exclusivamente `OrganizationId`, generado del lado del servidor. Ningún otro atributo (obligatorio u opcional) está respaldado por evidencia.

### 3. Decisiones tomadas
- La Identidad de `Organization` se reduce, hoy, a su identificador generado por el servidor.
- Logo, branding, colores, idioma, zona horaria, niveles educativos, estructura organizacional, periodos académicos y jerarquías quedan formalmente clasificados como Configuración diferida (no Identidad).
- Permisos queda clasificado como completamente fuera del alcance de Organization Management (pertenece al Platform Core), no como Configuración diferida propia.
- El Request Body de `POST /organizations` puede, con esta evidencia, quedar vacío.

### 4. Decisiones deliberadamente NO tomadas
- No se decide si un atributo legible como "nombre" pertenecerá algún día a la Identidad o a la Configuración — queda explícitamente abierto, pendiente de una decisión de producto futura (potencialmente un ACP), no resuelta por invención en este documento.
- No se diseña ningún mecanismo, formato ni validación para la futura Configuración — solo se confirma su existencia conceptual como categoría distinta de la Identidad.

### 5. Compatibilidad documental
Sin contradicciones con ninguno de los 10 documentos verificados (Sección 7) — el API Contract v1.0 queda, deliberadamente, sin modificar todavía.

### 6. Riesgos abiertos
- Si en el futuro se decide que `Organization` necesita un atributo legible (p. ej. "nombre"), esa decisión deberá tomarse explícitamente (posible ACP) antes de que cualquier documento la incorpore — no anticipada aquí.
- El modelo de Configuración (una vez que deje de estar diferido) no tiene, todavía, ningún principio de diseño propio más allá de "no es Identidad" — vacío heredado, no agravado por este documento.

### 7. Dictamen

**Organization Identity Specification v1.0 completa — vacío documental del API Contract v1.0 resuelto con la única evidencia disponible, sin inventar atributos.**

Detenido. No se modifica todavía el API Contract.
