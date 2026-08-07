# ORGANIZATION MANAGEMENT SCOPE v1.0

**Fecha:** 2026-07-31
**Autor:** Product Architect / Enterprise Architect / DDD Expert / Software Architect / Product Owner, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001 Organization Management Vision v1.0; Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, Functional Specification v1.3, API Contract v1.4, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Naturaleza de este documento:** alcance funcional de la versión 1.0 del Bounded Context Organization Management — qué pertenece y qué queda fuera. No diseña el dominio, no crea entidades ni código.

---

## 1. Objetivo del módulo

La misión de Organization Management dentro de Rédaction Lab es, exclusivamente: **ser la fuente de verdad de quién pertenece a qué Organización, con qué Rol organizacional, bajo la autoridad de quién** — y exponer esa verdad como un contrato de consulta mínimo a los Bounded Contexts que lo necesiten. No es, ni en su versión 1.0 ni en ninguna futura por diseño (ADR-001, Principio 4), un módulo de gestión educativa, administrativa, financiera ni de contenido. Su único objetivo funcional hoy, evidenciado por un consumidor real, es desbloquear las capacidades docentes de Academia (P-12/P-13/P-15) ya diseñadas pero no operables (Blueprint §14, ítem 1; PND-04).

---

## 2. Responsabilidades incluidas

| Capacidad | Justificación |
|---|---|
| **Registrar la existencia de una Organización** (identidad mínima). | Precondición lógica de cualquier otra capacidad — sin esto no hay "a qué" pertenecer. Congelado como concepto en ADR-001 §5 ("Organización"). |
| **Registrar la Pertenencia de un Miembro a una Organización.** | Es, literalmente, la información que Academia ya necesita y no puede obtener hoy (PND-04: "Academia necesita recibir una lista de `StudentId` ya resuelta"). |
| **Registrar el Rol organizacional que un Miembro ejerce dentro de una Organización.** | Necesario para responder la pregunta real ya bloqueada: "¿quién es Profesor de quién?" — sin colisionar con el rol de plataforma (ADR-001, Principio 8). |
| **Exponer un contrato de verificación de autoridad** (¿tiene el Miembro X, con Rol R, autoridad sobre el Miembro Y?). | Es, literalmente, el contrato ya previsto y Frozen del lado de Academia (`TeacherStudentRelationshipPort.hasRelationship()`) — esta capacidad ya tiene un consumidor real esperando. |
| **Exponer un contrato de enumeración de autoridad** (¿qué Miembros están bajo la autoridad del Miembro X?). | Es la capacidad hoy completamente ausente que originó toda esta investigación (Blueprint §14, ítem 1: "no existe endpoint para listar los estudiantes de este profesor"). |

Estas cinco capacidades son, sin excepción, una traducción directa de necesidades ya documentadas y evidenciadas — ninguna se ha inventado para esta versión.

---

## 3. Responsabilidades excluidas

