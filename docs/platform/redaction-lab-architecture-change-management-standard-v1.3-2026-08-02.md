# RÉDACTION LAB — ARCHITECTURE CHANGE MANAGEMENT STANDARD v1.3

**Emisor:** Architecture Change Control Board (ACCB), Rédaction Lab.
**Estado:** `MINOR REVISION` — pendiente de Auditoría de Cierre y Congelación (§3, §6).
**Fecha:** 2026-08-02 (v1.0 original: 2026-07-19).
**Alcance de este documento:** define exclusivamente el proceso de gestión de cambios. Esta revisión incorpora, por autorización de ACP-008 (FROZEN), el mecanismo de regularización retroactiva de modificaciones ya ejecutadas sobre documentos Frozen — sin alterar ninguna otra sección, sin modificar ningún otro documento del proyecto, y sin debilitar el criterio de rechazo automático del §11 para modificaciones no divulgadas. El caso práctico (Sección 14) es un ejemplo formal de uso del estándar, no una ejecución.

**Historial de cambios**

| Versión | Fecha | ACP relacionado | Cambio |
|---|---|---|---|
| 1.0 | 2026-07-19 | — (versión fundacional) | Adopción inicial del Architecture Change Management Standard como único mecanismo oficial de gestión de cambios de Rédaction Lab. |
| 1.1 | 2026-08-02 | ACP-008 | Incorporación del mecanismo de regularización retroactiva en las nueve secciones autorizadas por ACP-008 (§3, §4, §6, §7, §9, §10, §11, §12, §13). **La Auditoría Final de Congelación de v1.1 detectó que esta versión excedió el alcance autorizado**: modificó indebidamente VALIDACIÓN FINAL y RESULTADO, y añadió una sección nueva no autorizada ("Riesgos abiertos") que transcribía de forma incompleta los riesgos de ACP-008; además, omitió resolver la decisión sobre límite temporal exigida por el Plan de actualización de ACP-008, y dejó ambigua la aplicabilidad retroactiva de la calificación del §11 frente a ACP-006 v1.1. Dictamen de esa auditoría: B) Requiere correcciones. |
| 1.2 | 2026-08-02 | Auditoría Final de Congelación de v1.1 (hallazgos C-01 a C-06) | Revertidas VALIDACIÓN FINAL y RESULTADO a su texto original de v1.0; eliminada la sección "Riesgos abiertos"; corregido el Historial de cambios; añadida a §6.1 una justificación de ausencia de límite temporal; añadida a §11 una calificación de irretroactividad; añadida a §10.1 una nota de resolución de diseño sobre boards duales. **Una revisión independiente posterior detectó que la calificación de irretroactividad del §11 y la justificación del límite temporal de §6.1 contenían, respectivamente, una ambigüedad no resuelta y una afirmación fácticamente inconsistente con el propio historial del proyecto** — ver fila v1.3. |
| 1.3 | 2026-08-02 | Revisión independiente de Standard v1.2 (hallazgos C-07, C-08) | **C-07:** reescrita la calificación de irretroactividad del §11, eliminando la ambigüedad sobre si la fecha relevante es la de la modificación original del documento Frozen o la de presentación del ACP de Regularización — se establece expresamente que es esta última, que la fecha de la modificación original nunca es criterio de exclusión, que ACP-006 v1.1 permanece rechazado sin reapertura automática, y que solo un ACP de Regularización presentado y evaluado bajo el Standard vigente puede solicitar, como acto nuevo, la revisión del caso subyacente. **C-08:** eliminada la justificación de "actos simultáneos" en §6.1 (inconsistente con el historial real del proyecto, donde la Divulgación de Academia Domain Model v1.2 precedió por varios ciclos a cualquier ACP de Regularización); sustituida por la justificación ya usada en el resto del Standard: ausencia de evidencia documental que sugiera un plazo determinado, en ningún documento autorizado. Ninguna otra sección fue modificada; ninguna decisión de ACP-008 fue alterada. |

---

## 1. Objetivo

**Propósito.** Establecer el único mecanismo oficial mediante el cual un documento arquitectónico ya `FROZEN` de Rédaction Lab puede modificarse, garantizando que todo cambio quede solicitado, evaluado, aprobado, aplicado y auditado de forma trazable — nunca editado directamente.

**Problemas que evita:**
- Modificaciones silenciosas a un contrato ya congelado, que ya rompieron confianza en ciclos anteriores de otros proyectos de software (deriva arquitectónica sin registro).
- Pérdida de la razón histórica detrás de una decisión ("¿por qué este campo existe así?").
- Cambios concurrentes contradictorios entre distintos equipos sobre el mismo documento.
- Congelación prematura de documentos con vacíos conocidos, sin un mecanismo formal para cerrarlos después.
- Auditorías futuras sin evidencia de qué cambió, cuándo, por qué y quién lo aprobó.

**Beneficios para el proyecto:**
- Cada documento Frozen mantiene una única fuente de verdad, con historial verificable.
- Cualquier miembro nuevo del equipo puede reconstruir por qué el sistema es como es, sin arqueología de código.
- Los boards de gobierno (ARB, IRB, ACCB) tienen un proceso único y predecible, ya validado en este proyecto de forma informal (resoluciones A-01–A-10, CH-01, IRB de Academia) — este estándar formaliza esa práctica ya demostrada, sin inventar un proceso nuevo desde cero.
- Permite evolución continua del sistema sin sacrificar la estabilidad que "Frozen" promete a cada módulo consumidor.

---

## 2. Alcance

