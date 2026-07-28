# Architecture Review Board — Resolución de Pendientes Funcionales — Módulo Academia

**Comité:** ARB, Rédaction Lab. **Documento revisado:** `academia-functional-specification-v1.0-2026-07-19.md`. **Fecha:** 2026-07-19. **Alcance:** exclusivamente los cinco PENDIENTE DE DECISIÓN FUNCIONAL detectados en dicho documento. No se revisa ni se modifica el Domain Model, el Change Proposal CH-01 ni el Application Model. No se reescribe la Especificación Funcional.

---

## PENDIENTE 1 — CU-11, "Asignar unidad"

**DECISIÓN:** Opción A. *Asignar = recomendar.* La acción del Profesor registra una recomendación/priorización visible para el estudiante sobre una unidad específica. No modifica `UnitState`. No desbloquea. No es equivalente ni sustituto de `FORCE_LOCK`/`FORCE_RESTART`.

**JUSTIFICACIÓN:** La Opción B (asignar = desbloquear) exige incorporar una nueva capacidad de override (`FORCE_UNLOCK` o equivalente) al `TeacherOverride`/`TeacherOverridePolicy` del Domain Model — una extensión de dominio, expresamente prohibida en este ARB ("No modificar el Domain Model"). La Opción A, en cambio, es plenamente compatible con lo ya resuelto: A-03 establece que el desbloqueo depende únicamente de completar la unidad anterior, sin excepciones por prioridad o recomendación; A-10 ya agota las facultades de intervención directa del Profesor sobre el estado de una unidad (bloqueo y reinicio forzados) sin mencionar una tercera facultad de desbloqueo. Tratar "asignar" como señal informativa es, además, consistente con el tratamiento ya dado a las recomendaciones del Motor Pedagógico (Sección 4 de la Especificación: afectan únicamente orden/énfasis de presentación, nunca el estado de bloqueo). Se descarta la Opción C: no existe evidencia documental que justifique una tercera interpretación distinta de A o B.

**IMPACTO:** CU-11 queda completo: flujo principal = el Profesor selecciona un estudiante/grupo y una unidad, y el sistema registra la recomendación como metadato asociado al estudiante; resultado = la unidad aparece destacada/priorizada en el mapa de unidades del estudiante, sin alterar su estado real. A nivel de Application Model, CMD-11 (`AssignUnitToStudent`) queda confirmado como una operación que no invoca al agregado `AcademyUnit` ni a ninguna Policy de desbloqueo — coincide con la "Lectura 1" ya identificada en la auditoría Domain-vs-Application previa (posible pertenencia al Bounded Context de Espacio del Profesor, fuera de Academia en sentido estricto).

**RIESGO:** Confusión del estudiante si la interfaz no distingue con claridad una unidad "recomendada por el profesor" (aún bloqueada, si no ha llegado su turno) de una unidad "desbloqueada". Riesgo de UX, no de dominio ni de datos.

**ACCIONES NECESARIAS:**
1. Actualizar el texto de CU-11 en la Especificación Funcional (revisión menor, ver Dictamen).
2. Confirmar en el Application Model que CMD-11 no depende de ninguna Policy de `AcademyUnit`.
3. Definir, en la fase de UX/Infrastructure, una marca visual explícita ("Recomendada por tu profesor") distinta del estado de desbloqueo real.

---

## PENDIENTE 2 — Editor de Escritura

**DECISIÓN:** Opción B. *El Editor es una funcionalidad interna exclusiva de Academia*, no un módulo independiente compartido a nivel de dominio.

**JUSTIFICACIÓN:** El Domain Model v1.1 (Frozen) ya modela `Draft` y `Version` como entidades internas del agregado `Attempt`, propiedad exclusiva de Academia. Definir el Editor como módulo independiente exigiría extraer esas entidades a un Bounded Context propio y redefinir su propiedad — modificación de Domain Model, prohibida en este ARB. Es además consistente con el principio ya vinculante de Arquitectura Feature-Driven ("una feature nunca accederá directamente a otra"): ningún ecosistema hermano (Laboratorio, Simulador) consume ni comparte estado de escritura con Academia en ningún documento ya aprobado.

**IMPACTO:** Si Laboratorio o Simulador necesitan en el futuro una superficie de escritura equivalente, deberán modelar su propio mecanismo dentro de su propio Bounded Context, sin dependencia funcional de Academia. Esto no impide compartir, a nivel de interfaz (Design System), un mismo componente visual de edición de texto — decisión de implementación, sin implicación de dominio, fuera del alcance de este documento.