| Excluido | Justificación de la exclusión |
|---|---|
| **Evaluación pedagógica** | Pertenece exclusivamente a Academia (`Attempt`/`Version`, Domain Model v1.1) — Organization Management nunca conoce si una producción fue evaluada (ADR-001, Principio 4). |
| **Contenidos** | Pertenecen a Academia (Biblioteca de Modelos, `StepContentPanel`) — ningún contenido pedagógico cruza hacia Organization Management. |
| **Producción escrita** | Pertenece exclusivamente a Academia (`Version`) — mismo razonamiento, ya prohibido explícitamente en el Lenguaje Ubicuo de ADR-001 §5. |
| **IA** | Pertenece a Coach IA / al estándar de AI Provider del Platform Core — Organization Management nunca invoca modelos de lenguaje ni decide recomendaciones. |
| **Dashboard** | Es un módulo agregador de solo lectura de otros dominios (Product Architecture v1.0 §2) — Organization Management no le pertenece ni lo alimenta directamente en esta versión (Sección 6). |
| **Mi Plan** | Módulo exclusivamente individual por diseño ya Frozen (resoluciones 18.20-18.24) — sin ningún concepto organizacional en su especificación. |
| **Autenticación** | Ya resuelta 100% por Clerk a nivel de Platform Core (`Permission Catalog`, Domain Model §12.5-12.6) — Organization Management nunca gestiona sesiones, JWT ni credenciales; solo registra membresía, una vez que la identidad ya fue autenticada por el mecanismo existente. |
| **Facturación / Pagos** | NO DOCUMENTADO en ningún documento del producto — ningún módulo, ni siquiera Platform Core, modela billing o suscripciones (Organization Strategy v1.0 §1). Fuera de alcance salvo decisión de producto futura explícita, no inventada aquí. |
| **LMS (Learning Management System) completo** | Academia ya es, por diseño Frozen, el motor pedagógico del producto — Organization Management no gestiona currículos, calificaciones ni progreso; solo membresía y autoridad (Sección 1). |
| **ERP** | Ninguna evidencia documental de necesidad de planeación de recursos empresariales — incluirlo violaría directamente el riesgo ya señalado en ADR-001/Organization Strategy v1.0 de sobreingeniería sin evidencia real. |
| **CRM** | Ninguna evidencia de necesidad de gestión de relaciones comerciales/prospectos — mismo razonamiento. |
| **RRHH** | Incluso para el tipo de organización "Empresa", Organization Management no gestiona nómina, contratos laborales ni evaluación de desempeño de empleados — solo su membresía y rol *dentro del producto*, nunca su relación laboral real. |
| **Horarios / Calendario** | Ya pertenece a Mi Plan (`StudySchedule`, `DailyPlan`/`WeeklyPlan`) — módulo individual, sin relación con estructura organizacional. |
| **Notas (calificaciones)** | Domain Model de Academia (A-05) ya prohíbe explícitamente que Academia almacene puntuación de certificación — Organization Management, con mayor razón, nunca calcula ni almacena notas. |
| **Certificados** | NO DOCUMENTADO — ya señalado en Product Architecture v1.0 (§8) como un módulo separado y futuro, sin relación de diseño con Organization Management hasta que exista evidencia real. |
| **Biblioteca** | La única "Biblioteca" documentada en el producto es la Biblioteca de Modelos de Academia (`ModelExample`) — sin ninguna relación con estructura organizacional. |
| **Inventarios** | Ninguna evidencia de necesidad — mismo territorio que ERP, explícitamente fuera. |

---

## 4. Capacidades mínimas de la versión 1.0

Determinadas exclusivamente por el único consumidor real y evidenciado (Academia, Sección 6):

1. Registrar una Organización (identidad mínima, sin estructura interna todavía — ver Sección 5).
2. Asociar un Miembro a una Organización con exactamente un Rol organizacional.
3. Responder el contrato de verificación de autoridad (booleano).
4. Responder el contrato de enumeración de autoridad (colección).

**Aclaración explícita, para prevenir una lectura contradictoria con ADR-001:** que el modelo de dominio deba ser genérico y extensible (ADR-001, Decisión de la Sección 3, Principio 6) **no exige que la versión 1.0 implemente ya una Estructura/Jerarquía configurable multi-nivel** — exige únicamente que nada en esta versión 1.0 impida construirla después. Las cuatro capacidades mínimas de esta sección son compatibles con una Organización sin subdivisiones internas (Miembros asociados directamente a la Organización, sin Unidades organizacionales todavía) — la genericidad del *modelo eventual* y el alcance *mínimo de esta versión* son preguntas distintas; este documento resuelve la segunda, no reabre la primera.

---

## 5. Capacidades diferidas

| Capacidad diferida | Por qué se pospone |
|---|---|
| **Estructura/Jerarquía configurable multi-nivel** (Unidades organizacionales, departamentos, sedes, facultades) | Ningún consumidor real hoy la necesita — Academia solo requiere membresía directa Organización↔Miembro. Construirla sin un segundo caso de uso real violaría el criterio de exclusión por defecto ya aplicado consistentemente en todo el producto (Platform Core Foundation §2: "nunca por anticipación especulativa"). |
| **Relaciones organización-a-organización** (franquicias, redes de colegios, sedes múltiples con jerarquía propia) | Mismo razonamiento — ADR-001 (§8) ya señaló que esto depende de evidencia real, no disponible hoy. |
| **Mecanismo de activación del Modo Institucional** (cómo se crea una Organización, cómo un usuario se asocia a ella) | Ya señalado como riesgo residual explícito en ADR-001 (§11, riesgo 3) — requiere una decisión de producto propia, no de alcance. |
| **Multi-tenancy institucional** (aislamiento de datos entre Organizaciones distintas) | Decisión de Infrastructure, ortogonal al alcance funcional (ADR-001 §8/§11, riesgo 2) — no se resuelve en un documento de Scope. |
| **Soporte funcional concreto para tipos de organización distintos de la Universidad/Colegio/Academia de idiomas ya evidenciados por Academia** (Empresa, ONG, gobierno) | El modelo permanece genérico (no se cierra la puerta), pero ningún módulo del producto consume hoy un caso de Empresa/ONG real — construir ese soporte en detalle sin consumidor sería sobreingeniería (Sección 11). |

