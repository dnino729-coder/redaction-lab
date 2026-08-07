# Preguntas difíciles de directivos — Respuestas preparadas

35 preguntas, agrupadas por tema. Respuestas breves (10-20 segundos habladas), pensadas para un Rector/Decano/Director de Programa, no para un ingeniero.

---

## Pedagogía e IA

**1. ¿Por qué usar IA en vez de que los profesores corrijan directamente?**
No reemplaza al profesor — multiplica su capacidad de dar retroalimentación oportuna. Hoy el cuello de botella no es la voluntad docente, es el tiempo disponible por estudiante.

**2. ¿Cómo saben que la IA corrige bien el francés?**
La retroalimentación se estructura sobre las mismas categorías que evalúa el propio DELF (registro, cohesión, gramática, argumentación) — no es una corrección genérica, está diseñada sobre la rúbrica oficial del examen.

**3. ¿Qué pasa si la IA se equivoca?**
El profesor conserva visibilidad completa de cada observación y del texto original — puede matizarla o corregirla en su intervención oral, exactamente como haría con cualquier material de apoyo.

**4. ¿Por qué no usar directamente ChatGPT?**
ChatGPT es una herramienta genérica y abierta — no está integrada al progreso del estudiante, no sigue la rúbrica DELF, no le da al profesor visibilidad institucional, y no deja registro pedagógico del avance del curso.

**5. ¿Qué evidencia científica respalda este enfoque?**
La retroalimentación correctiva inmediata y categorizada es uno de los factores con mayor evidencia en la literatura de adquisición de segundas lenguas — el problema histórico nunca fue si funciona, sino si es sostenible dársela a cada estudiante a tiempo. Eso es justamente lo que resolvemos.

**6. ¿Cómo se calibra la dificultad de las unidades?**
Cada unidad se diseña sobre los descriptores oficiales del nivel B2 del Marco Común Europeo, con criterios de evaluación adaptados directamente de la grille DELF.

**7. ¿La IA reemplaza el criterio del profesor sobre matices culturales?**
No — y no debería. La IA identifica patrones lingüísticos objetivos (registro, gramática, cohesión); el juicio cultural y pedagógico fino sigue siendo exclusivamente del profesor.

---

## Integridad académica y evaluación

**8. ¿Cómo se evita el plagio o el uso de IA para escribir el texto en lugar del estudiante?**
El estudiante escribe directamente en el editor de la plataforma, con autoguardado en tiempo real desde la primera palabra — hay un registro completo del proceso de escritura, no solo del resultado final.

**9. ¿Esto cuenta para la nota oficial del curso?**
Eso lo decide la institución — la plataforma está diseñada para apoyar la práctica formativa; su integración a la evaluación sumativa es una decisión curricular, no técnica.

**10. ¿Cómo se integra al currículo actual?**
Se organiza por unidades alineadas a los tipos de texto que exige el DELF B2 — se puede secuenciar junto al programa ya existente sin duplicar contenido.

**11. ¿Reemplaza el examen de práctica que ya hacen?**
No — lo complementa. El examen de práctica mide el resultado final; esta plataforma trabaja el proceso de escritura repetida que lleva a ese resultado.

**12. ¿Cómo se asegura que el estudiante realmente aprendió, y no solo copió la sugerencia de la IA?**
La reflexión de cierre (paso final de cada unidad) exige que el estudiante explique con sus propias palabras qué aprendió y qué hará diferente — no es un paso opcional.

---

## Privacidad y protección de datos

**13. ¿Cómo se protegen los datos de los estudiantes?**
Cada estudiante tiene acceso exclusivamente a su propia información — la separación de datos está garantizada a nivel de base de datos (Row Level Security), no solo en la interfaz.

**14. ¿Un profesor puede ver el texto de un estudiante que no es suyo?**
No. El acceso de un profesor a un estudiante requiere una relación docente-estudiante verificada — sin esa relación, el sistema deniega el acceso por diseño, no por configuración manual del profesor.

**15. ¿Dónde se almacenan los datos?**
En infraestructura de base de datos gestionada (PostgreSQL), con las mismas prácticas de seguridad que cualquier sistema académico institucional moderno.

**16. ¿Qué pasa con los datos si la universidad deja de usar la plataforma?**
Es una decisión de política institucional a definir contractualmente — técnicamente, los datos pueden exportarse o eliminarse por completo.

**17. ¿Cumple con normativa de protección de datos?**
El diseño ya contempla principios de minimización y aislamiento de datos por defecto — la certificación formal ante la normativa local aplicable es un paso de la fase de implementación institucional, no de esta demostración.

---

## Autonomía y experiencia del estudiante

