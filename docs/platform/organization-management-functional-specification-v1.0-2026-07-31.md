# ORGANIZATION MANAGEMENT — FUNCTIONAL SPECIFICATION v1.0

**Fecha:** 2026-07-31
**Autor:** Product Architect / Product Owner, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001 Organization Management Vision v1.0; Organization Management Scope v1.0; Functional Specification v1.3, Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, API Contract v1.4, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Naturaleza de este documento:** comportamiento funcional puro. No contiene Domain Model, Aggregate, Entity, Value Object, Repository, Command, Query, evento, endpoint ni DTO — eso pertenece a documentos posteriores no autorizados por este encargo.

---

## 1. Objetivo del módulo

**Por qué existe:** porque Academia (Blueprint §14, ítem 1; PND-04; ADR-001 §2) ya diseñó capacidades docentes (revisar progreso, forzar bloqueo/reinicio, recomendar unidades, revisar historial detallado) que dependen de saber "qué Estudiantes están bajo la autoridad de qué Profesor" — información que hoy no existe en ningún lugar del producto.

**Qué problema resuelve:** la ausencia total de una fuente de verdad de pertenencia y autoridad organizacional. Sin ella, esas capacidades de Academia permanecen especificadas pero no operables (adaptador fail-closed, siempre deniega).

**Qué módulos consumirán sus servicios:** únicamente **Academia**, en esta versión (Organization Management Scope v1.0 §6) — para las cuatro capacidades ya identificadas de su capa de Application (`ApplyTeacherOverride`, `AssignUnitToStudent`, `GetStudentProgressSummary`, `GetTeacherOverrideHistory`).

**Qué módulos NO dependen de él:** Dashboard, Mi Plan, Coach IA, Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento — los ocho restantes, sin excepción, confirmados sin ninguna necesidad documentada (Organization Management Scope v1.0 §6).

---

## 2. Modos del producto

### Individual

- **Funcionalidades disponibles:** el recorrido completo de aprendizaje de Academia (P-01 a P-11), Dashboard, Mi Plan, Coach IA, y cualquier otro módulo habilitado — todas, sin ninguna restricción atribuible a Organization Management.
- **Módulos que funcionan:** los 9 módulos listados en el Contexto del producto, todos, de forma completa (ya verificado por evidencia de código para Academia — Product Architecture v1.0 §3).
- **Restricciones existentes:** ninguna — el Modo Individual no es una versión reducida del producto (Product Architecture v1.0, decisión 4).
- **Información que no existe:** ningún registro de Organización ni de Pertenencia para el usuario — no es un estado "vacío" a mostrar, es la ausencia total del concepto para ese usuario.
- **Cómo se comporta Academia:** exactamente igual que hoy, sin cambio — las 11 pantallas de Estudiante (P-01–P-11) no consultan ni requieren ningún dato de Organization Management (confirmado, no asumido).

### Institucional

- **Funcionalidades adicionales que aparecen:** únicamente las ya diseñadas y bloqueadas de Academia — Profesor revisa progreso agregado de sus Estudiantes (CU-09), fuerza bloqueo/reinicio (CU-10), recomienda unidades (CU-11), revisa historial académico detallado (CU-12) — todas ya especificadas en la Functional Specification v1.3 de Academia, no nuevas, solo ahora operables.
- **Módulos nuevos que se habilitan:** ninguno más allá de lo anterior — ningún otro módulo consume Organization Management en esta versión (Sección 1).
- **Qué cambia para el usuario:** adquiere uno o más registros de Pertenencia (a una Organización, con un Rol organizacional) — el resto de su experiencia (Dashboard, Mi Plan, Academia como Estudiante) permanece idéntico.
- **Qué cambia para la organización:** NO DOCUMENTADO — ningún documento define cómo una Organización llega a existir en el sistema ni cómo asocia a sus primeros Miembros (mecanismo de activación, explícitamente diferido en Organization Management Scope v1.0 §5, fuera de alcance de este documento funcional).

---

## 3. Actores

Actores funcionales identificados por evidencia (sin modelarlos):