**Documentos sujetos al proceso ACP** (todo documento que alcance el estado `FROZEN`):
- Product Blueprint
- Arquitectura General
- Domain Model (por módulo)
- Application Model (general y por módulo)
- Functional Specification (por módulo)
- Infrastructure Model (por módulo)
- Platform Core Foundation y todo componente individual derivado de él (Notification Catalog, Domain Event Catalog, Error Catalog, etc.)
- API Contract (por módulo)
- Frontend Contract (por módulo, cuando exista)
- Este mismo estándar (Architecture Change Management Standard), una vez adoptado — ningún documento queda exento de su propia regla.

**Documentos que NO requieren ACP:**
- Documentos de auditoría/revisión ya emitidos (Coverage Audits, DDD Audits, resoluciones de ARB/IRB) — son registros históricos de un momento dado; nunca se editan, solo se superan mediante una auditoría nueva y posterior.
- Change Proposals ya aprobados — una vez emitidos, son inmutables por la misma razón (registro histórico); un error en un ACP se corrige con un ACP nuevo, nunca editando el anterior.
- Documentos en estado `DRAFT` que aún no alcanzaron `FROZEN` — su propio autor puede modificarlos libremente hasta ese punto.
- Documentación operativa interna sin valor contractual (notas de trabajo, borradores de exploración) que nunca llegan a congelarse.

---

## 3. Estados oficiales de un documento

| Estado | Significado |
|---|---|
| **DRAFT** | Documento en elaboración activa. Sin valor contractual. Su autor puede modificarlo libremente, sin ACP, hasta que se somete a revisión. |
| **IN REVIEW** | Documento completo, sometido formalmente a un board de gobierno (ARB, IRB, ACCB u otro equivalente) para su aprobación. Puede resultar en aprobación, rechazo (regresa a `DRAFT`), o aprobación condicionada a ajustes menores. |
| **MINOR REVISION** | Estado transitorio de un documento **ya `FROZEN`** que tiene una o más decisiones ya aprobadas (vía ACP) pendientes de integrarse mecánicamente en su texto — exactamente el estado que atravesaron la Functional Specification y el Infrastructure Model de Academia entre la resolución de sus pendientes y la incorporación editorial de esas decisiones. No es un retroceso a `DRAFT`: el contenido ya aprobado es vinculante aunque el texto aún no lo refleje. |
| **EN REGULARIZACIÓN** | Estado transitorio de un documento **ya `FROZEN`** cuyo texto fue modificado directamente antes de que existiera un ACP aprobado que lo autorizara, y cuyo equipo responsable ha divulgado voluntariamente esa situación mediante una Solicitud de Regularización (§6.1). A diferencia de `MINOR REVISION`, este estado **no presupone ninguna decisión ya aprobada** — el propio ACP de Regularización está todavía pendiente de Aprobación. El documento no puede considerarse `FROZEN` mientras permanezca en este estado, y se resuelve exclusivamente mediante uno de los desenlaces oficiales del §6.1 (regularización aprobada, con o sin condiciones; regularización rechazada con reversión obligatoria; regularización parcial). Ningún documento puede transicionar a este estado sin una divulgación voluntaria previa a cualquier auditoría externa — su ausencia mantiene la modificación sujeta al rechazo automático del §11, sin excepción. |
| **FROZEN** | Documento ratificado. Contrato oficial vigente. Inmutable de forma directa: cualquier modificación exige un ACP aprobado. |
| **SUPERSEDED** | Una versión anteriormente `FROZEN` que fue reemplazada por una versión más nueva ya `FROZEN` del mismo documento. Se conserva íntegra por trazabilidad histórica; ya no orienta ninguna decisión de implementación vigente. |
| **ARCHIVED** | Documento retirado definitivamente del ciclo de vida activo del proyecto — ningún módulo lo consume. Se conserva solo por auditoría e historia, nunca como referencia de diseño futuro. |

---

## 4. Tipos de Change Proposal

| Tipo | Cuándo aplica |
|---|---|
| **Editorial** | Corrección de redacción, formato o referencia cruzada, sin alterar significado ni comportamiento (ejemplo real ya identificado: nombrar explícitamente `UnitUnlocked` donde hoy solo se describe su efecto). |
| **Documentación** | Agregar trazabilidad, notas aclaratorias o ejemplos faltantes, sin alterar comportamiento (ejemplo real: formalizar CU-xx de Administrador en la Functional Specification). |
| **Infraestructura** | Cambios en un Infrastructure Model — adaptadores, patrones técnicos, proveedores, umbrales operativos — sin tocar Domain ni Application. |
| **API** | Cambios en un API Contract — endpoints, DTOs, contratos HTTP — cuando el cambio no se origina en una capa inferior. |
| **Frontend** | Cambios en un Frontend Contract. |
| **Dominio** | Cambios en un Domain Model — Aggregates, Entities, Value Objects, Policies, Specifications, Domain Events, invariantes. Máximo nivel de escrutinio de todos los tipos, por su posición como fuente de verdad del comportamiento. |
| **Funcional** | Cambios en una Functional Specification — reglas visibles, casos de uso, flujos de usuario, criterios de aceptación. |
| **Seguridad** | Cambios en RBAC, autorización, políticas de acceso — habitualmente cruzan más de un módulo vía el Permission Catalog del Platform Core. |
| **Performance** | Cambios en umbrales, estrategias de caché, timeouts, paginación — sin alterar comportamiento funcional observable más allá del tiempo de respuesta. |
| **Platform Core** | Cambios en cualquier componente transversal (Notification Catalog, Error Catalog, Permission Catalog, etc.). El tipo de mayor alcance posible: por definición afecta simultáneamente a todos los módulos consumidores del componente. |
| **Regularización** | Formaliza, mediante el Flujo de Regularización Retroactiva (§6.1), la disposición de un documento Frozen cuyo texto fue modificado directamente antes de existir un ACP aprobado, siempre que dicha modificación haya sido divulgada voluntariamente por su equipo responsable antes de cualquier auditoría externa. No aplica a modificaciones no divulgadas, que permanecen sujetas al rechazo automático del §11 sin excepción. Requiere el anexo obligatorio de Comparación Línea por Línea (§7) y evaluación dual de boards (§10.1). |