---

## 6. Consumidores del módulo

| Módulo | ¿Consume en v1.0? | Qué información necesitaría | Qué nunca debería solicitar |
|---|---|---|---|
| **Academia** | **Sí — único consumidor real y evidenciado.** | El resultado de los contratos de verificación y enumeración de autoridad (Sección 4, capacidades 3 y 4), para las 4 piezas ya identificadas (`ApplyTeacherOverride`, `AssignUnitToStudent`, `GetStudentProgressSummary`, `GetTeacherOverrideHistory`). | La Estructura/Jerarquía interna de la Organización, ni ningún dato de otros Miembros no relacionados con su propia autoridad docente. |
| **Dashboard** | No — sin evidencia real (Organization Strategy v1.0 §6). | NO DOCUMENTADO ninguna necesidad hoy. | Cualquier dato organizacional, mientras no exista evidencia real. |
| **Mi Plan** | No — módulo exclusivamente individual. | Ninguna. | Cualquier dato organizacional. |
| **Coach IA** | No — capacidad transversal sobre el individuo. | Ninguna. | Cualquier dato organizacional. |
| **Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento** | No — todos placeholder, sin especificación que mencione estructura organizacional. | Ninguna. | Cualquier dato organizacional, hasta evidencia real. |
| **Platform Core** | Relación inversa: Organization Management consume al Platform Core (Notification/Error/Permission/Audit Catalog, Logging, Configuration, Secrets, Observability), nunca al revés. | Los componentes ya reconocidos del Core, igual que cualquier otro módulo. | El Core nunca solicita nada a Organization Management — regla universal ya vigente (Platform Core Foundation §6). |

---

## 7. Modo Individual

Cuando un usuario no pertenece a ninguna Organización, Organization Management simplemente **no tiene ningún registro de Pertenencia para ese usuario** — no existe un "modo degradado" ni una configuración especial que activar o desactivar; es la ausencia de un dato, no un estado del sistema.

**Verificación módulo por módulo (los 9 listados en el Contexto):**
- **Dashboard, Mi Plan, Coach IA, Laboratorio, Evolución, Centro de Entrenamiento, Simulador, Gamificación:** ninguno de estos 8 módulos consume Organization Management en absoluto (Sección 6) — su funcionamiento es, por definición, completamente independiente, no solo "compatible".
- **Academia (modo estudiante, P-01–P-11):** ya verificado por evidencia de código (Product Architecture v1.0 §3) que ninguna Query/Command de estas 11 pantallas importa el contrato de Organization Management — el recorrido completo de aprendizaje funciona de punta a punta sin ningún registro de Pertenencia.

**Conclusión:** ningún módulo obligatorio de la plataforma depende de Organization Management para operar en Modo Individual — confirmado, no asumido.

---

## 8. Modo Institucional

El cambio conceptual es exclusivamente aditivo: cuando un usuario **sí** tiene uno o más registros de Pertenencia (Organización + Rol), esa información queda disponible para ser consultada por los módulos que la necesiten. En el alcance de esta versión 1.0 (Sección 6), **el único módulo cuyo comportamiento cambia realmente es Academia** — sus pantallas de Profesor/Administrador (P-12/P-13/P-15), hoy bloqueadas por un adaptador fail-closed, pasan a ser operables porque el contrato que ya invocan (`TeacherStudentRelationshipPort`) obtiene, por primera vez, una respuesta real en vez de `false` constante.

Ningún otro módulo cambia de comportamiento en esta versión, porque ninguno otro lo consume (Sección 6) — el cambio conceptual del Modo Institucional, en el alcance de v1.0, se limita exactamente a esa única pieza. **No se diseña aquí** cómo un usuario o una Organización llegan a tener ese registro de Pertenencia (mecanismo de activación, Sección 5, diferido).

---

## 9. Escenarios de uso