**18. ¿Esto hace que el estudiante dependa demasiado de la IA?**
Al contrario — la reflexión de cierre obligatoria busca exactamente lo opuesto: que el estudiante internalice el patrón de error, no que dependa de que se lo señalen cada vez.

**19. ¿Qué pasa si un estudiante no tiene buen acceso a internet?**
Es una limitación real a considerar en la implementación institucional — la plataforma no requiere más que una conexión estable para escribir y recibir retroalimentación, sin necesidad de software instalado.

**20. ¿Cómo motiva al estudiante a escribir más de una vez?**
Cada unidad permite reescribir sobre la misma retroalimentación recibida — ver el progreso real entre una versión y la siguiente es, en sí mismo, un motivador mucho más concreto que una nota aislada.

**21. ¿Qué pasa si el estudiante no está de acuerdo con una observación de la IA?**
Puede consultarlo con su profesor — el sistema no oculta el texto original, así que esa conversación siempre parte de evidencia concreta, no de una opinión aislada.

---

## Rol del profesor

**22. ¿Los profesores sienten que esto los reemplaza?**
La experiencia diseñada es la opuesta: les devuelve visibilidad de todos sus estudiantes sin tener que corregir manualmente cada texto — pasan de correctores a mentores.

**23. ¿Qué capacitación necesita un profesor para usarlo?**
La interfaz reutiliza los mismos patrones (paneles, indicadores, historiales) que cualquier sistema de gestión académica ya conocido — la curva de adopción es mínima.

**24. ¿Qué pasa si el profesor quiere corregir algo distinto a lo que dice la IA?**
Hoy el panel del profesor es de consulta — la intervención pedagógica ocurre en el espacio de clase o tutoría, con la información ya organizada como punto de partida.

---

## Costo y viabilidad institucional

**25. ¿Cuánto costaría implementarlo?**
Ese es exactamente el siguiente paso de conversación, después de validar hoy que la propuesta pedagógica y técnica funciona — no queremos anticipar un número sin entender antes el alcance real que la institución necesita.

**26. ¿Qué tan escalable es a más estudiantes?**
La arquitectura ya está diseñada por capas independientes (identidad, progreso, retroalimentación) pensando en múltiples cursos y facultades, no en un solo grupo piloto.

**27. ¿Se necesita infraestructura propia de la universidad?**
No es un requisito para empezar — puede operar sobre infraestructura gestionada; una instalación on-premise sería una conversación técnica posterior, si la institución lo requiere.

**28. ¿Qué tan rápido se podría implementar con un grupo piloto real?**
Depende del alcance que decida la institución — la plataforma en sí ya cubre el ciclo completo mostrado hoy; lo que definiría el cronograma es el proceso administrativo de la universidad, no el desarrollo técnico.

---

## Comparación y diferenciación

**29. ¿En qué se diferencia de otras plataformas de aprendizaje de idiomas?**
Las plataformas genéricas enseñan idioma en general; esta está diseñada específicamente sobre la estructura y los criterios del examen DELF B2, con visibilidad institucional para el profesor — no es un producto de consumo masivo adaptado, es específico para este objetivo académico.

**30. ¿Qué pasa si un estudiante ya usa herramientas de IA por su cuenta?**
Esta plataforma no compite con eso — lo estructura: en vez de una corrección genérica y aislada, el estudiante recibe retroalimentación alineada al curso, con seguimiento docente y progreso medible en el tiempo.

---

## Preguntas de continuidad / próximos pasos

**31. ¿Qué falta para que esto esté listo para un piloto real?**
Cargar contenido oficial completo para los tipos de texto del examen y ejecutar una validación con un grupo reducido de estudiantes reales — el ciclo técnico que acaban de ver ya está construido y probado.

**32. ¿Puede la universidad pedir cambios al contenido pedagógico?**
Sí — el contenido de cada unidad (consignas, criterios, vocabulario) es configurable independientemente del funcionamiento técnico de la plataforma.

**33. ¿Qué pasa si el examen DELF cambia su formato?**
Las unidades están organizadas por tipo de texto y criterio de evaluación, no hardcodeadas al formato actual — actualizar una unidad es un cambio de contenido, no de arquitectura.

**34. ¿Cómo mediría la universidad el éxito de esto en un semestre?**
Con datos que hoy no existen de forma sistemática: cuántas versiones escribe cada estudiante, qué patrones de error persisten o desaparecen, y qué correlación tiene esa práctica con el resultado real del examen.

**35. ¿Qué necesitan de nosotros para avanzar?**
Una decisión sobre el alcance de un piloto (cuántos estudiantes, qué grupo, qué semestre) — con eso, el siguiente paso técnico y de contenido ya está claro.