**RIESGO:** Posible duplicación de esfuerzo de implementación entre ecosistemas al construir mecanismos de escritura equivalentes por separado. Riesgo aceptado y mitigable a nivel de Design System, sin acoplar dominios.

**ACCIONES NECESARIAS:**
1. Retirar el pendiente de la Sección 9 de la Especificación Funcional, dejando constancia de que "Editor" designa el mecanismo interno de Draft/Version de Academia.
2. Documentar, en el futuro Frontend/Infrastructure Model, la opción de un componente de UI de edición reutilizable entre ecosistemas, explícitamente como decisión de presentación, no de dominio.

---

## PENDIENTE 3 — Retroalimentación IA: síncrona / asíncrona / híbrida

**DECISIÓN:** *Híbrida.* Procesamiento asíncrono orientado a eventos como mecanismo de base, con una experiencia de espera acotada y comunicada al estudiante. Ventana objetivo de entrega: hasta 60 segundos en el caso típico; techo de espera de 3 minutos, tras el cual el sistema notifica al estudiante (vía el sistema de notificaciones ya existente) que la retroalimentación seguirá disponible cuando esté lista, sin bloquear su sesión ni obligarlo a permanecer esperando.

**JUSTIFICACIÓN:**
- *UX:* el Domain Model ya modela `ProductionSubmitted` → `FeedbackRequested` → `FeedbackDelivered` como eventos separados, no como una operación atómica — evidencia de que el diseño ya asumía desacople, no entrega instantánea garantizada. Una espera acotada y comunicada evita tanto el spinner indefinido como la falsa promesa de instantaneidad.
- *Costos:* generar retroalimentación estructurada en 10 categorías jerarquizadas por unidad de texto es una operación de IA no trivial; forzarla a ser síncrona en cada envío elevaría el costo por invocación pico y penalizaría la escalabilidad bajo carga simultánea (por ejemplo, muchos estudiantes enviando producciones al final de una sesión de clase).
- *Escalabilidad:* un patrón asíncrono orientado a eventos (ya presente en el Application Model como el "Patrón de Sincronización Attempt→AcademyUnit" con dos transacciones separadas) absorbe picos de demanda sin degradar la experiencia de otros estudiantes.
- *Experiencia pedagógica:* el principio de recuperación activa (§7.3) se sostiene mejor con una espera breve y predecible que con una demora indefinida; el umbral de 60 segundos preserva la sensación de continuidad del aprendizaje sin exigir infraestructura de tiempo real costosa.

**IMPACTO:** Resuelve directamente el riesgo ya señalado en la Sección 11 de la Especificación Funcional (ausencia de SLA) y en la Sección 14 (abandono de sesión por espera no acotada). Establece un contrato de UX claro para CU-04.

**RIESGO:** Si la infraestructura real de IA no logra sostener el umbral de 60 segundos de forma consistente, el techo de 3 minutos y la notificación diferida deben tratarse como piso mínimo aceptable, no como objetivo — riesgo de infraestructura, a validar en el Infrastructure Model.

**ACCIONES NECESARIAS:**
1. Incorporar esta definición como regla funcional visible en la Sección 11 de la Especificación Funcional (revisión menor).
2. Trasladar el umbral (60s objetivo / 3min techo) como requisito no funcional al futuro Infrastructure Model.
3. Confirmar con el sistema de notificaciones (§13.10) el evento a emitir cuando se supera el techo de espera.

---

## PENDIENTE 4 — Bloqueo docente durante sesión activa

**DECISIÓN:** El bloqueo aplicado por el Profesor (`FORCE_LOCK`, A-10) surte efecto de inmediato sobre el estado de la unidad, pero no interrumpe abruptamente la interacción que el estudiante tiene en curso en ese instante. El contenido en el que estaba trabajando permanece guardado (autoguardado ya garantizado por A-06). La restricción se manifiesta en la **siguiente acción** del estudiante que requiera que la unidad esté `UNLOCKED`/`IN_PROGRESS` (enviar producción, avanzar de paso, o reingresar tras salir): en ese momento, el sistema informa, en tono no punitivo, que la unidad fue pausada por su profesor, y que su trabajo permanece guardado y disponible en cuanto la unidad vuelva a estar disponible.