| Escenario | Responsabilidades relevantes del módulo |
|---|---|
| **Usuario individual** | Ninguna — cero interacción con Organization Management (Sección 7). |
| **Universidad** | Las 4 capacidades mínimas (Sección 4): Profesores de esa Universidad verifican/enumeran autoridad sobre sus Estudiantes — es el caso ya evidenciado por Academia P-12/P-13/P-15. |
| **Colegio** | Idéntico al caso Universidad en el alcance de v1.0 — ninguna diferencia funcional entre ambos tipos, porque la Estructura/Jerarquía diferenciadora (Sección 5) está diferida. |
| **Academia de idiomas** | Idéntico — es, de hecho, el tipo de organización más literalmente alineado con el producto (Rédaction Lab es, en sí, una plataforma de idiomas), y el caso más directo de aplicación de las 4 capacidades mínimas. |
| **Empresa** | Las capacidades mínimas (registrar Organización, Miembro, Rol) son aplicables a nivel de modelo — pero **ningún módulo del producto consume hoy un caso de uso real de Empresa** (Academia es instrucción DELF, no capacitación corporativa). En v1.0, este escenario queda soportado por el modelo genérico, sin ninguna funcionalidad concreta wireada a él. |
| **ONG** | Mismo razonamiento que Empresa — compatible a nivel de modelo, sin consumidor funcional real en v1.0. |
| **Organización pública** | Mismo razonamiento que Empresa/ONG. |

**Hallazgo honesto de esta sección:** de los siete escenarios evaluados, solo tres (Universidad, Colegio, Academia de idiomas) tienen, en esta versión, una funcionalidad real conectada (vía Academia); los otros cuatro son compatibles a nivel de modelo genérico (ADR-001) pero no tienen, hoy, ningún consumidor funcional dentro del producto.

---

## 10. Fuera de alcance (v1.0)

| Elemento | Prioridad de exclusión |
|---|---|
| ERP, CRM, RRHH, facturación, pagos, inventarios | **Crítica** — ningún documento del producto los menciona; incluirlos sería una invención de funcionalidad, no una responsabilidad ya evidenciada. |
| LMS completo (currículos, calificaciones, progreso educativo) | **Crítica** — ya es responsabilidad exclusiva de Academia/Evolución, invadirlo rompería el límite de contexto (ADR-001 §6). |
| Certificados | **Crítica** — NO DOCUMENTADO, sin relación de diseño establecida. |
| Biblioteca (de contenido) | **Crítica** — ya pertenece a Academia (`ModelExample`), sin relación funcional. |
| Estructura/Jerarquía multi-nivel configurable | **Alta** — diferida por ausencia de evidencia real (Sección 5), pero compatible con el modelo genérico eventual. |
| Relaciones organización-a-organización (franquicias, redes) | **Alta** — mismo razonamiento. |
| Multi-tenancy institucional (infraestructura) | **Alta** — riesgo real ya señalado, pero de un documento distinto (Infrastructure). |
| Mecanismo de activación del Modo Institucional | **Alta** — sin él, el módulo no tiene punto de entrada, pero su diseño no es responsabilidad de un documento de Scope. |
| Soporte funcional concreto para Empresa/ONG/gobierno | **Media** — el modelo no lo excluye, pero construir funcionalidad específica sin consumidor real sería prematuro (Sección 11). |
| Horarios/Calendario, Notas, Autenticación propia | **Baja como riesgo, pero exclusión permanente** — pertenecen, sin ambigüedad, a otros Bounded Contexts ya Frozen; no son candidatos a "todavía no", son candidatos a "nunca". |

---

## 11. Riesgos de expansión

- **Complejidad:** modelar una Estructura/Jerarquía arbitraria (niveles ilimitados, relaciones organización-a-organización) sin un segundo caso de uso real que la ejercite generaría un dominio más complejo de lo que cualquier requisito actual justifica — el mismo riesgo que Platform Core Foundation ya identificó explícitamente para su propio inventario ("Centralización excesiva", §7).
- **Acoplamiento:** si Organization Management absorbiera Horarios/Calendario (hoy de Mi Plan) o Notas/Evaluación (hoy de Academia/Evolución), se acoplaría directamente a esos dominios pedagógicos, violando el Principio 4 de ADR-001 (independencia del núcleo pedagógico) — el riesgo no es hipotético, es la traducción directa de una exclusión ya decidida en la Sección 3.
- **Sobreingeniería:** construir soporte funcional detallado para Empresa/ONG/organización gubernamental sin ningún consumidor real dentro del producto violaría el mismo criterio de exclusión por defecto ya aplicado sin excepción en todo el proyecto (Platform Core Foundation §2: "nunca por anticipación especulativa") — el riesgo es repetir, en Organization Management, exactamente el error que ese criterio fue diseñado para prevenir.
- **Pérdida de enfoque:** la misión del módulo (Sección 1) es deliberadamente estrecha — "membresía + autoridad". Cualquier expansión hacia gestión educativa/administrativa/financiera integral diluiría esa misión hasta volverla irreconocible frente a la Decisión ya congelada en ADR-001.
- **Deuda técnica futura:** cualquier capacidad construida en esta versión sin evidencia real (p. ej., un modelo de facturación imaginado) tendría que rediseñarse por completo cuando apareciera el requisito real, casi con certeza distinto de lo anticipado — mismo patrón de riesgo ya señalado repetidamente en ADR-001 (§11) para la multi-tenancy institucional.