| Actor | Responsabilidad funcional | Evidencia |
|---|---|---|
| **Persona** | Cualquier usuario del producto antes de tener una Pertenencia — es el estado por defecto del Modo Individual. | Implícito en toda la documentación de Academia (todo usuario existe antes de, y con independencia de, cualquier organización). |
| **Miembro** | Una Persona con al menos un registro de Pertenencia a una Organización. | ADR-001 §5 (Lenguaje Ubicuo Estratégico). |
| **Rol organizacional "Profesor"** | Ejerce autoridad sobre un conjunto de Miembros con Rol "Estudiante" dentro de la misma Organización. | Functional Specification v1.3 de Academia, CU-09 a CU-12 — ya evidenciado y consumido. |
| **Rol organizacional "Estudiante"** | Miembro bajo la autoridad de uno o varios Profesores de su misma Organización. | Mismo origen. |
| **Actor con capacidad de administrar Membresía/Roles** | Responsable de registrar Organizaciones y asociar Miembros con Roles (Organization Management Scope v1.0 §2, capacidades "administrar miembros"/"asignar roles"). | **Necesario por inferencia directa de una capacidad ya congelada, no explícitamente nombrado por ningún documento previo** — se señala así explícitamente, sin inventar un nombre propio (p. ej. "Administrador de Organización") que ningún documento respalda todavía. |

**Actores explícitamente NO evidenciados (se documenta su ausencia, no se inventan):** "Supervisor" e "Invitado" no aparecen en ningún documento Frozen del producto, en ningún contexto — no se incluyen como actores reales de esta especificación.

---

## 4. Casos de uso

*(Comportamiento funcional exclusivamente — sin Commands ni Queries.)*

### Organización

- **UC-OM-01 — Registrar una Organización.** Dado que el actor con capacidad administrativa lo solicita, el sistema registra la existencia de una nueva Organización con su identidad mínima (Organization Management Scope v1.0, capacidad 1). El mecanismo exacto por el cual ese actor obtiene esa capacidad es NO DOCUMENTADO (Sección 2, Modo Institucional).

### Membresía

- **UC-OM-02 — Asociar un Miembro a una Organización.** Dado un Miembro y una Organización ya registrada, el sistema registra la Pertenencia entre ambos.
- **UC-OM-03 — Retirar la Pertenencia de un Miembro.** NO DOCUMENTADO explícitamente en ningún documento previo de esta cadena — se señala como comportamiento razonablemente necesario para que "administrar miembros" (capacidad ya nombrada en el encargo de este documento) tenga sentido operativo completo, sin que ningún documento anterior lo haya especificado en detalle.

### Roles

- **UC-OM-04 — Asignar un Rol organizacional a un Miembro.** Dado un Miembro con Pertenencia a una Organización, el sistema le asocia exactamente un Rol organizacional dentro de esa Organización.
- **UC-OM-05 — Verificar autoridad.** Dado un Miembro con un Rol y otro Miembro de la misma Organización, el sistema responde si el primero tiene autoridad sobre el segundo (Organization Management Scope v1.0, capacidad 3 — generalización del contrato ya Frozen `TeacherStudentRelationshipPort.hasRelationship()`).
- **UC-OM-06 — Enumerar Miembros bajo autoridad.** Dado un Miembro con un Rol, el sistema responde con la colección de Miembros sobre los que ejerce autoridad (capacidad 4 — la capacidad hoy completamente ausente que originó esta investigación, Blueprint §14 ítem 1).

### Academia *(casos de uso ya propios y Frozen de Academia — listados aquí únicamente para mostrar qué queda habilitado, no para redefinirlos)*

- **UC-OM-07 (= CU-09 de Academia) — Revisar progreso agregado.** Un Profesor consulta el progreso de uno o varios Estudiantes bajo su autoridad, resuelta vía UC-OM-05/UC-OM-06.
- **UC-OM-08 (= CU-10 de Academia) — Forzar bloqueo o reinicio.** Un Profesor ejerce esta facultad únicamente sobre Estudiantes bajo su autoridad, verificada vía UC-OM-05.
- **UC-OM-09 (= CU-11 de Academia) — Recomendar unidad.** Igual, verificado vía UC-OM-05.
- **UC-OM-10 (= CU-12 de Academia) — Revisar historial académico detallado.** Igual, verificado vía UC-OM-05.

### Administración