Un ACP puede combinar más de un tipo cuando el cambio cruza capas (ver ACP-001, Sección 14, que combina Funcional + Aplicación).

---

## 5. Clasificación por impacto

| Nivel | Criterio objetivo (documentos afectados) | Criterio objetivo (riesgo de ruptura) |
|---|---|---|
| **Bajo** | 1 documento afectado. | Ningún consumidor externo al documento se ve afectado; sin cambio de comportamiento observable. |
| **Medio** | 2–3 documentos afectados. | Cambio aditivo, compatible hacia atrás; al menos un documento consumidor debe actualizarse, pero ningún contrato ya vigente se rompe. |
| **Alto** | 4 o más documentos afectados, **o** introduce un elemento nuevo de primera clase (nuevo Command, Query, endpoint, Aggregate) sin eliminar ni romper nada existente. | Riesgo de ruptura medio si el rollout entre capas no se coordina en el orden correcto (Domain→Application→Infrastructure→API→Frontend). |
| **Crítico** | Cualquier número de documentos, **si** el cambio rompe compatibilidad hacia atrás de un contrato ya consumido, **o** reabre/reinterpreta una resolución arquitectónica ya aprobada (tipo A-01–A-10), **o** afecta a más de un módulo funcional simultáneamente a través de un componente del Platform Core. | Riesgo de ruptura alto — exige plan de migración obligatorio y ventana de deprecación (Sección 8 del Platform Core Foundation, reutilizada aquí sin redefinir). |

---

## 6. Flujo oficial de aprobación

```
Solicitud → Análisis → Impacto → Revisión → Aprobación → Actualización → Auditoría → Nueva versión → Congelación
```

1. **Solicitud.** Cualquier miembro del equipo presenta un ACP completo, usando la plantilla oficial (Sección 7), con evidencia trazable a un documento Frozen o a una auditoría formal — nunca una opinión sin evidencia.
2. **Análisis.** El ACCB verifica que el ACP está completo y que la evidencia citada es real y verificable; clasifica su Tipo (Sección 4).
3. **Impacto.** Se aplica la clasificación objetiva de la Sección 5; se identifican todos los documentos Frozen afectados, directos e indirectos (incluida cualquier dependencia transversal vía Platform Core).
4. **Revisión.** El board correspondiente al tipo de cambio evalúa la propuesta: ARB para Dominio/Funcional, IRB para Infraestructura, un board equivalente para API/Frontend cuando se constituya, el propio ACCB para Platform Core y para cualquier cambio que cruce más de un tipo.
5. **Aprobación.** El board emite un veredicto formal — `APROBADO`, `RECHAZADO`, o `APROBADO CON CONDICIONES` — documentado con el mismo formato ya usado en este proyecto para las resoluciones A-01–A-10 ("Estado: APROBADA").
6. **Actualización.** El o los documentos Frozen afectados se editan exclusivamente para incorporar lo aprobado en el ACP — nunca más, nunca menos.
7. **Auditoría.** Se ejecuta la revisión correspondiente según la Sección 10, para confirmar que la actualización cerró efectivamente el ACP sin introducir inconsistencias nuevas.
8. **Nueva versión.** Se incrementa la versión del documento según las reglas de la Sección 8.
9. **Congelación.** El documento actualizado retorna a `FROZEN`; su versión anterior pasa a `SUPERSEDED`.

Ningún paso puede omitirse. Un ACP que pretenda saltar directamente de "Solicitud" a "Actualización" se rechaza automáticamente (Sección 11).

### 6.1 — Flujo de Regularización Retroactiva

Aplicable exclusivamente cuando un documento ya `FROZEN` fue modificado directamente antes de que existiera un ACP aprobado, y dicha modificación fue divulgada voluntariamente por su equipo responsable (Tipo **Regularización**, §4; Estado `EN REGULARIZACIÓN`, §3):

```
Divulgación → Solicitud de Regularización → Análisis → Impacto → Revisión → Decisión → Actualización (si aplica) → Auditoría → Congelación o Reversión
```

1. **Divulgación.** El equipo responsable declara explícitamente, dentro del propio documento afectado, que su texto fue modificado sin ACP previo aprobado. El documento transiciona a `EN REGULARIZACIÓN` (§3). Ninguna modificación descubierta sin esta divulgación voluntaria previa es elegible para este flujo — permanece sujeta, sin excepción, al rechazo automático del §11. **No existe límite temporal máximo entre la Divulgación y la presentación de la Solicitud de Regularización (paso 2). Esta ausencia de límite es deliberada: ni el presente Standard ni ACP-008 establecen plazo alguno, por no existir evidencia documental que sugiera un plazo determinado ni una necesidad documentada de imponerlo — Standard v1.3 mantiene, en consecuencia, esa ausencia de límite temporal sin modificarla.**
2. **Solicitud de Regularización.** Se presenta un ACP de Tipo Regularización (§4), usando la plantilla oficial (§7), con el anexo obligatorio de Comparación Línea por Línea (§7) contra la última versión legítimamente `FROZEN` del documento.
3. **Análisis.** El ACCB verifica: que la divulgación fue voluntaria y anterior a cualquier auditoría externa; que el anexo de comparación es completo y verificable; que ningún otro criterio de rechazo automático del §11 (distinto del de secuencia) aplica.
4. **Impacto.** Se clasifica conforme a la Sección 5, sin alteración de sus criterios.
5. **Revisión.** Evaluación dual (§10.1): el board correspondiente al Tipo del documento afectado (ARB, IRB, u otro equivalente) evalúa el contenido técnico; el ACCB valida específicamente la aplicabilidad de la excepción al criterio de secuencia del §11.
6. **Decisión.** Uno de los desenlaces oficiales siguientes:
   - **Regularización aprobada, sin condiciones.**
   - **Regularización aprobada con condiciones** — exige ajuste editorial antes de la Congelación (`Estado del ACP: APROBADO CON CONDICIONES`, §7).
   - **Regularización rechazada, con reversión obligatoria** a la última versión `FROZEN` legítima anterior a la modificación no autorizada.
   - **Regularización rechazada, con apertura de un nuevo ACP prospectivo** — el documento se revierte primero; el mismo cambio puede volver a proponerse siguiendo el flujo oficial (Sección 6) en el orden correcto.
   - **Regularización parcial** — solo la porción del cambio itemizada y verificada en el anexo de Comparación Línea por Línea se ratifica; cualquier porción no itemizada exige, según corresponda, corrección (paso 7) o reversión de esa porción específica.