**JUSTIFICACIÓN:** Esta definición no contradice ninguna resolución vigente: A-10 exige que el bloqueo sea efectivo y quede registrado, lo cual se cumple (el estado cambia de inmediato). A-06 exige que el trabajo en curso nunca se pierda, lo cual también se cumple (nada se descarta; solo se restringe el avance). No se inventa una tercera regla: se combina la aplicación inmediata del estado (ya resuelta) con la garantía de continuidad (ya resuelta), sin necesidad de una interrupción forzada de sesión que ninguna fuente exige ni prohíbe expresamente.

**IMPACTO:** Cierra el riesgo de UX señalado en la Sección 14 de la Especificación Funcional. Da a CU-10 (Forzar bloqueo o reinicio) un efecto completamente determinista y verificable desde la perspectiva del estudiante.

**RIESGO:** Si el estudiante está a mitad de un paso con contenido no autoguardado en el instante exacto del bloqueo (ventana entre keystroke y autoguardado), podría percibir pérdida de trabajo — riesgo técnico de implementación del autoguardado, no de esta regla funcional, y ya cubierto en general por el contrato de continuidad de A-06.

**ACCIONES NECESARIAS:**
1. Incorporar esta regla en la Sección 8 (Reglas funcionales) y en la Sección 14 (Riesgos) de la Especificación Funcional, retirando el pendiente.
2. Especificar, en el Infrastructure Model, la frecuencia de autoguardado necesaria para sostener esta garantía en la práctica.

---

## PENDIENTE 5 — Accesibilidad

**DECISIÓN:** Nivel mínimo obligatorio para Academia: **WCAG 2.1 nivel AA**, aplicado explícitamente a los siguientes puntos:
- **Contraste:** mínimo 4.5:1 para texto normal, 3:1 para texto grande, en todo el recorrido de la unidad y en la retroalimentación mostrada.
- **Teclado:** los 11 pasos de una unidad, la producción de texto y la navegación del mapa de unidades deben ser completamente operables sin mouse.
- **Lectores de pantalla:** estructura semántica navegable por paso (encabezados, landmarks, estados anunciados al cambiar), incluidas las categorías de retroalimentación.
- **Navegación:** el orden de foco sigue el orden secuencial de los 11 pasos, sin trampas de foco.
- **Responsive:** Academia hereda el estándar responsive ya vigente a nivel de plataforma, sin excepción por tratarse de contenido extenso (texto escrito).
- **Neurodiversidad:** sin límites de tiempo forzados dentro de una unidad — coherente con A-06 (sin expiración por abandono) y con el principio ya vigente de tono no punitivo (§8.6); esto ya constituye, de por sí, una accesibilidad cognitiva de base sin necesidad de una regla adicional.

**JUSTIFICACIÓN:** Ninguna fuente revisada establecía un nivel específico para Academia; WCAG 2.1 AA es el estándar mínimo esperable para una plataforma educativa pública, y no contradice ni reduce ningún estándar general ya vigente en el Design System del proyecto (§14.9) — de existir allí un nivel igual o superior, esta decisión no lo sustituye, lo confirma como piso para Academia.

**IMPACTO:** Cierra el pendiente de la Sección 11 de la Especificación Funcional con un criterio verificable y auditable.

**RIESGO:** Si el Design System general (§14.9) ya definía un nivel distinto (superior o con matices no revisados en este ARB), corresponde validar consistencia antes del Infrastructure Model — riesgo de trazabilidad documental, no de contenido.

**ACCIONES NECESARIAS:**
1. Incorporar este nivel mínimo en la Sección 11 de la Especificación Funcional, retirando el pendiente.
2. Verificar, antes del Infrastructure Model, que esta decisión no entra en conflicto con el nivel ya establecido en el Design System general del proyecto (§14.9).

---

## DICTAMEN FINAL

**2. Academia requiere una revisión menor.**

**Justificación:** los cinco pendientes quedan resueltos de forma definitiva, sin necesidad de modificar el Domain Model, el Application Model ni ninguna resolución A-01–A-10, y sin abrir ninguna contradicción nueva. Sin embargo, el documento `academia-functional-specification-v1.0-2026-07-19.md` todavía contiene, en su texto, las cinco marcas "PENDIENTE DE DECISIÓN FUNCIONAL" tal como fueron detectadas — este ARB no reescribe el documento, por lo que el artefacto en su estado actual no puede declararse Frozen. La actualización necesaria es estrictamente mecánica: incorporar las cinco decisiones ya emitidas en las secciones correspondientes (7, 8, 9, 11, 14), sin alterar ninguna otra parte del documento. Cerrada esa actualización (Especificación Funcional v1.1), Academia queda en condiciones de declararse oficialmente Frozen sin nueva iteración completa.