- **UC-OM-11 — Gestionar Membresía y Roles de una Organización.** El actor con capacidad administrativa (Sección 3) ejecuta UC-OM-02 a UC-OM-04 según lo requiera la operación normal de su Organización. No se especifica aquí ninguna interfaz, pantalla ni flujo de aprobación — es comportamiento, no diseño.

---

## 5. Capacidades mínimas — verificación de cobertura de Scope v1.0

| Capacidad exigida por el encargo | ¿Cubierta? | Caso(s) de uso |
|---|---|---|
| Registrar organización | Sí | UC-OM-01 |
| Administrar miembros | Sí | UC-OM-02, UC-OM-03, UC-OM-11 |
| Asignar roles | Sí | UC-OM-04 |
| Verificar autoridad | Sí | UC-OM-05 |
| Enumerar miembros autorizados | Sí | UC-OM-06 |

**"Nada más" — verificado:** ningún caso de uso de la Sección 4 excede estas cinco capacidades. UC-OM-07 a UC-OM-10 no son capacidades nuevas de Organization Management — son casos de uso ya propios de Academia, listados únicamente para trazar el consumo (Sección 4, nota).

---

## 6. Tipos de organización

| Tipo | Estado en v1.0 | Justificación |
|---|---|---|
| Universidad | **Soportado** | Caso ya evidenciado y funcionalmente conectado vía Academia (P-12/P-13/P-15). |
| Colegio | **Soportado** | Idéntico a Universidad — sin diferencia funcional en v1.0 (Estructura/Jerarquía diferida, Scope v1.0 §5). |
| Instituto | **Soportado** | Mismo razonamiento — ningún documento distingue "Instituto" de "Universidad"/"Colegio" en su comportamiento funcional. |
| Academia de idiomas | **Soportado** | El tipo más literalmente alineado con el producto (Rédaction Lab es, en sí, una plataforma de idiomas). |
| Empresa | **Parcialmente soportado** | Compatible a nivel de modelo genérico (ADR-001 §3), pero sin ningún consumidor funcional real en el producto (Academia es instrucción DELF, no capacitación corporativa) — mismo hallazgo honesto ya documentado en Organization Management Scope v1.0 §9. |
| ONG | **Parcialmente soportado** | Mismo razonamiento que Empresa. |
| Gobierno | **Parcialmente soportado** | Mismo razonamiento — equivalente a "Organización pública" ya evaluada en Scope v1.0 §9. |
| Centro de capacitación | **Parcialmente soportado** | Ningún documento distingue si su naturaleza es educativa (equivalente a Instituto) o de formación corporativa (equivalente a Empresa) — clasificación conservadora ante esa ambigüedad no resuelta documentalmente. |
| Otro | **Futuro** | Sin ninguna evidencia — compatible únicamente por el diseño genérico del modelo (ADR-001), sin ningún caso concreto que lo respalde todavía. |

---

## 7. Configuración institucional

**Hallazgo que detiene este documento antes de responder por invención — se documenta explícitamente, per la exigencia de esta cadena de detenerse ante contradicciones:** el encargo pide definir qué podrá personalizar una organización (nombre, logo, idioma, zona horaria, niveles educativos, estructura académica, periodos, terminología). **Ninguno de estos ocho elementos aparece entre las cinco capacidades mínimas ya congeladas en Organization Management Scope v1.0** (Sección 5 de este mismo documento) — ese documento, ya Frozen por esta misma cadena, circunscribió v1.0 a: registrar organización (identidad mínima, sin especificar campos de branding/localización), administrar miembros, asignar roles, verificar y enumerar autoridad. "Nada más" fue una condición explícita de esa versión.

**Resolución (sin modificar Scope v1.0, sin inventar):** todos los ocho elementos de configuración listados en el encargo pertenecen, sin excepción, a la capacidad ya explícitamente **diferida** de "Estructura/Jerarquía configurable" (Organization Management Scope v1.0 §5) o son, en el caso de nombre/logo/idioma/zona horaria, atributos de identidad no especificados por ningún documento como parte de la "identidad mínima" de la capacidad 1. **En consecuencia, en la versión 1.0: ninguno de estos ocho elementos es configurable.** La única personalización real de v1.0 es la que ya existe implícitamente en la capacidad de registrar una Organización (su identidad mínima, sin campos definidos más allá de lo estrictamente necesario para ser referenciada) y en asignar Roles organizacionales a sus Miembros (Sección 4). Cualquier configuración más rica queda, correctamente, para una versión futura que retome la Estructura/Jerarquía diferida.