7. **Actualización (si aplica).** Solo si la Decisión exige ajustar el texto (regularización con condiciones, o regularización parcial) — se corrige exclusivamente la porción del documento identificada como no autorizada por el anexo de comparación.
8. **Auditoría.** Auditoría de Regularización (§10).
9. **Congelación o Reversión.** Si se aprueba, el documento retorna a `FROZEN`, con el ACP de Regularización citado en su Historial de cambios (§12), señalando expresamente su naturaleza retroactiva. Si se rechaza, el documento se revierte obligatoriamente a su última versión `FROZEN` legítima.

Ningún paso de este flujo alternativo puede omitirse, bajo el mismo principio general de esta Sección. **Este flujo no exime a la modificación de ningún otro criterio de rechazo automático del §11** — únicamente neutraliza, bajo las condiciones estrictas de esta subsección, el criterio específico de secuencia (§11).

---

## 7. Plantilla oficial ACP

Todo Architecture Change Proposal debe contener, como mínimo, los siguientes campos:

| Campo | Contenido |
|---|---|
| **ID** | Identificador único, secuencial (`ACP-001`, `ACP-002`, ...). |
| **Título** | Nombre corto y descriptivo del cambio. |
| **Fecha** | Fecha de emisión. |
| **Autor** | Quién solicita el cambio. |
| **Tipo** | Uno o más de los tipos de la Sección 4. |
| **Clasificación de impacto** | Bajo / Medio / Alto / Crítico, según la Sección 5. |
| **Motivación** | Por qué se solicita el cambio. |
| **Problema** | Qué problema concreto resuelve. |
| **Evidencia** | Referencia trazable y verificable (documento, sección, hallazgo de auditoría) — nunca una afirmación sin respaldo. |
| **Documentos afectados** | Lista exhaustiva, directos e indirectos. |
| **Dependencias** | Otros ACP o decisiones de las que depende, o que dependen de este. |
| **Impacto** | Descripción cualitativa del efecto sobre cada documento/módulo afectado. |
| **Riesgos** | Riesgos identificados y su mitigación. |
| **Alternativas** | Opciones consideradas y por qué se descartaron o se dejan abiertas. |
| **Recomendación** | Postura del solicitante — puede ser una decisión definitiva o una autorización a proceder sin prescribir el diseño detallado, según corresponda. |
| **Plan de actualización** | Qué documento(s) se editan, en qué orden, y bajo responsabilidad de qué board. |
| **Plan de validación** | Qué auditoría/revisión de la Sección 10 se ejecuta después, y qué debe confirmar. |
| **Resultado esperado** | Estado final verificable una vez cerrado el ACP. |
| **Estado del ACP** | `PENDIENTE DE APROBACIÓN` / `APROBADO` / `APROBADO CON CONDICIONES` / `RECHAZADO`. |

**Anexo obligatorio para ACP de Tipo Regularización.** Todo ACP de Tipo Regularización (§4) debe incluir, además de los 19 campos anteriores, un **anexo de Comparación Línea por Línea** que identifique, sección por sección, cada diferencia entre el texto vigente del documento y su última versión legítimamente `FROZEN` — distinguiendo explícitamente las diferencias ya autorizadas (si existiera algún ACP previo parcial) de las no autorizadas. Ningún ACP de Tipo Regularización puede considerarse completo (checklist, §13) sin este anexo.

---

## 8. Reglas de versionado

| Cambio de versión | Cuándo aplica |
|---|---|
| **Major (X.0)** | El cambio rompe compatibilidad hacia atrás de un contrato ya consumido, elimina o redefine el significado de un elemento existente, o reabre una resolución arquitectónica ya aprobada. |
| **Minor (x.Y)** | El cambio es aditivo y compatible hacia atrás: agrega elementos nuevos (Command, Query, endpoint, campo opcional) sin alterar el comportamiento de los existentes. Coincide con el paso por el estado `MINOR REVISION`. |
| **Patch (x.y.Z)** | El cambio es editorial o documental, sin ningún efecto de comportamiento (corrección de redacción, aclaración, nombrar explícitamente algo ya implícito). |

**Relación con el tipo de cambio (Sección 4):** Editorial y Documentación → siempre Patch. Infraestructura, API, Performance y Seguridad → Minor si son aditivos (el caso habitual); Major solo si rompen un contrato ya consumido. Dominio, Funcional y Platform Core → Minor si son aditivos; Major si redefinen o eliminan algo ya vigente.

---

## 9. Trazabilidad

Cadena obligatoria, sin eslabones faltantes:

```
Documento original (vX.Y, FROZEN)
        ↓
ACP (ID único, evidencia citada)
        ↓
Documento actualizado (MINOR REVISION durante la integración)
        ↓
Nueva versión (vX.(Y+1) o (X+1).0, FROZEN)
```

