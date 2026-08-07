# ACP-007 — Apertura formal para modificar el Architecture Change Management Standard v1.0 (vacío normativo: regularización retroactiva)

**Naturaleza de este documento:** Architecture Change Proposal, emitido siguiendo estrictamente la plantilla oficial del propio Standard, §7. **Este ACP no modifica ningún documento** — únicamente solicita y, de aprobarse, autoriza el estudio de cómo cerrar el vacío normativo ya identificado en el propio Architecture Change Management Standard v1.0. No se diseña aquí ningún texto de reemplazo, ningún estado nuevo, ninguna rama de flujo ni ningún campo de plantilla — eso queda, expresamente, para el ciclo de Actualización posterior a la Aprobación (Standard §6).

---

## 1. Resumen de la investigación (solo hechos comprobados documentalmente)

- El Standard define seis estados de documento (§3): `DRAFT`, `IN REVIEW`, `MINOR REVISION`, `FROZEN`, `SUPERSEDED`, `ARCHIVED`. Ninguno describe un documento Frozen modificado antes de que exista un ACP aprobado.
- El flujo oficial (§6) es lineal: *Solicitud → Análisis → Impacto → Revisión → Aprobación → Actualización → Auditoría → Nueva versión → Congelación*. El único caso de salto de orden nombrado explícitamente es "Solicitud → Actualización." No se describe el caso en que "Actualización" ocurre sin que exista ninguna "Solicitud" previa.
- La plantilla oficial (§7, 19 campos) no contiene ningún campo para declarar que la modificación de un documento ya fue ejecutada antes del ACP que la autoriza.
- La cadena de trazabilidad obligatoria (§9) es: *Documento original (FROZEN) → ACP → Documento actualizado (MINOR REVISION) → Nueva versión (FROZEN)* — el ACP precede siempre, sin rama alterna documentada, a la edición del texto.
- El criterio de rechazo automático (§11) obliga a rechazar, sin pasar a Revisión, cualquier ACP que "asuma que un documento Frozen ya fue modificado directamente, sin pasar por este proceso" — sin excepción textual.
- El formato de Historial de cambios (§12) no contempla una fila para esta secuencia invertida.
- Academia Domain Model v1.2 se autodeclaró en estado `MINOR REVISION` antes de que existiera cualquier ACP aprobado, y su propia "Nota de gobernanza" cita "ACP-004" como precedente de "formalización retroactiva" ya practicada en el proyecto, sin que dicha práctica esté codificada en el Standard.
- ACP-006 v1.1 fue rechazado formalmente por el Architecture Review Board, exclusivamente por aplicación literal del §11, sin cuestionar el contenido técnico del cambio.

---

## 2. Justificación documental de cada punto

| Punto | Evidencia exacta |
|---|---|
| Inexistencia de un estado para regularización retroactiva (§3) | Cita literal de `MINOR REVISION`: *"Estado transitorio de un documento ya `FROZEN` que tiene una o más decisiones **ya aprobadas (vía ACP)** pendientes de integrarse mecánicamente en su texto."* Presupone ACP-antes-de-edición; ninguno de los seis estados cubre el orden inverso. |
| Inexistencia de una rama de flujo para modificaciones ya ejecutadas (§6) | Cita literal: *"Ningún paso puede omitirse. Un ACP que pretenda saltar directamente de 'Solicitud' a 'Actualización' se rechaza automáticamente (Sección 11)."* Solo nombra el salto Solicitud→Actualización; no nombra ni resuelve el caso "Actualización sin Solicitud previa alguna." |
| Inexistencia de soporte en la plantilla oficial (§7) | Los 19 campos enumerados (ID, Título, Fecha, Autor, Tipo, Clasificación de impacto, Motivación, Problema, Evidencia, Documentos afectados, Dependencias, Impacto, Riesgos, Alternativas, Recomendación, Plan de actualización, Plan de validación, Resultado esperado, Estado del ACP) no incluyen ningún campo para declarar "modificación ya ejecutada antes de este ACP." |
| Incompatibilidad de la cadena de trazabilidad (§9) | Cita literal: *"Documento original (vX.Y, FROZEN) → ACP (ID único, evidencia citada) → Documento actualizado (MINOR REVISION durante la integración) → Nueva versión (...FROZEN)."* y *"ninguna versión nueva sin su ACP citado, salvo la versión inicial."* La secuencia real de Academia Domain Model v1.2 (documento actualizado antes de que exista el ACP) invierte esta cadena. |
| Conflicto generado por el criterio de rechazo automático (§11) | Cita literal: *"Un ACP debe rechazarse automáticamente, sin pasar a Revisión, si... propone o asume que un documento Frozen ya fue modificado directamente, sin pasar por este proceso."* Verificado en la práctica: el Architecture Review Board rechazó ACP-006 v1.1 exactamente por esta cláusula. |
| Ausencia de soporte en el historial de cambios (§12) | Cita literal: *"Todo documento Frozen del proyecto adopta... la siguiente tabla en su encabezado: Versión / Fecha / ACP relacionado / Cambio."* Ninguna fila prevista para "cambio anterior a su propio ACP relacionado." |
| Contradicción con el propósito declarado por el propio Standard (§1) | Cita literal de "Problemas que evita": *"Congelación prematura de documentos con vacíos conocidos, **sin un mecanismo formal para cerrarlos después**."* La situación de Academia Domain Model v1.2 (congelado en los hechos, sin ACP aprobado, sin ruta documentada hacia ningún estado) es exactamente el escenario que esta cláusula declara evitar. |