---

## 8. Adaptabilidad

El ejemplo del encargo (Universidad: Facultad/Programa/Semestre/Grupo; Colegio: Grado/Curso/Sección; Empresa: Área/Equipo/Programa) describe exactamente la capacidad de **Estructura/Jerarquía configurable multi-nivel** ya identificada y explícitamente **diferida** en Organization Management Scope v1.0 (§5) — no forma parte del comportamiento funcional de esta versión 1.0.

**Lo que sí es cierto, como principio arquitectónico ya congelado (ADR-001, Principio 3 y 6), sin ser todavía comportamiento de v1.0:** el modelo eventual de Organization Management está diseñado para que, en una versión futura, cada Organización pueda definir su propia terminología y niveles de subdivisión sin que eso requiera un cambio de código distinto por tipo de organización — es una promesa de diseño para el futuro, no una capacidad presente. Esta especificación v1.0 no describe ningún comportamiento de adaptabilidad estructural, porque ese comportamiento no existe todavía.

---

## 9. Relación con Academia

**Qué consume Academia:** exclusivamente el resultado de UC-OM-05 (verificar autoridad) y UC-OM-06 (enumerar autoridad), para las cuatro piezas ya identificadas de su capa de Application (`ApplyTeacherOverride`, `AssignUnitToStudent`, `GetStudentProgressSummary`, `GetTeacherOverrideHistory`) — ya aisladas, sin tocar el resto de Academia (Product Architecture v1.0 §3).

**Qué nunca debe conocer Academia:** la Estructura/Jerarquía interna de una Organización, ni ningún dato de Miembros no relacionados con su propia autoridad docente sobre Estudiantes específicos — mismo límite ya congelado en ADR-001 §7.

**Qué sigue siendo responsabilidad exclusiva de Organization Management:** la existencia de la Organización, la Pertenencia y el Rol de cada Miembro, y toda la lógica de verificación/enumeración — Academia nunca almacena ni deriva esta información por sí misma; siempre la consulta.

---

## 10. Exclusiones

*(Reafirmando, en términos exclusivamente funcionales, las ya congeladas en Organization Management Scope v1.0 §3 — sin repetir su justificación técnica, solo el comportamiento que nunca ocurrirá.)*

- **ERP:** el producto nunca planificará recursos, activos ni finanzas de una Organización.
- **Facturación / Pagos:** el producto nunca procesará cobros, suscripciones ni licencias — ningún flujo de pago existe en esta especificación.
- **LMS completo:** el producto nunca gestionará currículos, calificaciones ni progreso educativo desde Organization Management — eso permanece, sin excepción, en Academia/Evolución.
- **Evaluaciones:** ningún Miembro será evaluado, calificado ni certificado por este módulo.
- **Calendarios:** Organization Management nunca programará ni gestionará horarios — eso pertenece a Mi Plan.
- **Notas:** ninguna calificación se almacena ni se calcula aquí.
- **Biblioteca:** ningún contenido educativo se gestiona aquí — eso pertenece a la Biblioteca de Modelos de Academia.
- **RRHH:** ningún dato laboral (contrato, nómina, desempeño) de un Miembro se gestiona aquí, ni siquiera para el tipo de organización "Empresa".
- **Inventarios:** ningún recurso físico o digital se administra aquí.

---

## 11. Riesgos (exclusivamente funcionales)