Todo documento Frozen de Rédaction Lab debe incluir, en su encabezado, una tabla de **Historial de cambios** (formato ya adoptado por Academia Functional Specification v1.1) que referencie el ACP correspondiente a cada versión posterior a la v1.0 original — ninguna versión nueva sin su ACP citado, salvo la versión inicial (que no tiene ACP predecesor, es el punto de partida del documento).

**Cadena alternativa — Regularización Retroactiva**:

```
Documento original (vX.Y, FROZEN)
        ↓
[modificación ejecutada sin ACP previo aprobado]
        ↓
Divulgación → Documento en EN REGULARIZACIÓN
        ↓
ACP de Regularización (ID único, con anexo de Comparación Línea por Línea)
        ↓
Decisión (§6.1)
        ↓
Nueva versión (vX.(Y+1), FROZEN, Historial de cambios citando el ACP de Regularización)
        — o —
Reversión a vX.Y (FROZEN, sin cambios respecto a la última versión legítima)
```

En el caso de una Nueva versión producida mediante el Flujo de Regularización Retroactiva (§6.1), el ACP citado en el Historial de cambios es el ACP de Regularización, aun cuando cronológicamente la edición del texto haya precedido a su Aprobación — precisamente el supuesto que este flujo regulariza, y no una excepción a la regla de este párrafo.

---

## 10. Auditoría

| Auditoría/Revisión | Se re-ejecuta obligatoriamente cuando... |
|---|---|
| **Coverage Audit** | El ACP se clasifica Alto o Crítico, o afecta más de una capa (p. ej. Funcional + Aplicación simultáneamente). |
| **Architecture Review (tipo ARB)** | El ACP es de tipo Dominio o Funcional. |
| **Infrastructure Review (tipo IRB)** | El ACP es de tipo Infraestructura, o de tipo Platform Core cuando toca un componente ya consumido por algún Infrastructure Model existente. |
| **API Review** | El ACP es de tipo API, o de tipo Dominio/Aplicación que introduce un Command/Query nuevo (exige endpoint nuevo). |
| **Frontend Review** | El ACP es de tipo Frontend, o de tipo API que modifica un contrato ya consumido por un Frontend Contract ya Frozen. |
| **Auditoría de Regularización** | El ACP es de Tipo Regularización (§4) — se ejecuta **además** de cualquier otra auditoría que corresponda por el Tipo del documento afectado (Coverage Audit, ARB, IRB, API Review, Frontend Review, según aplique), nunca en su lugar. |

Ninguna congelación (paso 9 del flujo, Sección 6) puede ocurrir sin que la auditoría correspondiente confirme el cierre correcto del ACP.

### 10.1 — Boards de la Regularización Retroactiva

Todo ACP de Tipo Regularización (§4) requiere **evaluación dual**, sin que ninguna de las dos sustituya a la otra:

1. **El board correspondiente al Tipo del documento afectado** (ARB para Dominio/Funcional, IRB para Infraestructura, u otro equivalente para API/Frontend, según la tabla de esta Sección) — evalúa el contenido técnico real del documento regularizado, con el mismo rigor que aplicaría a cualquier ACP normal de ese tipo.
2. **El Architecture Change Control Board (ACCB)** — valida específicamente si la excepción al criterio de secuencia del §11 es aplicable al caso concreto, en su calidad de emisor del propio Standard (encabezado de este documento) y titular de la regla que se excepciona.

**Nota de resolución de diseño:** esta configuración de evaluación dual resuelve, manteniéndola sin simplificar, una de las dos alternativas que ACP-008 dejaba explícitamente abiertas en su Plan de actualización ("configuración final de boards —Tipo + ACCB, o simplificada—").

---

## 11. Criterios de rechazo

Un ACP debe rechazarse automáticamente, sin pasar a Revisión, si ocurre cualquiera de los siguientes:

- No incluye evidencia trazable a un documento Frozen o a una auditoría formal (opinión sin respaldo).
- Propone o asume que un documento Frozen ya fue modificado directamente, sin pasar por este proceso — **salvo que el ACP sea de Tipo Regularización (§4) y cumpla estrictamente las condiciones del Flujo de Regularización Retroactiva (§6.1): divulgación voluntaria previa a cualquier auditoría externa, anexo de Comparación Línea por Línea completo y verificable, y ausencia de cualquier otro criterio de rechazo automático de esta misma Sección.** Esta excepción es exclusiva de ese supuesto exacto; **no se extiende, bajo ninguna interpretación, a modificaciones no divulgadas o descubiertas sin declaración previa del equipo responsable**, que permanecen sujetas a rechazo automático sin excepción. **La elegibilidad de esta excepción se determina exclusivamente por la fecha de presentación y evaluación del ACP de Regularización bajo el texto vigente de este Standard (desde v1.2 en adelante) — nunca por la fecha en que ocurrió la modificación original del documento Frozen, la cual no constituye, por sí misma, un criterio de exclusión. Esta excepción no reabre automáticamente ninguna decisión ya emitida: el rechazo ya emitido por el Architecture Review Board a ACP-006 v1.1 permanece firme, sin que esta calificación lo revierta. Únicamente un ACP de Regularización presentado y evaluado bajo el presente Standard puede solicitar, como acto nuevo e independiente, la revisión del caso subyacente a esa decisión — nunca como una reapertura automática o retroactiva de ACP-006 v1.1 ni de ninguna otra decisión ya tomada.**
- Reabre o reinterpreta una resolución arquitectónica ya aprobada (tipo A-01–A-10) sin identificarlo explícitamente como tal y sin escalar al mismo nivel de autoridad que la aprobó originalmente.
- Introduce funcionalidad nueva no solicitada por ningún documento Funcional ya Frozen (scope creep no evidenciado).
- No define un Plan de validación verificable.
- Es de clasificación Major o Crítica y no incluye un plan de migración para los consumidores ya existentes.
- Duplica un componente ya existente en el Platform Core sin justificar por qué el existente resulta insuficiente.

