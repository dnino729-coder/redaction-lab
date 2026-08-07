# RESOLUCIÓN DE GOBERNANZA — Regularización de la ruptura documental confirmada (ACP-008 / ACP-009)

**Versión:** 1.0
**Fecha:** 2026-08-02
**Autor:** Architecture Change Control Board (ACCB), Rédaction Lab
**Naturaleza de este documento:** análisis de gobernanza basado exclusivamente en el texto del Architecture Change Management Standard vigente al momento de su emisión y en `investigacion-forense-cadena-gobernanza-v1.0-2026-08-02.md`. No es un Architecture Change Proposal, no modifica ningún documento, no reconstruye ACP-008 ni ACP-009, no interpreta conversaciones previas como evidencia documental.
**Estado documental:** `EMITIDA` — registro histórico de un análisis puntual. Conforme al Architecture Change Management Standard, §2 (*"Documentos de auditoría/revisión ya emitidos... son registros históricos de un momento dado; nunca se editan, solo se superan mediante una auditoría nueva y posterior"*), este documento no requiere ACP para su emisión y es inmutable una vez emitido.

**Historial de cambios**

| Versión | Fecha | Origen | Cambio |
|---|---|---|---|
| 1.0 | 2026-08-02 | Emisión inicial | Análisis de gobernanza inicial, producido en respuesta a `investigacion-forense-cadena-gobernanza-v1.0-2026-08-02.md`, para determinar la acción de gobernanza correcta ante la ruptura documental confirmada (ausencia física de ACP-008 y ACP-009). |

**Documento base (no modificado):** `investigacion-forense-cadena-gobernanza-v1.0-2026-08-02.md` — cuyas conclusiones se toman como hecho consumado, sin reinterpretación.

---

## 1. Hechos demostrados (evidencia documental directa)

- ACP-008 y ACP-009 no existen como archivos en el repositorio (`investigacion-forense-cadena-gobernanza-v1.0-2026-08-02.md`, verificado por `grep`/`find` directos).
- Standard v1.1 a v1.5.1 citan ACP-008 como autorización de la incorporación del mecanismo de Regularización Retroactiva, y Standard v1.5.1 cita ACP-009 v1.1 como autorización de su última corrección y de su propia Congelación.
- Standard §9: *"ninguna versión nueva sin su ACP citado, salvo la versión inicial."*
- Standard §3, `FROZEN`: *"Inmutable de forma directa: cualquier modificación exige un ACP aprobado."*
- Standard §11, primer criterio de rechazo automático: *"No incluye evidencia trazable a un documento Frozen o a una auditoría formal (opinión sin respaldo)."*
- Standard §1, "Problemas que evita": *"Modificaciones silenciosas a un contrato ya congelado... deriva arquitectónica sin registro."*
- El Standard **no contiene ninguna sección, regla o estado que contemple explícitamente el escenario "un documento fue declarado FROZEN citando un ACP que nunca existió físicamente."**

## 2. Inferencias necesarias (explícitamente marcadas como tales)

- *Inferencia:* dado que §9 exige que toda versión posterior a la original "referencie el ACP correspondiente" y ese ACP no existe, la referencia no satisface sustantivamente el requisito de §9 — es una cita vacía, no una cita real, aunque el campo de texto esté presente.
- *Inferencia:* la ausencia de una regla explícita de "invalidación automática" no equivale a que la condición FROZEN esté correctamente fundamentada — solo significa que el Standard no anticipó este escenario específico.
- *Inferencia:* el propio mecanismo de Regularización Retroactiva (§3 `EN REGULARIZACIÓN`, §4 Tipo `Regularización`, §6.1, §10.1, calificación del §11) fue insertado en el Standard citando el ACP-008 inexistente — por lo que **ese mismo mecanismo no puede usarse para validarse a sí mismo** sin incurrir en razonamiento circular. Su legitimidad, como la del resto del contenido de v1.1–v1.5.1, está pendiente de la misma pregunta que se está investigando.

## 3. Reglas del Standard aplicables

- §9 (trazabilidad — ACP citado obligatorio).
- §3 (definiciones de estado — ninguna encaja perfectamente en este escenario).
- §11 (evidencia trazable como condición de validez de cualquier ACP).
- §1 (propósito general — prevenir deriva arquitectónica sin registro).
- §6, flujo oficial (Solicitud → Análisis → Impacto → Revisión → Aprobación → Actualización → Auditoría → Nueva versión → Congelación) — como referencia del único proceso legítimo ya definido, aplicable por analogía directa (no por invención) a la regularización pendiente.