- **Sin punto de entrada real:** al no definirse (por estar fuera de alcance de este documento) el mecanismo de activación institucional, ningún usuario real puede hoy convertirse efectivamente en Miembro — la especificación es completa, pero no ejecutable de punta a punta hasta que ese mecanismo se decida en otro documento.
- **Confusión entre Rol de plataforma y Rol organizacional:** un usuario podría no entender por qué su Rol de plataforma (`TEACHER`) no le otorga automáticamente autoridad sobre ningún Estudiante sin una Pertenencia y Rol organizacional adicionales — riesgo de experiencia de usuario, no técnico.
- **Expectativa desalineada en tipos "parcialmente soportados":** una Empresa u ONG que registre su Organización podría esperar funcionalidad real (como la que Academia ya ofrece a Universidades) y encontrar, en esta versión, solo compatibilidad de modelo sin ningún flujo conectado — riesgo de decepción de producto si no se comunica esta limitación explícitamente.
- **Percepción de incompletitud en organizaciones con subdivisión real:** una Universidad con facultades/programas reales podría percibir el producto como insuficiente desde el primer uso, al no existir todavía la Estructura/Jerarquía configurable (diferida) — riesgo funcional de adopción, no de arquitectura.

---

## 12. Dependencias

**Módulos que necesitan Organization Management:** únicamente Academia, y solo para sus cuatro capacidades docentes ya identificadas (Sección 1, 9).

**Módulos completamente independientes:** Dashboard, Mi Plan, Coach IA, Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento — los ocho restantes, sin ninguna dependencia funcional documentada.

---

## 13. Escenarios

- **Usuario individual:** no tiene ninguna Pertenencia; usa Dashboard, Mi Plan, Academia (P-01–P-11), Coach IA y cualquier otro módulo habilitado exactamente igual que cualquier otro usuario — cero interacción con Organization Management, en cualquier punto de su experiencia.
- **Profesor universitario:** es Miembro de una Organización de tipo Universidad, con Rol organizacional "Profesor"; puede invocar UC-OM-05/UC-OM-06 para verificar/enumerar sus Estudiantes, habilitando así CU-09 a CU-12 de Academia (revisar progreso, forzar bloqueo/reinicio, recomendar, revisar historial) exactamente como esas pantallas ya fueron diseñadas.
- **Universidad:** existe como Organización registrada (UC-OM-01, mecanismo de creación fuera de alcance); sus Profesores y Estudiantes son Miembros con sus respectivos Roles organizacionales (UC-OM-02/UC-OM-04); el único comportamiento visible del lado de la Organización, en esta versión, es que sus Profesores pueden ejercer las facultades ya descritas arriba.
- **Colegio:** comportamiento idéntico al de Universidad en esta versión — ninguna diferencia funcional (Sección 6).
- **Instituto:** comportamiento idéntico.
- **Academia de idiomas:** comportamiento idéntico — el caso más natural del producto.
- **Empresa:** puede registrarse como Organización y asociar Miembros con Roles (UC-OM-01 a UC-OM-04) a nivel de modelo, pero no existe, en esta versión, ningún flujo de Academia (ni de ningún otro módulo) diseñado para un caso de capacitación corporativa distinto del ya existente para Profesor/Estudiante — el comportamiento observable para una Empresa, hoy, es idéntico al de registrar Miembros sin que ningún módulo consuma esa información de forma diferenciada.

---

## 14. Auditoría

Verificación explícita, sección por sección, de que este documento no contiene diseño de dominio:

- **¿Aparecen entidades?** No — "Organización", "Miembro", "Rol" se usan exclusivamente como conceptos de comportamiento (Sección 3, 4), nunca como Aggregate/Entity/Value Object con atributos o invariantes.
- **¿Aparecen Commands?** No — los "UC-OM-XX" de la Sección 4 son casos de uso narrativos, sin firma, sin nombre de clase, sin forma de entrada/salida.
- **¿Aparecen Queries?** No — "verificar autoridad"/"enumerar autoridad" se describen como comportamiento, no como contrato técnico.
- **¿Aparecen APIs?** No — ningún endpoint, verbo HTTP ni URI se menciona en ningún punto.
- **¿Aparece diseño de dominio?** No — ninguna decisión de Aggregate, invariante o regla de negocio interna se toma aquí; las únicas decisiones ya tomadas (Sección 7, 8) son de **alcance**, heredadas explícitamente de Organization Management Scope v1.0, no nuevas.

**Este documento se detiene aquí.** No se avanza al Domain Model. No se propone ninguna mejora futura fuera de lo ya señalado como riesgo (Sección 11) o diferido (Secciones 7, 8), ambos ya congelados por documentos anteriores de esta misma cadena.