---

## 12. Historial de cambios — formato oficial

Todo documento Frozen del proyecto adopta, desde este estándar en adelante, la siguiente tabla en su encabezado:

| Versión | Fecha | ACP relacionado | Cambio |
|---|---|---|---|
| *(una fila por versión posterior a la v1.0 original)* | | | |

Sin excepción — incluidos los documentos ya existentes de Academia en su próxima revisión, y este mismo estándar en cualquier revisión futura de sí mismo.

**Nota para versiones producidas mediante Regularización Retroactiva**: cuando una fila del Historial de cambios corresponda a una versión producida mediante el Flujo de Regularización Retroactiva (§6.1), la columna "Cambio" debe declarar expresamente esa naturaleza — iniciando la descripción con "Regularización retroactiva:" — de forma que quede visible, sin ambigüedad, que la secuencia real de esa versión difirió del orden oficial de la Sección 6.

---

## 13. Checklist de aprobación

- [ ] El ACP está completo según la plantilla de la Sección 7.
- [ ] La evidencia citada es trazable a un documento Frozen o a una auditoría formal ya emitida.
- [ ] El Tipo y la Clasificación de impacto están asignados correctamente según las Secciones 4 y 5.
- [ ] Todos los documentos afectados, directos e indirectos (incluida cualquier dependencia vía Platform Core), están identificados.
- [ ] Ninguna resolución arquitectónica ya aprobada queda reinterpretada sin escalarlo explícitamente.
- [ ] El Plan de actualización no excede el alcance descrito en la Motivación/Problema.
- [ ] El Plan de validación especifica qué auditoría/revisión de la Sección 10 se ejecutará.
- [ ] Ningún criterio de rechazo automático de la Sección 11 aplica.
- [ ] La versión objetivo (major/minor/patch) es coherente con el tipo de cambio, según la Sección 8.
- [ ] **Si el ACP es de Tipo Regularización (§4):** el anexo de Comparación Línea por Línea está presente y completo; la divulgación fue voluntaria y anterior a cualquier auditoría externa (§6.1, §11); y la evaluación dual de boards (§10.1) fue ejecutada por ambos boards, no solo por uno.

---

## 14. Ejemplo práctico

**ACP-001 — Academia Coverage Completion**

Este ACP nace directamente de los tres hallazgos con impacto real de la `Academia Architecture Coverage Audit` (2026-07-19): F-01, F-02 y F-09. Se presenta como caso de uso formal de este estándar. **No se aplica ningún cambio a ningún documento en este acto** — el ACP queda formalmente emitido y, donde corresponde, aprobado en su decisión, con la Actualización real (paso 6 del flujo) pendiente de ejecución en un ciclo posterior.

---

### ACP-001-A — Incorporar la Verificación de Comprensión al Application Model y derivados

| Campo | Contenido |
|---|---|
| **ID** | ACP-001-A |
| **Título** | Incorporar la Verificación de Comprensión (pasos 1–6 del recorrido) al Application Model, Infrastructure Model y API Contract de Academia |
| **Fecha** | 2026-07-19 |
| **Autor** | Architecture Coverage Auditor (origen del hallazgo) |
| **Tipo** | Funcional + Aplicación |
| **Clasificación de impacto** | Alto (3 documentos afectados directamente: Application Model, Infrastructure Model, API Contract; introduce elementos nuevos sin romper nada existente) |
| **Motivación** | Cerrar el hallazgo F-01 (ERROR CRÍTICO) de la Coverage Audit, que bloquea el inicio de Frontend Contract. |
| **Problema** | CU-02 de la Functional Specification v1.1 (Contextualizar, Definir objetivos, Comprender con verificación explícita, Observar, Analizar, Practicar — 6 de los 11 valores de `UnitStep`) no posee ningún Command ni Query en el Application Model, y en consecuencia tampoco endpoint de API ni componente de Infrastructure. |
| **Evidencia** | `academia-architecture-coverage-audit-2026-07-19.md`, Hallazgo F-01 y Matriz A; `academia-functional-specification-v1.1-2026-07-19-FROZEN.md`, CU-02; `academia-domain-model-v1.1-2026-07-19.md`, enum `UnitStep` (11 valores, ya Frozen, sin modificar). |
| **Documentos afectados** | Application Model (directo — nuevos Commands/Queries); Infrastructure Model (derivado — nuevos adaptadores/persistencia para los pasos); API Contract (derivado — nuevos endpoints). Domain Model: **no afectado** — `UnitStep` ya contiene los 11 valores necesarios, no requiere modificación. |
| **Dependencias** | Ninguna hacia otros módulos; el cambio es interno a Academia. |
| **Impacto** | Habilita la implementación completa del recorrido de una unidad; sin este cambio, más de la mitad de las pantallas de Academia no tienen contrato de Backend. |
| **Riesgos** | Un diseño incorrecto de los nuevos Commands podría tensionar invariantes ya cerrados de `Attempt` — mitigado exigiendo que el ARB de Dominio confirme, durante la Actualización, que ningún Invariante ya Frozen se ve alterado. |
| **Alternativas** | (a) un Command genérico de avance de paso (`AdvanceStep`) reutilizable para los 6 pasos, más un Command específico de verificación de comprensión; (b) un Command dedicado por cada uno de los 6 pasos; (c) tratar los pasos de contenido (Contextualizar a Practicar) como lectura sin persistencia de progreso individual, persistiendo únicamente la verificación de comprensión como único paso con efecto de Command. Este ACP no elige entre ellas — esa decisión de diseño corresponde al ciclo de Actualización, no a la autorización del cambio. |
| **Recomendación** | Autorizar la extensión del Application Model; el diseño detallado (elección entre alternativas) se resuelve en un sprint dedicado, siguiendo la misma disciplina ya aplicada en el resto de Academia (sin inventar comportamiento no evidenciado por CU-02). |
| **Plan de actualización** | Sprint de extensión del Application Model → propagación ordenada a Infrastructure Model → propagación a API Contract, en ese orden, sin excepción (mismo orden de capas ya usado en todo este proyecto). |
| **Plan de validación** | Nueva Coverage Audit enfocada en Matriz A y en la tabla de Cobertura de IA, para confirmar que `UnitStep` queda 100% cubierto y que las tres interacciones de IA hoy sin cobertura (verificación de comprensión, "Actividades IA") quedan resueltas. |
| **Resultado esperado** | CU-02 con orquestación completa; F-01 cerrado; `UnitStep` sin valores ⚠ en la próxima auditoría de cobertura. |
| **Estado del ACP** | **APROBADO** — autorización a proceder. La Actualización (paso 6 del flujo) queda pendiente de ejecución en un ciclo posterior; este documento no la ejecuta. |