---

## 3. Clasificación del ACP

**Tipo:** el Standard §4 enumera exactamente diez tipos: Editorial, Documentación, Infraestructura, API, Frontend, Dominio, Funcional, Seguridad, Performance, Platform Core. **Ninguno de los diez describe, en su definición literal, un cambio al propio Architecture Change Management Standard.** Esto no puede resolverse por inferencia sin violar la restricción de no inventar categorías — se deja constancia expresa: **la clasificación exacta de Tipo NO está documentada** como una categoría de encaje perfecto. El candidato más cercano, por descripción literal, es **"Documentación"** (§4: *"Agregar trazabilidad, notas aclaratorias o ejemplos faltantes, sin alterar comportamiento"*) — coincide parcialmente en que se trata de cerrar una ausencia de trazabilidad ya evidenciada, pero el propio Standard no confirma que un nuevo estado/rama de flujo entre dentro de "sin alterar comportamiento." Esta determinación se deja explícitamente para que el Architecture Review Board la resuelva, tal como ya ocurrió con la pregunta del §11 en ACP-006.

**Clasificación de impacto:** por conteo de documentos (§5), un único documento se ve afectado directamente (el propio Standard) — criterio literal de "Bajo." Sin embargo, ACP-005 clasificó su propio cambio como "Alto" no por conteo de documentos sino porque "introduce un elemento nuevo de primera clase... sin eliminar ni romper nada existente" (§5). Por la misma lógica, un mecanismo nuevo de gobernanza (estado, rama de flujo, campo de plantilla) es, dentro del dominio de gobernanza del propio Standard, un elemento estructural nuevo — aunque los ejemplos literales que el §5 da para "Alto" (Command, Query, endpoint, Aggregate) son construcciones técnicas de un Bounded Context, no de un documento de gobernanza. Se clasifica aquí como **Alto**, por analogía directa con el razonamiento ya empleado por ACP-005 para sí mismo — dejando expresamente señalado que es una extensión analógica, no una coincidencia textual literal, para que el ARB la confirme o la corrija.

**Motivación:** cerrar el vacío normativo que produjo el rechazo automático de ACP-006 v1.1, evidenciado por el Architecture Review Board sin cuestionar el contenido técnico del cambio subyacente.

**Problema:** el Standard no contempla, en ninguna de las secciones §3/§6/§7/§9/§11/§12, ningún mecanismo para regularizar una modificación de un documento Frozen ya ejecutada antes de la existencia de un ACP aprobado — produciendo, para Academia Domain Model v1.2, una situación sin ruta documentada hacia ninguno de los seis estados oficiales, en contradicción directa con el propósito que el propio Standard declara en su §1.

---

## 4. Documentos afectados

**Directo:** Architecture Change Management Standard v1.0 (única reapertura que este ACP autoriza).

**No modificados por este ACP, verificado explícitamente:**
- Platform Core Foundation — no se toca.
- Academia (todos sus documentos, incluido Domain Model v1.2) — no se toca; su disposición final queda pendiente de un ACP posterior, una vez exista el mecanismo.
- Organization Management — no se toca.
- Product Architecture — no se toca.
- ADR-001 — no se toca.

---

## 5. Alcance

### Incluido
- Autorizar la reapertura del Architecture Change Management Standard v1.0, exclusivamente para **estudiar y documentar** un mecanismo de regularización retroactiva de modificaciones ya ejecutadas sobre documentos Frozen.
- El estudio debe cubrir, como mínimo, las seis secciones identificadas con evidencia (§3, §6, §7, §9, §11, §12).