---

## 12. Criterios para considerar terminado el Scope v1.0

El alcance funcional de esta versión se considera completo cuando, y solo cuando, se cumplen simultáneamente:

1. Toda responsabilidad incluida (Sección 2) está respaldada por evidencia de al menos un consumidor real — cumplido (Academia, único consumidor, ya evidenciado).
2. Toda responsabilidad excluida (Sección 3) queda explícitamente descartada con justificación propia — cumplido, sin ninguna omisión silenciosa de los ítems exigidos por el encargo (evaluación pedagógica, contenidos, producción escrita, IA, Dashboard, Mi Plan, autenticación, facturación, pagos, LMS, ERP, CRM, RRHH, horarios, calendario, notas, certificados, biblioteca, inventarios).
3. Ninguna capacidad diferida (Sección 5) aparece, ni parcial ni implícitamente, dentro de las capacidades mínimas (Sección 4).
4. El Modo Individual queda demostrado — no solo afirmado — como no dependiente, para cada uno de los 9 módulos del Contexto (Sección 7).
5. El Modo Institucional queda descrito exclusivamente a nivel conceptual, sin diseñar su mecanismo de activación (Sección 8).
6. Ninguna decisión propia del Domain Model (nivel exacto de jerarquía, mecanismo de multi-tenancy, mecanismo de activación) fue tomada implícitamente al definir este alcance — todas quedan explícitamente diferidas (Sección 5) o señaladas como riesgo (Sección 11), nunca resueltas aquí.

---

## Validación final obligatoria

1. **¿Contradicción con Product Architecture v1.0?** Ninguna — este Scope es un subconjunto disciplinado de la clasificación ya hecha ahí ("Institutional Modules") y de su matriz de dependencias (§3), sin alterarla.
2. **¿Contradicción con Organization Strategy v1.0?** Ninguna — las responsabilidades incluidas (Sección 2) y excluidas (Sección 3) de este documento son consistentes, sin excepción, con el alcance funcional ya definido en esa estrategia (§3); este documento prioriza, no contradice.
3. **¿Contradicción con ADR-001?** Ninguna — se aclaró explícitamente (Sección 4) que diferir la Estructura/Jerarquía multi-nivel a una versión futura no contradice la Decisión de genericidad de ADR-001 §3: el modelo eventual permanece genérico y extensible; solo se acota qué se construye primero.
4. **¿Contradicción con el Blueprint?** Ninguna — no se modifica ni se toca ninguna decisión de Academia; el contrato que Academia ya invoca (`TeacherStudentRelationshipPort`) es exactamente el que este Scope se compromete a satisfacer, sin alterar su forma.
5. **¿Este Scope mantiene completamente funcional el Modo Individual?** Sí — Sección 7, verificado módulo por módulo, no solo afirmado.
6. **¿Este Scope permite implementar el Modo Institucional sin afectar el núcleo pedagógico?** Sí — Sección 8: el único cambio de comportamiento ocurre en Academia, a través del contrato ya aislado a nivel de Application, sin tocar su Domain.
7. **¿Este Scope evita convertir Organization Management en un ERP o un LMS?** Sí — Sección 3 excluye ambos explícitamente con justificación propia; Sección 11 los señala como riesgo de expansión si se ignorara esta exclusión.
8. **¿El documento deja un alcance suficientemente acotado para comenzar la Functional Specification?** Sí — 4 capacidades mínimas, cada una evidenciada por un consumidor real, sin ambigüedad de qué construir primero.

**No se detectó ninguna contradicción, ambigüedad ni decisión de Domain Model tomada implícitamente.** No se avanza a la Functional Specification.