---

### ACP-001-B — Eliminar la ambigüedad del término "grupo"

| Campo | Contenido |
|---|---|
| **ID** | ACP-001-B |
| **Título** | Definición oficial del término "grupo" en el contexto de Academia |
| **Fecha** | 2026-07-19 |
| **Autor** | ACCB |
| **Tipo** | Funcional + Documentación |
| **Clasificación de impacto** | Medio (2 documentos afectados: Functional Specification, API Contract; cambio aditivo/aclaratorio, no rompe nada existente, no requiere endpoint nuevo) |
| **Motivación** | Cerrar el hallazgo F-02 de la Coverage Audit. |
| **Problema** | CU-09 y CU-11 de la Functional Specification permiten acciones docentes "sobre un estudiante o un grupo completo", pero ningún documento Frozen define qué es un "grupo" a nivel de dominio o de contrato técnico. |
| **Evidencia** | `academia-architecture-coverage-audit-2026-07-19.md`, Hallazgo F-02; `academia-functional-specification-v1.1-2026-07-19-FROZEN.md`, Secciones 6 y 7 (CU-09, CU-11); `academia-api-contract-v1.0-2026-07-19.md`, nota de EP-07/EP-08 y PENDIENTE DE DECISIÓN DE API #2. |
| **Documentos afectados** | Functional Specification (aclaración de "grupo"); API Contract (nota confirmando que no se requiere endpoint de grupo). Domain Model y Application Model: **no afectados**. |
| **Dependencias** | Ninguna. |
| **Impacto** | Resuelve la ambigüedad sin introducir ningún concepto nuevo de dominio ni ningún endpoint nuevo — el Profesor opera sobre múltiples estudiantes mediante llamadas individuales ya existentes (EP-07, EP-08, EP-20), orquestadas por el Frontend. |
| **Riesgos** | Ninguno significativo — es una decisión de alcance que reduce complejidad, no la aumenta. |
| **Alternativas** | (a) modelar `Group` como entidad de dominio de primera clase (descartada por este ACP, diferida); (b) tratar "grupo" como selección múltiple orquestada por el Frontend, sin nuevo concepto de dominio (adoptada). |
| **Decisión oficial** | **No existe `Group` como entidad del dominio en Rédaction Lab v1.x.** Toda referencia a "grupo" en la Functional Specification y en el API Contract de Academia pasa a significar **selección múltiple de estudiantes desde el Panel del Profesor** — el Frontend itera sobre estudiantes individuales usando los endpoints ya existentes (EP-07, EP-08, EP-20), sin ningún cambio de Application Model, Domain Model, Infrastructure Model ni API Contract. El soporte a grupos reales como entidad de dominio (con membresía persistida, progreso agregado nativo, etc.) queda diferido a una futura versión, mediante un ACP independiente que deberá evaluarse con su propia evidencia de necesidad transversal. |
| **Plan de actualización** | Incorporar esta decisión como aclaración textual en la Functional Specification (Secciones 2, 6, 7, 9) y como nota confirmatoria en el API Contract (retirando el marcador de pendiente de EP-07/EP-08/EP-20 y de la Sección "PENDIENTES DE DECISIÓN DE API #2"). Cambio de versión: Patch (aclaración, sin nuevo comportamiento). |
| **Plan de validación** | Verificación editorial simple (no requiere nueva Coverage Audit completa, dado que no se tocan Domain/Application/Infrastructure) — confirmar que ninguna mención residual de "grupo" quede sin la aclaración aplicada. |
| **Resultado esperado** | F-02 cerrado; CU-09 y CU-11 con alcance 100% definido, sin introducir `GroupId` ni `GroupProgressSummaryDTO`. |
| **Estado del ACP** | **APROBADO**, con decisión oficial ya emitida en este mismo ACP. La Actualización editorial queda pendiente de ejecución en un ciclo posterior; este documento no la ejecuta. |

---

### ACP-001-C — Alinear la Functional Specification con el Infrastructure Model respecto a la Biblioteca de Modelos