### Excluido
- Diseñar aquí el texto concreto del nuevo estado, la nueva rama de flujo, el nuevo campo de plantilla o la calificación del §11 — corresponde al ciclo de Actualización posterior a la Aprobación.
- Modificar Platform Core Foundation.
- Modificar cualquier documento de Academia (Domain Model, Application Model, Infrastructure Model, API Contract, Blueprint, Functional Specification).
- Modificar Organization Management (Domain Model, Application Model, Infrastructure Model, API Contract).
- Modificar Product Architecture.
- Modificar ADR-001.
- Resolver la disposición final de Academia Domain Model v1.2 (permanece pendiente de un ACP posterior, una vez exista el mecanismo).

---

## 6. Riesgos (solo los respaldados por evidencia, sin mitigaciones)

- Mientras este ACP no se resuelva, Academia Domain Model v1.2 permanece sin ninguna ruta documentada hacia `FROZEN`, `SUPERSEDED` o cualquier otro estado oficial del §3.
- La clasificación de Tipo e Impacto de este propio ACP no tiene un encaje textual exacto en el Standard (Sección 3 de este documento) — riesgo de que el Architecture Review Board deba resolver también esta ambigüedad de clasificación, no solo la de fondo.
- El Standard es, por su propio §2, el documento de mayor autoridad normativa del proyecto ("ningún documento queda exento de su propia regla") — cualquier ambigüedad en su propia clasificación de cambio carece de una autoridad superior a la cual escalar dentro del propio proyecto, más allá del Architecture Review Board.
- La práctica ya evidenciada de "formalización retroactiva" (Academia Domain Model v1.2 citando "ACP-004") sin respaldo normativo escrito continuará ocurriendo de manera no codificada si este ACP no se aprueba.

---

## 7. ACP completo (plantilla oficial, Standard §7)