**Sobre si la ausencia física de un ACP citado invalida automáticamente la condición FROZEN del Standard:** no existe una regla explícita de invalidación automática — el Standard no contempla este escenario. Por inferencia necesaria de §9/§3/§11, la condición `FROZEN` carece de la base evidenciaria que el propio Standard exige, aunque ningún artículo la declare "inválida" en esos términos literales.

## 4. Mecanismo correcto de regularización

**No es el mecanismo de Regularización Retroactiva** — sería circular, dado que ese mismo mecanismo es parte de lo no verificado (Sección 2). **No es "reconstrucción documental"** en el sentido de redactar ahora ACP-008/009 con fecha retroactiva simulando que siempre existieron: eso constituiría, literalmente, la "modificación silenciosa... deriva arquitectónica sin registro" que el propio §1 declara como el problema central que el Standard existe para evitar — fabricar un registro histórico inexistente es lo opuesto a corregirlo.

**Mecanismo correcto:** un **ACP nuevo y real** (fecha de emisión genuina, no retroactiva), tramitado siguiendo íntegramente el flujo oficial del §6 desde su primer paso (Solicitud), antes de cualquier Actualización — exactamente el proceso que nunca se ejecutó para ACP-008/009 en su momento.

**Sobre la naturaleza de una eventual reconstrucción:** redactar ACP-008/009 ahora constituiría **creación de documentos nuevos** — nunca "recuperación de evidencia faltante" (no hay nada que recuperar: la investigación forense demostró que nunca existieron) ni "modificación histórica" (no hay historial real que modificar). Si se presentaran con fecha retroactiva, constituirían además una fabricación de registro, contraria al §1.

## 5. Orden obligatorio de ejecución (recomendación derivada del §6, no una regla ya escrita para este caso exacto)

1. Reconocer expresamente el estado real del Standard (este mismo documento).
2. Presentar un ACP nuevo, con fecha real, que autorice — de manera prospectiva y verificable — el contenido que ACP-008 debía haber autorizado (mecanismo de Regularización Retroactiva), siguiendo Solicitud → Análisis → Impacto → Revisión → Aprobación, **antes** de dar por válida la Actualización ya presente en el texto.
3. Repetir el mismo proceso real para el contenido que ACP-009 debía autorizar (corrección de VALIDACIÓN FINAL) — puede combinarse en el mismo ACP del paso 2 o tramitarse por separado.
4. Solo tras la Aprobación real de ese ACP nuevo, ejecutar Auditoría (§6, paso 7) confirmando que el texto ya existente en el Standard corresponde exactamente a lo recién aprobado.
5. Nueva versión y Congelación, con Historial de cambios que cite el ACP real, no una fecha retroactiva.

No se determina aquí si esto exige uno o dos ACP nuevos, ni su numeración — eso excede el alcance de este análisis.

## 6. Estado documental recomendado para Standard v1.5.1

**`MINOR REVISION`.** Es la opción existente más cercana (no inventada): describe un documento ya `FROZEN` (v1.0, cuya validez no depende de ningún ACP externo, per §9) con contenido pendiente de integrarse mediante autorización real. El ajuste imperfecto se reconoce expresamente: §3 presupone que las "decisiones" ya fueron "aprobadas (vía ACP)" — condición que aquí nunca se cumplió realmente, por lo que el encaje es aproximado, no literal. Una alternativa más drástica —reversión completa a v1.0, descartando el contenido de v1.1–v1.5.1— permanece disponible si el ACP nuevo del punto 5 rechaza el contenido en sí, no solo su falta de respaldo documental.

## 7. Riesgos

- Si se opta por "reconstruir" ACP-008/009 con fecha retroactiva, se repetiría exactamente el problema que el propio Standard busca prevenir (§1).
- Mientras no se resuelva, cualquier documento que dependa de Standard v1.5.1 como marco vigente (incluida cualquier decisión ya tomada citándolo como FROZEN) hereda la misma falta de respaldo evidenciario.
- El mecanismo de Regularización Retroactiva, al no poder validarse a sí mismo, no puede usarse todavía con confianza para ningún otro caso pendiente en el proyecto (p. ej. Academia Domain Model v1.2), agravando el bloqueo ya señalado por la Auditoría de Gobernanza Global.

## 8. Dictamen final

El Standard no contiene un mecanismo ya escrito para este escenario exacto; la vía correcta, por inferencia directa de sus propias reglas (§6, §9, §11) y no por invención, es la emisión de un **ACP nuevo y real** —nunca una reconstrucción retroactiva— que autorice de manera prospectiva y verificable el contenido ya redactado, con Standard v1.5.1 recomendado a `MINOR REVISION` mientras ese ACP no se resuelva.