| Campo | Contenido |
|---|---|
| **ID** | ACP-001-C |
| **Título** | Diferenciación explícita entre contenido editorial estático y comentario comparativo generado por IA en la Biblioteca de Modelos |
| **Fecha** | 2026-07-19 |
| **Autor** | ACCB |
| **Tipo** | Funcional + Aplicación (menor) |
| **Clasificación de impacto** | Medio (2–3 documentos afectados: Functional Specification, Application Model, API Contract — cambio aclaratorio/aditivo, no rompe nada existente) |
| **Motivación** | Cerrar el hallazgo F-09 de la Coverage Audit. |
| **Problema** | La Functional Specification (Sección 10) declara que la IA "genera comentario comparativo dentro de la Biblioteca de Modelos", mientras que el Application Model/API Contract modelan ese campo como contenido estático gestionado por el Administrador (`CMD-12`/`CMD-13`, `ModelExampleDTO.comparativeComment`), sin distinguir ambos orígenes posibles. |
| **Evidencia** | `academia-architecture-coverage-audit-2026-07-19.md`, Hallazgo F-09 y tabla de Cobertura de IA; `academia-functional-specification-v1.1-2026-07-19-FROZEN.md`, Sección 10; `academia-api-contract-v1.0-2026-07-19.md`, DTO `ModelExampleDTO`. |
| **Documentos afectados** | Functional Specification (aclaración de la Sección 10 y 4); Application Model (posible distinción de campos si se confirma que ambos orígenes coexisten); API Contract (posible extensión del DTO). Domain Model: **no afectado** — `ModelExample` ya es un Aggregate agnóstico al origen de su contenido. |
| **Dependencias** | Ninguna. |
| **Impacto** | Elimina el riesgo de que una implementación futura interprete de forma incorrecta si el comentario comparativo se genera en tiempo real o se cura editorialmente. |
| **Riesgos** | Si la distinción no se aplica de forma consistente en los tres documentos, el hallazgo podría reaparecer en la siguiente Coverage Audit — mitigado por el Plan de validación. |
| **Alternativas** | (a) el comentario comparativo es siempre contenido estático curado por el Administrador (sin IA en tiempo de consulta); (b) el comentario comparativo es siempre generado dinámicamente por IA en cada consulta del estudiante; (c) ambos coexisten, claramente diferenciados: un campo editorial estático (Administrador) y, de forma separada, un comentario generado por IA. |
| **Decisión oficial** | Se adopta la alternativa (c): **los comentarios comparativos generados por IA deberán quedar claramente diferenciados del contenido estático administrado por el Administrador.** `ModelExample` conserva su contenido editorial (producción ejemplar, gestionada por CMD-12/13/14, sin cambios) y, de forma explícitamente distinta, cualquier comentario comparativo de origen IA se identifica como tal en la Functional Specification, el Application Model y el DTO correspondiente — nunca conflados bajo un único campo indistinguible como ocurre hoy en `ModelExampleDTO.comparativeComment`. |
| **Plan de actualización** | Aclarar la Sección 10 y 4 de la Functional Specification; evaluar en el Application Model si el comentario de origen IA requiere su propio Command/Query de generación (fuera del alcance de este ACP definirlo — se autoriza la distinción, no se diseña su mecanismo); ajustar el DTO en el API Contract para separar ambos orígenes. |
| **Plan de validación** | Nueva revisión de la tabla de Cobertura de IA en la próxima Coverage Audit, confirmando que el comentario comparativo de origen IA tiene, igual que la retroalimentación formativa, origen funcional + contrato API + integración Infrastructure explícitos y diferenciados del contenido estático. |
| **Resultado esperado** | F-09 cerrado; ambos orígenes de contenido en la Biblioteca de Modelos, inequívocamente distinguibles en los tres documentos. |
| **Estado del ACP** | **APROBADO**, con decisión oficial de diferenciación ya emitida en este mismo ACP. El mecanismo detallado (si el comentario IA requiere un Command propio) queda pendiente de resolución en el ciclo de Actualización; este documento no lo ejecuta ni lo diseña. |

---

## VALIDACIÓN FINAL

| Verificación | Resultado |
|---|---|
| ✓ Preserva la trazabilidad | **Cumple.** Toda modificación queda ligada a un ACP con evidencia citada (Sección 7, 9); ningún documento cambia sin ese eslabón. |
| ✓ Evita modificaciones directas a documentos Frozen | **Cumple.** El estado `FROZEN` (Sección 3) es explícitamente inmutable salvo vía ACP aprobado; los tres criterios de rechazo automático (Sección 11) cierran cualquier intento de omitir el proceso. |
| ✓ Permite auditoría completa | **Cumple.** La Sección 10 ata cada tipo de cambio a la auditoría/revisión correspondiente, sin dejar ningún tipo sin verificación posterior. |
| ✓ Mantiene historial de cambios | **Cumple.** La Sección 12 formaliza el mismo formato de tabla ya usado en Academia Functional Specification v1.1, extendido a todo documento del proyecto. |
| ✓ Permite evolución controlada del proyecto | **Cumple.** El propio ACP-001 (Sección 14) demuestra el ciclo completo hasta el paso de Aprobación, sin necesidad de comprometer la estabilidad de ningún documento ya Frozen — la Actualización queda correctamente diferida a un ciclo posterior, tal como exige el propio estándar. |

---

## RESULTADO

**El Architecture Change Management Standard v1.0 queda adoptado como el único mecanismo oficial para modificar la arquitectura de Rédaction Lab, a partir de esta fecha.**

**Justificación:** el estándar no introduce ningún proceso ajeno a la disciplina ya demostrada en este proyecto — formaliza exactamente el patrón ya usado con éxito en las resoluciones A-01 a A-10, el Change Proposal CH-01, y los ciclos de ARB/IRB de Academia, cerrando el único vacío real que quedaba: la ausencia de un proceso único, documentado y obligatorio para *todos* los módulos futuros, no solo para Academia. ACP-001 demuestra que el estándar es operable en un caso real sin necesidad de comprometer ningún documento ya Frozen: dos de sus tres sub-propuestas (B y C) ya cuentan con decisión oficial dentro del propio ACP, y la tercera (A) queda correctamente autorizada sin prescribir un diseño que no le corresponde a este nivel de gobierno. Ningún documento fue modificado en la elaboración de este estándar ni de su ejemplo — tal como exigía el encargo.