| Campo | Contenido |
|---|---|
| **ID** | ACP-007 |
| **Título** | Apertura formal para modificar el Architecture Change Management Standard v1.0, con el fin de resolver el vacío normativo de regularización retroactiva de modificaciones ya ejecutadas sobre documentos Frozen |
| **Fecha** | 2026-08-02 |
| **Autor** | Architecture Review Board (origen: rechazo formal de ACP-006 v1.1, fundamentado exclusivamente en el §11 del propio Standard, sin objeción al contenido técnico del cambio subyacente) |
| **Tipo** | **NO DOCUMENTADO como categoría de encaje exacto** — el Standard §4 no define un tipo para cambios sobre sí mismo. Candidato más cercano por descripción literal: **Documentación**. Determinación final reservada al Architecture Review Board. |
| **Clasificación de impacto** | **Alto** — por analogía directa con el razonamiento de ACP-005 (elemento estructural nuevo introducido, sin eliminar ni romper nada existente), no por conteo de documentos (que indicaría "Bajo"). Extensión analógica explícitamente señalada, no coincidencia textual literal — sujeta a confirmación del ARB. |
| **Motivación** | Cerrar el vacío normativo que produjo el rechazo automático de ACP-006 v1.1 por parte del Architecture Review Board, sin que dicho rechazo haya cuestionado el contenido técnico del cambio subyacente. |
| **Problema** | El Standard no contempla, en §3, §6, §7, §9, §11 ni §12, ningún mecanismo para regularizar una modificación de un documento Frozen ya ejecutada antes de la existencia de un ACP aprobado — dejando a Academia Domain Model v1.2 sin ruta documentada hacia ninguno de los seis estados oficiales, en contradicción con el propósito declarado en el propio §1 del Standard. |
| **Evidencia** | Las citas literales de §1, §3, §6, §7, §9, §11 y §12 recogidas en la Sección 2 de este documento; el rechazo formal de ACP-006 v1.1 por el Architecture Review Board, fundamentado exclusivamente en el §11; la referencia de Academia Domain Model v1.2 a "ACP-004" como precedente de formalización retroactiva ya practicado sin respaldo normativo escrito. |
| **Documentos afectados** | **Directo:** Architecture Change Management Standard v1.0. **No modificados:** Platform Core Foundation, Academia (todos sus documentos), Organization Management, Product Architecture, ADR-001. |
| **Dependencias** | Depende del rechazo formal de ACP-006 v1.1 por el Architecture Review Board y de la Investigación de Gobernanza que documentó el vacío normativo. De este ACP dependerá, en el futuro, un ACP posterior que aplique el mecanismo ya estudiado y documentado a la disposición final de Academia Domain Model v1.2 — explícitamente no incluido en el alcance de este ACP. |
| **Impacto** | Sobre el Standard: adición de, como mínimo, un mecanismo nuevo (alcance exacto — estado, rama de flujo, campo de plantilla, o combinación — a determinar en el ciclo de Actualización, no aquí). Sobre cualquier otro documento: ninguno todavía — ningún contrato ya consumido se modifica, porque el mecanismo no existe aún. |
| **Riesgos** | Los enumerados en la Sección 6 de este documento: Academia Domain Model v1.2 sin ruta documentada mientras este ACP no se resuelva; ambigüedad de clasificación de Tipo/Impacto de este propio ACP; ausencia de autoridad superior al Architecture Review Board dentro del proyecto para resolver ambigüedades del documento de mayor jerarquía normativa; continuidad de la práctica no codificada de formalización retroactiva. |
| **Alternativas** | (a) No modificar el Standard y tratar cada futuro caso de modificación ya ejecutada como un rechazo automático definitivo, sin ruta de regularización — descartada por evidencia: contradice directamente el propósito declarado en el propio §1 ("sin un mecanismo formal para cerrarlos después"). (b) Modificar el Standard para incorporar un mecanismo de regularización retroactiva — adoptada como objeto de estudio de este ACP, sin diseñar aquí su contenido concreto. Ninguna alternativa de diseño (nuevo estado, nueva rama de flujo, nuevo campo, calificación del §11, o combinación) se evalúa en este ACP — queda explícitamente abierta al ciclo de Actualización. |
| **Recomendación** | Autorizar la reapertura del Architecture Change Management Standard v1.0 **exclusivamente para estudiar y documentar** un mecanismo de regularización retroactiva — sin prescribir aquí su diseño concreto, siguiendo el mismo patrón de alcance ya empleado por ACP-005 para Platform Core Foundation. |
| **Plan de actualización** | 1) El Standard pasa a `MINOR REVISION` (§3). 2) Se estudia el mecanismo necesario contra las seis secciones identificadas (§3, §6, §7, §9, §11, §12), incluyendo la resolución de la clasificación de Tipo/Impacto de este mismo ACP. 3) Si se aprueba, se documenta e incorpora al texto del Standard. 4) El Standard pasa a una nueva versión FROZEN. Responsable: Architecture Review Board / Architecture Change Control Board (ACCB), dado que el cambio afecta al documento de mayor jerarquía normativa del proyecto. |
| **Plan de validación** | Revisión por el Architecture Review Board (mismo board que emitió el rechazo de ACP-006 v1.1), confirmando que el mecanismo resultante: (a) cierra el vacío evidenciado en las seis secciones; (b) no reabre ninguna resolución arquitectónica ya aprobada (A-01–A-10); (c) no debilita el criterio de rechazo automático del §11 para los casos que sí busca prevenir (modificaciones no divulgadas o de mala fe). |
| **Resultado esperado** | Architecture Change Management Standard v1.x (FROZEN), con un mecanismo formal de regularización retroactiva ya definido, permitiendo que un ACP posterior resuelva la disposición final de Academia Domain Model v1.2 sin activar automáticamente el §11. |
| **Estado del ACP** | **PENDIENTE DE APROBACIÓN** |

---

## 8. Compatibilidad documental

| Documento | ¿Contradicción? |
|---|---|
| Architecture Change Management Standard v1.0 | No — este ACP no modifica el Standard, solo solicita autorización para estudiarlo; toda evidencia citada es literal. |
| ACP-005 | No — se usa como referencia de razonamiento (alcance "estudiar y documentar", clasificación de impacto por analogía), sin reinterpretar su contenido. |
| ACP-006 v1.1 | No — este ACP no reabre ni reinterpreta el rechazo ya emitido; lo toma como motivación y evidencia. |
| Academia Domain Model v1.2 | No — no se modifica; se cita únicamente su "Nota de gobernanza" como evidencia de precedente informal (ACP-004). |

---

## 9. Dictamen

Este ACP contiene los 19 campos de la plantilla oficial, con evidencia trazable en cada afirmación sustantiva, con alcance explícitamente limitado a estudiar (no diseñar) un mecanismo, y con dos ambigüedades de clasificación (Tipo, Impacto) declaradas expresamente en vez de resueltas por invención. **ACP-007 queda listo para Auditoría de Cierre del Architecture Review Board**, con la salvedad expresa de que dicha auditoría deberá pronunciarse también sobre las dos clasificaciones abiertas señaladas en la Sección 3, no solo sobre el fondo del vacío normativo.

Me detengo aquí, conforme a la instrucción explícita. No se ha modificado ningún documento ni propuesto texto de reemplazo para el Standard.
