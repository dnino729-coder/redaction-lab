# 01_Conocimiento_Consolidado.md

## Memoria técnica consolidada — Redaction Lab
### Plataforma web de entrenamiento de la producción escrita DELF B2 mediante Inteligencia Artificial

> Este documento consolida en una única fuente de verdad la información técnica, pedagógica, funcional y de diseño contenida en los 11 documentos fuente del proyecto. Está organizado por grandes áreas funcionales (no por documento de origen) y conserva textualmente todas las reglas obligatorias (MUST / MUST NOT / SHOULD, expresadas en el original como "deberá", "nunca", "no deberá", "obligatorio"), los nombres exactos de módulos, entidades, componentes, servicios y clases, y las especificaciones técnicas completas (esquemas de base de datos, tokens de diseño, endpoints de API, etc.).
>
> **Documentos fuente consolidados:**
> 1. Libro maestro EdTech B2 (Discovery / Fase 1)
> 2. Product Identity (Product Blueprint)
> 3. Product Architecture
> 4. Learning Blueprint
> 5. AI Blueprint
> 6. Wireframe - Experience Blueprint
> 7. UI Design System (Fase 7)
> 8. UX Experience (Fase 8 — NeuroUX Blueprint)
> 9. PRD — Product Requirements Document
> 10. Domain Modeling
> 11. Modeling Design
>
> **Reglas de consolidación aplicadas:** no se ha perdido información relevante; solo se eliminaron duplicaciones exactas; se conservan todas las especificaciones técnicas, incluso si parecen redundantes entre documentos; no se ha reinterpretado ni simplificado ningún requisito; no se ha modificado la arquitectura definida en las fuentes. Cuando dos o más documentos entran en contradicción, no se ha decidido cuál prevalece — se documenta en la sección **17. Conflictos Detectados**, al final de este documento, indicando el origen de cada conflicto.

---

## Índice

1. Visión General del Proyecto
2. Identidad de Producto y Marca
3. Objetivos Funcionales
4. Alcance (Incluye / Excluye)
5. Arquitectura General de la Plataforma
6. Módulos y Ecosistemas Funcionales
7. Metodología Pedagógica y Sistema DELF B2
8. Experiencia de Usuario (UX / NeuroUX)
9. Componentes de Inteligencia Artificial
10. Sistema de Evaluación y Certificación
11. Gamificación
12. Autenticación, Roles y Permisos
13. Base de Datos: Entidades, Relaciones y Modelo Físico
14. Design System (Identidad Visual, Componentes, Tokens)
15. Seguridad, DevOps, Observabilidad e Integraciones Externas
16. Plan de Implementación, Gobernanza y Convenciones de Desarrollo
17. Conflictos Detectados
18. Decisiones de Resolución de Conflictos (Arquitectura y Producto)

---

## 1. Visión General del Proyecto

### 1.1 Nombre del producto

El nombre provisional del proyecto en el Libro Maestro es **"Project DELF Coach"** (Doc 1); el Product Blueprint (Doc 2) baraja tres nombres provisionales de producto: **"Redaction Lab"**, **"Atélier de rédaction"**, **"Evolutif"**. **"Redaction Lab"** es el nombre que se consolida y utiliza de forma consistente en el resto de los documentos técnicos (PRD, Domain Modeling, UI Design System, UX Experience), por lo que se adopta como nombre oficial del proyecto en este documento. Ver conflicto de naming en la sección 17.

### 1.2 Misión

"Ayudar a los estudiantes a aprobar la producción escrita del DELF B2 mediante práctica guiada, retroalimentación inteligente y entrenamiento personalizado." (Doc 1)

La gran promesa (Doc 2): "Ayudamos a los candidatos del DELF B2 a escribir con confianza mediante entrenamiento inteligente, práctica personalizada y retroalimentación inmediata basada en IA."

### 1.3 Problema que resuelve

"La dificultad en la redacción de textos propios del DELF B2, junto con la escasa comprensión de la gramática, el léxico, la cohesión y la coherencia exigidos en la prueba." (Doc 1) — "cerca del 80% no logra superar la prueba escrita debido a la complejidad de sus exigencias" (Doc 1).

Objetivo del problema real a resolver (Doc 2): "Reducimos la confusión, la ansiedad y la incertidumbre que experimentan los candidatos frente a la prueba de producción escrita del DELF B2. A través de entrenamiento personalizado, retroalimentación inmediata y seguimiento continuo del progreso, ayudamos al estudiante a desarrollar las habilidades necesarias para afrontar el examen con seguridad y autonomía."

### 1.4 Diferenciación frente a un libro/curso tradicional y frente a ChatGPT

"La plataforma transforma la preparación del DELF B2 en una experiencia interactiva y personalizada. A diferencia de un libro o un curso tradicional, el estudiante no solo estudia contenidos: practica con ejercicios ilimitados generados por IA, recibe retroalimentación inmediata alineada con los criterios oficiales del DELF, identifica sus errores recurrentes, sigue su progreso mediante estadísticas y cuenta con un plan de entrenamiento adaptado a sus necesidades." (Doc 1)

Frente a ChatGPT (Doc 1): "La plataforma no solo utiliza IA para responder preguntas; organiza un proceso completo de aprendizaje. Diagnostica el nivel del estudiante, planifica su entrenamiento, genera actividades alineadas con los criterios oficiales del DELF, analiza el progreso a lo largo del tiempo, identifica patrones de error y adapta automáticamente las siguientes actividades. La IA es un componente del producto, no el producto en sí."

### 1.5 Visión a largo plazo

Visión a 5 años (Doc 1): "Convertirse en una herramienta presente en universidades e institutos de todo el mundo, especialmente dirigida a estudiantes hispanohablantes."

Visión a 2035 (Doc 2, Sección 7): impacto esperado — "Ser la plataforma de referencia a nivel internacional para el entrenamiento de la producción escrita del DELF B2 mediante inteligencia artificial y principios de aprendizaje basados en evidencia." Legado: "El primer producto web con IA diseñado para entrenarse para la prueba de producción escrita del examen DELF B2."

### 1.6 Manifiesto (Doc 2, Sección 8 — texto completo, valor fundacional)

"Durante años hemos enseñado a miles de estudiantes a prepararse para el DELF B2. En ese camino descubrimos algo que iba mucho más allá de la gramática, el vocabulario o las estructuras textuales. Descubrimos que muchos estudiantes no fracasan porque no sean capaces de escribir, sino porque sienten miedo al enfrentarse a la hoja en blanco, porque no saben si están progresando o porque no cuentan con una retroalimentación constante que les permita aprender de sus errores.

Creemos que aprender a escribir en una lengua extranjera no consiste en memorizar modelos o repetir estructuras. Es un proceso de construcción, práctica, reflexión y mejora continua. Cada texto escrito representa una oportunidad para pensar mejor, comunicar ideas con mayor claridad y desarrollar confianza en las propias capacidades.

Por esa razón nació este producto. No para sustituir a los profesores, sino para acompañar su labor. No para que la inteligencia artificial escriba por el estudiante, sino para que el estudiante aprenda a escribir cada vez mejor.

Creemos que la tecnología debe estar al servicio del aprendizaje y que la inteligencia artificial puede convertirse en un entrenador disponible en cualquier momento, capaz de ofrecer orientación inmediata, identificar oportunidades de mejora y adaptar el entrenamiento a las necesidades de cada persona.

También creemos que aprender requiere constancia. No buscamos que los estudiantes estudien más horas, sino que desarrollen el hábito de practicar de manera frecuente, consciente y con objetivos claros.

Nuestro propósito no es únicamente ayudar a aprobar un examen internacional. Nuestro verdadero objetivo es que cada estudiante descubra que puede escribir con confianza, organizar sus ideas con claridad y expresarse en francés con seguridad y autonomía." (Doc 2)

### 1.7 Filosofía fundacional (Doc 2, Sección 3)

- Sobre escribir: "Escribir requiere de diferentes componentes: la lectura, la creatividad, la inspiración, las palabras. Escribir no consiste únicamente en unir palabras correctamente. Es organizar pensamientos, defender ideas, comunicar emociones y construir conocimiento. Aprender a escribir es aprender a pensar con claridad."
- Sobre los errores: "Los errores no son evidencia de incapacidad, sino oportunidades para aprender. Cada error revela el siguiente paso del aprendizaje y nos acerca a una escritura más sólida y consciente."
- Sobre la IA: "La inteligencia artificial no reemplaza al profesor. La utilizamos como un entrenador disponible en cualquier momento para acompañar al estudiante, ofrecer retroalimentación inmediata y personalizar su proceso de aprendizaje."
- Sobre los profesores: "Los profesores inspiran, orientan y desarrollan el pensamiento crítico. Nuestro producto nace para complementar su labor, nunca para sustituirla."

### 1.8 Usuarios objetivo / audiencia

- Usuarios principales: estudiantes universitarios, autodidactas, profesores, academias (Doc 1).
- Edad: candidatos entre 18 y 30 años (Doc 1).
- Nivel de francés requerido al ingreso: mínimo B1 (Doc 1).
- Motivos para presentar el DELF: "requisito de grado, opción de estudios o trabajo en Francia o Canadá" (Doc 1).
- Dispositivos soportados: computador, celular, tablet (Doc 1).
- Preparación actual típica del mercado: "clases grupales de 28 estudiantes, 6 horas semanales, con apenas un mes de preparación" (Doc 1).
- Principales frustraciones detectadas: "no comprender la estructura del examen, el tiempo, la gramática, el léxico, la morfosintaxis"; "ejercicios sin feedback" (Doc 1).

### 1.9 Orquestación como principio arquitectónico central del producto

El PRD (Cap. 14) eleva la visión de "producto único" a principio de arquitectura obligatorio: "La plataforma deberá comportarse como un único organismo inteligente en el que la información fluye permanentemente entre los diferentes módulos, permitiendo que cada decisión del estudiante tenga un impacto inmediato sobre el resto del sistema." "Claude deberá comprender que ningún ecosistema funciona de manera independiente. Todos comparten una misma memoria pedagógica, una misma representación del progreso del estudiante y un mismo objetivo." Ver detalle completo en la sección 5.5.

---

## 2. Identidad de Producto y Marca

### 2.1 Personalidad y tono

Personalidad de la plataforma (Doc 1): "seria, divertida, cercana, formal, motivadora" (sic, "divertidad" en el original).

Personalidad (Doc 2, Sección 2):
- Viste: "Casual." "Minimalista."
- Habla: "Muy cercano." "Motivador." "Profesional."
- Nunca diría: "Nunca ridiculiza al estudiante." "Nunca juzga." "Nunca genera culpa."
- Tres adjetivos: "Inspirador." "Inteligente." "Cercano."

### 2.2 Valores de marca (Doc 2, Sección 4)

- **Autonomía**: "Permite que el estudiante decida el tiempo y espacio para sentarse a estudiar. Permite que el proceso sea sencillo para el estudiante."
- **Honestidad**: "Otorga una retroalimentación real del nivel de lengua del estudiante, te ofrece consejos a partir de tu progreso y de tu nivel de lengua."
- **Aprendizaje significativo**: "Permite que la adquisición del conocimiento se haga de manera interactiva, pausada, fácil y simple de comprender."
- **Mejora continua**: "Motiva al estudiante a permanecer y no dejar de lado su proceso de aprendizaje."
- **Evidencia científica**: "Ofrece detalles estadísticos sobre el proceso de aprendizaje, utiliza teorías sobre educación, neurociencia, pedagogía para sustentar cada una de las actividades propuestas."

### 2.3 Tono de comunicación por situación (Doc 2, Sección 5 — tabla completa, referencia obligatoria de copywriting para el Coach IA)

| Situación | Respuesta del producto |
|---|---|
| El estudiante se equivoca mucho | "Aprender a escribir es un proceso. Los errores que encontramos hoy son una oportunidad para mejorar. Vamos a trabajar paso a paso; no necesitas hacerlo perfecto desde el primer intento. Estoy aquí para ayudarte a avanzar." |
| El estudiante mejora | "¡Excelente progreso! Hoy escribes con más claridad y organizas mejor tus ideas. Cada práctica te acerca más al nivel que exige el DELF B2. Sigamos construyendo sobre este avance." |
| El estudiante abandona varios días | "¡Qué bueno verte nuevamente! Todos interrumpimos nuestros hábitos alguna vez. Lo importante es regresar. Continuemos desde donde nos quedamos y demos hoy un nuevo paso hacia tu objetivo." |
| El estudiante obtiene una excelente nota | "¡Felicitaciones! Este resultado refleja el trabajo constante que has realizado. Disfruta este logro, pero recuerda que todavía podemos seguir perfeccionando tu escritura." |
| El estudiante está frustrado | "Es normal sentirse frustrado cuando aprender parece difícil. Cada persona progresa a un ritmo diferente. Lo importante no es escribir perfecto hoy, sino escribir un poco mejor que ayer. Vamos a identificar juntos qué está dificultando tu progreso y construiremos una estrategia para superarlo." |

### 2.4 El Coach IA como elemento central de identidad

"El Coach IA no aparece en el menú. Porque no es un lugar al que el estudiante entra. Es una presencia constante." (Doc 3). Funciones: explicar conceptos; resolver dudas; adaptar actividades; corregir textos; motivar; detectar patrones de error; recordar el progreso; recomendar la siguiente actividad; ajustar el plan de entrenamiento; acompañar al estudiante en todos los ecosistemas. (Ver desarrollo completo en la sección 9.)

### 2.5 Gamificación no infantilizada (regla de identidad)

"La gamificación estará diseñada para adultos y jóvenes universitarios. En lugar de personajes caricaturescos, utilizará desafíos, niveles de dominio, metas personales, indicadores de progreso y simulaciones del examen que aporten una sensación de crecimiento profesional y académico." (Doc 1)

---

## 3. Objetivos Funcionales

### 3.1 Objetivos pedagógicos generales

Al finalizar el entrenamiento el estudiante deberá ser capaz de: "comprender cualquier consigna del DELF B2, planificar sus ideas, redactar textos coherentes y cohesionados, utilizar un registro adecuado, gestionar el tiempo del examen y reconocer sus propios errores antes de entregar una producción escrita." (Doc 1)

Resultados/beneficios buscados en el estudiante: confianza, seguridad, autonomía, capacidad de autoevaluación, disciplina de práctica (Doc 1).

### 3.2 Objetivos frente al modelo de preparación tradicional

Reducir el tiempo de preparación, ofrecer retroalimentación inmediata (normalmente solo dada por un profesor), generar ejercicios ilimitados adaptados al nivel, permitir práctica autónoma con seguimiento personalizado (Doc 1). Eliminar: la incertidumbre frente al examen, la necesidad de esperar días para correcciones, el miedo a escribir; convertir la preparación en "un proceso organizado, progresivo y motivador" (Doc 1).

### 3.3 Tabla de transformación (antes / después) (Doc 2)

| Antes | Después |
|---|---|
| No me sentía seguro del contenido de mi carta | Tengo la confianza y la seguridad para redactar cualquier carta |
| No sentía motivación para sentarme a estudiar | Siento interés y ganas de sentarme para estudiar y practicar |
| Me sentía perdido y no sabía cómo empezar a estudiar | Ahora sé exactamente qué hacer para mejorar cada día, comprendo la línea de trabajo para lograr mis objetivos |
| No comprendía cómo articular los conocimientos de gramática | Ahora utilizo la gramática de forma natural mientras escribo |

### 3.4 Objetivos por módulo (declarados en el Libro Maestro y Product Architecture)

- **Onboarding/diagnóstico**: "El objetivo no es evaluar. Es conocer." (Doc 3)
- **Landing Page**: "Presentar el producto y convertir visitantes en usuarios." (Doc 3)
- **Dashboard**: "Dar al estudiante una visión clara de su progreso y orientarlo sobre qué hacer a continuación." (Doc 1)
- **Academia DELF B2**: "Enseñar los fundamentos necesarios antes de escribir." (Doc 1)
- **Biblioteca de Modelos**: "Aprender a partir de ejemplos reales." (Doc 1)

### 3.5 Objetivos del sistema de orquestación (PRD Cap. 14)

La orquestación deberá perseguir: garantizar la comunicación permanente entre todos los ecosistemas; evitar la duplicación de información; mantener actualizado el perfil pedagógico del estudiante; personalizar continuamente el recorrido de aprendizaje; asegurar la coherencia entre recomendaciones, actividades y evaluaciones; permitir la escalabilidad del producto mediante una arquitectura modular.

### 3.6 Objetivo general del sistema (Prompt Maestro, PRD Cap. 12)

Construir una plataforma web interactiva para la preparación de la producción escrita del DELF B2 que: reproduzca la experiencia de una plataforma educativa moderna; ofrezca aprendizaje adaptativo mediante IA; proporcione retroalimentación inmediata y personalizada; incorpore principios de neurociencia aplicada al aprendizaje; permita seguimiento detallado del progreso del estudiante; sea escalable para integrar otros exámenes DELF y DALF.

---

## 4. Alcance (Incluye / Excluye)

### 4.1 Alcance de la primera versión (MVP) según el Libro Maestro

"Para esa primera versión, me centraría en: 1. Dashboard. 2. Academia DELF B2. 3. Laboratorio de Escritura. 4. Corrector Inteligente. 5. Simulador Oficial." (Doc 1)

### 4.2 Módulos de la visión ampliada (Doc 1, Bloque I)

1. Inicio (Dashboard)
2. Academia DELF B2
3. Biblioteca de Modelos
4. Laboratorio de Escritura ⭐ — marcado explícitamente como "el corazón del proyecto" / "Es donde pasará la mayor parte del tiempo"
5. Corrector Inteligente
6. Entrenamiento Personalizado
7. Simulador Oficial
8. Gamificación y Desafíos
9. Perfil y Analíticas

Adicionalmente, un espacio independiente para profesores, explícitamente NO tratado como "un módulo más": "Deberían tener un espacio independiente. Así habría dos productos en uno: Espacio del estudiante / Espacio del profesor." (Doc 1)

### 4.3 Ecosistemas de la Arquitectura de Producto (Doc 3 — nomenclatura de Product Architecture)

| Ecosistema | Propósito |
|---|---|
| 🧭 Mi Plan | Define el camino personalizado del estudiante |
| 📖 Conoce el DELF | Comprender el examen y sus criterios |
| ✍️ Taller de Escritura | Aprender y practicar cada tipo de texto |
| 📚 Laboratorio de Lectura y Escritura | Experimentar, leer y producir textos auténticos |
| 🎯 Centro de Entrenamiento | Mantener el hábito mediante misiones y desafíos diarios |
| 📝 Simulador DELF | Practicar en condiciones reales de examen |
| 📈 Mi Evolución | Analizar el progreso y redefinir objetivos |

Nota: la nomenclatura de ecosistemas difiere entre documentos (Doc 1, Doc 3, Doc 6, Doc 8, Doc 7). Ver mapeo consolidado y conflicto de nomenclatura en la sección 17.

### 4.4 Qué NO incluye / qué NO es el producto (exclusiones explícitas)

**Del Libro Maestro (Doc 1):**
- La IA "nunca" completa la tarea de escritura por el estudiante ("¿Qué tareas nunca realizará? Completar la tarea a realizar.")
- No habrá recompensas explícitas ("¿Habrá recompensas? No." — ver contradicción en sección 17).
- No habrá videos ("¿Habrá videos? No.")
- No habrá suscripción mensual ("¿Suscripción mensual? No" — ver matiz en sección 17).

**Del Product Blueprint (Doc 2, Sección 6 — "¿Qué NO somos?"):**
- Un libro digital.
- Un chatbot.
- Un profesor que hace las tareas.
- Un curso grabado.
- Un corrector automático.

**Tono prohibido (Doc 2):** "Nunca ridiculiza al estudiante." "Nunca juzga." "Nunca genera culpa."

**De la Landing Page (Doc 3):** "No pertenece al proceso de aprendizaje" — está explícitamente fuera del flujo pedagógico.

### 4.5 Alcance temático de tipos de texto DELF B2 trabajados

Cartas de motivación, cartas de reclamación, correo de lectores, foro, carta abierta (Doc 1). Con teoría asociada: "explicación de los elementos de cada carta, como fórmulas de saludo, de cortesía, contenido específico para cada letra, conectores lógicos" (Doc 1). Incluye simulacros por cada tipo de texto, ejercicios libres, ejercicios guiados y ejemplos comentados (Doc 1).

En el modelo de datos (Domain Modeling, Cap. 5, tabla `WritingTask`), el enum `task_type` amplía esta tipología a: `LETTER, ARTICLE, ESSAY, EMAIL, REPORT`.

### 4.6 Alcance futuro / roadmap fuera del alcance actual

- Después del DELF B2: DALF C1 (Doc 1).
- Producción oral, comprensión oral, comprensión escrita: sí, como extensiones futuras (Doc 1).
- Otros idiomas: inglés, español como lengua extranjera (Doc 1).
- Roadmap técnico detallado por versiones (PRD Cap. 11): **v1.0** Producción escrita DELF B2, IA correctora, Dashboard, Certificados, Gamificación; **v2.0** Producción oral, reconocimiento de voz, pronunciación, conversaciones con IA; **v3.0** Comprensión oral, comprensión escrita, exámenes completos DELF; **v4.0** Plataforma completa DELF y DALF, panel institucional, gestión de docentes, gestión de cursos, analítica avanzada, aprendizaje adaptativo.
- Visión a largo plazo (PRD Cap. 13): DELF A1/A2/B1/B2, DALF C1/C2, preparación TCF/TEF, producción oral/escrita, comprensión oral/escrita, analítica institucional, integración con LMS (Moodle, Canvas vía LTI), apps móviles Android/iOS, aprendizaje adaptativo con IA, modo sin conexión, ecosistema multiinstitucional.

### 4.7 Modelo de negocio (fuera del alcance de desarrollo pero relevante como restricción de producto)

Modelo B2C: suscripción individual, pago único del curso, versión Premium. Modelo B2B: licencias para universidades, institutos, profesores. Servicios adicionales: simulacros certificados, tutorías, correcciones humanas, cursos especializados (Doc 1).
## 5. Arquitectura General de la Plataforma

> **Advertencia de consolidación importante:** el PRD contiene **dos especificaciones de stack tecnológico mutuamente incompatibles** (Capítulo 2 vs. Capítulos 10-13), y el Domain Modeling especifica un tercer ORM distinto de ambas. Esta sección documenta las tres versiones tal como aparecen en las fuentes, sin decidir cuál prevalece. El detalle completo del conflicto está en la sección 17.1.

### 5.1 Flujo de producto de alto nivel (Product Architecture, Doc 3)

```
Landing Page
     │
     ▼
Registro / Inicio de sesión
     │
     ▼
(Onboarding solo la primera vez)
Diagnóstico + Objetivos + Plan personalizado
     │
     ▼
Dashboard Inteligente
     │
     ├──────────────┬──────────────┬──────────────┬──────────────┐
     ▼               ▼              ▼              ▼              ▼
 Academia      Laboratorio   Entrenamiento    Simulador    Mi plan / Evolución
     │               │              │              │
     └──────────────┴──────────────┴──────────────┴──────────────┘
              Coach IA (presente en todo)
```

"Cada fase responde a una necesidad específica del estudiante y todas están conectadas por el Coach IA, que personaliza la experiencia según el progreso individual." (Doc 3)

### 5.2 Arquitectura Tecnológica — Versión A (PRD, Capítulo 2 "Arquitectura Tecnológica")

Cuatro principios fundamentales: simplicidad de mantenimiento; alto rendimiento; modularidad; escalabilidad. "Claude deberá utilizar exclusivamente las tecnologías especificadas en este documento", salvo justificación técnica superior y autorizada.

**Stack tecnológico oficial (Versión A):**

| Área | Tecnología | Reglas clave |
|---|---|---|
| Framework | Next.js (App Router) | Obligatorio App Router; "No deberán utilizarse arquitecturas antiguas" (Pages Router prohibido) |
| UI | React | Componentes desacoplados, pequeños, reutilizables; "No deberá crear páginas monolíticas" |
| Lenguaje | TypeScript | Obligatorio en todo el proyecto; "No se permitirá código JavaScript sin tipado" |
| Estilos | Tailwind CSS | "No deberán escribirse hojas CSS extensas"; estilos derivados del Design System, convertidos en tokens reutilizables |
| Componentes base | shadcn/ui | Punto de partida para botones, tarjetas, diálogos, inputs, tablas, formularios, popovers, menús, tooltips |
| Animación | Framer Motion | Suaves, breves, coherentes, funcionales; "Nunca deberán utilizarse únicamente con fines decorativos" |
| Backend | Capacidades backend de Next.js | Route Handlers, Server Actions, funciones de servidor; backend desacoplado de interfaz; lógica crítica siempre en servidor |
| Base de datos | PostgreSQL vía **Supabase** | Provee autenticación, almacenamiento, BD, seguridad, storage de archivos, Edge Functions cuando sean necesarias |
| ORM | **Drizzle ORM** | "No deberá escribir consultas SQL repetitivas cuando puedan resolverse mediante el ORM" |
| Autenticación | **Clerk** | Registro, inicio de sesión, recuperación de contraseña, autenticación social, gestión de sesiones, protección de rutas; integración completa con Supabase |
| IA | Multi-proveedor (OpenAI, Anthropic Claude, futuros compatibles) | Capa de abstracción; "El resto de la plataforma nunca deberá depender directamente de un proveedor específico" |
| Estado | React Context / Zustand / TanStack Query | Context cuando sea suficiente; Zustand para estados globales complejos; TanStack Query para datos de servidor |
| Formularios | React Hook Form + Zod | Validación, tipado, reutilización, mensajes de error consistentes |
| Storage archivos | Supabase Storage | Documentos, imágenes, recursos multimedia, evidencias de aprendizaje |
| Analíticas | Herramientas con eventos personalizados | Registrar tiempo de entrenamiento, uso de funcionalidades, frecuencia, progreso, interacción con Coach IA |
| Despliegue | **Vercel** | SSR, Edge Functions, carga diferida, optimización automática de imágenes, división automática de código |

**Arquitectura basada en servicios (Versión A):** servicios independientes de autenticación, Coach IA, analíticas, progreso, gamificación, simulaciones, recomendaciones — cada uno con responsabilidades claramente definidas.

**Reglas obligatorias (Cap. 2):** utilizar exclusivamente TypeScript; mantener arquitectura modular; reutilizar componentes antes de crear nuevos; centralizar toda la comunicación con la IA; desacoplar lógica de negocio de la interfaz; respetar el Design System; optimizar rendimiento desde la arquitectura; documentar los servicios principales; mantener consistencia en la organización del proyecto.

**Restricciones (Cap. 2):** Claude no deberá introducir tecnologías redundantes; utilizar múltiples librerías para resolver el mismo problema; mezclar estilos arquitectónicos; crear dependencias innecesarias; escribir código difícil de mantener; sacrificar claridad por complejidad técnica.

### 5.3 Arquitectura Tecnológica — Versión B (PRD, Capítulos 10-13 "Despliegue" / "Prompt Maestro" / "Plan de Implementación")

Estos capítulos posteriores del mismo PRD especifican un stack diferente:

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Framer Motion (coincide con Versión A).
- **Backend**: **Node.js, NestJS**, REST API, WebSockets, **JWT Authentication** (Refresh Tokens) — en lugar de las Route Handlers/Server Actions de Next.js y de Clerk.
- **Base de datos**: **PostgreSQL** directamente (tablas normalizadas, índices), sin mencionar Supabase como capa intermedia.
- **Contraseñas**: **Encriptación bcrypt** (Cap. 11) — diferente del Argon2id especificado en Domain Modeling Cap. 16 (ver sección 17.1).
- **Almacenamiento**: Supabase Storage o **AWS S3** (alternativa explícita).
- **IA**: OpenAI, Anthropic Claude, **Google Gemini** (Gemini se añade como tercer proveedor, no mencionado en la Versión A).
- **Caché**: **Redis** (sesiones, progreso, resultados temporales, consultas frecuentes).
- **Monitoreo**: **Sentry, Grafana, Prometheus**.
- **CI/CD**: **GitHub, GitHub Actions**.
- **Despliegue**: compatible con **Vercel, Railway, Render, AWS, Azure** (selección mediante variables de configuración).

**Arquitectura multicapa (Anexo A, Cap. 15):**
```
┌──────────────────────────────┐
│ Cliente (Frontend)            │
│ Next.js · React · TypeScript │
└──────────────┬───────────────┘
               │ HTTPS / REST
┌──────────────▼───────────────┐
│ API (NestJS)                  │
│ Autenticación · IA · Lógica  │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ PostgreSQL / Storage          │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Proveedores IA y Servicios    │
│ OpenAI · Claude · Gemini      │
└──────────────────────────────┘
```

### 5.4 Arquitectura del Proyecto — estructura de código (PRD, Capítulo 3)

"Claude deberá organizar todo el desarrollo siguiendo una arquitectura basada en dominios funcionales (**Feature-Driven Architecture**)", evitando estructuras centradas solo en tipos de archivo. "Cada ecosistema definido en el PRD deberá convertirse en un módulo independiente con responsabilidades claramente delimitadas."

**Principios arquitectónicos:** modularidad; separación de responsabilidades; bajo acoplamiento; alta cohesión; reutilización de componentes; escalabilidad; legibilidad; mantenibilidad.

**Estructura de alto nivel** (`redaction-lab/`):
```
app/ | features/ | components/ | services/ | lib/ | hooks/ | providers/ |
stores/ | types/ | utils/ | config/ | styles/ | assets/ | prompts/ |
database/ | middleware/ | public/ | tests/
```

- **`app/`**: solo estructura de navegación Next.js App Router (rutas, layouts, loading, error, metadata, páginas principales). "Toda la lógica deberá residir fuera de esta carpeta."
- **`features/`** (la más importante): cada ecosistema pedagógico = feature independiente. Módulos: `dashboard/`, `mi-plan/`, `academy/`, `laboratory/`, `daily-training/`, `simulator/`, `analytics/`, `profile/`, `coach/`, `gamification/`, `notifications/`, `settings/`.
  - Estructura interna idéntica en todas: `components/`, `pages/`, `hooks/`, `services/`, `types/`, `schemas/`, `utils/`, `constants/`, `actions/`.
  - Ejemplo detallado (`academy/`): componentes `LessonCard`, `LessonViewer`, `LessonProgress`, `LessonSidebar`; hooks `useLesson`, `useProgress`; servicios `lessonService`, `progressService`; tipos `Lesson`, `Module`, `Activity`; schema `lessonSchema`; util `calculateProgress`.
- **`components/`** (globales, reutilizables): `Button`, `Card`, `Modal`, `Dialog`, `Avatar`, `ProgressBar`, `Tabs`, `Navbar`, `Sidebar`, `Tooltip`, `Input`, `Badge`, `Loading`, `Charts`. "Claude nunca deberá colocar componentes específicos de un ecosistema en esta carpeta."
- **`services/`** (lógica de negocio compartida): `auth/`, `ai/`, `analytics/`, `gamification/`, `storage/`, `database/`, `notifications/`. "Los servicios nunca dependerán de componentes visuales."
- **`prompts/`** (ingeniería de prompts, versionada y documentada): `coach/`, `feedback/`, `simulation/`, `evaluation/`, `recommendations/`, `grammar/`, `writing/`. "Claude nunca deberá escribir prompts directamente dentro del código."
- **`database/`**: `schema/`, `migrations/`, `seed/`, `queries/`, `drizzle/`.
- **`config/`**: `theme`, `navigation`, `routes`, `constants`, `metadata`, `environment`. "Claude evitará valores 'hardcodeados' distribuidos por el proyecto."
- **`providers/`**: `ThemeProvider`, `AuthProvider`, `CoachProvider`, `AnalyticsProvider`, `ToastProvider`.
- **`stores/`** (un dominio por store): `userStore`, `coachStore`, `dashboardStore`, `settingsStore`, `progressStore`.
- **`hooks/`** (reutilizables): `useAuth`, `useTheme`, `useDebounce`, `useProgress`, `useToast`, `useMediaQuery`.
- **`types/`** (compartidos, sin duplicados): `user`, `lesson`, `simulation`, `coach`, `feedback`, `progress`.
- **`utils/`** (sin lógica pedagógica): `dates`, `strings`, `formatters`, `validators`, `calculations`.
- **`assets/`**: `illustrations/`, `icons/`, `avatars/`, `animations/`, `backgrounds/`, `logos/`.
- **`middleware/`**: autenticación; protección de rutas; internacionalización; validación de sesión.
- **`tests/`**: `unit/`, `integration/`, `e2e/`, `fixtures/`. "Cada módulo importante deberá disponer de pruebas automatizadas."

**Dependencias entre módulos:** una feature nunca accederá directamente a otra feature; comunicación vía servicios compartidos o interfaces públicas; ningún componente podrá depender de detalles internos de otro módulo; dependencias unidireccionales y explícitas.

**Convenciones de nombres (código):** Componentes PascalCase (`LessonCard.tsx`); Hooks camelCase con prefijo `use` (`useLesson.ts`); Servicios camelCase (`lessonService.ts`); Tipos PascalCase (`Lesson.ts`); Carpetas kebab-case (`daily-training`); Variables camelCase; Constantes UPPER_SNAKE_CASE globales.

**Restricciones (Cap. 3):** Claude no deberá colocar lógica de negocio dentro de componentes visuales; almacenar componentes específicos en carpetas globales; mezclar responsabilidades dentro de un mismo archivo; crear dependencias circulares; duplicar tipos, hooks o servicios; romper la organización modular.

**Estructura alternativa (Prompt Maestro, Cap. 12 — versión más simple, potencialmente inconsistente con la Feature-Driven Architecture del Cap. 3):**
```
/app
/components
/modules
/services
/hooks
/lib
/styles
/types
/api
/database
/public
```
Ver nota de conflicto en sección 17.1.

### 5.5 Arquitectura de Datos — nivel conceptual (PRD, Capítulo 4)

"Claude deberá comprender que esta arquitectura no representa únicamente un conjunto de tablas de base de datos. Constituye la memoria estructurada del entrenador inteligente" — permite reconstruir el historial completo de aprendizaje, personalizar el Coach IA y alimentar todos los ecosistemas.

**Principios de diseño:** una única fuente de verdad para cada entidad; relaciones explícitas mediante claves foráneas; separación entre datos pedagógicos, funcionales y analíticos; escalabilidad para futuras certificaciones (DALF, TCF, etc.); independencia respecto al proveedor de IA; trazabilidad completa del aprendizaje.

**Dominios de información:** (1) Identidad; (2) Aprendizaje; (3) Producción escrita; (4) Retroalimentación; (5) Simulaciones; (6) Gamificación; (7) Analíticas; (8) Memoria pedagógica.

**Entidades principales conceptuales:**

| Entidad | Contenido / regla |
|---|---|
| Usuario | identificación, perfil, preferencias, configuración, objetivos, fecha del examen, idioma, nivel |
| Competencia | coherencia, cohesión, gramática, léxico, ortografía, adecuación; reutilizadas por toda la plataforma |
| Unidad | unidad de aprendizaje |
| Actividad | cada ejercicio realizado |
| Producción | cada texto escrito; "Una producción nunca deberá sobrescribirse. Claude almacenará siempre nuevas versiones." |
| Retroalimentación | fortalezas, errores, sugerencias, criterios DELF, recomendaciones |
| Simulación | cada simulación realizada |
| Progreso | estado del estudiante; "Nunca será calculado únicamente mediante porcentaje" |
| Coach Memory | patrones, dificultades, preferencias, fortalezas, estrategias exitosas |
| Logros | información de gamificación |

**Relaciones (cadena conceptual):** Usuario → tiene muchas actividades → actividad genera una producción → producción genera varias retroalimentaciones → retroalimentaciones alimentan la memoria del Coach → memoria modifica Mi Plan → Mi Plan genera nuevos entrenamientos. "Toda la plataforma deberá formar un único ecosistema conectado."

**Modelo conceptual de alto nivel:**
```
Usuario
├── Perfil
├── Configuración
├── Mi Plan
├── Progreso
├── Memoria del Coach
├── Unidades
│   └── Actividades
│   └── Producciones
│       ├── Versiones
│       ├── Retroalimentaciones
│       └── Reescrituras
├── Centro de Entrenamiento
├── Centro de Simulación
├── Logros
├── Analíticas
└── Dashboard
```

**Modelo conceptual alternativo (Anexo B, Cap. 15):** `Usuario → Curso → Unidad → Actividad → Intento → Retroalimentación → Evaluación → Certificado`. Introduce entidades `Curso` e `Intento` no presentes en el modelo conceptual del Cap. 4 ni en el Domain Modeling detallado (sección 13). Ver nota en sección 17.1.

**Reglas obligatorias (Cap. 4):** utilizar UUID como identificador principal; emplear claves foráneas en todas las relaciones; versionar producciones y retroalimentaciones; evitar duplicación de información; documentar cada entidad; mantener consistencia entre nombres de tablas y modelos; diseñar esquemas preparados para futuras ampliaciones.

**Restricciones (Cap. 4):** no almacenar información redundante; no eliminar historiales pedagógicos relevantes; no sobrescribir producciones escritas; no acoplar el modelo de datos a un proveedor específico de IA; no crear tablas sin una responsabilidad claramente definida.

**Seguridad de datos (Cap. 4):** Row Level Security (RLS) en Supabase; políticas de acceso por usuario; cifrado de datos sensibles cuando corresponda; auditoría de cambios importantes; "El estudiante solo podrá acceder a su propia información."

> El esquema físico detallado de la base de datos (todas las tablas, campos, tipos e índices) se documenta íntegramente en la sección 13.

### 5.6 Orquestación Inteligente del Ecosistema (PRD, Capítulo 14 — principio arquitectónico transversal)

**Objetivos de la orquestación:** garantizar la comunicación permanente entre todos los ecosistemas; evitar la duplicación de información; mantener actualizado el perfil pedagógico del estudiante; personalizar continuamente el recorrido de aprendizaje; asegurar la coherencia entre recomendaciones, actividades y evaluaciones; permitir la escalabilidad del producto mediante una arquitectura modular. "Cada componente desarrollado por Claude deberá integrarse en este sistema de comunicación."

**Flujo global de información (ejemplo textual):** al finalizar una actividad en la Academia: se actualiza el % de progreso en Evolución; el Dashboard muestra el nuevo estado; Mi Plan reorganiza las siguientes sesiones; el Centro de Entrenamiento Diario genera nuevos desafíos relacionados; el Coach IA incorpora la información a su memoria pedagógica. "La información nunca deberá permanecer aislada dentro de un único ecosistema."

**Perfil pedagógico unificado:** un único perfil de aprendizaje por estudiante, actualizado automáticamente desde: Academia, Laboratorio Inteligente de Lectura y Escritura, Centro de Entrenamiento Diario, Centro de Simulación DELF B2, Evolución, Mi Plan, Dashboard, Coach IA.

**Motor de personalización:** interpreta continuamente el comportamiento del estudiante (competencias dominadas, dificultades recurrentes, frecuencia de entrenamiento, tiempo disponible, resultados obtenidos, evolución histórica, hábitos de estudio, preferencias configuradas) y adapta automáticamente contenido, recomendaciones y planificación.

**Automatización del aprendizaje (ejemplos de reacción automática sin intervención manual):**
- Interrupción del entrenamiento varios días → Mi Plan reorganiza el calendario + Coach IA ofrece estrategias para retomar el ritmo.
- Simulación revela dificultades en cohesión textual → Laboratorio propone actividades específicas + Centro de Entrenamiento Diario genera desafíos relacionados.
- Competencia consolidada → el sistema reduce gradualmente el apoyo y aumenta la complejidad de las tareas.

**Consistencia de la experiencia:** misma identidad visual, mismo lenguaje pedagógico, mismos criterios de evaluación, misma arquitectura de navegación, mismo tono del Coach IA, interacción uniforme entre módulos. "El estudiante deberá percibir Redaction Lab como un único entorno de aprendizaje y no como un conjunto de herramientas independientes."

**Directrices de verificación para Claude** antes de desarrollar cualquier funcionalidad: ¿puede comunicarse con el resto de ecosistemas? ¿utiliza el perfil pedagógico unificado? ¿actualiza automáticamente indicadores correspondientes? ¿mantiene coherencia de experiencia de usuario? ¿fortalece el sistema de personalización? ¿puede ampliarse sin afectar la arquitectura existente? "Ningún módulo deberá comportarse como una aplicación independiente."

### 5.7 Orquestación de Servicios y Flujo de Ejecución (PRD, Capítulo 9)

**Principios:** desacoplamiento entre servicios; comunicación mediante interfaces públicas; ejecución orientada a eventos; responsabilidad única por servicio; consistencia transaccional; trazabilidad de los procesos; tolerancia a fallos; escalabilidad horizontal.

**Arquitectura general:**
```
Usuario → Interfaz (UI) → Controlador de Acción → Motor de Orquestación
  ├── Motor Pedagógico
  ├── Coach IA
  ├── Base de Datos
  └── Analíticas
       │
       ├── Mi Plan
       ├── Dashboard
       └── Centro de Entrenamiento
```

**Flujo general de ejecución (ejemplo):** 1) el estudiante realiza una acción; 2) la interfaz valida la información; 3) se envía la solicitud al servidor; 4) el Motor de Orquestación identifica el tipo de evento; 5) se ejecutan los servicios correspondientes; 6) se actualiza la base de datos; 7) se recalcula el progreso; 8) se actualiza la memoria pedagógica; 9) se generan nuevas recomendaciones; 10) se responde al usuario.

**Sistema basado en eventos** (ejemplos): usuario registrado; inicio de sesión; actividad iniciada; actividad completada; producción enviada; retroalimentación generada; simulación finalizada; objetivo alcanzado; racha actualizada; cambio de configuración.

**Servicios y responsabilidades:**
- **Servicio de autenticación** — gestiona identidad y sesiones.
- **Motor Pedagógico** — calcula decisiones educativas.
- **Coach IA** — genera acompañamiento y retroalimentación.
- **Servicio de progreso** — actualiza competencias y evolución.
- **Servicio de gamificación** — calcula experiencia, logros, niveles, rachas, recompensas.
- **Servicio de analíticas** — registra eventos relevantes.
- **Servicio de notificaciones** — programa recordatorios, mensajes del Coach, avisos de entrenamiento, logros, recomendaciones.

**Flujo de una producción escrita (secuencia obligatoria):**
```
Entrega del texto → Validación → Almacenamiento → Evaluation Engine → Feedback Engine
→ Actualización de la memoria pedagógica → Motor Pedagógico → Actualización de Mi Plan
→ Actualización del Dashboard → Actualización de Evolución → Respuesta del Coach IA
```
"Cada etapa deberá completarse antes de iniciar la siguiente, salvo aquellas que puedan ejecutarse de forma paralela sin comprometer la coherencia de los datos."

**Comunicación entre ecosistemas:** "Los ecosistemas no deberán comunicarse directamente entre sí." Ejemplos explícitos: el Dashboard no consultará directamente la Academia; la Academia no modificará Mi Plan; Mi Plan no actualizará la memoria del Coach IA. Toda interacción debe pasar por el Motor de Orquestación o servicios compartidos.

**Gestión de errores:** cada servicio implementa mecanismos de recuperación; cuando un proceso falla se registra el error, se notifica únicamente la información relevante al usuario, se evita la pérdida de datos, se intenta reanudar el proceso cuando sea posible. "Los errores internos nunca deberán exponerse directamente en la interfaz."

**Procesamiento asíncrono (background jobs):** generación de estadísticas, actualización de analíticas, creación de recomendaciones futuras, sincronización de memoria, envío de notificaciones. "El usuario no deberá esperar innecesariamente a que finalicen estos procesos."

**Flujo integral de referencia de toda la plataforma:**
```
Usuario → Interfaz → Controlador → Motor de Orquestación
  ├── Autenticación
  ├── Motor Pedagógico
  ├── Coach IA
  ├── Base de Datos
  ├── Analíticas
  ├── Gamificación
  ├── Notificaciones
  → Actualización del estado → Renderizado de la interfaz
```

**Reglas obligatorias (Cap. 9):** mantener todos los servicios desacoplados; utilizar eventos para coordinar procesos complejos; centralizar la lógica de orquestación; ejecutar procesos asíncronos cuando sea apropiado; registrar eventos relevantes; mantener la consistencia entre todos los ecosistemas.

**Restricciones (Cap. 9):** no permitir comunicación directa entre ecosistemas cuando exista un servicio de orquestación; no duplicar lógica de negocio en distintos módulos; no bloquear la interfaz por procesos secundarios; no realizar llamadas redundantes a la IA; no actualizar información crítica sin registrar el evento correspondiente.

### 5.8 Rol de Claude durante el desarrollo (Prompt Maestro, PRD Cap. 12)

Durante todo el desarrollo del proyecto, Claude actuará simultáneamente como: arquitecto de software Full Stack; especialista en UX/UI para plataformas educativas; ingeniero Frontend (React, Next.js, TypeScript); ingeniero Backend (NestJS y PostgreSQL); diseñador de bases de datos; especialista en Inteligencia Artificial aplicada a la educación; experto en preparación del DELF B2; experto en didáctica del Francés como Lengua Extranjera (FLE); especialista en neuroeducación y aprendizaje autorregulado; ingeniero DevOps; especialista en accesibilidad digital (WCAG 2.1 AA); redactor de documentación técnica.
## 6. Módulos y Ecosistemas Funcionales

> La nomenclatura de los ecosistemas varía entre documentos. Se presenta aquí la descripción funcional consolidada de cada ecosistema, indicando entre paréntesis los distintos nombres que recibe en cada fuente. El mapeo completo de nombres alternativos está en la sección 17.2.

### 6.1 Landing Page

Objetivo: "Presentar el producto y convertir visitantes en usuarios." "No pertenece al proceso de aprendizaje." (Doc 3)

Componentes: logo, nombre del producto, propuesta de valor, beneficios, demostración, testimonios, planes, registro, inicio de sesión (Doc 3). Descripción ampliada (Doc 6): presentación breve del entrenador, beneficios principales, testimonios, ejemplos del funcionamiento de la plataforma, llamado a la acción (CTA) claro para registro/login, sección de filosofía del producto.

### 6.2 Registro, Inicio de Sesión y Onboarding

Dos recorridos: usuario nuevo → onboarding; usuario recurrente → directo al Dashboard Inteligente (Doc 3).

**Onboarding (solo una vez — "Este recorrido nunca vuelve a aparecer"):**
1. **Conocer al estudiante**: ¿Cuándo presentarás el DELF?, ¿Cuántos minutos puedes estudiar al día?, ¿Has presentado el examen antes?, ¿Cuál crees que es tu mayor dificultad?
2. **Diagnóstico inicial**: pequeñas actividades. "El objetivo no es evaluar. Es conocer."
3. **Creación automática de "Mi Plan"**: ejemplo dado — Fecha del examen: 15 noviembre; Tiempo restante: 114 días; Objetivo: 25/25; Entrenamiento recomendado: 35 minutos diarios; Horas estimadas: 95 horas. "Este plan será dinámico."

Fase de inducción adicional (Doc 8, solo primer ingreso): se explican características del examen DELF B2, criterios oficiales de evaluación, estructura de la prueba escrita y funcionamiento general del entrenador.

Flujo de primer ingreso completo (Doc 1): el estudiante llega → crea una cuenta → la plataforma le da la bienvenida → hace un diagnóstico inicial → la IA identifica fortalezas y debilidades → se crea automáticamente un plan de entrenamiento → el estudiante realiza su primera misión → recibe una retroalimentación inmediata → obtiene su primera estadística → comienza su progreso.

Flujo técnico de registro (PRD Cap. 5, secuencial y automático — el usuario nunca lo ejecuta manualmente): 1) crear la identidad en Clerk; 2) crear el perfil en la base de datos; 3) crear el perfil pedagógico inicial; 4) inicializar la memoria del Coach IA; 5) crear Mi Plan inicial; 6) crear el Dashboard personalizado; 7) registrar la fecha de creación; 8) iniciar el recorrido de onboarding.

### 6.3 Dashboard (Inicio)

"El Dashboard constituye el núcleo de toda la plataforma. No funciona como un simple menú de navegación, sino como el centro de control desde el cual el estudiante organiza todo su proceso de aprendizaje." (Doc 6). Objetivo: "Dar al estudiante una visión clara de su progreso y orientarlo sobre qué hacer a continuación." (Doc 1)

Debe responder en menos de 5 segundos a 4 preguntas fundamentales (Doc 8): ¿Dónde estoy? ¿Cómo voy? ¿Qué debo hacer hoy? ¿Qué tan cerca estoy de mi objetivo?

**Arquitectura del Dashboard (componentes, en orden, Doc 8 Cap. 4):**
1. **Bienvenida** — saludo personalizado, avatar del Coach IA, mensaje motivador contextual, fecha y hora de la última sesión.
2. **Mi objetivo** — fecha prevista del examen DELF B2, días restantes, % general de preparación, nivel estimado de desempeño, avance hacia la meta.
3. **Mi Plan (vista resumida)** — horas recomendadas semanales, sesiones completadas, sesiones pendientes, objetivo diario, progreso semanal.
4. **"Continúa donde te quedaste"** — última unidad estudiada, última actividad, último texto escrito, retroalimentaciones pendientes, simulaciones incompletas. "El acceso deberá realizarse mediante un único clic."
5. **Recomendación del Coach IA** — una única recomendación prioritaria con breve explicación justificativa.
6. **Evolución (resumen visual)** — indicadores de calidad de escritura, organización textual, gramática, cohesión, vocabulario, frecuencia de estudio, autonomía.
7. **Acceso a los ecosistemas** — Introducción al DELF B2, Academia, Laboratorio de Lectura y Escritura, Desafíos, Simulador, Evolución, Mi Plan, Perfil.

Comportamiento inteligente: "Dos estudiantes nunca tendrán exactamente el mismo Dashboard, aunque compartirán la misma estructura visual." Se adapta según: progreso alcanzado, dificultades detectadas, frecuencia de estudio, fecha del examen, resultados de simulaciones, hábitos de aprendizaje.

Ejemplo concreto (Doc 3): "Hola Diego 👋 — Hoy entrenaremos durante 25 minutos. Tu progreso 72%. Próximo objetivo: Dominar la carta formal. Hoy recomendamos: continuar Academia, escribir una carta, realizar el reto diario. Botón: Comenzar entrenamiento."

Regla de continuidad: "Al finalizar cualquier actividad, la plataforma no regresará automáticamente al menú principal. En su lugar, ofrecerá una transición natural hacia la siguiente etapa del recorrido."

### 6.4 Academia DELF B2 (también: "Conoce el DELF", "Taller de Escritura")

Objetivo: "Enseñar los fundamentos necesarios antes de escribir." (Doc 1) "Este módulo sería la parte 'teórica' de tu antigua cartilla." (Doc 1)

Contenido (Doc 1): ¿Cómo funciona la producción escrita del DELF B2?; criterios oficiales de evaluación; tipos de textos; organización textual; registro formal e informal; conectores; gramática clave; léxico; estrategias para el examen.

Dividido en dos partes (Doc 3): *Academia DELF B2* (estructura, criterios oficiales, rúbricas, estrategias, gestión del tiempo, errores frecuentes, consejos del examinador) y *Academia de Escritura* (todos los tipos de texto, cada uno con estructura secuencial: Presentación → Objetivos → Estructura → Elementos lingüísticos → Análisis de modelos → Ejemplos comentados → Actividades IA → Mini evaluación → Retroalimentación → Desbloquear siguiente unidad).

Secuencia NeuroUX obligatoria de cada unidad (Doc 8, Cap. 5 — "Todas las unidades del entrenador deberán seguir exactamente el siguiente recorrido"): 1) Contextualizar; 2) Definir objetivos; 3) Comprender; 4) Observar; 5) Analizar; 6) Practicar; 7) Producir; 8) Recibir retroalimentación; 9) Reescribir; 10) Reflexionar; 11) Desbloquear. "Ninguna unidad podrá omitir etapas esenciales ni alterar el orden general del recorrido."

### 6.5 Biblioteca de Modelos

Contenido (Doc 1): modelos completos, producciones excelentes, producciones con errores, análisis detallado, comentarios de la IA. "No solo leería textos, sino que comprendería por qué unos obtienen mejor puntuación que otros."

### 6.6 Laboratorio de Escritura / Laboratorio de Lectura y Escritura (Corazón del producto)

Marcado con ⭐ en el Libro Maestro como "el corazón del proyecto": "Es donde pasará la mayor parte del tiempo." (Doc 1) El estudiante puede: elegir un tipo de texto, elegir un nivel de dificultad, generar un tema nuevo con IA, escribir directamente en la plataforma, guardar borradores, consultar herramientas de apoyo.

Descrito en Product Architecture (Doc 3) como "nuestro mayor diferencial": "Aquí el estudiante deja de preparar el examen. Empieza a desarrollar competencias reales." Cuatro espacios:
- **Biblioteca temática**: textos auténticos, clasificados por temas DELF.
- **Exploración**: la IA ayuda a comprender — resume, explica, pregunta, relaciona ideas.
- **Escritura libre**: el estudiante escribe sin presión; puede modificar, reescribir, comparar versiones.
- **Generador inteligente**: "La IA crea consignas nuevas a partir de cualquier texto. Esto significa que un mismo texto podrá generar decenas de ejercicios distintos."

### 6.7 Corrector Inteligente

Tras escribir, la IA analiza (Doc 1): adecuación a la consigna, organización, coherencia, cohesión, riqueza léxica, gramática, ortografía, registro, conectores, vocabulario repetido — "y ofrecerá una retroalimentación alineada con los criterios del DELF." Ver desarrollo completo del motor de evaluación en la sección 10.

### 6.8 Entrenamiento Personalizado / Centro de Entrenamiento (Desafíos)

"No mostraría ejercicios iguales para todos." Ejemplo de mensaje del sistema (Doc 1): "Has mejorado la organización, pero todavía cometes muchos errores con los conectores concesivos. Te recomiendo estas tres actividades antes de hacer otro simulacro." "Sería una especie de entrenador personal."

Descrito en Doc 3 como el ecosistema que responde a "¿Qué debo hacer hoy?": misión diaria, reto semanal, práctica personalizada, gamificación, logros, rachas, recompensas. "Aquí se construye el hábito." Basado en repetición espaciada, recuperación activa, práctica deliberada e intercalado de contenidos (Doc 6).

### 6.9 Simulador Oficial (Simulador DELF / Simulador DELF B2)

Componentes (Doc 1): cronómetro, consigna tipo DELF, límite de palabras, interfaz sin ayudas (modo examen), evaluación posterior.

Descrito en Doc 3: "Entrenamiento en condiciones reales." Incluye banco de simulacros, cronómetro oficial, entrega del texto, evaluación IA, rúbrica oficial, informe detallado, comparación con simulacros anteriores. El Coach IA reduce considerablemente sus intervenciones durante la simulación.

Ver especificación técnica detallada de la evaluación final en la sección 10.2 (incluye modo bloqueado/fullscreen, autosave cada 20 segundos, panel lateral de herramientas).

### 6.10 Gamificación y Desafíos

Ver desarrollo completo en la sección 11.

### 6.11 Perfil y Analíticas / Mi Evolución

Datos mostrados (Doc 1): evolución de notas, tipos de textos practicados, fortalezas, debilidades, tiempo dedicado, historial de producciones, objetivos alcanzados.

Descrito en Doc 3: "No solo mostrará estadísticas. Mostrará aprendizaje." Ejemplos de mensajes: "Has reducido los errores de cohesión un 42%." "Ahora utilizas conectores más variados." "Tu organización textual pasó de nivel B1 a B2." Incluye también fortalezas, próximos objetivos, recomendaciones del Coach IA.

### 6.12 Mi Plan

"Este módulo no existía en nuestra primera propuesta, pero ahora creo que es imprescindible. Será el 'GPS' del estudiante." (Doc 3) Contiene: fecha del examen, cuenta regresiva, horas estudiadas, horas recomendadas, calendario de entrenamiento, porcentaje de avance, metas semanales, objetivos personalizados, posibilidad de reprogramar el plan si cambian las fechas. "El Dashboard tomará la información de aquí para decidir qué mostrar cada día."

Componentes de la personalización del plan (PRD Cap. 6, Learning Planner): analiza disponibilidad, progreso, fecha del examen, prioridades; genera propuestas de entrenamiento adaptativas.

### 6.13 Coach IA (no es un módulo navegable)

"El Coach IA no aparece en el menú. Porque no es un lugar al que el estudiante entra. Es una presencia constante." (Doc 3) Ver desarrollo íntegro en la sección 9.1.

### 6.14 Espacio del Profesor (producto independiente del espacio del estudiante)

"Creo que no deberían ser un módulo más. Deberían tener un espacio independiente. Así habría dos productos en uno: Espacio del estudiante / Espacio del profesor." (Doc 1)

Funciones (Doc 1): crear grupos; asignar tareas; seguir el progreso de cada estudiante; revisar estadísticas; intervenir en la retroalimentación cuando lo considere necesario; analizar las cartas, ver las producciones escritas, hacer correcciones; usar la IA.

Ampliación (PRD Cap. 12, "Flujo del docente"): visualizar estudiantes; revisar progreso; consultar estadísticas; crear grupos; asignar actividades; descargar reportes; revisar producciones escritas; complementar la retroalimentación automática.

### 6.15 Panel Administrativo

Gestión de usuarios (PRD Cap. 11): crear usuarios, editar perfiles, bloquear cuentas, eliminar cuentas, restablecer contraseñas. Gestión de contenidos: editar lecciones, actividades, ejemplos, recursos, rúbricas, insignias — "sin necesidad de modificar el código." Estadísticas: usuarios activos, tiempo promedio, actividades realizadas, errores frecuentes, nivel promedio, progreso, uso de IA.

Flujo del administrador (PRD Cap. 12): gestionar usuarios; administrar contenidos; configurar el sistema; visualizar métricas globales; gestionar certificados; controlar permisos; configurar proveedores de IA.

### 6.16 Mapeo consolidado de nomenclatura de ecosistemas entre documentos

| Concepto funcional | Doc 1 (Libro Maestro) | Doc 3 (Product Architecture) | Doc 6/Doc 8 (UX) | Doc 7 (Design System) |
|---|---|---|---|---|
| Pantalla de inicio | Inicio (Dashboard) | Dashboard Inteligente | Dashboard | Dashboard |
| Teoría del examen | Academia DELF B2 | Conoce el DELF | Academia | Academia |
| Práctica de escritura | Taller de Escritura / Academia de Escritura | Taller de Escritura | Academia (unidades) | Academia |
| Práctica libre / lectura | Laboratorio de Escritura | Laboratorio de Lectura y Escritura | Laboratorio (Doc 6) / Laboratorio de Lectura y Escritura (Doc 8) | Laboratorio de Lectura y Escritura |
| Hábito diario | Entrenamiento Personalizado / Gamificación y Desafíos | Centro de Entrenamiento | Entrenamiento (Doc 6) / Desafíos (Doc 8) | Entrenamiento (Desafíos) |
| Examen simulado | Simulador Oficial | Simulador DELF | Simulador (Doc 6) / Simulador DELF B2 (Doc 8) | Simulador DELF B2 |
| Progreso/estadísticas | Perfil y Analíticas | Mi Evolución | Evolución | Evolución |
| Planificación | (no existe como módulo separado) | Mi Plan | Mi Plan | Mi Plan |
| Corrección automática | Corrector Inteligente | (función transversal del Coach IA / Simulador) | (función transversal) | (función transversal) |

Ver detalle de las contradicciones de nomenclatura no resueltas en la sección 17.2.
## 7. Metodología Pedagógica y Sistema DELF B2

### 7.1 Fundamento pedagógico central

"Escribir es un proceso de resolución de problemas." Implica interpretar la situación comunicativa, organizar ideas, seleccionar información relevante, planificar, controlar múltiples aspectos lingüísticos simultáneamente y revisar críticamente (Doc 4).

"El entrenador no concibe la escritura como una actividad final que aparece después de estudiar teoría. Por el contrario, considera que escribir es el mecanismo mediante el cual se construye el aprendizaje." (Doc 4)

Diagnóstico pedagógico de por qué fracasan los estudiantes (no por falta de gramática, sino por): comenzar a escribir sin planificar; interpretar parcialmente la consigna; no identificar correctamente al destinatario; usar registro demasiado informal; desarrollar ideas poco conectadas; repetir vocabulario; usar conectores mecánicamente; no argumentar de forma coherente y cohesionada; no tener amplio vocabulario; no considerar el límite de tiempo; traducir literalmente desde la lengua materna; no revisar antes de entregar (Doc 4).

Explicación neurocientífica: "sobrecarga de la memoria de trabajo. El estudiante intenta atender simultáneamente a la gramática, el vocabulario, la organización textual y el contenido argumentativo, superando la capacidad limitada de procesamiento consciente." Por ello, "la plataforma deberá secuenciar el aprendizaje y distribuir la carga cognitiva mediante actividades progresivas, retroalimentación inmediata y práctica espaciada." (Doc 4)

Fundamentación teórica citada explícitamente: Cognitive Load Theory (John Sweller); práctica deliberada (Anders Ericsson); Zona de Desarrollo Próximo (Lev Vygotsky).

### 7.2 El ciclo oficial de aprendizaje (aplicable a todo tipo de texto — carta formal, artículo, correo, texto argumentativo)

"El estudiante recorrerá siempre las mismas etapas cognitivas" (Doc 4):

1. **Comprender** — primera tarea: comprender la situación comunicativa (¿Quién escribe? ¿A quién? ¿Por qué? ¿Qué debe conseguir? ¿Qué espera el destinatario? ¿Cuál es la intención comunicativa?). "El entrenador nunca permitirá que el estudiante comience a escribir sin haber demostrado previamente que comprende la consigna."
2. **Observar** — observación de modelos auténticos múltiples (no memorización). "El entrenador evitará presentar un único modelo."
3. **Analizar** — el estudiante se convierte en "investigador del texto": organización interna, función de cada párrafo, progresión de ideas, relación entre conectores, elección del registro, eficacia comunicativa.
4. **Practicar** — actividades pequeñas antes de la producción completa: ordenar párrafos, seleccionar conectores, reconstruir textos, completar fragmentos, reorganizar argumentos, mejorar frases.
5. **Recibir retroalimentación** — no es "una simple corrección de errores"; su objetivo es ayudar a comprender por qué una decisión comunicativa es más eficaz que otra. "La plataforma priorizará preguntas antes que respuestas." Ejemplos: "¿Crees que este saludo corresponde a una carta formal?"; "¿Este argumento responde realmente al problema planteado en la consigna?"; "¿Observas alguna repetición innecesaria?"
6. **Reescribir** — "constituye probablemente la etapa más importante de todo el proceso." "La primera versión nunca representa el producto final del aprendizaje." Cada producción es "un borrador susceptible de mejora."
7. **Reflexionar** — preguntas: ¿Qué aprendí hoy? ¿Qué fue lo más difícil? ¿Qué error cometí con mayor frecuencia? ¿Qué estrategia funcionó mejor? ¿Qué debo practicar nuevamente?
8. **Entrenar nuevamente** — el aprendizaje no termina al completar una actividad correctamente; se programan nuevas oportunidades de recuperación días o semanas después (práctica distribuida/espaciada, más eficaz que la repetición intensiva).
9. **Dominar** — el dominio "no se medirá por la ausencia absoluta de errores", sino por la capacidad de usar la habilidad de manera flexible en situaciones nuevas, con autonomía creciente. "Dominar significa transferir el conocimiento." Cuando se alcanza: "la plataforma dejará de ser un instructor para convertirse únicamente en un compañero de perfeccionamiento."

**Reglas de integridad del ciclo (obligatorias):**
- "La unidad comenzará siempre con una fase de planificación, nunca con la escritura directa."
- "El Coach IA verificará primero la comprensión de la consigna antes de permitir que el estudiante escriba."
- "La retroalimentación se centrará inicialmente en aspectos macrotextuales (intención comunicativa, estructura, coherencia y adecuación) antes de corregir errores gramaticales menores."
- "Ninguna actividad, interacción del Coach IA o elemento de la plataforma podrá romper este ciclo de aprendizaje."
- "La inteligencia artificial no entregará respuestas antes de que el estudiante haya pensado."
- "Las actividades no comenzarán con escritura libre sin una fase previa de comprensión y análisis."
- "La evaluación no se limitará a una calificación final, sino que acompañará todo el proceso."
- "Cada módulo del entrenador, independientemente del tipo de texto trabajado, respetará esta secuencia pedagógica."

### 7.3 Principios científicos del modelo (presentes en todas las unidades)

Aprendizaje activo; segmentación (cada etapa trabaja una única habilidad); práctica deliberada; recuperación activa; retroalimentación formativa (los errores orientan el aprendizaje, no lo penalizan); metacognición; transferencia (aplicar estrategias a cualquier situación de escritura, no solo resolver una actividad).

### 7.4 Sistema DELF B2 — perfil de entrada y competencias

Nivel de entrada esperado: "aproximadamente un nivel B1 consolidado."

- **Competencia lingüística previa**: tiempos verbales frecuentes; vocabulario amplio de temas DELF; conectores básicos; vocabulario cotidiano; estructuras sintácticas relativamente complejas.
- **Competencia discursiva previa**: organización básica de párrafos; capacidad de expresar opiniones; noción de coherencia textual.
- **Competencia estratégica previa**: comprensión lectora suficiente para interpretar consignas; capacidad de buscar información en modelos; disposición a revisar y corregir.

Explícitamente NO necesario antes de comenzar: memorizar cartas modelo; conocer listas extensas de conectores; dominar perfectamente toda la gramática francesa; poseer vocabulario especializado; escribir sin cometer errores.

**Competencias/destrezas objetivo (equivalentes a subcompetencias evaluables):** analizar una consigna e identificar la intención comunicativa; reconocer el destinatario y adaptar el registro; planificar el texto antes de escribir; organizar argumentos de forma lógica y coherente; utilizar conectores discursivos variados; redactar una carta formal completa respetando convenciones del género; revisar críticamente la propia producción; reescribir aplicando retroalimentación.

En el modelo de datos (Domain Modeling, Cap. 8, tabla `Competency`), las competencias iniciales del sistema son: `TaskAchievement, Coherence, Cohesion, Vocabulary, Grammar, Morphosyntax, Spelling, Register, Argumentation, TextStructure, Revision, Autonomy`.

### 7.5 Objetivo final de la unidad (autonomía)

"Al concluir esta unidad, el estudiante deberá alcanzar una autonomía suficiente para enfrentarse a una nueva consigna de carta formal sin depender constantemente del profesor o de la inteligencia artificial." "La IA deberá convertirse únicamente en una herramienta de verificación y perfeccionamiento, nunca en un sustituto del proceso de escritura." El estudiante deberá ser capaz de: interpretar una nueva situación comunicativa; seleccionar la estructura adecuada; generar ideas propias; escribir una primera versión sin ayuda; utilizar correctamente conectores, fórmulas de despedida y de cortesía; revisar críticamente su producción; decidir qué modificaciones realizar.

### 7.6 Estrategias de aprendizaje incorporadas

Aprendizaje basado en errores (error hunting); microlearning con objetivos diarios; simulaciones progresivas con retroalimentación inmediata; gamificación para mantener hábitos de escritura (Doc 1).

### 7.7 Nombre exacto del examen y variantes textuales oficiales

"DELF B2 Producción Escrita" / en francés: "Évaluation Finale DELF B2" / "Production Écrite" (PRD Cap. 10).

---

## 8. Experiencia de Usuario (UX / NeuroUX)

### 8.1 Filosofía NeuroUX (Doc 8, Cap. 1)

"La experiencia de usuario de Redaction Lab se fundamenta en un principio esencial: aprender constituye una experiencia cognitiva, emocional y conductual." "Redaction Lab no es únicamente una aplicación web para preparar el examen DELF B2. Es un entrenador inteligente cuya experiencia ha sido diseñada para optimizar la adquisición de competencias de escritura mediante la integración de principios provenientes de la neurociencia cognitiva, la psicología del aprendizaje, la didáctica de las lenguas extranjeras y la inteligencia artificial."

**8 Principios de NeuroUX (textuales):**
1. Reducir la carga cognitiva extrínseca.
2. Favorecer la atención sostenida.
3. Estimular la recuperación activa.
4. Promover la práctica deliberada.
5. Fortalecer la metacognición.
6. Construir hábitos de aprendizaje (Mi Plan, sesiones, rachas, objetivos semanales).
7. Incrementar la percepción de autoeficacia.
8. Favorecer la autonomía (apoyo intenso al inicio, decreciente con el dominio).

**Directrices de verificación (aplicables a cada pantalla/componente/flujo, respondidas antes de implementar):** ¿Reduce la carga cognitiva del estudiante? ¿Favorece la atención sobre el contenido realmente importante? ¿Estimula la práctica activa y la reflexión? ¿Ofrece retroalimentación útil para mejorar? ¿Fortalece la percepción de progreso y autoeficacia? ¿Promueve la autonomía en lugar de la dependencia? ¿Contribuye al desarrollo de hábitos de estudio sostenibles? ¿Respeta la función del Coach IA como mentor y no como sustituto del estudiante? "Si la respuesta a alguna de estas preguntas es negativa, Claude deberá reconsiderar la solución propuesta."

### 8.2 El recorrido NeuroUX del estudiante (8 etapas)

1. **Descubrir** — conoce la plataforma, comprende su propósito, explora funcionalidades principales.
2. **Comprender** — aprende cómo funciona la prueba escrita del DELF B2 y sus criterios de evaluación.
3. **Aprender** — estudia tipos de texto mediante explicaciones, ejemplos y actividades guiadas.
4. **Practicar** — produce textos, recibe retroalimentación, revisa, desarrolla autonomía.
5. **Entrenar** — consolida mediante desafíos breves, recuperación activa, sesiones periódicas.
6. **Simular** — exámenes completos en condiciones similares a la evaluación oficial.
7. **Reflexionar** — analiza su progreso, identifica fortalezas/dificultades, redefine objetivos.
8. **Dominar** — nivel de desempeño que permite afrontar el DELF B2 con confianza, autonomía y seguridad.

### 8.3 Arquitectura de navegación (Doc 8, Cap. 3)

**Estructura general de navegación (9 espacios principales):** Dashboard (centro de control); Mi Plan; Introducción al DELF B2; Academia; Laboratorio de Lectura y Escritura; Desafíos; Simulador DELF B2; Evolución; Perfil.

**Principios de navegación:** claridad; consistencia (mismos menús/comportamiento en todos los ecosistemas); continuidad (retomar exactamente donde se dejó); orientación (sugerencia del siguiente paso sin recorrido obligatorio); accesibilidad (mínimo número de interacciones); flexibilidad (libertad de recorrer ecosistemas).

**Navegación adaptativa:** "Uno de los principios fundamentales de Redaction Lab será la navegación adaptativa." Ejemplo: si un estudiante presenta dificultades recurrentes en organización textual de cartas formales, el Dashboard prioriza actividades de esa competencia antes de recomendar nuevos contenidos; si el desempeño es sólido, propone desafíos más complejos o simulaciones.

Regla estable de posicionamiento: "Los ecosistemas mantendrán siempre la misma posición dentro de la navegación principal... Claude evitará modificar la ubicación de los elementos entre diferentes pantallas."

### 8.4 Dashboard Experience — ver desarrollo completo en la sección 6.3.

### 8.5 Experiencia de aprendizaje dentro de una unidad — ver secuencia obligatoria de 11 pasos en la sección 6.4.

Rol del Coach IA en la unidad: mentor permanente, intervención contextual y adaptativa; puede explicar conceptos, aclarar instrucciones, formular preguntas, ofrecer ejemplos adicionales, orientar la planificación, dar retroalimentación, sugerir estrategias, recomendar recursos. "En ningún caso generará la respuesta completa ni redactará el texto por el estudiante."

### 8.6 Experiencia del error (Doc 8, Cap. 7)

"Redaction Lab concibe el error como un componente esencial del aprendizaje y no como un indicador de fracaso." "Claude evitará utilizar expresiones categóricas como 'incorrecto', 'fallaste' o 'respuesta equivocada'."

**5 principios NeuroUX del error:**
1. El error informa — se usa para personalizar actividades futuras.
2. El error no define al estudiante — la retroalimentación evalúa la producción, nunca a la persona.
3. El error requiere contexto — toda corrección explica qué ocurrió, por qué ocurrió, cómo puede corregirse, cuándo volverá a utilizarse esa competencia.
4. El error genera práctica — siempre hay oportunidad inmediata de aplicar la recomendación (reescritura o nueva actividad).
5. El error fortalece la memoria — las competencias con más errores reaparecen en desafíos, laboratorio y simulaciones mediante repetición espaciada.

**Secuencia constante del Coach IA frente al error:** 1) reconoce el esfuerzo realizado; 2) explica el aspecto que requiere atención; 3) ofrece una explicación clara y adaptada al nivel; 4) propone una acción concreta para mejorar. Ejemplo: "Has organizado muy bien tus ideas principales. Observemos ahora cómo podemos fortalecer la cohesión entre los párrafos utilizando conectores más variados. Practiquemos este aspecto en la siguiente versión del texto."

Diseño emocional del error: "Claude evitará utilizar colores, iconos o animaciones que transmitan fracaso o penalización." "Ninguna corrección deberá finalizar sin ofrecer una posibilidad real de mejora."

### 8.7 Motivación y compromiso (Doc 8, Cap. 8)

"Redaction Lab no busca que el estudiante pase más tiempo conectado, sino que construya un hábito sostenible de entrenamiento" — contraste explícito con "la mayoría de plataformas [que] responden con puntos y medallas."

**6 principios NeuroUX de la motivación:**
1. Propósito visible — el estudiante comprende por qué realiza cada actividad.
2. Progreso visible — indicadores claros de evolución (competencias, calidad de escritura, frecuencia, cumplimiento del plan).
3. Objetivos alcanzables — metas realistas adaptadas al contexto, favoreciendo experiencias frecuentes de logro.
4. Autonomía — el estudiante decide cuándo estudiar, qué revisar; la plataforma orienta sin imponer.
5. Reconocimiento del esfuerzo — se valora el proceso y la constancia, no solo los resultados.
6. Formación de hábitos — sesiones breves y frecuentes, rutinas sostenibles.

"En ningún caso [el Coach IA] utilizará mensajes que generen culpa, comparación con otros estudiantes o presión excesiva."

Mecanismos de gamificación mencionados explícitamente (con precaución): insignias, niveles, desafíos, rachas — "evitando convertir la recompensa en el objetivo principal."

### 8.8 Personalización (Doc 8, Cap. 9)

**5 niveles de adaptación:**
1. Adaptación del plan de estudio — Mi Plan se reorganiza automáticamente ante cambios de fecha/disponibilidad.
2. Adaptación de contenidos — se recomiendan unidades/actividades según competencias que requieren fortalecimiento.
3. Adaptación del Coach IA — principiantes reciben explicaciones más detalladas y acompañamiento frecuente; avanzados reciben intervenciones breves orientadas a la reflexión.
4. Adaptación de la retroalimentación — amplia y orientada al aprendizaje al inicio; sintética y específica después.
5. Adaptación del entrenamiento — Desafíos y Laboratorio incorporan recurrentemente competencias no dominadas (repetición espaciada, recuperación activa).

Principios: la adaptación favorece el aprendizaje, nunca lo limita; el estudiante conserva el control; las recomendaciones son sugerencias, no obligaciones; la plataforma explica transparentemente por qué recomienda algo.

### 8.9 Cierre y continuidad del aprendizaje (Doc 8, Cap. 10)

**Componentes del cierre de sesión, en orden:**
1. Resumen del aprendizaje (competencias trabajadas, avances, fortalezas, oportunidades de mejora).
2. Evidencias de progreso (evolución de calidad textual, disminución de errores, tiempo dedicado, cumplimiento del plan).
3. Reflexión metacognitiva (¿Qué aprendí hoy? ¿Qué fue lo más difícil? ¿Qué estrategia me ayudó? ¿Qué quiero mejorar?).
4. Próximo paso (Dashboard actualiza el plan y muestra la siguiente recomendación).
5. Despedida del Coach IA (mensaje breve, cercano, motivador).

"El estudiante nunca abandonará la plataforma sin conocer cuál es la actividad que le permitirá continuar avanzando." "El cierre nunca deberá limitarse a un mensaje de 'actividad completada'."

### 8.10 Autonomía y transferencia del aprendizaje (Doc 8, Cap. 11)

**5 principios NeuroUX de la autonomía:**
1. Andamiaje progresivo — ayuda intensa al inicio, cada vez más discreta.
2. Reflexión antes que respuesta — el Coach IA formula preguntas antes de explicar.
3. Aplicación en nuevos contextos — situaciones variadas que exigen transferir estrategias, no repetición mecánica.
4. Autorregulación — el estudiante planifica, supervisa, identifica dificultades y fija objetivos sin depender solo de recomendaciones automáticas.
5. Confianza — la plataforma refuerza la percepción de autoeficacia con evidencias concretas de desarrollo.

"En las simulaciones finales, el Coach IA limitará su participación durante la escritura para reproducir las condiciones reales del examen."

### 8.11 La NeuroLearning Experience (Doc 8, Cap. 12 — síntesis integradora)

"La experiencia del estudiante no depende de un único elemento de la plataforma... sino la integración coherente de todos estos componentes."

**7 principios de la NeuroLearning Experience:** aprendizaje con propósito; aprendizaje progresivo; aprendizaje personalizado; aprendizaje activo; aprendizaje emocionalmente seguro; aprendizaje autorregulado; aprendizaje transferible.

Integración de componentes (texto síntesis): "El Dashboard organiza el recorrido del estudiante. Mi Plan estructura el entrenamiento a largo plazo. La Academia construye el conocimiento. El Laboratorio permite experimentar y consolidar competencias. Los Desafíos fortalecen la práctica cotidiana. El Simulador integra todas las habilidades en un contexto auténtico. Evolución convierte el aprendizaje en información observable. El Coach IA conecta permanentemente todos los ecosistemas."

"La tecnología nunca constituirá un fin en sí misma. Cada decisión de diseño deberá estar al servicio del aprendizaje."

### 8.12 Nota de fase futura no desarrollada (mencionada en Doc 8)

El propio Doc 8 propone, sin desarrollarla, una "Fase 9 – Interaction Blueprint (Arquitectura de las interacciones IA)" que definiría con el mismo nivel de detalle: cómo será cada conversación con el Coach IA; cómo funcionarán las correcciones paso a paso; cómo se diseñarán los prompts internos; cómo se adaptará la IA al historial del estudiante; cómo se integrará la memoria pedagógica; cómo se generarán las actividades y simulaciones dinámicamente. Esta fase **no está desarrollada** en ninguno de los 11 documentos fuente analizados; parte de su contenido queda parcialmente cubierto por el PRD Cap. 6-8 (sección 9 de este documento).
## 9. Componentes de Inteligencia Artificial

### 9.1 Coach IA — naturaleza, misión y filosofía (AI Blueprint, Doc 5)

**Aclaración de alcance fundacional:** "Aquí no vamos a diseñar la inteligencia artificial. Vamos a diseñar la personalidad, la pedagogía, la memoria y el comportamiento de ese entrenador." "La IA NO es el producto. La IA es simplemente el profesor. El producto sigue siendo el entrenamiento." "Si mañana cambiamos Claude por GPT, Gemini o cualquier otra IA... La plataforma seguirá funcionando. Porque el verdadero valor estará en este documento."

**Misión formal:** "El Coach IA es un entrenador de escritura cuya misión consiste en desarrollar progresivamente la autonomía del estudiante mediante preguntas, orientación, retroalimentación personalizada y entrenamiento deliberado. Su objetivo no es escribir por el estudiante, sino ayudarle a convertirse en un escritor cada vez más competente, seguro y autónomo." Principio rector repetido: **Autonomía**.

**Definición ampliada (Cap. 6):** "El Coach IA constituye el núcleo inteligente del entrenador y representa el principal elemento diferenciador de la plataforma." "El éxito del entrenador no se medirá por la cantidad de respuestas que ofrece, sino por la capacidad que desarrolla el estudiante para resolver por sí mismo los retos de escritura." "El Coach IA no debe concebirse como un chatbot conversacional, sino como un entrenador pedagógico inteligente."

**Filosofía del Coach (lista textual completa, principio operativo permanente):**
> Nunca escribe por el estudiante. Nunca hace la tarea. Nunca da la respuesta demasiado pronto. Nunca juzga. Nunca ridiculiza. Nunca castiga. Nunca crea dependencia. Siempre hace pensar. Siempre hace preguntas. Siempre recuerda los avances. Siempre adapta el entrenamiento. Siempre motiva. Siempre explica el porqué.

### 9.2 Arquitectura del comportamiento del Coach IA (10 dimensiones)

**1. Cuándo aparece:** "Debe aparecer solamente cuando aporta valor." Casos: antes de comenzar una unidad; antes de una actividad difícil; cuando detecta un error repetitivo; cuando el estudiante lleva mucho tiempo bloqueado; cuando termina una actividad; cuando observa progreso; cuando el estudiante vuelve después de varios días.

**2. Cuándo NO aparece:** no interrumpe constantemente; no felicita después de cada clic; no explica lo obvio; no distrae; no reemplaza la reflexión; no habla mientras el estudiante está concentrado. "La plataforma debe tener silencios."

**3. Cómo habla (personalidad):** profesional, paciente, muy humano, muy claro; nunca infantil, nunca exageradamente entusiasta, nunca robótico, nunca académico, nunca arrogante. "Debe parecer un excelente profesor universitario que además sabe muchísimo sobre aprendizaje."

**4. Cómo piensa (proceso mental antes de responder):** ¿Qué está intentando hacer el estudiante? ¿Qué sabe ya? ¿Qué error está cometiendo? ¿Por qué lo está cometiendo? ¿Qué debería descubrir por sí mismo? ¿Cuánta ayuda necesita? ¿Estoy creando dependencia? ¿Existe una mejor pregunta que una respuesta?

**5. Niveles de ayuda (escalera de andamiaje/scaffolding, obligatoria):**
- Nivel 0: No ayuda. Observa.
- Nivel 1: Hace preguntas.
- Nivel 2: Da una pista.
- Nivel 3: Ofrece un ejemplo parecido.
- Nivel 4: Explica el concepto.
- Nivel 5: Resuelve el problema — "Solo cuando realmente sea necesario." "La respuesta directa constituirá siempre el último recurso."

**6. Memoria pedagógica ("El Coach nunca olvida. Debe recordar"):** los errores frecuentes; los textos escritos; las fortalezas; las debilidades; los conectores que más utiliza; los tiempos verbales; las dificultades; los hábitos; la velocidad; la autonomía; las metas. "No para vigilar. Sino para personalizar."

**7. Cómo motiva:** "No quiero una IA que diga '¡Excelente!' Cada cinco segundos. Quiero algo más inteligente." Ejemplo: "Hoy has utilizado una estructura argumentativa mucho más sólida que hace dos semanas." La motivación surge del propio crecimiento, no de recompensas superficiales.

**8. Cómo corrige** (ver desarrollo íntegro en la sección 9.5).

**9. Cómo personaliza:** "Cada sesión será diferente. Porque el Coach decidirá: Qué actividades aparecen. Qué ejercicios desaparecen. Qué conceptos necesitan repetirse. Qué textos conviene leer. Qué errores volverán a entrenarse." "Cada estudiante tendrá un entrenador diferente."

**10. Cuándo desaparece:** "El mejor Coach... Es el que cada vez aparece menos. Porque el estudiante ya no lo necesita." A medida que aumenta la autonomía, disminuyen frecuencia e intensidad de las intervenciones. "El verdadero éxito del sistema consistirá en que el usuario ya no necesite la ayuda constante de la inteligencia artificial para producir textos de calidad."

### 9.3 Modelo cognitivo del Coach IA (secuencia interna de decisión, descrita como "el capítulo más importante de todos")

1. El estudiante escribe.
2. El Coach analiza la consigna.
3. Analiza el historial del estudiante.
4. Detecta fortalezas.
5. Detecta errores.
6. Clasifica los errores por prioridad.
7. Decide si intervenir.
8. Calcula el nivel de ayuda.
9. Formula una pregunta.
10. Observa la respuesta.
11. Vuelve a analizar.
12. Decide la siguiente acción.

### 9.4 Arquitectura técnica del Sistema de IA Pedagógica (PRD, Capítulo 6)

La IA es un servicio transversal, no un chatbot aislado. "Toda interacción con modelos de lenguaje deberá responder a un objetivo educativo claramente definido." Arquitectura desacoplada con capa de abstracción común, independiente del proveedor.

**Arquitectura general (motores coordinados por AI Orchestrator):**
```
AI Orchestrator
 ├── Coach IA
 ├── Feedback Engine
 └── Evaluation Engine
      Coach IA → Recommendation Engine
      Feedback Engine → Writing Analyzer
      Evaluation Engine → DELF Scoring Engine
Recommendation Engine → Learning Planner → Memory Engine
```

"El AI Orchestrator es el único componente autorizado para comunicarse directamente con los modelos de lenguaje." "Ningún módulo de la plataforma deberá comunicarse directamente con OpenAI, Anthropic u otros proveedores."

**Servicios especializados:**
- **Coach Service** — gestiona conversaciones del Coach IA (responder, orientar, motivar, explicar, acompañar).
- **Feedback Engine** — analiza producciones escritas; genera fortalezas, errores, sugerencias, prioridades de mejora, estrategias de reescritura. "Nunca deberá limitarse a señalar errores gramaticales."
- **Evaluation Engine** — evalúa con criterios oficiales del DELF B2 (adecuación, organización, coherencia, cohesión, vocabulario, gramática, ortografía, registro). "Los criterios deberán mantenerse independientes del modelo de IA."
- **Recommendation Engine** — genera recomendaciones personalizadas (actividades, unidades, simulaciones, entrenamientos diarios, contenidos de la Academia), basadas en el historial.
- **Learning Planner** — colabora con Mi Plan; analiza disponibilidad, progreso, fecha del examen, prioridades; genera propuestas adaptativas.
- **Memory Engine** — gestiona la memoria pedagógica (fortalezas, errores frecuentes, hábitos, objetivos, estrategias exitosas, historial). "El Coach IA utilizará esta memoria antes de generar cualquier respuesta."

**Construcción del contexto (previo a cada consulta):** perfil pedagógico, historial reciente, objetivo de la actividad, tipo de intervención, nivel DELF, preferencias del estudiante, memoria del Coach, instrucciones del sistema. "Las consultas nunca deberán realizarse utilizando únicamente el último mensaje del usuario."

**Flujo de procesamiento:** Usuario → Solicitud → AI Orchestrator → Construcción del contexto → Selección del servicio especializado → Modelo de IA → Validación de la respuesta → Procesamiento pedagógico → Respuesta al estudiante → Actualización de la memoria pedagógica.

**Validación de respuestas (antes de mostrarlas, verificar que):** responde a la solicitud del estudiante; respeta la filosofía pedagógica; no resuelve completamente la actividad; mantiene el tono definido para el Coach IA; utiliza lenguaje claro; favorece la reflexión. "Las respuestas que no cumplan deberán regenerarse o ajustarse."

**Seguridad:** proteger datos personales; anonimizar información cuando sea posible; registrar únicamente la información necesaria; claves API almacenadas de forma segura; ejecución exclusivamente desde el servidor. "Las claves nunca deberán exponerse en el cliente."

### 9.5 Motor de Evaluación / Cómo corrige el Coach IA

**Regla explícita: "Nunca comienza por la gramática."** Orden jerárquico de corrección (mayor a menor prioridad):
1. Comprensión
2. Intención comunicativa
3. Estructura
4. Coherencia
5. Cohesión
6. Argumentación
7. Registro
8. Vocabulario
9. Gramática
10. Ortografía

"La retroalimentación se centrará inicialmente en aspectos macrotextuales... antes de corregir errores gramaticales menores, ya que la evidencia en adquisición de segundas lenguas muestra que intervenir primero sobre la organización del discurso produce mejoras más duraderas en la competencia escrita." (Doc 4)

> **Nota de consolidación:** esta jerarquía de 10 categorías (AI Blueprint / PRD Cap. 6) coexiste con la rúbrica oficial DELF de 5 criterios usada en el módulo de Evaluación Final (sección 10.2): `RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe` (más `RichesseLinguistique` en el modelo de datos). Ambos marcos son consistentes en el principio (macrotextual antes que microtextual) pero no están explícitamente unificados en una única tabla de mapeo en ninguno de los documentos fuente.

### 9.6 Arquitectura de Prompts e Ingeniería de Contexto (PRD, Capítulo 7)

"Un prompt representa una estrategia pedagógica antes que una instrucción técnica." "Los prompts no deberán escribirse directamente en el código de componentes ni generarse de forma improvisada."

**Arquitectura general — Prompt Engine:**
```
Solicitud del usuario → Prompt Engine
 ├── Selección de plantilla
 ├── Recuperación de contexto
 ├── Recuperación de memoria pedagógica
 ├── Recuperación del historial reciente
 ├── Aplicación de reglas pedagógicas
 ├── Construcción del prompt final
→ Modelo de IA → Respuesta → Validación → Entrega al estudiante
```

**Componentes del Prompt Engine:**
- **Prompt Repository** — repositorio versionado de plantillas por categoría pedagógica. "No deberán existir prompts incrustados en el código de la aplicación."
- **Context Builder** — reúne perfil pedagógico, nivel, historial reciente, competencias trabajadas, progreso actual, actividad en curso, memoria del Coach, objetivos, fecha del examen.
- **Prompt Composer** — combina plantilla + contexto en un prompt completo y estructurado.
- **Prompt Validator** — verifica contexto suficiente, ausencia de redundancia, respeto de reglas pedagógicas, formato esperado, ausencia de contradicciones.
- **Response Validator** — comprueba que la respuesta responde a la solicitud, mantiene el tono del Coach, favorece la autonomía, no resuelve completamente la actividad, respeta la filosofía educativa.

**Tipos de prompts (plantillas específicas):** explicación de conceptos; orientación durante una actividad; retroalimentación de producciones escritas; análisis de errores; recomendaciones personalizadas; planificación del entrenamiento; interpretación de indicadores; motivación y acompañamiento; simulaciones DELF; autoevaluación; reflexión metacognitiva; generación de actividades.

**Estructura estándar obligatoria de un prompt:** 1) Rol del sistema; 2) Objetivo pedagógico; 3) Contexto del estudiante; 4) Contexto de la actividad; 5) Información de la memoria pedagógica; 6) Reglas específicas de comportamiento; 7) Restricciones; 8) Formato esperado de la respuesta.

**Optimización del contexto:** recuperar únicamente información relevante; evitar repetir instrucciones constantes; resumir el historial cuando sea muy extenso; reutilizar memoria previamente sintetizada. Objetivo: "maximizar calidad con el menor consumo posible de tokens."

**Seguridad de prompts:** nunca incluir datos personales innecesarios, información confidencial, claves o identificadores sensibles.

### 9.7 Motor Pedagógico Adaptativo (PRD, Capítulo 8)

"No es un modelo de IA ni un sistema de recomendación basado solo en estadísticas: es un sistema de toma de decisiones educativas" construido sobre el Learning Blueprint, neurociencia del aprendizaje, práctica deliberada, metacognición y evaluación formativa. "El motor deberá ser completamente independiente del modelo de IA. La IA puede explicar decisiones, nunca decidirlas." "La autoridad pedagógica recae en el Motor Pedagógico" — el Coach IA no decide el recorrido, solo lo explica, motiva y contextualiza.

**Arquitectura:**
```
Datos del estudiante → Motor Pedagógico Adaptativo
 ├── Mi Plan
 ├── Centro de Entrenamiento
 └── Coach IA
→ Nuevas decisiones
```

**Información de entrada (nunca una decisión con un único indicador):** perfil pedagógico; competencias alcanzadas y prioritarias; historial de actividades; resultados de simulaciones; errores frecuentes; tiempo disponible; regularidad del entrenamiento; fecha del examen; memoria pedagógica; objetivos personales; indicadores de Evolución.

**Reglas pedagógicas "si-entonces" (ejemplos explícitos):**
- Si una competencia está bajo el umbral → priorizar actividades relacionadas.
- Si hay dominio sostenido → aumentar gradualmente la dificultad.
- Si el estudiante abandona varios días → reorganizar Mi Plan + sesión de reactivación.
- Si mejora significativamente una competencia → redistribuir el tiempo hacia otras áreas prioritarias.

**Integración con los ecosistemas:**

| Ecosistema | Rol del Motor Pedagógico |
|---|---|
| Dashboard | Determina qué información destacar |
| Mi Plan | Genera automáticamente el calendario de entrenamiento |
| Academia | Selecciona contenidos prioritarios |
| Laboratorio | Propone actividades específicas |
| Centro de Entrenamiento Diario | Construye los desafíos personalizados |
| Centro de Simulación | Determina cuándo realizar una simulación completa |
| Evolución | Actualiza los indicadores de progreso |

"Toda decisión deberá ser explicable y trazable." "Ninguna decisión dependerá del azar."

---

## 10. Sistema de Evaluación y Certificación

### 10.1 Principios generales de evaluación

La evaluación "no se limitará a una calificación final, sino que acompañará todo el proceso" (evaluación formativa continua, no solo sumativa) (Doc 4). Toda evaluación deberá: seguir la rúbrica oficial DELF B2; almacenar resultados históricos; generar retroalimentación automática; permitir revisión docente; mostrar progreso longitudinal (PRD Cap. 12).

### 10.2 Módulo de Evaluación Final y Certificación (PRD, Capítulo 10)

**Objetivo:** medir el progreso del estudiante desde el inicio hasta el final, simulando las condiciones reales del examen DELF B2 Producción Escrita y generando retroalimentación personalizada mediante IA.

**Arquitectura:**
```
Evaluación Final
  ├── Diagnóstico inicial
  ├── Evaluaciones por unidad
  ├── Simulacro completo DELF
  ├── Evaluación automática IA
  ├── Evaluación del docente
  ├── Comparación progreso
  ├── Certificado digital
  └── Recomendaciones futuras
```

**Pantalla inicial:** título "Évaluation Finale DELF B2"; subtítulo "Il est temps de mesurer vos progrès."; botón "Commencer l'évaluation".

**Cinco niveles de la evaluación:**

- **Nivel 1 — Diagnóstico inicial**: recupera automáticamente la primera producción escrita, puntaje inicial, errores y fortalezas iniciales (almacenados durante el primer uso).
- **Nivel 2 — Mini evaluación**: 3 ejercicios rápidos de 5 minutos cada uno — Reescritura (evalúa gramática), Conectores, Organización textual. Sistema de puntuación: `scoreGrammar`, `scoreCohesion`, `scoreVocabulary`.
- **Nivel 3 — Producción Escrita Completa**: la IA genera un tema nuevo, aleatorio, no repetido, de nivel DELF B2. Ejemplo: *"Vous participez à un forum sur l'impact de l'intelligence artificielle dans l'éducation. Écrivez un texte argumentatif de 250 mots."* Cronómetro de 60 minutos, contador de 250 palabras. Panel lateral de herramientas: `Compteur de mots`, `Temps restant`, `Plan du texte`, `Connecteurs`, `Expressions utiles`, `Grille DELF` — todo accesible sin abandonar la escritura.

**Sistema de bloqueo — Modo examen (obligatorio):** fullscreen; disable copy; disable paste; disable tab switching warning; autosave cada **20 segundos**. Botón final: "Remettre ma production"; animación: "Analyse en cours...".

**Evaluación IA — rúbrica oficial DELF (obligatoria, "Claude utilizará exactamente la rúbrica oficial DELF"):**

| Criterio | Rango |
|---|---|
| Criterio 1 — Respect de la consigne | 0–5 |
| Criterio 2 — Cohérence | 0–5 |
| Criterio 3 — Lexique | 0–5 |
| Criterio 4 — Morphosyntaxe | 0–5 |
| Criterio 5 — Orthographe | 0–5 |
| **Total (certificación oficial)** | **25 puntos** |

*(Resolución 18.15: `RichesseLinguistique` — presente únicamente en el modelo de datos, sección 13.6 — se registra como indicador analítico adicional 0-5 en `CriterionScore`, visible en el informe de retroalimentación, pero no forma parte de este total oficial de 25 puntos ni de la condición de certificado ≥18/25.)*

**Feedback IA generado automáticamente:** Resumen (ej. "Excellent progression. Votre texte est bien structuré. Le niveau est proche du DELF B2."); Fortalezas (ej. "Très bonne argumentation. Bonne utilisation des connecteurs. Lexique varié. Structure logique."); Aspectos por mejorar (ej. "Attention aux accords. Quelques répétitions. Ponctuation perfectible.").

**Corrección inteligente:** muestra Texto original → Texto corregido → Explicación. Ejemplo: Original *"Je pense les réseaux sociaux est utiles."* → Corrección *"Je pense que les réseaux sociaux sont utiles."* → Explicación: *"Il manque 'que'. Accord sujet-verbe. Adjectif au pluriel."*

**Indicadores mostrados (gráficos):** Nombre d'erreurs; Types d'erreurs; Complexité lexicale; Richesse grammaticale; Longueur moyenne des phrases; Diversité des connecteurs; Lisibilité.

**Dashboard Final (pantalla tipo Analytics):**
- Radar: Organisation, Lexique, Grammaire, Argumentation, Cohérence.
- Gráfico de barras: Diagnostic → Unité 1 → Unité 2 → ... → Examen final.
- Curva de progreso: Progression globale.
- Comparación Avant/Maintenant (ejemplo): Connecteurs 12→41; Erreurs 34→8; Richesse lexicale 58→89; Score DELF 12/25→22/25.

**Perfil del estudiante generado automáticamente por la IA:** `Communicateur, Argumentateur, Pragmatique, Créatif, Analytique` — con descripción personalizada.

**Predicción DELF (calculada por Claude):** `Probabilité de réussite` (ej. 92%); `Niveau estimé` (B2 consolidé / B2 en progression / B1 avancé).

**Plan personalizado generado automáticamente:** ej. "Pour atteindre un excellent niveau: Travaillez davantage: accords, vocabulaire abstrait, nuances argumentatives, cohésion."

**Certificado:** si el puntaje es **≥ 18/25**, se genera automáticamente `Attestation de réussite`, `Cartilla Interactive DELF B2`, `Production Écrite` — incluye nombre, fecha, puntaje, nivel, código QR, firma digital.

**Insignias del módulo de evaluación:** Premier texte; Expert en connecteurs; Lexique avancé; Argumentateur; Persévérant; Sans fautes; Expert DELF — cada una animada.

**Exportación:** PDF descargable con reporte completo, retroalimentación, historial, correcciones, plan de estudio, certificado.

**Entidades de base de datos asociadas (nivel conceptual del PRD, distinto del esquema detallado del Domain Modeling):** `FinalScore, FinalText, GrammarScore, VocabularyScore, TaskScore, CohesionScore, Errors, Progress, Date, Certificate, Achievements`.

**Rol de la IA en este módulo:** evaluador oficial DELF B2; corrector lingüístico experto; tutor de escritura académica; analista del progreso del estudiante; generador de recomendaciones personalizadas; emisor de certificación digital basada en el desempeño.

**Criterios de aceptación del módulo:** simulación fiel del examen oficial; corrección automática alineada con la rúbrica oficial; retroalimentación detallada, específica y accionable; visualización clara del progreso; generación automática de plan de mejora; emisión de certificado digital e insignias cuando se cumplan los criterios; persistencia de todos los resultados para análisis longitudinal.

### 10.3 Modelo de datos de la evaluación DELF (Domain Modeling, Capítulo 6 — ver también sección 13.6)

Entidades: `Exam, ExamSection, ExamTask, ExamAttempt, EvaluationRubric, EvaluationCriterion, CriterionScore, Evaluator, EvaluationResult, ExamHistory`. Secciones del examen (enum): `COMPREHENSION_ORALE, COMPREHENSION_ECRITE, PRODUCTION_ORALE, PRODUCTION_ECRITE`. Criterios DELF B2 (enum en `EvaluationCriterion`): `RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe, RichesseLinguistique`. Tipos de evaluador: `AI, TEACHER, OFFICIAL, HYBRID`.
## 11. Gamificación

### 11.1 Principios de diseño

"La gamificación estará diseñada para adultos y jóvenes universitarios. En lugar de personajes caricaturescos, utilizará desafíos, niveles de dominio, metas personales, indicadores de progreso y simulaciones del examen que aporten una sensación de crecimiento profesional y académico." (Doc 1) "La idea no es infantilizar el aprendizaje, sino mantener el hábito de escribir." (Doc 1)

Desde el AI Blueprint / UX: la gamificación "reforzará el compromiso con el aprendizaje, pero nunca sustituirá el valor del conocimiento adquirido. Las insignias, niveles y desafíos servirán para visualizar el esfuerzo realizado y consolidar hábitos de estudio, evitando convertir la recompensa en el objetivo principal." (Doc 8)

### 11.2 Mecánicas mencionadas en el Libro Maestro (Doc 1, Bloque H)

Misiones diarias; retos semanales; rachas de estudio; logros; niveles; desafíos temáticos; eventos especiales. "¿Habrá misiones? Sí. ¿Niveles? Sí. ¿Desafíos semanales? Sí. ¿Logros? Sí. ¿Recompensas? No" — ver contradicción documentada en la sección 17.3, dado que otros documentos sí incluyen recompensas.

### 11.3 Gamificación en el Prompt Maestro (PRD Cap. 12)

Implementar: niveles; experiencia (XP); insignias; barras de progreso; desafíos; recompensas; logros; estadísticas personales.

### 11.4 Modelo de datos de gamificación (Domain Modeling, Capítulo 9 — especificación completa; ver también sección 13.9)

Entidades: `XPTransaction, Level, StudentLevel, Badge, StudentBadge, Achievement, StudentAchievement, Mission, StudentMission, Reward, RewardClaim, Streak`.

- Fuentes de XP (enum `XPTransaction.source`): `ACTIVITY, MISSION, ACHIEVEMENT, DAILY_LOGIN, BONUS`.
- Rareza de insignias (enum `Badge.rarity`): `COMMON, UNCOMMON, RARE, EPIC, LEGENDARY`.
- Tipos de misión (enum `Mission.mission_type`): `DAILY, WEEKLY, SPECIAL, EVENT`.
- Tipos de recompensa (enum `Reward.reward_type`): `BADGE, AVATAR, THEME, CERTIFICATE, BONUS`.

**Reglas de negocio obligatorias:** todas las transacciones de XP deben registrarse en `XPTransaction`; el XP total se calcula como la suma de todas las transacciones; cada estudiante tiene un único nivel activo; el cambio de nivel es automático al alcanzar el XP mínimo requerido; un logro solo puede desbloquearse una vez por estudiante; una insignia solo puede otorgarse una vez por estudiante; una misión solo puede completarse una vez durante su período de vigencia; el progreso de las misiones se actualiza automáticamente a partir de la actividad del estudiante; las recompensas solo pueden reclamarse si el estudiante dispone del XP requerido, y el XP usado se descuenta mediante una nueva transacción; la racha (`Streak`) se actualiza automáticamente al completar actividades válidas, y si transcurre un día sin actividad, la racha se reinicia.

### 11.5 Servicio de gamificación en la orquestación de servicios (PRD Cap. 9)

El "Servicio de gamificación" calcula: experiencia; logros; niveles; rachas; recompensas — coordinado por el Motor de Orquestación junto con el resto de servicios (autenticación, Motor Pedagógico, Coach IA, progreso, analíticas, notificaciones).

### 11.6 Diseño visual de la gamificación (UI Design System)

Componentes de gamificación en el catálogo de componentes UI: insignias; medallas; niveles; desafíos; recompensas; misiones; cofres; desbloqueos; experiencia acumulada; rachas. "Estos componentes deberán utilizarse de manera moderada y nunca interferir con el objetivo principal de aprendizaje." Colores de ecosistema para "Entrenamiento": naranja, "que transmite energía, práctica y dinamismo" (ver sección 14.3).

---

## 12. Autenticación, Roles y Permisos

### 12.1 Propósito y principios de diseño (PRD, Capítulo 5)

"El sistema de autenticación no constituye únicamente un mecanismo para iniciar sesión: es el punto de entrada al ecosistema completo y base de la memoria pedagógica individual." Principios: seguridad por defecto; privacidad de la información; experiencia de acceso sencilla; persistencia del aprendizaje; escalabilidad; separación entre identidad y datos pedagógicos. "La autenticación nunca deberá mezclarse con la lógica educativa."

### 12.2 Arquitectura de cuatro dominios separados (pero vinculados)

| Dominio | Contenido (ejemplos) |
|---|---|
| Identidad | correo electrónico, contraseña, proveedor de autenticación, sesión, dispositivos autorizados |
| Perfil | nombre, fotografía, idioma, país, zona horaria |
| Perfil pedagógico | nivel de francés, fecha del examen, objetivos, disponibilidad semanal, progreso, competencias |
| Configuración | tema visual, idioma de interfaz, frecuencia de notificaciones, configuración del Coach IA, accesibilidad |

### 12.3 Proveedor de autenticación

**PRD Cap. 2 y Cap. 5 especifican Clerk** como proveedor oficial: registro por correo, inicio de sesión, recuperación de contraseña, verificación de correo, cierre seguro de sesión, autenticación con Google, autenticación con Apple (preparada para futuras versiones). "Toda la lógica de autenticación deberá delegarse en Clerk."

**PRD Cap. 11-12 especifican en su lugar JWT + Refresh Tokens + bcrypt** para contraseñas, sin mencionar Clerk. Ver conflicto documentado en la sección 17.1.

### 12.4 Flujo de registro (automático, secuencial — el usuario nunca lo ejecuta manualmente)

1. Crear la identidad en Clerk (o en el sistema de auth, según versión de arquitectura).
2. Crear el perfil en la base de datos.
3. Crear el perfil pedagógico inicial.
4. Inicializar la memoria del Coach IA.
5. Crear Mi Plan inicial.
6. Crear el Dashboard personalizado.
7. Registrar la fecha de creación.
8. Iniciar el recorrido de onboarding.

### 12.5 Roles del sistema (PRD Cap. 5)

- **Estudiante** — accede al entrenamiento completo, produce textos, recibe retroalimentación, gestiona su progreso.
- **Profesor** (versión futura en el PRD, aunque ya presente como espacio independiente en el Libro Maestro) — crear grupos, revisar estudiantes, visualizar estadísticas, asignar actividades, monitorear el progreso.
- **Administrador** — gestiona usuarios, contenidos, configuración global, analíticas, mantenimiento.
- **Coach IA** — no es un usuario humano; servicio inteligente con acceso únicamente a la información pedagógica necesaria para personalizar el aprendizaje.

**Roles mínimos del Plan de Implementación (PRD Cap. 13, Fase 2):** Administrador, Docente, Estudiante.

### 12.6 Roles y permisos en el modelo de datos (Domain Modeling, Capítulo 1 — RBAC completo)

**Roles iniciales (tabla `Role`):** `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE`.

> Nota de consolidación: el Domain Modeling define **6 roles** (añade `SUPER_ADMIN`, `REVIEWER` y `AI_SERVICE` como rol explícito de sistema), mientras que el PRD Cap. 5 y Cap. 13 solo mencionan 3-4 roles (Estudiante, Profesor, Administrador, y el Coach IA como "no humano" sin ser formalmente un `Role` de tabla). Ambas fuentes son compatibles pero de distinto nivel de detalle; se documenta la versión más granular (Domain Modeling) como la especificación de base de datos autoritativa.

Modelo RBAC completo: `User` N:M `Role` (vía `UserRole`), `Role` N:M `Permission` (vía `RolePermission`). Tabla `Permission`: campos `id, code, name, module, description`. "Toda autenticación deberá pasar por el sistema de permisos basado en roles (RBAC)."

**Proveedores OAuth soportados (tabla `OAuthAccount.provider`):** Google, Microsoft, Apple. (Nota: el PRD solo menciona Google y Apple; Microsoft aparece únicamente en el Domain Modeling — ver sección 17.1).

### 12.7 Seguridad de la autenticación

**PRD Cap. 5:** autenticación segura mediante Clerk; Row Level Security en Supabase; validación de permisos en servidor; protección CSRF cuando corresponda; protección frente a fuerza bruta delegada en Clerk; almacenamiento seguro de tokens; cierre automático de sesiones inválidas. "La seguridad nunca dependerá únicamente del frontend."

**Domain Modeling Cap. 16 (Seguridad de Datos):** contraseñas nunca en texto plano; utilizar **Argon2id** con salt automático y rehash automático cuando sea necesario (distinto de bcrypt, especificado en PRD Cap. 11 — ver sección 17.1); tokens (JWT, Refresh Token, CSRF Token, Password Reset Token, Email Verification Token) siempre con fecha de expiración; cifrado AES-256 para Coach Memory, API Keys, OAuth Tokens, Secrets, configuraciones sensibles; roles iniciales `SuperAdmin, Administrator, Teacher, Student, AI, System` (nomenclatura ligeramente distinta a la de Cap. 1 del mismo documento — ver sección 17.1).

### 12.8 Privacidad

"Un estudiante nunca podrá acceder a datos de otro estudiante." El Coach IA usará únicamente información autorizada. Posibilidad futura de exportar datos y eliminar permanentemente la cuenta, compatible con normativas internacionales de protección de datos.

### 12.9 Reglas obligatorias consolidadas (Cap. 5)

Claude deberá: separar autenticación, perfil y datos pedagógicos; utilizar Clerk como proveedor principal (según Versión A de arquitectura); proteger todas las rutas privadas; crear automáticamente el perfil pedagógico tras el registro; mantener la sesión sincronizada con toda la plataforma; documentar el flujo completo de autenticación; garantizar que cada estudiante conserve su historial completo de aprendizaje.

Claude no deberá: almacenar contraseñas en la base de datos propia; duplicar información de autenticación; mezclar identidad con progreso pedagógico; permitir accesos sin validación; crear dependencias entre el sistema de autenticación y la lógica del Coach IA.

**Rutas públicas:** página principal, información del producto, registro, inicio de sesión, recuperación de contraseña.
**Rutas privadas:** Dashboard, Academia, Mi Plan, Laboratorio, Entrenamiento, Simulación, Evolución, Perfil.
## 13. Base de Datos: Entidades, Relaciones y Modelo Físico

> Fuente principal: Domain Modeling (Doc 10, 20 capítulos) y Modeling Design (Doc 11, capítulo 1, redundante con Doc 10 Cap. 1). Motor de base de datos: **PostgreSQL 17**. ORM especificado en este documento: **Prisma ORM** (contradice Drizzle ORM del PRD Cap. 2 — ver sección 17.1). Todas las tablas usan `UUID` como clave primaria (excepto tablas puente, con clave primaria compuesta), `snake_case` para columnas, nombres de tabla en inglés y singular, e incluyen `created_at`/`updated_at` (y `deleted_at` cuando aplica Soft Delete).

### 13.1 Capítulo 1 — Usuarios y Autenticación

**Entidades:** `User, Role, Permission, RolePermission, UserRole, Session, RefreshToken, OAuthAccount, UserDevice, PasswordReset, EmailVerification`.

**Tabla `User`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NULL para OAuth |
| first_name | VARCHAR(120) | NOT NULL |
| last_name | VARCHAR(120) | NOT NULL |
| avatar_url | TEXT | NULL |
| language | VARCHAR(10) | DEFAULT "fr" |
| timezone | VARCHAR(60) | DEFAULT "UTC" |
| status | ENUM | ACTIVE, INACTIVE, BLOCKED, PENDING |
| last_login_at | TIMESTAMP | NULL |
| email_verified | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

**Tabla `Role`**: id (UUID, PK), name (VARCHAR(100), UNIQUE), description (TEXT, NULL), created_at (TIMESTAMP, NOT NULL). Roles iniciales: `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE`. **Actualizado por resolución 18.4/18.14: se añade un séptimo rol inicial, `SYSTEM`**, reservado para procesos automatizados internos (jobs, migraciones, integraciones), distinto de `AI_SERVICE`. Lista vigente de roles iniciales: `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE, SYSTEM`.

**Tabla `Permission`**: id, code (VARCHAR(150)), name (VARCHAR(150)), module (VARCHAR(100)), description (TEXT).

**Tabla `RolePermission`** (puente): role_id, permission_id — PK (role_id, permission_id).

**Tabla `UserRole`** (puente): user_id, role_id — PK (user_id, role_id).

**Tabla `Session`**: id, user_id, ip_address (VARCHAR(80)), user_agent (TEXT), device_name (VARCHAR(120)), started_at, expires_at, revoked_at (NULL).

**Tabla `RefreshToken`**: id, user_id, token_hash (TEXT), expires_at, revoked (BOOLEAN).

**Tabla `OAuthAccount`**: id, user_id, provider (ENUM), provider_user_id (VARCHAR(255)), access_token (TEXT NULL), refresh_token (TEXT NULL), created_at. Providers soportados: Google, Microsoft, Apple.

**Tabla `UserDevice`**: id, user_id, device_uuid (VARCHAR(255)), platform (VARCHAR(60)), browser (VARCHAR(60)), trusted (BOOLEAN), last_seen.

**Tabla `PasswordReset`**: id, user_id, token_hash, expires_at, used_at (NULL).

**Tabla `EmailVerification`**: id, user_id, token_hash, expires_at, verified_at (NULL).

**Relaciones:** User 1:N Session; User 1:N RefreshToken; User 1:N OAuthAccount; User 1:N UserDevice; User 1:N PasswordReset; User 1:N EmailVerification; User N:M Role; Role N:M Permission.

**Índices:** User.email, User.status, Session.user_id, Session.expires_at, RefreshToken.user_id, OAuthAccount.provider, OAuthAccount.provider_user_id, UserRole.user_id, RolePermission.role_id.

**Reglas de negocio (MUST):** el correo electrónico debe ser único; las contraseñas se almacenan únicamente como hash, nunca en texto plano; un usuario puede tener múltiples roles y múltiples sesiones activas; todo Refresh Token debe estar asociado a una sesión válida; el borrado de usuarios es lógico (`deleted_at`); toda autenticación pasa por RBAC; todas las FK mantienen integridad referencial; todas las tablas incluyen `created_at`/`updated_at`, y `deleted_at` cuando aplica.

### 13.2 Capítulo 2 — Perfiles

**Entidades:** `StudentProfile, TeacherProfile, UserPreference, UserLanguage, LearningPreference, NotificationPreference, AccessibilityPreference, Avatar`.

**Tabla `StudentProfile`**: id (PK), user_id (FK, UNIQUE), current_level (ENUM A1-C2), target_level (ENUM A1-C2), native_language (VARCHAR(50), NOT NULL), country (NULL), institution (NULL), learning_goal (TEXT NULL), biography (TEXT NULL), created_at, updated_at.

**Tabla `TeacherProfile`**: id (PK), user_id (FK, UNIQUE), institution (NOT NULL), department (NULL), specialization (NULL), biography (NULL), office_hours (NULL), created_at, updated_at.

**Tabla `Avatar`**: id, user_id, image_url, provider (ENUM), created_at.

**Tabla `UserPreference`**: id, user_id, theme (ENUM: LIGHT, DARK, SYSTEM), language, timezone, date_format, time_format (ENUM), created_at, updated_at.

**Tabla `UserLanguage`**: id, user_id, language_code, proficiency_level (ENUM), is_native (BOOLEAN).

**Tabla `LearningPreference`**: id, user_id, daily_goal_minutes, weekly_goal_sessions, preferred_feedback (ENUM: SHORT, STANDARD, DETAILED), ai_assistance (BOOLEAN), reminder_enabled (BOOLEAN).

**Tabla `NotificationPreference`**: id, user_id, email_notifications, push_notifications, in_app_notifications, reminder_notifications, marketing_notifications (todos BOOLEAN).

**Tabla `AccessibilityPreference`**: id, user_id, font_scale (DECIMAL(3,2)), reduced_motion, high_contrast, dyslexia_font, screen_reader (BOOLEAN).

**Relaciones:** User 1:1 StudentProfile; User 1:1 TeacherProfile; User 1:1 Avatar; User 1:1 UserPreference; User 1:N UserLanguage; User 1:1 LearningPreference; User 1:1 NotificationPreference; User 1:1 AccessibilityPreference.

**Reglas (MUST):** cada usuario tiene un único perfil según su rol principal; puede registrar múltiples idiomas; todas las preferencias se inicializan con valores por defecto al crear la cuenta; la eliminación de un usuario elimina en cascada sus perfiles/preferencias cuando corresponda.

### 13.3 Capítulo 3 — Organización Académica (Profesores, Grupos y Matrículas)

**Entidades:** `AcademicPeriod, Course, Group, Enrollment, GroupTeacher, GroupStudent, Invitation`.

**Tabla `AcademicPeriod`**: id (PK), name (UNIQUE), start_date (NOT NULL), end_date (NOT NULL), status (ENUM: PLANNED, ACTIVE, CLOSED), created_at, updated_at.

**Tabla `Course`**: id (PK), code (UNIQUE), name (NOT NULL), description (NULL), target_level (ENUM A1-C2), active (DEFAULT TRUE), created_at, updated_at.

**Tabla `Group`**: id (PK), course_id (FK), academic_period_id (FK), code (UNIQUE), name (NOT NULL), max_students (NOT NULL), status (ENUM: ACTIVE, CLOSED, ARCHIVED), created_by (FK User), created_at, updated_at.

**Tabla `GroupTeacher`** (puente): group_id, teacher_id, assigned_at — PK (group_id, teacher_id).

**Tabla `Enrollment`**: id (PK), student_id (FK User), group_id (FK), enrollment_date (NOT NULL), status (ENUM: ACTIVE, COMPLETED, WITHDRAWN, SUSPENDED), final_grade (DECIMAL(5,2) NULL), created_at, updated_at.

**Tabla `GroupStudent`** (puente): group_id, student_id — PK (group_id, student_id).

**Tabla `Invitation`**: id, group_id, email, token, expires_at, accepted_at (NULL), invited_by, created_at.

**Relaciones:** AcademicPeriod 1:N Course; AcademicPeriod 1:N Group; Course 1:N Group; Group N:M Teacher; Group N:M Student; Student 1:N Enrollment; Group 1:N Enrollment; Group 1:N Invitation.

**Reglas (MUST):** un grupo pertenece a un único curso y a un único período académico; un estudiante puede matricularse en múltiples grupos; un profesor puede administrar múltiples grupos; un grupo puede tener múltiples profesores; un grupo no puede superar `max_students`; no puede existir matrícula duplicada para el mismo estudiante en el mismo grupo; una invitación debe tener token único y fecha de expiración; no se permiten matrículas en grupos cerrados o archivados.

### 13.4 Capítulo 4 — Plan de Aprendizaje

**Entidades:** `LearningPlan, LearningGoal, LearningObjective, LearningPhase, LearningTask, StudySchedule, StudySession, LearningProgress, DailyPlan, WeeklyPlan`.

**Tabla `LearningPlan`**: id (PK), student_id (FK User), name (NOT NULL), description (NULL), target_level (ENUM A1-C2), start_date (NOT NULL), end_date (NULL), status (ENUM: ACTIVE, PAUSED, COMPLETED, CANCELLED), created_at, updated_at.

**Tabla `LearningGoal`**: id, learning_plan_id, title, description, priority (ENUM: LOW, MEDIUM, HIGH, CRITICAL), target_date, completed_at (NULL), status (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED — resolución 18.21).

**Tabla `LearningObjective`**: id, learning_goal_id, title, description, order_number, completed_at (NULL — extensión formal de esta ficha, Sprint 3.3.1, requerida por el invariante de 18.21), status (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED — resolución 18.21).

**Tabla `LearningPhase`**: id, learning_plan_id, name, phase_order, start_date, end_date, completed_at (NULL — extensión formal de esta ficha, Sprint 3.3.1, requerida por el invariante de 18.21), status (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED — resolución 18.21).

**Tabla `LearningTask`**: id, learning_phase_id, title, description, estimated_minutes, difficulty (ENUM: EASY, MEDIUM, HARD, EXPERT), due_date, completed_at (NULL), status (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED — resolución 18.21), source (ENUM: SELF_DIRECTED, ACADEMY, LABORATORY, DAILY_TRAINING, SIMULATOR; default SELF_DIRECTED — resolución 18.20.5, extensión formal de esta ficha).

**Tabla `StudySchedule`**: id, learning_plan_id, days_per_week, sessions_per_day, minutes_per_session, reminder_time (TIME).

**Tabla `StudySession`**: id, student_id, learning_task_id, started_at, finished_at, duration_minutes, completed (BOOLEAN).

**Tabla `DailyPlan`**: id, learning_plan_id, plan_date, estimated_minutes, completed_minutes, completion_percentage (DECIMAL(5,2)).

**Tabla `WeeklyPlan`**: id, learning_plan_id, week_number, estimated_minutes, completed_minutes, completion_percentage.

**Tabla `LearningProgress`**: id, learning_plan_id, completed_tasks, total_tasks, completion_percentage, current_streak, updated_at.

**Relaciones:** User 1:N LearningPlan; LearningPlan 1:N LearningGoal; LearningGoal 1:N LearningObjective; LearningPlan 1:N LearningPhase; LearningPhase 1:N LearningTask; LearningPlan 1:1 StudySchedule; LearningPlan 1:N DailyPlan; LearningPlan 1:N WeeklyPlan; LearningPlan 1:1 LearningProgress; LearningTask 1:N StudySession; User 1:N StudySession. `LearningGoal`↔`LearningObjective` y `LearningPhase`↔`LearningTask` son dos ramas independientes bajo `LearningPlan` (no anidadas entre sí — un objetivo no pertenece a ninguna fase, ni una tarea a ninguna meta).

**Reglas (MUST):** un estudiante puede tener múltiples planes, pero solo un plan activo; cada plan debe contener al menos un objetivo; cada objetivo pertenece a un único plan; cada fase pertenece a un único plan; cada tarea pertenece a una única fase; las sesiones de estudio se asocian a una única tarea; el progreso se calcula automáticamente a partir de las tareas completadas; el % de avance se mantiene entre 0 y 100. **Estados y `completed_at` de `LearningGoal`/`LearningObjective`/`LearningPhase`/`LearningTask` (resolución 18.21):** `completed_at IS NOT NULL` si y solo si `status = COMPLETED` (invariante de dominio, aplicable a las 4 entidades); `LearningPhase.status`/`LearningGoal.status` se calculan automáticamente a partir de sus hijas (`LearningTask`/`LearningObjective` respectivamente), nunca se editan manualmente; `LearningTask.status` se actualiza manualmente solo si `source = SELF_DIRECTED`, en cualquier otro caso exclusivamente por el evento `EXTERNAL_ACTIVITY_COMPLETED`; `LearningObjective.status` se actualiza siempre manualmente (no tiene campo `source`); `CANCELLED` es un estado terminal en las 4 entidades, sin reactivación posible; ver 18.21 para el detalle completo de transiciones válidas.

### 13.5 Capítulo 5 — Producción Escrita

**Entidades:** `WritingTask, WritingPrompt, WritingSubmission, WritingDraft, WritingVersion, WritingCorrection, WritingFeedback, WritingScore, WritingAttachment, WritingHistory`.

**Tabla `WritingTask`**: id (PK), title (NOT NULL), description (NOT NULL), task_type (ENUM: LETTER, ARTICLE, ESSAY, EMAIL, REPORT), delf_level (ENUM: B2), estimated_minutes (NOT NULL), difficulty (ENUM: EASY, MEDIUM, HARD), active (DEFAULT TRUE), created_at, updated_at.

**Tabla `WritingPrompt`**: id, writing_task_id, title, prompt (TEXT), instructions (TEXT), minimum_words, maximum_words, created_at.

**Tabla `WritingSubmission`**: id, student_id, writing_task_id, current_version_id, status (ENUM: DRAFT, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, CORRECTED, ARCHIVED), submitted_at (NULL), created_at, updated_at.

**Tabla `WritingDraft`**: id, submission_id, content (LONGTEXT), word_count, character_count, autosaved_at, created_at.

**Tabla `WritingVersion`**: id, submission_id, version_number, content (LONGTEXT), created_by, created_at.

**Tabla `WritingCorrection`**: id, submission_id, corrected_by, correction_type (ENUM: AI, TEACHER, HYBRID), overall_feedback (TEXT), created_at.

**Tabla `WritingFeedback`**: id, correction_id, category (ENUM: GRAMMAR, VOCABULARY, COHERENCE, COHESION, REGISTER, SPELLING, SYNTAX, PUNCTUATION, TASK_COMPLETION), severity (ENUM), selected_text (TEXT), suggestion (TEXT), explanation (TEXT), start_offset (INTEGER), end_offset (INTEGER).

**Tabla `WritingScore`**: id, submission_id, task_score, coherence_score, vocabulary_score, grammar_score, final_score (todos DECIMAL(5,2)), passed (BOOLEAN).

**Tabla `WritingAttachment`**: id, submission_id, file_name, file_url, mime_type, file_size (BIGINT), uploaded_at.

**Tabla `WritingHistory`**: id, submission_id, action (VARCHAR(120)), performed_by, created_at.

**Relaciones:** WritingTask 1:N WritingPrompt; WritingTask 1:N WritingSubmission; User 1:N WritingSubmission; WritingSubmission 1:N WritingDraft; WritingSubmission 1:N WritingVersion; WritingSubmission 1:1 WritingCorrection; WritingCorrection 1:N WritingFeedback; WritingSubmission 1:1 WritingScore; WritingSubmission 1:N WritingAttachment; WritingSubmission 1:N WritingHistory.

**Reglas (MUST):** cada entrega pertenece a un único estudiante y a una única tarea; una entrega puede tener múltiples versiones; el borrador se guarda automáticamente; la versión actual se referencia mediante `current_version_id`; toda corrección se asocia a una única entrega; toda observación pertenece a una única corrección; la puntuación final se calcula automáticamente a partir de los criterios de evaluación; **no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión.**

### 13.6 Capítulo 6 — Evaluación del DELF

**Entidades:** `Exam, ExamSection, ExamTask, ExamAttempt, EvaluationRubric, EvaluationCriterion, CriterionScore, Evaluator, EvaluationResult, ExamHistory`.

**Tabla `Exam`**: id (PK), title (NOT NULL), level (ENUM A1-C2), exam_type (ENUM: OFFICIAL, MOCK, PRACTICE), duration_minutes (NOT NULL), active (DEFAULT TRUE), created_at, updated_at.

**Tabla `ExamSection`**: id, exam_id, section (ENUM: COMPREHENSION_ORALE, COMPREHENSION_ECRITE, PRODUCTION_ORALE, PRODUCTION_ECRITE), order_number, duration_minutes.

**Tabla `ExamTask`**: id, exam_section_id, title, instructions, minimum_words, maximum_words, maximum_score.

**Tabla `ExamAttempt`**: id, student_id, exam_id, started_at, submitted_at, finished_at, status (ENUM: NOT_STARTED, IN_PROGRESS, SUBMITTED, EVALUATED, CANCELLED), total_score, passed (BOOLEAN).

**Tabla `EvaluationRubric`**: id, exam_task_id, title, maximum_score, version.

**Tabla `EvaluationCriterion`**: id, rubric_id, name, description, weight, maximum_score, display_order. Criterios DELF B2: `RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe, RichesseLinguistique`. *(Resolución 18.15: `RichesseLinguistique` se puntúa 0-5 en `CriterionScore` como indicador analítico, pero no suma al `final_score`/certificación oficial de 25 puntos — ver 10.2 y 18.15.)*

**Tabla `CriterionScore`**: id, criterion_id, attempt_id, evaluator_id, score, comment.

**Tabla `Evaluator`**: id, user_id, evaluator_type (ENUM: AI, TEACHER, OFFICIAL, HYBRID), certified (BOOLEAN).

**Tabla `EvaluationResult`**: id, attempt_id, evaluator_id, final_score, percentage, passed, overall_feedback, evaluated_at.

**Tabla `ExamHistory`**: id, attempt_id, action, performed_by, created_at.

**Relaciones:** Exam 1:N ExamSection; ExamSection 1:N ExamTask; Exam 1:N ExamAttempt; User 1:N ExamAttempt; ExamTask 1:1 EvaluationRubric; EvaluationRubric 1:N EvaluationCriterion; EvaluationCriterion 1:N CriterionScore; ExamAttempt 1:N CriterionScore; Evaluator 1:N CriterionScore; ExamAttempt 1:1 EvaluationResult; ExamAttempt 1:N ExamHistory.

**Reglas (MUST):** cada intento pertenece a un único estudiante y corresponde a un único examen; cada examen contiene al menos una sección; cada sección contiene al menos una tarea; cada tarea usa una única rúbrica; cada criterio pertenece a una única rúbrica; cada criterio recibe una única puntuación por evaluador en cada intento; la puntuación final se calcula automáticamente a partir de los criterios de la rúbrica; la condición de aprobación se deriva de la puntuación final; toda evaluación queda registrada en el historial.

### 13.7 Capítulo 7 — Coach IA y Memoria

**Entidades:** `Coach, CoachConversation, CoachMessage, CoachMemory, CoachMemoryCategory, CoachObservation, CoachRecommendation, CoachPrompt, CoachContext, CoachReflection, CoachAction`.

**Tabla `Coach`**: id (PK), name (NOT NULL), version (NOT NULL), model (NOT NULL), active (DEFAULT TRUE), created_at, updated_at.

**Tabla `CoachConversation`**: id, coach_id, student_id, title, status (ENUM: ACTIVE, ARCHIVED, CLOSED), started_at, last_message_at, created_at, updated_at.

**Tabla `CoachMessage`**: id, conversation_id, sender (ENUM: USER, COACH, SYSTEM), message (LONGTEXT), token_count, response_time_ms, created_at.

**Tabla `CoachMemory`**: id, student_id, category_id, title, memory (TEXT), confidence (DECIMAL(5,2)), active (BOOLEAN), created_at, updated_at.

**Tabla `CoachMemoryCategory`**: id, name, description. Categorías: `Grammar, Vocabulary, Coherence, Cohesion, Register, Spelling, Syntax, WritingStyle, FrequentErrors, LearningHabits, Strengths, Weaknesses, Goals`.

**Tabla `CoachObservation`**: id, student_id, writing_submission_id, observation (TEXT), category, severity (ENUM: LOW, MEDIUM, HIGH, CRITICAL), created_at.

**Tabla `CoachRecommendation`**: id, student_id, recommendation (TEXT), priority (ENUM), generated_from, completed (BOOLEAN), created_at.

**Tabla `CoachPrompt`**: id, coach_id, name, prompt (LONGTEXT), version, active, created_at.

**Tabla `CoachContext`**: id, student_id, current_level, target_level, current_plan_id, last_submission_id, updated_at.

**Tabla `CoachReflection`**: id, student_id, summary (TEXT), generated_at.

**Tabla `CoachAction`**: id, recommendation_id, action, status, completed_at (NULL).

**Relaciones:** Coach 1:N CoachConversation; Coach 1:N CoachPrompt; CoachConversation 1:N CoachMessage; User 1:N CoachConversation; User 1:N CoachMemory; CoachMemoryCategory 1:N CoachMemory; User 1:N CoachObservation; WritingSubmission 1:N CoachObservation; User 1:N CoachRecommendation; CoachRecommendation 1:N CoachAction; User 1:1 CoachContext; User 1:N CoachReflection.

**Reglas (MUST):** un estudiante puede tener múltiples conversaciones; cada conversación pertenece a un único estudiante y a un único Coach; todos los mensajes pertenecen a una única conversación; la memoria del Coach persiste entre conversaciones; cada memoria pertenece a una única categoría; las observaciones pueden asociarse a una producción escrita específica; las recomendaciones se generan automáticamente a partir de la memoria, el historial y las evaluaciones; el contexto del Coach se mantiene sincronizado con el progreso del estudiante; las reflexiones se generan automáticamente a partir del historial de aprendizaje; **no se permite eliminar la memoria, solo marcarla como inactiva.**

### 13.8 Capítulo 8 — Competencias y Analíticas de Aprendizaje

**Entidades:** `Competency, SubCompetency, StudentCompetency, CompetencyAssessment, CompetencyProgress, Strength, Weakness, LearningMetric, PerformanceMetric, LearningAnalytics, StudentDashboard`.

**Tabla `Competency`**: id (PK), code (UNIQUE), name (NOT NULL), description (NULL), active (DEFAULT TRUE), created_at, updated_at. Competencias iniciales: `TaskAchievement, Coherence, Cohesion, Vocabulary, Grammar, Morphosyntax, Spelling, Register, Argumentation, TextStructure, Revision, Autonomy`.

**Tabla `SubCompetency`**: id, competency_id, code, name, description, weight.

**Tabla `StudentCompetency`**: id, student_id, competency_id, current_level, target_level, mastery_percentage (DECIMAL(5,2)), last_updated.

**Tabla `CompetencyAssessment`**: id, student_competency_id, writing_submission_id, score, evaluator_type (ENUM: AI, TEACHER, HYBRID), assessed_at.

**Tabla `CompetencyProgress`**: id, student_competency_id, previous_score, current_score, improvement, recorded_at.

**Tabla `Strength`**: id, student_id, competency_id, confidence, detected_at.

**Tabla `Weakness`**: id, student_id, competency_id, severity (ENUM: LOW, MEDIUM, HIGH, CRITICAL), detected_at.

**Tabla `LearningMetric`**: id, student_id, study_time_minutes, completed_sessions, completed_tasks, active_days, calculated_at.

**Tabla `PerformanceMetric`**: id, student_id, average_score, success_rate, average_feedback, evaluated_at.

**Tabla `LearningAnalytics`**: id, student_id, productivity_index, engagement_index, consistency_index, progression_index, updated_at.

**Tabla `StudentDashboard`**: id, student_id, current_level, total_xp, completed_activities, completed_plans, current_streak, updated_at.

**Relaciones:** Competency 1:N SubCompetency; User 1:N StudentCompetency; Competency 1:N StudentCompetency; StudentCompetency 1:N CompetencyAssessment; WritingSubmission 1:N CompetencyAssessment; StudentCompetency 1:N CompetencyProgress; User 1:N Strength/Weakness; Competency 1:N Strength/Weakness; User 1:N LearningMetric/PerformanceMetric; User 1:1 LearningAnalytics; User 1:1 StudentDashboard.

**Reglas (MUST):** cada competencia puede dividirse en subcompetencias; cada estudiante tiene un único registro por competencia; las evaluaciones actualizan automáticamente el progreso de la competencia correspondiente; fortalezas/debilidades se detectan automáticamente del historial de evaluaciones; las métricas de aprendizaje y rendimiento se calculan/actualizan automáticamente; **el Dashboard consolida únicamente información derivada de otras tablas — no almacena información duplicada**; todos los porcentajes se mantienen entre 0 y 100.

### 13.9 Capítulo 9 — Gamificación

Ver especificación completa en la sección 11.4.

### 13.10 Capítulo 10 — Notificaciones

**Entidades:** `Notification, NotificationTemplate, NotificationPreference, NotificationDelivery, NotificationChannel, NotificationEvent, Reminder, ReminderExecution`.

**Tabla `Notification`**: id (PK), user_id (FK), template_id (FK), title (NOT NULL), message (TEXT NOT NULL), type (ENUM: INFO, SUCCESS, WARNING, ERROR), status (ENUM: PENDING, SENT, READ, FAILED), created_at, read_at (NULL).

**Tabla `NotificationTemplate`**: id, code, name, subject, content, active, created_at, updated_at.

**Tabla `NotificationPreference`**: id, user_id, email_enabled, push_enabled, in_app_enabled, reminder_enabled, updated_at.

**Tabla `NotificationDelivery`**: id, notification_id, channel_id, status (ENUM: PENDING, PROCESSING, SENT, DELIVERED, FAILED, READ), sent_at, delivered_at (NULL), failed_at (NULL), error_message (NULL).

**Tabla `NotificationChannel`**: id, code, name, active. Canales: `EMAIL, PUSH, IN_APP`.

**Tabla `NotificationEvent`**: id, code, name, description, active. Eventos iniciales: `USER_REGISTERED, WRITING_SUBMITTED, WRITING_CORRECTED, MISSION_COMPLETED, LEVEL_UP, BADGE_UNLOCKED, PLAN_REMINDER, STREAK_WARNING, EXAM_COMPLETED, COACH_MESSAGE`.

**Tabla `Reminder`**: id, user_id, event_id, title, scheduled_at, repeat_type (ENUM: NONE, DAILY, WEEKLY, MONTHLY), active.

**Tabla `ReminderExecution`**: id, reminder_id, executed_at, status, notification_id.

**Reglas (MUST):** toda notificación pertenece a un único usuario y se genera a partir de una plantilla o evento; puede enviarse por múltiples canales; el envío se registra en `NotificationDelivery`; las preferencias del usuario se respetan antes de enviar cualquier notificación; un usuario solo tiene un registro de preferencias; los recordatorios se programan mediante `Reminder`; cada ejecución se registra en `ReminderExecution`; **las notificaciones leídas no se eliminan**; el historial de envíos se conserva para auditoría.

### 13.11 Capítulo 11 — Administración y Auditoría

**Entidades:** `AuditLog, SystemEvent, Configuration, ConfigurationValue, FeatureFlag, SystemSetting, MaintenanceWindow, BackgroundJob, JobExecution, SystemHealth`.

**Tabla `AuditLog`**: id (PK), user_id (FK User, NULL), action (NOT NULL), module (NOT NULL), entity (NOT NULL), entity_id (NULL), old_value (JSONB NULL), new_value (JSONB NULL), ip_address (NULL), user_agent (NULL), created_at.

**Tabla `SystemEvent`**: id, event_type, severity (ENUM: INFO, WARNING, ERROR, CRITICAL), source, message, metadata (JSONB), occurred_at.

**Tabla `Configuration`**: id, code, name, description, editable, created_at, updated_at.

**Tabla `ConfigurationValue`**: id, configuration_id, value (JSONB), updated_by, updated_at.

**Tabla `FeatureFlag`**: id, code, name, enabled, rollout_percentage, created_at, updated_at.

**Tabla `SystemSetting`**: id, key, value (JSONB), category, updated_at.

**Tabla `MaintenanceWindow`**: id, title, starts_at, ends_at, status (ENUM: SCHEDULED, ACTIVE, FINISHED, CANCELLED), created_at.

**Tabla `BackgroundJob`**: id, name, queue, schedule, active, created_at.

**Tabla `JobExecution`**: id, job_id, started_at, finished_at, status (ENUM: PENDING, RUNNING, SUCCESS, FAILED, CANCELLED), execution_time_ms, error_message (NULL).

**Tabla `SystemHealth`**: id, service, status (ENUM: HEALTHY, DEGRADED, UNAVAILABLE), response_time_ms, checked_at.

**Reglas (MUST):** toda acción administrativa se registra en `AuditLog`; **ningún registro de auditoría puede modificarse o eliminarse**; toda modificación de configuración se registra en `ConfigurationValue`; las configuraciones se almacenan como JSONB cuando su estructura es variable; los Feature Flags pueden activarse/desactivarse sin desplegar una nueva versión; toda ejecución de procesos en segundo plano se registra en `JobExecution`; los eventos críticos se registran en `SystemEvent`; el estado de los servicios se actualiza periódicamente en `SystemHealth`.

### 13.12 Capítulo 12 — Modelo Físico (ERD, claves, índices, restricciones y migraciones)

**Motor de Base de Datos:** PostgreSQL 17. **ORM:** Prisma ORM.

**Convenciones (MUST):** UUID como PK en todas las tablas; FK en UUID; nombres de tabla en singular e inglés; columnas en snake_case; `created_at`/`updated_at` obligatorios; `deleted_at` solo cuando existe Soft Delete.

**Tipos de datos:** UUID (PK/FK), VARCHAR (cadenas cortas), TEXT (texto largo), JSONB (configuración/metadatos), BOOLEAN (estados), INTEGER (contadores), BIGINT (tamaños de archivo), DECIMAL (calificaciones/porcentajes), DATE, TIME, TIMESTAMP, ENUM (valores controlados).

**Claves primarias (MUST):** todas las tablas tienen `id UUID PRIMARY KEY`, excepto las tablas puente (UserRole, RolePermission, GroupTeacher, GroupStudent), que usan clave primaria compuesta.

**Claves foráneas (MUST):** todas las relaciones usan Foreign Keys (ej. student_id, teacher_id, group_id, submission_id, coach_id, plan_id); no se permiten relaciones sin FK.

**Integridad referencial (MUST):** ON DELETE RESTRICT para entidades principales; ON DELETE CASCADE únicamente para tablas dependientes; ON UPDATE CASCADE.

**Índices automáticos para:** todas las PK y FK, email, status, created_at, updated_at, code, slug, token, level, student_id, teacher_id, group_id, course_id, plan_id, submission_id, conversation_id, notification_id.

**Índices únicos para:** email, username, course.code, group.code, permission.code, feature_flag.code, configuration.code, badge.code, achievement.code, oauth(provider, provider_user_id).

**Índices compuestos (ejemplos):** (student_id, created_at), (group_id, student_id), (course_id, group_id), (submission_id, version_number), (student_id, competency_id), (student_id, level_id), (student_id, status).

**Soft Delete:** utilizar únicamente `deleted_at TIMESTAMP`; no utilizar `is_deleted`; no eliminar registros históricos.

**Restricciones CHECK:** porcentajes 0–100; XP ≥ 0; calificaciones ≥ 0; duraciones > 0; fechas: start_date ≤ end_date.

**Restricciones NOT NULL (MUST):** todos los campos obligatorios se declaran NOT NULL; no depender de la validación del frontend.

**ENUM (MUST):** todos los estados se implementan mediante ENUM; no utilizar VARCHAR para representar estados.

**Migraciones:** todas las modificaciones mediante migraciones; nunca modificar la BD manualmente; cada migración debe ser atómica, reversible, versionada y documentada.

**Seeds** (datos iniciales automáticos): Roles, Permissions, Competencies, DELF Rubrics, Levels, Badges, Achievements, Notification Templates, Feature Flags, Configurations. *(El seed de Roles debe generar los 7 valores vigentes tras la resolución 18.4/18.14, incluyendo `SYSTEM`.)*

**Transacciones:** utilizar transacciones para operaciones críticas — matrícula; envío de producción escrita; evaluación DELF; asignación de XP; desbloqueo de logros; actualización del Coach Memory. No permitir escrituras parciales.

**Optimización (MUST):** evitar consultas N+1; utilizar índices en consultas frecuentes; utilizar paginación; utilizar carga diferida cuando sea posible; optimizar consultas con EXPLAIN ANALYZE.

**Archivos que Claude debe generar automáticamente:** `schema.prisma`, `ERD.svg`, `ERD.pdf`, `migration.sql`, `seed.ts`, `indexes.sql`, `constraints.sql`, `database.md`.

**Validación automática obligatoria:** todas las tablas poseen PK; todas las relaciones poseen FK; no existen relaciones huérfanas; no existen duplicaciones de entidades; todos los índices necesarios fueron creados; todas las restricciones CHECK fueron implementadas; todos los ENUM fueron definidos; todas las migraciones son reversibles; el modelo cumple la Tercera Forma Normal (3FN), salvo desnormalizaciones justificadas por rendimiento; el modelo es compatible con PostgreSQL 17 y Prisma ORM.
### 13.13 Capítulo 13 — Convenciones de Nomenclatura de Base de Datos

**Reglas generales — MUST:** utilizar inglés en toda la base de datos; nombres descriptivos; consistencia en todos los módulos; evitar abreviaturas; snake_case. **MUST NOT:** espacios; caracteres especiales; mayúsculas; prefijos innecesarios.

| Elemento | Formato | Ejemplos |
|---|---|---|
| Tablas | Singular, snake_case | `user`, `student_profile`, `learning_plan`, `writing_submission`, `coach_memory`, `notification`, `audit_log` |
| Columnas | snake_case | `first_name`, `last_name`, `created_at`, `student_id`, `teacher_id`, `submission_id`, `group_id`, `level_id` |
| Claves primarias | `id` (UUID) | No usar `user_id`, `student_pk`, `teacher_pk` como PK |
| Claves foráneas | `<tabla>_id` | `user_id`, `student_id`, `teacher_id`, `group_id`, `course_id`, `plan_id`, `submission_id`, `conversation_id`, `notification_id` |
| Tablas puente | `EntidadEntidad` | `user_role`, `role_permission`, `group_teacher`, `group_student` (PK compuesta) |
| Índices | `idx_<tabla>_<columnas>` | `idx_user_email`, `idx_group_code`, `idx_submission_student`, `idx_notification_status` |
| Índices únicos | `uq_<tabla>_<columnas>` | `uq_user_email`, `uq_course_code`, `uq_group_code` |
| Foreign Keys | `fk_<tabla>_<tabla_referenciada>` | `fk_student_profile_user`, `fk_group_course`, `fk_submission_student` |
| Primary Keys | `pk_<tabla>` | `pk_user`, `pk_group`, `pk_notification` |
| Constraints CHECK | `ck_<tabla>_<regla>` | `ck_score_range`, `ck_xp_positive`, `ck_date_range` |
| ENUM (tipo) | PascalCase | `UserStatus`, `SubmissionStatus`, `MissionType`, `NotificationType`, `DifficultyLevel` |
| ENUM (valores) | UPPER_SNAKE_CASE | `ACTIVE`, `INACTIVE`, `PENDING`, `COMPLETED` |
| Relaciones Prisma | PascalCase | `StudentProfile`, `LearningPlan`, `WritingSubmission`, `CoachConversation` |
| Archivos Prisma | singular, PascalCase | `User.prisma`, `LearningPlan.prisma`, `CoachMemory.prisma`, `Notification.prisma` |
| Migraciones | `YYYYMMDDHHMM_descripcion` | `202708150900_initial_schema`, `202708201130_add_learning_plan` |
| Seeds | `seed_<modulo>.ts` | `seed_roles.ts`, `seed_permissions.ts`, `seed_levels.ts`, `seed_badges.ts` |
| Variables (código) | camelCase | `studentId`, `groupId`, `currentLevel`, `writingScore`, `coachMemory` |
| Constantes (código) | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `DEFAULT_LANGUAGE`, `MAX_LOGIN_ATTEMPTS`, `DEFAULT_TIMEZONE` |
| Endpoints API | kebab-case | `/api/users`, `/api/learning-plans`, `/api/writing-submissions`, `/api/coach-memory`, `/api/student-dashboard` |

**Restricciones adicionales (MUST):** mantener una única convención en todo el proyecto; todos los módulos siguen exactamente las mismas reglas; no reutilizar nombres para entidades diferentes; no utilizar abreviaturas ambiguas; **no modificar la nomenclatura una vez publicada una migración.**

**Validación automática que Claude debe ejecutar:** tablas/columnas en snake_case; PK siempre `id`; FK con formato `<tabla>_id`; índices y restricciones con la nomenclatura oficial; ENUM en PascalCase; migraciones con el formato oficial; ausencia de nombres duplicados.

### 13.14 Capítulo 14 — Estrategia de Versionado de la Base de Datos

**Principios (MUST):** todo cambio mediante migraciones; nunca modificar directamente la BD en producción; toda migración incremental y reversible; toda migración registrada en el repositorio.

**Versionado semántico:** `v1.0.0`, `v1.1.0`, `v2.0.0` — MAJOR (cambios incompatibles), MINOR (nuevas funcionalidades compatibles), PATCH (correcciones sin modificar el modelo).

**Orden de ejecución de migraciones iniciales:** `01_initial_schema → 02_authentication → 03_profiles → 04_academic_structure → 05_learning_plan → 06_writing → 07_delf_evaluation → 08_coach_ai → 09_learning_analytics → 10_gamification → 11_notifications → 12_administration → 13_integrations → 14_indexes → 15_seed_data`.

**Cambios permitidos:** crear tablas, columnas, índices, restricciones, ENUM, vistas, funciones, triggers, tablas puente.

**Cambios restringidos (Claude NO podrá):** eliminar tablas utilizadas; eliminar columnas con datos; modificar claves primarias; modificar UUID existentes; eliminar Foreign Keys; eliminar restricciones; reutilizar nombres eliminados.

**Cambios compatibles vs. incompatibles:** compatibles = agregar tablas/columnas opcionales/índices/restricciones/ENUM/relaciones opcionales. Incompatibles = cambiar tipos de datos, eliminar columnas/tablas, renombrar tablas/columnas, modificar relaciones existentes o Primary Keys.

**Rollback:** toda migración debe incluir `UP` y `DOWN`; "el rollback deberá restaurar completamente el estado anterior."

**Migraciones atómicas:** "cada migración deberá modificar únicamente un módulo funcional... no mezclar módulos" (ej. una migración para Coach AI, otra para Gamificación, otra para Notificaciones).

**Entornos:** cada migración se ejecuta en orden Development → Testing → Staging → Production. "No ejecutar directamente en producción."

**Archivos generados por migración:** `migration.sql`, `rollback.sql`, `migration.md`, `schema.prisma`, `seed.ts`, `migration_log.md`.

**Restricciones (MUST):** nunca modificar manualmente una migración ya aplicada; nunca sobrescribir migraciones anteriores; nunca reutilizar nombres de migraciones; nunca generar migraciones con múltiples responsabilidades; toda modificación del esquema genera una nueva migración; toda migración debe poder ejecutarse una única vez de forma segura.

### 13.15 Capítulo 20 — Reglas de Evolución del Modelo

**Principios (MUST):** mantener compatibilidad con versiones anteriores; preservar la integridad de los datos; evolucionar mediante cambios incrementales; evitar rediseños completos del esquema; garantizar estabilidad del dominio.

**Cambios permitidos:** crear nuevas tablas, columnas, relaciones, índices, ENUM, restricciones, vistas, funciones, triggers.

**Cambios restringidos (Claude NO podrá):** eliminar tablas con datos; modificar claves primarias; modificar UUID existentes; eliminar relaciones o restricciones activas; reutilizar nombres de entidades eliminadas.

**Evolución de entidades (MUST):** toda nueva entidad pertenece a un único módulo funcional y mantiene cohesión con el dominio; no crear entidades duplicadas; no dividir una entidad existente sin migración de datos.

**Evolución de columnas:** permitido agregar columnas opcionales/con valores por defecto, ampliar longitud cuando sea compatible. No permitido eliminar columnas con información, cambiar el tipo de una columna utilizada, ni reutilizar nombres eliminados.

**Evolución de ENUM:** permitido agregar nuevos valores; no permitido eliminar o renombrar valores utilizados, ni reutilizarlos.

**Deprecación (proceso obligatorio):** 1) marcar como deprecated; 2) crear alternativa compatible; 3) migrar los datos; 4) actualizar dependencias; 5) eliminar únicamente en una versión MAJOR.

**Refactorización:** permitida únicamente cuando reduce complejidad, mejora rendimiento, elimina duplicación y no rompe compatibilidad; toda refactorización debe incluir su migración correspondiente.

**Documentación obligatoria tras cada modificación:** actualizar ERD, `schema.prisma`, `migration.sql`, `database.md`, documentación de API y de arquitectura.

**Restricciones finales (MUST):** nunca modificar directamente la BD en producción; nunca eliminar información sin migración previa; nunca romper compatibilidad sin una versión MAJOR; nunca introducir duplicación de entidades; nunca crear relaciones sin claves foráneas; nunca publicar cambios sin actualizar la documentación.

### 13.16 Documento "Modeling Design" (Doc 11) — nota de alcance

El Doc 11 declara explícitamente un enfoque distinto al del PRD: "En este documento debemos hacer exactamente lo contrario que en un documento funcional: no explicar, sino especificar." Cada capítulo debe contener únicamente: entidades, atributos, tipos de datos, restricciones, claves primarias, claves foráneas, relaciones, índices, reglas de integridad y reglas que Claude debe respetar. "Nada más."

El único capítulo desarrollado en este documento (Capítulo 1. Usuarios y Autenticación) reproduce **de forma prácticamente idéntica** el Capítulo 1 del Domain Modeling (Doc 10) documentado en la sección 13.1 — se trata de una redundancia exacta entre ambos documentos, no de contenido adicional. El archivo termina tras este único capítulo (300 líneas), sin desarrollar los capítulos 2-20 restantes.
## 14. Design System (Identidad Visual, Componentes, Tokens)

> Fuente: UI Design System (Doc 7, 8267 líneas / 12 capítulos narrativos + 12 capítulos de Design Tokens). Esta sección combina la filosofía y las reglas narrativas (14.1–14.11) con el catálogo técnico completo de tokens (14.12, transcrito íntegro por su naturaleza de especificación exacta de valores).

### 14.1 Filosofía del Diseño Visual

"El diseño visual de Redaction Lab constituye una parte esencial de su modelo pedagógico. La interfaz no ha sido concebida como un elemento decorativo... sino como un componente activo del proceso de aprendizaje." "Redaction Lab debe transmitir desde el primer momento la sensación de encontrarse en un entorno de entrenamiento serio, organizado y diseñado específicamente para aprender a escribir en francés." "La plataforma no pretende impresionar mediante efectos visuales complejos ni interfaces sobrecargadas. Su objetivo consiste en desaparecer detrás del aprendizaje."

**Regla rectora de todo el Design System:** "Claude deberá priorizar siempre la experiencia educativa sobre la complejidad visual. Si existe conflicto entre una decisión estética y una decisión pedagógica, prevalecerá siempre la segunda."

El Coach IA como parte de la filosofía visual: "Nunca dominará la pantalla ni interrumpirá innecesariamente el trabajo del estudiante." "Visualmente deberá percibirse como un entrenador cercano y profesional, nunca como un chatbot invasivo."

Directrices: arquitectura modular reutilizable; todos los ecosistemas comparten el mismo lenguaje visual y estructura de navegación; las diferencias entre Academia, Laboratorio, Entrenamiento, Simulador, Evolución y Mi Plan responden exclusivamente a objetivos pedagógicos, no a cambios drásticos de diseño; cada pantalla presenta un único objetivo principal; el Dashboard es siempre el punto central de navegación; el Coach IA se implementa como componente contextual integrado, nunca mediante ventanas emergentes que bloqueen el contenido.

### 14.2 Identidad Visual

La identidad se fundamenta en el "concepto de evolución mediante el entrenamiento" — no representa un curso, libro digital o corrector automático, sino "un espacio de práctica deliberada, reflexión y retroalimentación constante." "La identidad visual evitará reproducir estereotipos asociados al mundo tecnológico, como robots, circuitos electrónicos o elementos futuristas excesivos."

**Logotipo:** debe expresar crecimiento, construcción del conocimiento y escritura; diseño limpio, contemporáneo, reconocible, utilizable en interfaces digitales, materiales impresos, presentaciones académicas y futuras apps móviles; suficientemente flexible para acompañar la expansión hacia DALF u otros idiomas. Debe existir una versión completa (con nombre) y una versión simplificada (espacios reducidos/móviles), y ocupar posición permanente en la barra superior.

**Iconos:** un mismo estilo gráfico lineal, mismas proporciones y grosor de línea.

**Ilustraciones:** solo cuando aportan valor pedagógico o emocional; se evitan estilos infantiles/caricaturescos (público objetivo: universitarios y adultos jóvenes).

**Identidad visual por ecosistema (variaciones sutiles de color/iconografía, sin romper la unidad gráfica general):** Academia — organización y descubrimiento; Laboratorio — exploración y experimentación; Entrenamiento — dinamismo y práctica; Simulador — concentración y evaluación; Evolución — crecimiento y análisis del progreso; Mi Plan — planificación y organización personal.

**Coach IA (elemento más representativo de la identidad):** debe transmitir cercanía, inteligencia y serenidad; no se representará como personaje caricaturesco ni asistente robótico — proyectará la imagen de un mentor académico.

### 14.3 Sistema Cromático

"Los colores no serán utilizados únicamente como recursos estéticos; cada uno cumplirá una función específica." "El color nunca deberá convertirse en el protagonista de la interfaz." Todos los colores deben definirse como **tokens de diseño** (ver catálogo completo de valores en 14.12.3 y 14.12.7).

**Categorías cromáticas mínimas:** color primario de marca; color secundario; color de fondo principal; color de superficies y tarjetas; color para textos principales/secundarios; color para botones primarios/secundarios; colores de éxito, advertencia, oportunidad de mejora, información, enlaces, indicadores de progreso; colores específicos por ecosistema.

**Distribución conceptual de colores por ecosistema (recomendada):**

| Ecosistema | Color | Asociación |
|---|---|---|
| Academia | Azul | conocimiento, comprensión, estabilidad |
| Laboratorio | Violeta | creatividad, exploración, experimentación |
| Entrenamiento | Naranja | energía, práctica, dinamismo |
| Simulador | Rojo oscuro / granate (moderado) | concentración, desafío, condiciones de examen, evitando ansiedad |
| Evolución | Verde | crecimiento, progreso, consolidación |
| Mi Plan | Turquesa | organización, planificación, equilibrio |

Accesibilidad de color: "la comprensión de la información nunca dependerá exclusivamente del color." Modo claro como configuración principal, arquitectura cromática compatible con un futuro modo oscuro sin rediseñar componentes.

### 14.4 Iconografía

Estilo minimalista, limpio y contemporáneo; grosor uniforme de línea; cada icono representa una única idea o acción con significado constante en toda la plataforma.

**Icono oficial por ecosistema:** Dashboard — cuadrícula/panel de control; Mi Plan — calendario/ruta de aprendizaje; Academia — libro abierto/graduación; Laboratorio de Lectura y Escritura — pluma estilográfica + documento; Entrenamiento (Desafíos) — objetivo/diana; Simulador DELF B2 — cronómetro/documento de examen; Evolución — gráfico ascendente; Perfil — usuario; Configuración — engranaje.

**Iconografía de actividades:** Leer, Observar, Analizar, Clasificar, Organizar, Relacionar, Escribir, Reescribir, Revisar, Reflexionar, Autoevaluar, Retroalimentación IA, Desbloquear logro, Misión completada.

Accesibilidad: ningún icono es el único medio de comunicación — siempre acompañado de etiquetas/descripciones.

### 14.5 Ilustraciones y Dirección Artística

> El documento fuente contiene **dos redacciones consecutivas** del Capítulo 5 (una preliminar "Sistema de ilustraciciones y recursos gráficos" y una versión revisada "Dirección artística"); ambas se conservan por fidelidad.

**Versión preliminar — estilo "Editorial Flat Illustration":** formas geométricas simples, proporciones equilibradas, colores suaves, sombras discretas, composición limpia. Personajes con diversidad cultural, lingüística y social. Cinco categorías de ilustraciones: pedagógicas, contextuales, motivacionales, conceptuales, institucionales.

**Versión final — estilo "Stylized Flat Illustration" (predominante), combinado obligatoriamente con:** Painterly Vector Art (texturas pictóricas discretas); Semi-flat Digital Painting (sombras suaves, degradados sutiles, ligera profundidad); Modern Editorial Illustration (narrativa visual); Storybook Illustration y Cozy/Whimsical Illustration (calidez, ambientes acogedores).

Escenas representarán: espacios luminosos, escritorios organizados, bibliotecas, cafeterías, universidades, parques, trenes, ciudades francesas, espacios culturales. Personajes leyendo, reflexionando, tomando notas, escribiendo cartas, colaborando o interactuando con el Coach IA.

**Estilos que Claude debe evitar siempre (ambas versiones, lista consolidada):** Anime, Manga, Disney, Pixar, videojuegos, ciencia ficción, cyberpunk, hiperrealismo, caricaturas infantiles, clipart, fotografías de stock, avatares hiperrealistas, estética futurista de robots, efectos tridimensionales exagerados, sombras duras, colores fluorescentes, composiciones recargadas.

**Representación del Coach IA:** debe alejarse deliberadamente de estereotipos de IA — no será robot humanoide, holograma futurista, androide metálico ni personaje de ciencia ficción; tampoco caricaturesco o infantil. Se representará mediante un **avatar humano estilizado**, con rasgos neutros y universales, vestimenta casual y contemporánea. Lenguaje corporal abierto y acogedor; "nunca mostrará gestos de desaprobación, enfado o frustración." No ocupará grandes áreas de pantalla ni interrumpirá mediante ventanas emergentes invasivas. Claude deberá diseñar **un único personaje oficial** para toda la plataforma, con conjunto reutilizable de expresiones/posturas para distintas situaciones pedagógicas.

### 14.6 Catálogo de Componentes UI

"Ningún componente deberá diseñarse de manera aislada; todos deberán construirse a partir de una biblioteca centralizada de componentes reutilizables." Principio: **"reconocer antes que recordar."**

**Componentes de navegación:** Barra superior (Header); Barra lateral de navegación; Menú inferior adaptable (móvil); Breadcrumbs; Menú de usuario; Selector de idioma; Buscador global; Selector de ecosistemas; Selector de unidades.

**Componentes de botones:** Botón primario, secundario, terciario; Botón de acción rápida; Botón con icono; Botón flotante; Botón de continuar; Botón de volver; Botón de guardar; Botón de enviar producción; Botón "Solicitar ayuda al Coach IA". Estados obligatorios de cada botón: **Normal, Hover, Focus, Active, Disabled, Loading, Success.**

**Componentes de tarjetas (Cards):** de ecosistema, de unidad, de actividad, de misión, de progreso, de logro, de recomendación, del Coach IA, de recursos, de simulador. Mantienen: esquinas redondeadas, sombras suaves, espacio interno amplio, jerarquía tipográfica clara, iconografía consistente, microanimaciones discretas.

**Componentes de entrada de datos:** Campos de texto, Áreas de escritura, Selector de opciones, Checkbox, Radio Button, Dropdown, Date Picker, Calendario, Selector de tiempo, Etiquetas, Chips, Buscador.

**Editor de escritura del estudiante** (componente más importante de toda la plataforma), debe incluir: contador de palabras; temporizador; guardado automático; resaltado visual; observaciones del Coach IA; historial de versiones; comparación entre versiones; panel de retroalimentación; rúbrica DELF B2 integrada; modo concentración (Focus Mode).

**Componentes de progreso:** barras de progreso, círculos de progreso, indicadores diarios, rachas, % de dominio, nivel alcanzado, progreso por competencia, por tipo textual, semanal, mensual — todos actualizados automáticamente.

**Componentes del Coach IA:** tarjeta de explicación, de sugerencia, de estrategia, de ejemplo, de corrección, de felicitación, de motivación, de reflexión; preguntas socráticas; recomendaciones personalizadas.

**Componentes de evaluación:** rúbrica interactiva, criterios DELF, puntuación, observaciones, fortalezas, oportunidades de mejora, radar de competencias, informe final, recomendaciones posteriores.

**Componentes de gamificación:** insignias, medallas, niveles, desafíos, recompensas, misiones, cofres, desbloqueos, experiencia acumulada, rachas — uso moderado, "nunca interferir con el objetivo principal de aprendizaje."

**Componentes de retroalimentación:** mensajes informativos, éxito, advertencias, oportunidades de mejora, consejos personalizados, errores del sistema, confirmaciones. "Nunca deberá generar ansiedad."

**Reglas generales de todo componente:** completamente responsive; funciona en escritorio/tablet/móvil; respeta el sistema cromático y tipográfico oficial; integra la iconografía oficial; accesible mediante teclado; cumple criterios de contraste; consistente en todos los estados; admite futuras ampliaciones sin modificar su estructura base.

### 14.7 Estados de Interacción

Los estados deben comunicar: que el sistema recibió la acción; que está procesando; que la acción se completó o requiere atención.

| Estado | Especificación |
|---|---|
| Normal | apariencia limpia, equilibrada, poco llamativa |
| Hover | ligera elevación, incremento mínimo de sombra, cambio suave de color; transición **150–250 ms** |
| Focus | indicador claro y visible (crítico para accesibilidad por teclado) |
| Active | reducción ligera de escala, cambio temporal de color, pequeña animación de presión; duración **< 150 ms** |
| Selected | diferenciación visual evidente sin resultar agresiva (tarjetas, actividades, respuestas, filtros, unidades, ecosistemas) |
| Loading | Skeleton Screens, barras de progreso, indicadores discretos, mensajes del Coach IA (ej. "Estoy analizando tu producción...") |
| Guardado automático | indicador discreto (ej. "✔ Guardado hace 5 segundos"); nunca ventanas emergentes que interrumpan |
| Éxito | transición suave, animación pequeña, mensaje positivo, actualización inmediata del progreso; nunca celebraciones exageradas tipo videojuego |
| Oportunidad de mejora | frases como "Podemos mejorar este punto", "Observemos nuevamente esta estructura", "Existe una alternativa más natural" |
| Retroalimentación IA | transición gradual: indicador de análisis → explicación → recomendaciones, dividida en bloques |
| Desbloqueo | pequeña animación, actualización del Dashboard, insignia, mensaje del Coach IA |
| Error del sistema | comunicado con tranquilidad, nunca mensajes alarmantes (ej. "Ha ocurrido un problema temporal. Inténtalo nuevamente en unos segundos"); el trabajo del estudiante se conserva automáticamente |

### 14.8 Microinteracciones

Cada microinteracción tiene un propósito funcional/pedagógico: confirmar acciones, orientar la atención, comunicar el estado del sistema, disminuir la incertidumbre, favorecer la sensación de progreso, fortalecer la relación con el Coach IA.

**Especificaciones técnicas exactas:**
- Duración estándar de animaciones: **150–300 ms**.
- Transiciones entre pantallas: hasta **400 ms** (versión final) — la versión preliminar del mismo capítulo indica hasta **500 ms**; ambos valores figuran textualmente en el documento fuente (ver conflicto en sección 17.4).
- Curvas de aceleración: **ease-in-out** en todas las animaciones.
- "Las animaciones nunca deberán bloquear la interacción del usuario."
- El editor de escritura "priorizará la estabilidad visual sobre cualquier efecto dinámico" — microinteracciones reducidas al mínimo.
- El Simulador DELF B2 reduce considerablemente las microinteracciones (solo cronómetro, guardado automático, confirmaciones relevantes).

**Patrón de retroalimentación del Coach IA (5 etapas de aparición progresiva):** 1) mensaje inicial; 2) análisis; 3) explicación; 4) sugerencias; 5) estrategia de mejora.

Claude evitará: rebotes exagerados, rotaciones innecesarias, partículas permanentes, efectos tridimensionales excesivos, o cualquier recurso que incremente la carga cognitiva.

### 14.9 Accesibilidad

Marco de referencia: **Diseño Universal (Universal Design)** y **WCAG 2.2, nivel de conformidad AA** como estándar mínimo.

- Navegación completa por teclado, orden lógico (Tab), indicador de foco visible en todos los componentes.
- Contraste adecuado entre texto/fondo/elementos interactivos; ninguna información depende exclusivamente del color (se complementa con iconografía/texto).
- Tipografía: legibilidad prioritaria, texto ampliable sin pérdida de funcionalidad.
- Alt text en ilustraciones con información relevante; imágenes decorativas marcadas como tales.
- Opción para reducir/eliminar animaciones (sensibilidad al movimiento).
- Accesibilidad cognitiva: instrucciones claras, lenguaje sin ambigüedades, tareas complejas divididas en pasos progresivos.
- Formularios: etiquetas visibles, instrucciones claras, mensajes de error específicos, confirmaciones, ayuda contextual.
- Editor de escritura: escritura sin distracciones, compatible con teclado, guardado automático, historial de versiones, navegación sencilla entre observaciones del Coach IA.

### 14.10 Responsive Design

Enfoque obligatorio: **Mobile First**. "Ningún elemento de la interfaz tendrá dimensiones fijas." Misma identidad visual en todos los dispositivos (solo cambia la organización espacial).

| Dispositivo | Navegación | Comportamiento |
|---|---|---|
| Móvil (punto de partida) | Barra inferior fija + menú desplegable | Una columna, desplazamiento vertical continuo, botones amplios, acceso rápido al Coach IA |
| Tableta | Menú lateral colapsable + navegación superior | Dos columnas cuando resulte beneficioso (contenido + observaciones del Coach + progreso + recursos) |
| Escritorio | Menú lateral permanente | Múltiples paneles simultáneos: consigna, rúbrica, retroalimentación, recursos, editor |

"Ninguna actividad perderá funcionalidades por usar un dispositivo móvil." "Ningún componente deberá provocar desplazamientos horizontales innecesarios." El Coach IA permanece siempre accesible (botón flotante o acceso fijo) independientemente del dispositivo. Nota: esta primera mitad del documento **no especifica breakpoints numéricos** (px) — los valores exactos aparecen en el catálogo de Design Tokens (sección 14.12.8).

### 14.11 Diseño Emocional

Objetivo: "reducir la ansiedad asociada a la producción escrita", fortalecer la confianza, favorecer hábitos sostenibles.

**Sensaciones específicas por ecosistema:** Dashboard — organización y claridad; Academia — curiosidad; Laboratorio — exploración; Entrenamiento — superación personal; Simulador — concentración; Evolución — percepción de progreso; Mi Plan — compromiso con el aprendizaje.

**Mensajes negativos que nunca aparecerán:** "Respuesta incorrecta.", "Has fallado.", "No es suficiente."
**Expresiones que se usan en su lugar:** "Intentémoslo desde otra perspectiva.", "Observemos juntos esta parte.", "Has avanzado; ahora podemos mejorar este aspecto.", "Este es un buen momento para revisar esta estrategia."

**Arquitectura emocional del recorrido (etapas):** Primer contacto (curiosidad, tranquilidad, confianza — "Aquí sé por dónde empezar y siento que puedo lograrlo"); Exploración (interés, pequeños logros rápidos); Aprendizaje (acompañamiento, progresión gradual); Error (oportunidad, serenidad); Progreso (indicadores claros, comentarios personalizados); Simulación (se reducen apoyos pero se mantiene estabilidad); Finalización (satisfacción, celebración moderada centrada en el esfuerzo).

El Coach IA "actuará como un mentor que acompaña el aprendizaje, nunca como un juez que califica el desempeño."
### 14.12 Catálogo Completo de Design Tokens

> Transcripción íntegra y fiel del catálogo de Design Tokens (Capítulos de Tokens del UI Design System, líneas 3190-8267 del documento fuente). Se preservan todos los valores numéricos, nombres de tokens y reglas MUST/MUST NOT exactamente como aparecen en el original. Los encabezados se renumeran para anidarse bajo esta sección sin alterar su contenido.


#### (1) DESIGN TOKENS GENERALES

##### 1.1 Reglas Generales

**MUST**
- Utilizar exclusivamente los Design Tokens definidos en este documento.

**MUST**
- Toda propiedad visual deberá referenciar un token.

**MUST NOT**
- Utilizar valores HEX, RGB, tamaños, radios, sombras o espaciados directamente dentro de componentes.

**MUST NOT**
- Crear nuevos tokens sin actualizar el Design System.

##### 1.2 Estructura de Tokens

Organizar los tokens en las siguientes categorías:
- Color
- Typography
- Spacing
- Radius
- Border
- Shadow
- Opacity
- Blur
- Motion
- Grid
- Breakpoint
- Z-Index
- Icon
- Illustration

##### 1.3 Color Tokens

**Primary**
| Token | Valor |
|---|---|
| Primary-50 | #EFF6FF |
| Primary-100 | #DBEAFE |
| Primary-200 | #BFDBFE |
| Primary-300 | #93C5FD |
| Primary-400 | #60A5FA |
| Primary-500 | #2563EB |
| Primary-600 | #1D4ED8 |
| Primary-700 | #1E40AF |
| Primary-800 | #1E3A8A |
| Primary-900 | #172554 |
| Primary-950 | #0F172A |

**Secondary**
| Token | Valor |
|---|---|
| Secondary-50 | #F5F3FF |
| Secondary-100 | #EDE9FE |
| Secondary-200 | #DDD6FE |
| Secondary-300 | #C4B5FD |
| Secondary-400 | #A78BFA |
| Secondary-500 | #7C3AED |
| Secondary-600 | #6D28D9 |
| Secondary-700 | #5B21B6 |
| Secondary-800 | #4C1D95 |
| Secondary-900 | #2E1065 |

**Neutral**
| Token | Valor |
|---|---|
| Neutral-0 | #FFFFFF |
| Neutral-50 | #FAFAFA |
| Neutral-100 | #F5F5F5 |
| Neutral-200 | #E5E5E5 |
| Neutral-300 | #D4D4D4 |
| Neutral-400 | #A3A3A3 |
| Neutral-500 | #737373 |
| Neutral-600 | #525252 |
| Neutral-700 | #404040 |
| Neutral-800 | #262626 |
| Neutral-900 | #171717 |
| Neutral-950 | #0A0A0A |

**Success**
| Token | Valor |
|---|---|
| Success-50 | #ECFDF5 |
| Success-100 | #D1FAE5 |
| Success-200 | #A7F3D0 |
| Success-300 | #6EE7B7 |
| Success-400 | #34D399 |
| Success-500 | #10B981 |
| Success-600 | #059669 |
| Success-700 | #047857 |
| Success-800 | #065F46 |
| Success-900 | #064E3B |

**Warning**
| Token | Valor |
|---|---|
| Warning-50 | #FFFBEB |
| Warning-100 | #FEF3C7 |
| Warning-200 | #FDE68A |
| Warning-300 | #FCD34D |
| Warning-400 | #FBBF24 |
| Warning-500 | #F59E0B |
| Warning-600 | #D97706 |
| Warning-700 | #B45309 |
| Warning-800 | #92400E |
| Warning-900 | #78350F |

**Danger**
| Token | Valor |
|---|---|
| Danger-50 | #FEF2F2 |
| Danger-100 | #FEE2E2 |
| Danger-200 | #FECACA |
| Danger-300 | #FCA5A5 |
| Danger-400 | #F87171 |
| Danger-500 | #EF4444 |
| Danger-600 | #DC2626 |
| Danger-700 | #B91C1C |
| Danger-800 | #991B1B |
| Danger-900 | #7F1D1D |

**Info**
| Token | Valor |
|---|---|
| Info-50 | #EFF6FF |
| Info-100 | #DBEAFE |
| Info-200 | #BFDBFE |
| Info-300 | #93C5FD |
| Info-400 | #60A5FA |
| Info-500 | #3B82F6 |
| Info-600 | #2563EB |
| Info-700 | #1D4ED8 |
| Info-800 | #1E40AF |
| Info-900 | #1E3A8A |

##### 1.4 Background Tokens
- Background-Primary: #FFFFFF
- Background-Secondary: #F8FAFC
- Background-Tertiary: #F1F5F9
- Background-Inverse: #0F172A

##### 1.5 Surface Tokens
- Surface-Primary
- Surface-Secondary
- Surface-Tertiary
- Surface-Elevated
- Surface-Overlay
- Surface-Modal
- Surface-Card
- Surface-Tooltip

##### 1.6 Border Tokens
- Border-Light
- Border-Default
- Border-Strong
- Border-Accent
- Border-Focus
- Border-Disabled
- Border-Success
- Border-Warning
- Border-Danger

##### 1.7 Text Tokens
- Text-Primary
- Text-Secondary
- Text-Tertiary
- Text-Placeholder
- Text-Inverse
- Text-Link
- Text-Success
- Text-Warning
- Text-Danger
- Text-Disabled

##### 1.8 Icon Tokens
- Icon-Primary
- Icon-Secondary
- Icon-Tertiary
- Icon-Inverse
- Icon-Accent
- Icon-Success
- Icon-Warning
- Icon-Danger

##### 1.9 Button Tokens
- Button-Primary
- Button-Primary-Hover
- Button-Primary-Active
- Button-Secondary
- Button-Secondary-Hover
- Button-Secondary-Active
- Button-Ghost
- Button-Disabled

##### 1.10 Input Tokens
- Input-Background
- Input-Border
- Input-Hover
- Input-Focus
- Input-Disabled
- Input-Placeholder
- Input-Error
- Input-Success

##### 1.11 Card Tokens
- Card-Background
- Card-Border
- Card-Shadow
- Card-Hover
- Card-Selected

##### 1.12 Badge Tokens
- Badge-Primary
- Badge-Secondary
- Badge-Success
- Badge-Warning
- Badge-Danger
- Badge-Info

##### 1.13 AI Tokens
- AI-Primary
- AI-Secondary
- AI-Background
- AI-Gradient-Start
- AI-Gradient-End
- AI-Avatar
- AI-Message
- AI-Response

##### 1.14 DELF Tokens
- DELF-Writing
- DELF-Reading
- DELF-Listening
- DELF-Speaking
- DELF-Grammar
- DELF-Vocabulary
- DELF-Evaluation

##### 1.15 Gamification Tokens
- XP
- Level
- Achievement
- Mission
- Reward
- Gold
- Silver
- Bronze
- Diamond

##### 1.16 Opacity Tokens
| Token | Valor |
|---|---|
| Opacity-0 | 0 |
| Opacity-5 | 0.05 |
| Opacity-10 | 0.10 |
| Opacity-20 | 0.20 |
| Opacity-30 | 0.30 |
| Opacity-40 | 0.40 |
| Opacity-50 | 0.50 |
| Opacity-60 | 0.60 |
| Opacity-70 | 0.70 |
| Opacity-80 | 0.80 |
| Opacity-90 | 0.90 |
| Opacity-100 | 1 |

##### 1.17 Blur Tokens
| Token | Valor |
|---|---|
| Blur-None | 0px |
| Blur-XS | 2px |
| Blur-SM | 4px |
| Blur-MD | 8px |
| Blur-LG | 12px |
| Blur-XL | 20px |

##### 1.18 Z-Index Tokens
| Token | Valor |
|---|---|
| Base | 0 |
| Dropdown | 100 |
| Sticky | 200 |
| Overlay | 300 |
| Drawer | 400 |
| Modal | 500 |
| Popover | 600 |
| Tooltip | 700 |
| Toast | 800 |
| CoachAI | 900 |
| System | 9999 |

##### 1.19 Reglas

**MUST**
- Todos los componentes deberán consumir exclusivamente estos Design Tokens.

**MUST**
- Todo nuevo componente deberá reutilizar tokens existentes.

**MUST NOT**
- Duplicar tokens.

**MUST NOT**
- Crear variantes visuales fuera del sistema.

**MUST NOT**
- Utilizar valores hardcoded dentro del código.

##### 1.20 Resultado Esperado

Claude deberá poder generar automáticamente:
- tokens.json
- design-tokens.ts
- theme.ts
- tailwind.config.ts
- Variables CSS
- Tema global de la aplicación

---

#### (2) TYPOGRAPHY (Capítulo 2)

##### 2.1 Reglas Generales

**MUST**
- Utilizar una única familia tipográfica en toda la plataforma.

**MUST**
- Toda tipografía deberá utilizar exclusivamente los tokens definidos en este capítulo.

**MUST NOT**
- Utilizar tamaños, pesos o alturas de línea personalizados.

**MUST NOT**
- Crear variantes tipográficas fuera del Design System.

##### 2.2 Familia Tipográfica
- Fuente Principal: **Inter**
- Fallback: system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif

##### 2.3 Font Weights
| Nombre | Valor |
|---|---|
| Thin | 100 |
| ExtraLight | 200 |
| Light | 300 |
| Regular | 400 |
| Medium | 500 |
| SemiBold | 600 |
| Bold | 700 |
| ExtraBold | 800 |

##### 2.4 Display Tokens
| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display-XL | 64px | 700 | 72px | -2% |
| Display-L | 56px | 700 | 64px | -2% |
| Display-M | 48px | 700 | 56px | -1% |

##### 2.5 Heading Tokens
| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Heading-1 | 40px | 700 | 48px | -1% |
| Heading-2 | 32px | 700 | 40px | — |
| Heading-3 | 28px | 600 | 36px | — |
| Heading-4 | 24px | 600 | 32px | — |
| Heading-5 | 20px | 600 | 28px | — |
| Heading-6 | 18px | 600 | 26px | — |

##### 2.6 Title Tokens
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Title-L | 20px | 600 | 28px |
| Title-M | 18px | 600 | 26px |
| Title-S | 16px | 600 | 24px |

##### 2.7 Body Tokens
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Body-XL | 20px | 400 | 32px |
| Body-L | 18px | 400 | 30px |
| Body-M | 16px | 400 | 28px |
| Body-S | 14px | 400 | 24px |
| Body-XS | 12px | 400 | 20px |

##### 2.8 Label Tokens
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Label-L | 16px | 500 | 24px |
| Label-M | 14px | 500 | 20px |
| Label-S | 12px | 500 | 18px |

##### 2.9 Button Tokens (tipografía)
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Button-L | 16px | 600 | 24px |
| Button-M | 14px | 600 | 20px |
| Button-S | 12px | 600 | 18px |

##### 2.10 Caption Tokens
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Caption-L | 14px | 400 | 20px |
| Caption-M | 12px | 400 | 18px |
| Caption-S | 10px | 400 | 16px |

##### 2.11 Input Tokens (tipografía)
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Input | 16px | 400 | 24px |
| Placeholder | 16px | 400 | 24px |

##### 2.12 Tooltip Tokens
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Tooltip | 12px | 500 | 18px |

##### 2.13 Badge Tokens (tipografía)
| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Badge | 12px | 600 | 16px | 2% |

##### 2.14 AI Tokens (tipografía)
| Token | Size | Weight | Line Height |
|---|---|---|---|
| AI-Message | 16px | 400 | 28px |
| AI-Feedback | 15px | 400 | 26px |
| AI-Suggestion | 14px | 400 | 24px |

##### 2.15 DELF Tokens (tipografía)
| Token | Size | Weight | Line Height |
|---|---|---|---|
| Exercise-Title | 24px | 700 | 32px |
| Instruction | 16px | 400 | 28px |
| Evaluation | 15px | 500 | 24px |

##### 2.16 Letter Spacing Tokens
| Nombre | Valor |
|---|---|
| Tighter | -2% |
| Tight | -1% |
| Normal | 0% |
| Wide | 1% |
| Wider | 2% |
| Widest | 4% |

##### 2.17 Text Alignment
- Left
- Center
- Right
- Justify

##### 2.18 Text Transform
- None
- Uppercase
- Lowercase
- Capitalize

##### 2.19 Restricciones

**MUST**
- Utilizar únicamente los tamaños definidos en este capítulo.

**MUST**
- Mantener una jerarquía tipográfica consistente en toda la plataforma.

**MUST**
- Respetar los pesos y alturas de línea oficiales.

**MUST NOT**
- Modificar manualmente font-size, font-weight, line-height o letter-spacing fuera de los tokens.

**MUST NOT**
- Utilizar más de una familia tipográfica.

##### 2.20 Resultado Esperado

Claude deberá generar automáticamente:
- typography.ts
- font-tokens.json
- tailwind.config.ts (theme.fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)
- Variables CSS tipográficas
- Componentes tipográficos reutilizables (Display, Heading, Body, Label, Caption, Button, Tooltip) utilizando exclusivamente los tokens definidos en este capítulo.

---

#### (3) SPACING SYSTEM (Capítulo 3)

##### 3.1 Reglas Generales

**MUST**
- Utilizar exclusivamente los valores de espaciado definidos en este capítulo.

**MUST**
- Todo margen, padding, gap, separación y tamaño espacial deberá utilizar un Spacing Token.

**MUST NOT**
- Utilizar valores arbitrarios.

**MUST NOT**
- Utilizar valores hardcoded.

##### 3.2 Unidad Base
- Base Unit: **4px**
- Todo el sistema de espaciado deberá construirse como múltiplos de esta unidad.

##### 3.3 Spacing Tokens
| Token | Valor |
|---|---|
| Spacing-0 | 0px |
| Spacing-1 | 4px |
| Spacing-2 | 8px |
| Spacing-3 | 12px |
| Spacing-4 | 16px |
| Spacing-5 | 20px |
| Spacing-6 | 24px |
| Spacing-8 | 32px |
| Spacing-10 | 40px |
| Spacing-12 | 48px |
| Spacing-14 | 56px |
| Spacing-16 | 64px |
| Spacing-20 | 80px |
| Spacing-24 | 96px |
| Spacing-32 | 128px |
| Spacing-40 | 160px |
| Spacing-48 | 192px |
| Spacing-56 | 224px |
| Spacing-64 | 256px |

##### 3.4 Gap Tokens
| Token | Valor |
|---|---|
| Gap-XS | 4px |
| Gap-SM | 8px |
| Gap-MD | 16px |
| Gap-LG | 24px |
| Gap-XL | 32px |
| Gap-2XL | 48px |
| Gap-3XL | 64px |

##### 3.5 Padding Tokens
| Token | Valor |
|---|---|
| Padding-XS | 4px |
| Padding-SM | 8px |
| Padding-MD | 16px |
| Padding-LG | 24px |
| Padding-XL | 32px |
| Padding-2XL | 48px |
| Padding-3XL | 64px |

##### 3.6 Margin Tokens
| Token | Valor |
|---|---|
| Margin-XS | 4px |
| Margin-SM | 8px |
| Margin-MD | 16px |
| Margin-LG | 24px |
| Margin-XL | 32px |
| Margin-2XL | 48px |
| Margin-3XL | 64px |

##### 3.7 Stack Spacing (espaciado vertical entre elementos consecutivos)
| Token | Valor |
|---|---|
| Stack-XS | 4px |
| Stack-SM | 8px |
| Stack-MD | 16px |
| Stack-LG | 24px |
| Stack-XL | 32px |
| Stack-2XL | 48px |
| Stack-3XL | 64px |

##### 3.8 Inline Spacing (espaciado horizontal entre elementos)
| Token | Valor |
|---|---|
| Inline-XS | 4px |
| Inline-SM | 8px |
| Inline-MD | 16px |
| Inline-LG | 24px |
| Inline-XL | 32px |
| Inline-2XL | 48px |

##### 3.9 Section Spacing (separación entre secciones principales)
| Token | Valor |
|---|---|
| Section-SM | 48px |
| Section-MD | 64px |
| Section-LG | 96px |
| Section-XL | 128px |
| Section-2XL | 160px |

##### 3.10 Page Spacing
| Token | Valor |
|---|---|
| Page-Mobile | 16px |
| Page-Tablet | 24px |
| Page-Laptop | 32px |
| Page-Desktop | 48px |
| Page-Wide | 64px |

##### 3.11 Component Spacing
- **Button**: Padding Y 12px / Padding X 20px / Gap 8px
- **Input**: Padding Y 12px / Padding X 16px / Gap 8px
- **Card**: Padding 24px / Gap 16px
- **Modal**: Padding 32px / Gap 24px
- **Sidebar**: Padding 24px / Gap 16px
- **Navbar**: Padding Y 16px / Padding X 24px / Gap 24px

##### 3.12 Grid Spacing
- Column Gap: 24px
- Row Gap: 24px
- Container Gap: 32px

##### 3.13 Icon Spacing
| Token | Valor |
|---|---|
| Icon Gap XS | 4px |
| Icon Gap SM | 8px |
| Icon Gap MD | 12px |
| Icon Gap LG | 16px |

##### 3.14 Form Spacing
- Campo → Campo: 24px
- Label → Input: 8px
- Input → Helper: 8px
- Helper → Error: 4px
- Grupo → Grupo: 32px
- Formulario → Botones: 40px

##### 3.15 Dashboard Spacing
- Widget → Widget: 24px
- Card → Card: 24px
- Sección → Sección: 48px
- Panel → Panel: 32px

##### 3.16 Responsive
**Mobile**
- Reducir únicamente: Section, Page, Container
- Mantener constantes: Padding interno, Gap de componentes, Espaciado de formularios

##### 3.17 Restricciones

**MUST**
- Utilizar exclusivamente los Spacing Tokens.

**MUST**
- Mantener una cuadrícula basada en múltiplos de 4px.

**MUST**
- Reutilizar siempre los mismos valores.

**MUST NOT**
- Utilizar valores como: 5px, 7px, 13px, 18px, 21px, 27px, 35px, 43px, 51px.

**MUST NOT**
- Modificar el espaciado manualmente fuera del sistema.

##### 3.18 Resultado Esperado

Claude deberá generar automáticamente:
- spacing.ts
- spacing.json
- Variables CSS de espaciado
- Escala spacing de tailwind.config.ts
- Tokens reutilizables para margin, padding, gap, space-x, space-y y layouts

---

#### (4) BORDER RADIUS (Capítulo 4)

##### 4.1 Reglas Generales

**MUST**
- Utilizar exclusivamente los Border Radius Tokens definidos en este capítulo.

**MUST**
- Todos los componentes deberán reutilizar estos tokens.

**MUST NOT**
- Definir radios personalizados.

**MUST NOT**
- Utilizar valores hardcoded.

##### 4.2 Border Radius Tokens
| Token | Valor |
|---|---|
| Radius-None | 0px |
| Radius-XS | 2px |
| Radius-SM | 4px |
| Radius-MD | 8px |
| Radius-LG | 12px |
| Radius-XL | 16px |
| Radius-2XL | 24px |
| Radius-3XL | 32px |
| Radius-Pill | 999px |
| Radius-Full | 9999px |

##### 4.3 Button Radius
- Button-Large: Radius-LG
- Button-Medium: Radius-MD
- Button-Small: Radius-MD
- Button-Icon: Radius-MD
- Button-FAB: Radius-Full

##### 4.4 Input Radius
- Input: Radius-MD
- Textarea: Radius-MD
- Select: Radius-MD
- Search: Radius-Pill
- Autocomplete: Radius-MD

##### 4.5 Card Radius
- Card: Radius-XL
- Card-Compact: Radius-LG
- Card-Elevated: Radius-XL
- Dashboard Card: Radius-XL

##### 4.6 Modal Radius
- Modal: Radius-2XL
- Dialog: Radius-XL
- Drawer: Radius-XL
- Popover: Radius-LG

##### 4.7 Navigation Radius
- Sidebar: Radius-None
- Navbar: Radius-None
- Tab: Radius-MD
- Breadcrumb: Radius-SM
- Menu: Radius-LG

##### 4.8 Badge Radius
- Badge: Radius-Pill
- Chip: Radius-Pill
- Tag: Radius-Pill
- Notification: Radius-Pill

##### 4.9 Image Radius
- Avatar: Radius-Full
- Thumbnail: Radius-LG
- Illustration: Radius-XL
- Banner: Radius-XL

##### 4.10 AI Components
- AI Chat Bubble: Radius-2XL
- AI Suggestion Card: Radius-XL
- AI Message: Radius-XL
- AI Coach Avatar: Radius-Full
- AI Panel: Radius-XL

##### 4.11 DELF Components
- Exercise Card: Radius-XL
- Evaluation Card: Radius-XL
- Feedback Card: Radius-XL
- Correction Panel: Radius-XL

##### 4.12 Gamification
- Achievement Card: Radius-XL
- Reward Card: Radius-XL
- XP Badge: Radius-Pill
- Level Badge: Radius-Pill
- Mission Card: Radius-XL

##### 4.13 Tables
- Table Container: Radius-XL
- Table Header: Radius-XL
- Table Cell: Radius-None
- Pagination: Radius-MD

##### 4.14 Alerts
- Success Alert: Radius-LG
- Warning Alert: Radius-LG
- Danger Alert: Radius-LG
- Info Alert: Radius-LG

##### 4.15 Tooltips
- Tooltip: Radius-MD
- Toast: Radius-LG
- Snackbar: Radius-LG

##### 4.16 Dropdowns
- Dropdown: Radius-LG
- Context Menu: Radius-LG
- Select Menu: Radius-LG
- Command Palette: Radius-XL

##### 4.17 Responsive
Los valores de Border Radius permanecerán constantes en: Mobile, Tablet, Laptop, Desktop, UltraWide.
No modificar el radio según el tamaño de pantalla.

##### 4.18 Restricciones

**MUST**
- Utilizar únicamente los Border Radius Tokens oficiales.

**MUST**
- Mantener consistencia visual entre componentes equivalentes.

**MUST**
- Utilizar Radius-Pill únicamente para elementos tipo badge, chip, search o botones circulares.

**MUST**
- Utilizar Radius-Full únicamente para elementos completamente circulares.

**MUST NOT**
- Utilizar radios distintos a los definidos en este capítulo.

**MUST NOT**
- Combinar múltiples radios arbitrarios en un mismo componente.

**MUST NOT**
- Modificar el radio mediante estilos inline.

##### 4.19 Resultado Esperado

Claude deberá generar automáticamente:
- radius.ts
- radius.json
- Variables CSS de Border Radius
- Escala borderRadius de tailwind.config.ts
- Tokens reutilizables para todos los componentes visuales, utilizando exclusivamente los Border Radius Tokens definidos en este capítulo.

---

#### (5) ELEVATION & SHADOW SYSTEM (Capítulo 5)

##### 5.1 Reglas Generales

**MUST**
- Utilizar exclusivamente los Shadow Tokens definidos en este capítulo.

**MUST**
- Toda elevación visual deberá representarse mediante un Shadow Token.

**MUST NOT**
- Definir sombras personalizadas.

**MUST NOT**
- Utilizar valores hardcoded.

##### 5.2 Principios

La elevación deberá comunicar únicamente: jerarquía; profundidad; interacción; foco; superposición.
Las sombras nunca deberán utilizarse como elemento decorativo.

##### 5.3 Shadow Tokens

- **Shadow-None**: `box-shadow: none;`
- **Shadow-XS**: `box-shadow: 0 1px 2px rgba(15,23,42,0.05);`
- **Shadow-SM**: `box-shadow: 0 1px 3px rgba(15,23,42,0.10), 0 1px 2px rgba(15,23,42,0.06);`
- **Shadow-MD**: `box-shadow: 0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.06);`
- **Shadow-LG**: `box-shadow: 0 10px 15px rgba(15,23,42,0.10), 0 4px 6px rgba(15,23,42,0.05);`
- **Shadow-XL**: `box-shadow: 0 20px 25px rgba(15,23,42,0.12), 0 8px 10px rgba(15,23,42,0.08);`
- **Shadow-2XL**: `box-shadow: 0 25px 50px rgba(15,23,42,0.25);`
- **Shadow-Inner**: `box-shadow: inset 0 2px 4px rgba(15,23,42,0.06);`

##### 5.4 Elevation Levels
| Nivel | Shadow Token |
|---|---|
| Elevation-0 | Shadow-None |
| Elevation-1 | Shadow-XS |
| Elevation-2 | Shadow-SM |
| Elevation-3 | Shadow-MD |
| Elevation-4 | Shadow-LG |
| Elevation-5 | Shadow-XL |
| Elevation-6 | Shadow-2XL |

##### 5.5 Buttons
- Default: Shadow-None
- Hover: Shadow-SM
- Pressed: Shadow-Inner
- Disabled: Shadow-None
- Focus: Shadow-MD

##### 5.6 Inputs
- Default: Shadow-None
- Hover: Shadow-XS
- Focus: Shadow-MD
- Error: Shadow-None
- Disabled: Shadow-None

##### 5.7 Cards
- Default: Shadow-SM
- Hover: Shadow-LG
- Selected: Shadow-LG
- Interactive: Shadow-MD
- Static: Shadow-XS

##### 5.8 Modals
- Modal: Shadow-2XL
- Dialog: Shadow-XL
- Drawer: Shadow-XL
- Popover: Shadow-LG

##### 5.9 Dropdowns
- Dropdown: Shadow-LG
- Context Menu: Shadow-LG
- Select Menu: Shadow-LG
- Command Menu: Shadow-XL

##### 5.10 Tooltips
- Tooltip: Shadow-LG
- Toast: Shadow-LG
- Snackbar: Shadow-LG

##### 5.11 AI Components
- Coach AI Panel: Shadow-LG
- AI Chat: Shadow-SM
- AI Suggestions: Shadow-MD
- AI Floating Button: Shadow-XL

##### 5.12 DELF Components
- Exercise Card: Shadow-SM
- Evaluation Card: Shadow-MD
- Correction Panel: Shadow-MD
- Feedback Card: Shadow-SM

##### 5.13 Dashboard
- Widgets: Shadow-SM
- Statistics Cards: Shadow-MD
- Charts: Shadow-SM
- Floating Panels: Shadow-LG

##### 5.14 Navigation
- Navbar: Shadow-XS
- Sidebar: Shadow-None
- Bottom Navigation: Shadow-LG

##### 5.15 Responsive
Los Shadow Tokens permanecerán constantes en: Mobile, Tablet, Laptop, Desktop, UltraWide.
No modificar las sombras según el tamaño de pantalla.

##### 5.16 Performance

**MUST**
- Utilizar únicamente sombras definidas en este capítulo.

**MUST**
- Mantener el número mínimo de capas por sombra.

**MUST NOT**
- Aplicar múltiples sombras acumuladas innecesarias.

**MUST NOT**
- Utilizar efectos costosos que degraden el rendimiento.

##### 5.17 Restricciones

**MUST**
- Todos los componentes deberán utilizar un único nivel de elevación.

**MUST**
- Incrementar la elevación únicamente cuando exista interacción o cambio de contexto.

**MUST NOT**
- Utilizar sombras para compensar problemas de contraste.

**MUST NOT**
- Aplicar sombras a elementos puramente tipográficos.

**MUST NOT**
- Crear nuevas variantes de sombras fuera del Design System.

##### 5.18 Resultado Esperado

Claude deberá generar automáticamente:
- shadows.ts
- elevation.ts
- shadow.json
- Variables CSS de sombras
- Escala boxShadow de tailwind.config.ts
- Sistema de elevación reutilizable para todos los componentes, utilizando exclusivamente los Shadow Tokens definidos en este capítulo.

---

#### (6) ICONOGRAPHY SYSTEM (Capítulo 6)

##### 6.1 Reglas Generales

**MUST**
- Utilizar una única biblioteca oficial de iconos.

**MUST**
- Todos los iconos deberán reutilizar los Design Tokens definidos en este documento.

**MUST NOT**
- Mezclar múltiples bibliotecas de iconos.

**MUST NOT**
- Modificar manualmente el estilo de los iconos.

##### 6.2 Biblioteca Oficial
- **Lucide Icons**, versión: última versión estable

##### 6.3 Estilo
- **Outline**
- Características: Minimalista, Geométrico, Consistente, Moderno, Bajo ruido visual

##### 6.4 Grosor
- Stroke Width: **2px**
- Utilizar el mismo grosor para todos los iconos.

##### 6.5 Tamaños
| Token | Valor |
|---|---|
| Icon-XS | 12px |
| Icon-SM | 16px |
| Icon-MD | 20px |
| Icon-LG | 24px |
| Icon-XL | 32px |
| Icon-2XL | 40px |
| Icon-3XL | 48px |

##### 6.6 Color

Todos los iconos deberán utilizar exclusivamente: Icon-Primary, Icon-Secondary, Icon-Tertiary, Icon-Inverse, Icon-Success, Icon-Warning, Icon-Danger, Icon-Disabled.
Nunca utilizar colores HEX directamente.

##### 6.7 Espaciado (separación entre icono y texto)
| Token | Valor |
|---|---|
| XS | 4px |
| SM | 8px |
| MD | 12px |
| LG | 16px |

##### 6.8 Botones
- Button Small: Icon-SM
- Button Medium: Icon-MD
- Button Large: Icon-LG
- FAB: Icon-XL

##### 6.9 Inputs
- Leading Icon: Icon-MD
- Trailing Icon: Icon-MD
- Search: Icon-MD
- Password: Icon-MD
- Validation: Icon-SM

##### 6.10 Navegación
- Sidebar: Icon-MD
- Navbar: Icon-MD
- Tabs: Icon-MD
- Breadcrumb: Icon-SM
- Menu: Icon-MD

##### 6.11 Dashboard
- Statistics: Icon-LG
- Cards: Icon-LG
- Charts: Icon-MD
- Widgets: Icon-LG
- Quick Actions: Icon-LG

##### 6.12 IA
- Coach IA: Icon-XL
- Chat: Icon-MD
- Suggestion: Icon-MD
- Feedback: Icon-MD
- Generation: Icon-LG
- Sparkles: Icon-MD

##### 6.13 DELF
- Production Écrite: File Pen
- Compréhension Écrite: Book Open
- Compréhension Orale: Headphones
- Production Orale: Mic
- Grammaire: Languages
- Vocabulaire: Book Text
- Correction: Circle Check
- Évaluation: Clipboard Check

##### 6.14 Gamificación
- XP: Star
- Level: Trophy
- Mission: Target
- Achievement: Medal
- Reward: Gift
- Diamond: Gem
- Ranking: Crown
- Badge: Award

##### 6.15 Estados
Default, Hover, Active, Selected, Disabled, Success, Warning, Danger, Loading.

No modificar: tamaño, grosor, proporción.
Únicamente podrá cambiar el color según el estado.

##### 6.16 Animaciones

Permitir únicamente: Fade, Scale, Rotate 90°, Pulse, Bounce, Spin (Loading).
Duración máxima: **200ms**

##### 6.17 Accesibilidad

Todos los iconos deberán:
- incluir aria-label cuando representen una acción;
- incluir title cuando sea necesario;
- respetar contraste WCAG AA;
- mantener un área mínima interactiva de 44×44 px cuando sean clicables.

Los iconos decorativos deberán marcarse como: `aria-hidden="true"`

##### 6.18 Restricciones

**MUST**
- Utilizar únicamente Lucide Icons.

**MUST**
- Mantener el mismo estilo visual en toda la plataforma.

**MUST**
- Utilizar exclusivamente los tamaños oficiales.

**MUST**
- Utilizar exclusivamente los colores definidos por los Icon Tokens.

**MUST NOT**
- Mezclar iconografía Filled, Outline y Duotone.

**MUST NOT**
- Estirar, comprimir o deformar iconos.

**MUST NOT**
- Aplicar sombras, gradientes o efectos especiales.

**MUST NOT**
- Crear iconos personalizados salvo aprobación explícita del Design System.

##### 6.19 Resultado Esperado

Claude deberá generar automáticamente:
- Biblioteca oficial de iconos.
- Sistema de tamaños.
- Sistema de colores.
- Componentes `<Icon />`.
- Integración con Lucide Icons.
- Configuración reutilizable para toda la plataforma.

Utilizando exclusivamente las reglas definidas en este capítulo.

---

#### (7) COLOR SYSTEM (Capítulo 8)

> Nota de fidelidad: en el documento fuente, el "CAPÍTULO 8. COLOR SYSTEM" completo (secciones 8.1–8.17) aparece **duplicado literalmente dos veces consecutivas** (líneas 5367–5835 y 5836–6304, con contenido idéntico). Se presenta una sola vez a continuación para evitar redundancia, dejando constancia de la duplicación en el original.

##### 8.1 Reglas Generales

**MUST**
- Utilizar exclusivamente la paleta oficial definida en este capítulo.

**MUST**
- Todos los componentes deberán consumir Color Tokens.

**MUST NOT**
- Utilizar colores HEX directamente en los componentes.

**MUST NOT**
- Crear nuevas variantes cromáticas fuera del Design System.

##### 8.2 Paleta Primaria
| Token | Valor |
|---|---|
| Primary-50 | #EFF6FF |
| Primary-100 | #DBEAFE |
| Primary-200 | #BFDBFE |
| Primary-300 | #93C5FD |
| Primary-400 | #60A5FA |
| Primary-500 | #2563EB |
| Primary-600 | #1D4ED8 |
| Primary-700 | #1E40AF |
| Primary-800 | #1E3A8A |
| Primary-900 | #172554 |
| Primary-950 | #0F172A |

Uso: Botones primarios, Enlaces, Elementos activos, Indicadores, Navegación.

##### 8.3 Paleta Secundaria
| Token | Valor |
|---|---|
| Secondary-50 | #F5F3FF |
| Secondary-100 | #EDE9FE |
| Secondary-200 | #DDD6FE |
| Secondary-300 | #C4B5FD |
| Secondary-400 | #A78BFA |
| Secondary-500 | #7C3AED |
| Secondary-600 | #6D28D9 |
| Secondary-700 | #5B21B6 |
| Secondary-800 | #4C1D95 |
| Secondary-900 | #2E1065 |

Uso: Acciones secundarias, Destacados, IA, Gamificación.

##### 8.4 Paleta Neutral
| Token | Valor |
|---|---|
| Neutral-0 | #FFFFFF |
| Neutral-50 | #FAFAFA |
| Neutral-100 | #F5F5F5 |
| Neutral-200 | #E5E5E5 |
| Neutral-300 | #D4D4D4 |
| Neutral-400 | #A3A3A3 |
| Neutral-500 | #737373 |
| Neutral-600 | #525252 |
| Neutral-700 | #404040 |
| Neutral-800 | #262626 |
| Neutral-900 | #171717 |
| Neutral-950 | #0A0A0A |

Uso: Texto, Fondos, Bordes, Contenedores.

##### 8.5 Colores Semánticos
| Color | Valor | Uso |
|---|---|---|
| Success | #10B981 | Correcto, Completado, Éxito |
| Warning | #F59E0B | Advertencias, Atención, Información importante |
| Danger | #EF4444 | Error, Eliminación, Riesgo |
| Info | #3B82F6 | Información, Ayuda, Notificaciones |

##### 8.6 Background System
- Background-Primary: #FFFFFF
- Background-Secondary: #F8FAFC
- Background-Tertiary: #F1F5F9
- Background-Inverse: #0F172A

##### 8.7 Surface System
- Surface-Primary
- Surface-Secondary
- Surface-Elevated
- Surface-Modal
- Surface-Card
- Surface-Overlay
- Surface-Tooltip

Todas las superficies utilizarán únicamente tonos neutros.

##### 8.8 Text Colors
| Token | Referencia |
|---|---|
| Text-Primary | Neutral-900 |
| Text-Secondary | Neutral-700 |
| Text-Tertiary | Neutral-500 |
| Text-Disabled | Neutral-400 |
| Text-Inverse | Neutral-0 |

##### 8.9 Border Colors
| Token | Referencia |
|---|---|
| Border-Light | Neutral-200 |
| Border-Default | Neutral-300 |
| Border-Strong | Neutral-500 |
| Border-Focus | Primary-500 |
| Border-Error | Danger-500 |
| Border-Success | Success-500 |

##### 8.10 IA
| Token | Valor / Referencia |
|---|---|
| AI-Primary | Secondary-500 |
| AI-Gradient-Start | Primary-500 |
| AI-Gradient-End | Secondary-500 |
| AI-Background | #F8FAFF |
| AI-Message | Neutral-900 |
| AI-Assistant | Primary-500 |

##### 8.11 DELF
| Módulo | Color |
|---|---|
| Production Écrite | #2563EB |
| Compréhension Écrite | #0EA5E9 |
| Compréhension Orale | #14B8A6 |
| Production Orale | #7C3AED |
| Grammaire | #F59E0B |
| Vocabulaire | #22C55E |
| Évaluation | #EF4444 |

##### 8.12 Gamificación
| Elemento | Color |
|---|---|
| XP | #2563EB |
| Nivel | #7C3AED |
| Logro | #F59E0B |
| Recompensa | #22C55E |
| Diamante | #06B6D4 |
| Oro | #EAB308 |
| Plata | #94A3B8 |
| Bronce | #B45309 |

##### 8.13 Estados

**Hover**: Oscurecer un nivel. Ejemplo: Primary-500 → Primary-600
**Active**: Oscurecer dos niveles. Primary-500 → Primary-700
**Disabled**: Background Neutral-100 / Text Neutral-400 / Border Neutral-200
**Focus**: Border Primary-500 / Ring Primary-300

##### 8.14 Modo Oscuro
- Background: Neutral-950
- Surface: Neutral-900
- Card: Neutral-800
- Border: Neutral-700
- Text: Neutral-0

Mantener la misma paleta semántica.

##### 8.15 Accesibilidad

**MUST**
- Cumplir WCAG AA.

Relación mínima: **4.5 : 1**
Texto grande: **3 : 1**
No utilizar combinaciones que reduzcan la legibilidad.

##### 8.16 Restricciones

**MUST**
- Todos los componentes deberán utilizar únicamente Color Tokens.

**MUST**
- Mantener consistencia cromática en toda la plataforma.

**MUST NOT**
- Utilizar colores HEX directamente dentro de componentes.

**MUST NOT**
- Crear nuevas variantes cromáticas.

**MUST NOT**
- Modificar manualmente la saturación, brillo o tonalidad de los colores oficiales.

##### 8.17 Resultado Esperado

Claude deberá generar automáticamente:
- colors.ts
- color-tokens.json
- Variables CSS de color
- Escala colors de tailwind.config.ts
- Temas Light y Dark
- Sistema cromático reutilizable para toda la plataforma, utilizando exclusivamente los Color Tokens definidos en este capítulo.

---

#### (8) LAYOUT & GRID SYSTEM (Capítulo 9)

##### 9.1 Reglas Generales

**MUST**
- Toda la plataforma deberá utilizar un único sistema de Grid.

**MUST**
- Todos los layouts deberán construirse utilizando este sistema.

**MUST NOT**
- Crear grids personalizados.

**MUST NOT**
- Modificar el número de columnas según el módulo.

##### 9.2 Grid Oficial
- **12 Columns**: Todas las páginas utilizarán una cuadrícula de doce columnas.

##### 9.3 Gutters
| Breakpoint | Valor |
|---|---|
| Mobile | 16px |
| Tablet | 24px |
| Desktop | 24px |
| Wide | 32px |

##### 9.4 Márgenes Laterales
| Breakpoint | Valor |
|---|---|
| Mobile | 16px |
| Tablet | 24px |
| Laptop | 32px |
| Desktop | 48px |
| Wide | 64px |

##### 9.5 Container
- Max Width: **1440px**
- Width: 100%
- Horizontal: Centered

##### 9.6 Breakpoints
| Nombre | Valor |
|---|---|
| Mobile | 0px |
| SM | 640px |
| MD | 768px |
| LG | 1024px |
| XL | 1280px |
| 2XL | 1536px |

##### 9.7 Responsive Grid
- Mobile: 4 Columns
- Tablet: 8 Columns
- Desktop: 12 Columns

##### 9.8 Sidebar
- Desktop Width: 280px
- Collapsed: 80px
- Mobile: Drawer

##### 9.9 Navbar
- Height: **72px** (siempre fija)

##### 9.10 Dashboard
- Sidebar: 280px
- Navbar: 72px
- Content: Remaining Width
- Padding: 32px

##### 9.11 Cards
- Minimum Width: 320px
- Maximum Width: 100%
- Internal Padding: 24px

##### 9.12 Formularios
- Campos: 100% Width
- Separación: 24px
- Botones: Alineados a la derecha

##### 9.13 Modales
| Tamaño | Valor |
|---|---|
| Small | 480px |
| Medium | 640px |
| Large | 800px |
| Extra Large | 1024px |

Máximo: 90vw / 90vh

##### 9.14 Panel IA
- Desktop Width: 420px
- Tablet: 360px
- Mobile: Full Width

##### 9.15 Editor de Producción Escrita
- Área de escritura: 70%
- Panel IA: 30%
- En pantallas pequeñas: 100% → Panel IA colapsable

##### 9.16 Tablas
- Responsive: Horizontal Scroll
- Columnas: Auto Layout

##### 9.17 Grid de Tarjetas
| Breakpoint | Cards |
|---|---|
| Desktop | 4 Cards |
| Laptop | 3 Cards |
| Tablet | 2 Cards |
| Mobile | 1 Card |

##### 9.18 Zonas Principales

Toda pantalla deberá organizarse en: Navbar → Sidebar → Main Content → Optional Right Panel → Footer

##### 9.19 Alineación

Utilizar únicamente: Left, Center, Right.
Alineación vertical: Top, Center, Bottom.

##### 9.20 Responsive

Nunca modificar: tipografía; iconografía; radios; sombras.
Únicamente adaptar: columnas; ancho; disposición; visibilidad; orden.

##### 9.21 Restricciones

**MUST**
- Utilizar exclusivamente el Grid oficial.

**MUST**
- Mantener consistencia entre todos los módulos.

**MUST**
- Todos los componentes deberán alinearse con la cuadrícula.

**MUST**
- Respetar los breakpoints oficiales.

**MUST NOT**
- Utilizar posiciones absolutas para construir layouts.

**MUST NOT**
- Crear grids diferentes para módulos específicos.

**MUST NOT**
- Utilizar anchos fijos cuando pueda utilizarse diseño fluido.

##### 9.22 Resultado Esperado

Claude deberá generar automáticamente:
- Sistema de Grid de 12 columnas.
- Layout responsive para Mobile, Tablet y Desktop.
- Configuración de container y screens en tailwind.config.ts.
- Layouts reutilizables para Dashboard, Editor, Formularios, Panel IA, Modales y Tarjetas.
- Componentes de layout consistentes en toda la plataforma.

Utilizando exclusivamente las reglas definidas en este capítulo.

---

#### (9) MOTION SYSTEM (Capítulo 10)

##### 10.1 Reglas Generales

**MUST**
- Toda animación deberá utilizar exclusivamente los Motion Tokens definidos en este capítulo.

**MUST**
- Las animaciones deberán mejorar la comprensión de la interfaz.

**MUST NOT**
- Utilizar animaciones decorativas.

**MUST NOT**
- Crear nuevas duraciones o curvas fuera del sistema.

##### 10.2 Principios

Toda animación deberá cumplir al menos uno de los siguientes objetivos:
- indicar interacción;
- comunicar cambio de estado;
- dirigir la atención;
- reforzar jerarquía visual;
- proporcionar retroalimentación;
- facilitar la continuidad visual.

##### 10.3 Duración
| Token | Valor |
|---|---|
| Instant | 100ms |
| Fast | 150ms |
| Normal | 200ms |
| Medium | 250ms |
| Slow | 300ms |

No utilizar animaciones superiores a **300ms**. Excepto celebraciones.

##### 10.4 Easing

Curvas: Linear, Ease, Ease-In, Ease-Out, Ease-In-Out, Spring.

Utilización:
- Hover: Ease-Out
- Opening: Ease-Out
- Closing: Ease-In
- Dragging: Linear
- Microinteractions: Spring

##### 10.5 Hover
Aplicar únicamente: cambio de color; elevación; ligera escala; sombra.
Escala máxima: **1.02**
Duración: **150ms**

##### 10.6 Active
Aplicar: Scale **0.98**
Duración: **100ms**

##### 10.7 Focus
Animar únicamente: Focus Ring; Border Color.
Duración: **150ms**

##### 10.8 Botones
Estados animados: Hover, Active, Loading, Success, Disabled.
Animaciones permitidas: Fade, Scale, Elevation.

##### 10.9 Inputs
Animar únicamente: borde; focus; helper text; mensaje de error.
No mover el layout.

##### 10.10 Modales
- Entrada: Fade + Scale 0.95 → 1
- Salida: Fade + Scale 1 → 0.95
- Duración: **200ms**

##### 10.11 Drawers
- Entrada: Slide
- Salida: Slide
- Duración: **250ms**

##### 10.12 Dropdowns
- Entrada: Fade + Scale
- Duración: **150ms**

##### 10.13 Tooltips
- Entrada: Fade + TranslateY 4px
- Duración: **100ms**

##### 10.14 Cards
- Hover: Elevation +1, Scale 1.01
- Duración: **150ms**

##### 10.15 IA (Coach IA)
Permitir: Fade, Typing Indicator, Streaming Response, Pulse, Smooth Scroll.
No utilizar animaciones agresivas.

##### 10.16 Loading
Animaciones permitidas: Skeleton, Spinner, Progress Bar, Pulse, Dots.
No utilizar loaders bloqueantes cuando sea posible utilizar Skeleton.

##### 10.17 Notificaciones
- Entrada: Slide Up + Fade
- Salida: Fade
- Duración: **200ms**

##### 10.18 Páginas
Transición entre páginas: Fade
Duración: **200ms**
No utilizar transiciones complejas.

##### 10.19 Scroll
Permitir: Smooth Scroll
Mantener: **60 FPS**
No modificar manualmente la velocidad del navegador.

##### 10.20 Microinteracciones
Permitir únicamente: Hover, Focus, Active, Ripple ligero, Elevación, Cambio de color, Fade, Scale, Pulse.

##### 10.21 Animaciones de Éxito
Duración máxima: **600ms**
Permitir: Check Animation, Progress Complete, Badge Unlock, Achievement Reveal.
No repetir automáticamente.

##### 10.22 Animaciones de Error
Permitir únicamente: Horizontal Shake
Desplazamiento máximo: **8px**
Duración: **300ms**

##### 10.23 Reduced Motion
Detectar automáticamente: `prefers-reduced-motion`

Cuando esté activo:
- eliminar escalados;
- eliminar desplazamientos;
- eliminar rebotes;
- reducir transiciones a Fade o Instant.

##### 10.24 Performance

**MUST**
- Animar únicamente: opacity; transform.

**MUST NOT**
- Animar: width; height; margin; padding; top; left; right; bottom.

Utilizar aceleración por GPU siempre que sea posible.

##### 10.25 Restricciones

**MUST**
- Mantener consistencia en todas las animaciones.

**MUST**
- Utilizar exclusivamente las duraciones oficiales.

**MUST**
- Utilizar exclusivamente las curvas oficiales.

**MUST NOT**
- Crear animaciones personalizadas fuera del sistema.

**MUST NOT**
- Utilizar animaciones superiores a 300ms, excepto celebraciones.

**MUST NOT**
- Utilizar animaciones que reduzcan la productividad del usuario.

##### 10.26 Resultado Esperado

Claude deberá generar automáticamente:
- motion.ts
- animation-tokens.json
- Variables CSS para animaciones
- Configuración de transition, animation y keyframes en tailwind.config.ts
- Biblioteca de animaciones reutilizable para todos los componentes
- Compatibilidad con prefers-reduced-motion

utilizando exclusivamente los Motion Tokens definidos en este capítulo.

---

#### (10) TAILWIND THEME (Capítulo 11)

##### 11.1 Reglas Generales

**MUST**
- Toda la interfaz deberá construirse utilizando exclusivamente el tema oficial de Tailwind CSS.

**MUST**
- Todos los valores visuales deberán derivarse de los Design Tokens.

**MUST NOT**
- Utilizar clases arbitrarias (`[]`).

**MUST NOT**
- Utilizar valores hardcoded.

**MUST NOT**
- Modificar el tema fuera del archivo oficial.

##### 11.2 Framework
- **Tailwind CSS v4** (última versión estable)

##### 11.3 Tema Global

El tema deberá contener únicamente los siguientes grupos: Colors, Typography, Spacing, Border Radius, Shadows, Breakpoints, Containers, Animations, Keyframes, Z-Index, Opacity, Blur, Transitions.

##### 11.4 Colors

Generar automáticamente: Primary, Secondary, Neutral, Success, Warning, Danger, Info, Background, Surface, Border, Text, AI, DELF, Gamification.
Todos los colores deberán provenir del Capítulo 1 y Capítulo 8.

##### 11.5 Typography

Registrar automáticamente: Display, Heading, Title, Body, Label, Caption, Button, Tooltip.
Utilizar exclusivamente los tamaños definidos en el Capítulo 2.

##### 11.6 Spacing

Registrar automáticamente: Spacing, Gap, Padding, Margin, Container, Section.
Utilizar únicamente la escala definida en el Capítulo 3.

##### 11.7 Border Radius

Registrar automáticamente: None, XS, SM, MD, LG, XL, 2XL, 3XL, Pill, Full.
Utilizar exclusivamente el Capítulo 4.

##### 11.8 Shadows

Registrar automáticamente: None, XS, SM, MD, LG, XL, 2XL, Inner.
Utilizar exclusivamente el Capítulo 5.

##### 11.9 Breakpoints

Registrar:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

No crear breakpoints adicionales.

##### 11.10 Container

Registrar: Centered, Max Width **1440px**, Responsive Horizontal Padding.

##### 11.11 Z-Index

Registrar: Base, Dropdown, Sticky, Overlay, Drawer, Modal, Popover, Tooltip, Toast, CoachAI, System.
Utilizar exclusivamente los valores definidos en el Capítulo 1.

##### 11.12 Opacity

Registrar: 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.

##### 11.13 Blur

Registrar: None, XS, SM, MD, LG, XL.

##### 11.14 Transitions

Registrar únicamente: 100ms, 150ms, 200ms, 250ms, 300ms.
Curvas: Linear, Ease, Ease-In, Ease-Out, Ease-In-Out, Spring.

##### 11.15 Keyframes

Registrar únicamente: Fade In, Fade Out, Scale In, Scale Out, Slide Up, Slide Down, Slide Left, Slide Right, Pulse, Spin, Bounce, Skeleton, Shake, Typing, Gradient, Progress.
No crear keyframes adicionales.

##### 11.16 Animations

Registrar únicamente: fade, slide, scale, pulse, spin, bounce, typing, skeleton, loading, success, error, toast.

##### 11.17 Dark Mode

Configurar: `class`
El tema deberá soportar: Light Theme, Dark Theme, utilizando los mismos Design Tokens.

##### 11.18 Plugins

Permitir únicamente plugins oficialmente aprobados para el proyecto.
No instalar plugins que dupliquen funcionalidades del núcleo de Tailwind.

##### 11.19 Utilidades Personalizadas

Permitir únicamente utilidades derivadas de: Colors, Typography, Radius, Shadows, Motion, Grid, Spacing.
No crear utilidades arbitrarias.

##### 11.20 Prohibiciones

**MUST NOT**
- Utilizar: `bg-[#...]`, `text-[#...]`, `border-[#...]`, `w-[...]`, `h-[...]`, `p-[...]`, `m-[...]`, `rounded-[...]`, `shadow-[...]`, `text-[...]`, `leading-[...]`, `tracking-[...]`

**MUST NOT**
- Utilizar clases arbitrarias (`[...]`).

**MUST NOT**
- Utilizar estilos inline.

**MUST NOT**
- Duplicar valores existentes.

##### 11.21 Validación

Claude deberá verificar automáticamente que:
- ✓ Todos los colores provienen del Color System.
- ✓ Toda tipografía proviene del Typography System.
- ✓ Todos los espacios provienen del Spacing System.
- ✓ Todos los radios provienen del Border Radius System.
- ✓ Todas las sombras provienen del Shadow System.
- ✓ Todas las animaciones provienen del Motion System.
- ✓ No existen valores hardcoded.

##### 11.22 Archivos Generados

Claude deberá generar automáticamente: tailwind.config.ts, theme.ts, design-tokens.ts, tokens.json, colors.ts, typography.ts, spacing.ts, radius.ts, shadows.ts, motion.ts.

##### 11.23 Resultado Esperado

Claude deberá generar un tailwind.config.ts completamente funcional, reutilizable y consistente, utilizando exclusivamente los Design Tokens definidos en los capítulos anteriores, sin valores arbitrarios, sin duplicaciones y manteniendo un único sistema visual para toda la plataforma.

---

#### (11) CSS DESIGN TOKENS (Capítulo 12)

##### 12.1 Reglas Generales

**MUST**
- Todos los valores visuales deberán exponerse mediante Custom Properties de CSS.

**MUST**
- Todos los componentes deberán consumir exclusivamente Variables CSS.

**MUST NOT**
- Utilizar valores hardcoded.

**MUST NOT**
- Duplicar variables.

##### 12.2 Estructura

Organizar las variables en `:root { }` con los grupos: Colors, Typography, Spacing, Radius, Shadow, Border, Opacity, Blur, Motion, Z-Index, Breakpoints.

##### 12.3 Color Variables (`:root`)
```
--primary-50; --primary-100; --primary-200; --primary-300; --primary-400; --primary-500; --primary-600; --primary-700; --primary-800; --primary-900; --primary-950;
--secondary-50; --secondary-100; --secondary-200; --secondary-300; --secondary-400; --secondary-500; --secondary-600; --secondary-700; --secondary-800; --secondary-900;
--neutral-0; --neutral-50; --neutral-100; --neutral-200; --neutral-300; --neutral-400; --neutral-500; --neutral-600; --neutral-700; --neutral-800; --neutral-900; --neutral-950;
--success-500; --warning-500; --danger-500; --info-500;
```

##### 12.4 Background Variables (`:root`)
```
--background-primary; --background-secondary; --background-tertiary; --background-inverse;
```

##### 12.5 Surface Variables (`:root`)
```
--surface-primary; --surface-secondary; --surface-elevated; --surface-card; --surface-modal; --surface-overlay; --surface-tooltip;
```

##### 12.6 Text Variables (`:root`)
```
--text-primary; --text-secondary; --text-tertiary; --text-disabled; --text-placeholder; --text-inverse; --text-link;
```

##### 12.7 Border Variables (`:root`)
```
--border-light; --border-default; --border-strong; --border-focus; --border-success; --border-warning; --border-danger;
```

##### 12.8 Typography Variables (`:root`)
```
--font-family;
--display-xl; --display-lg; --display-md;
--heading-1; --heading-2; --heading-3; --heading-4; --heading-5; --heading-6;
--title-lg; --title-md; --title-sm;
--body-xl; --body-lg; --body-md; --body-sm; --body-xs;
--label-lg; --label-md; --label-sm;
--caption-lg; --caption-md; --caption-sm;
```

##### 12.9 Font Weight Variables (`:root`)
```
--font-thin; --font-light; --font-regular; --font-medium; --font-semibold; --font-bold; --font-extrabold;
```

##### 12.10 Line Height Variables (`:root`)
```
--line-height-tight; --line-height-normal; --line-height-relaxed; --line-height-loose;
```

##### 12.11 Spacing Variables (`:root`)
```
--spacing-0; --spacing-1; --spacing-2; --spacing-3; --spacing-4; --spacing-5; --spacing-6; --spacing-8; --spacing-10; --spacing-12; --spacing-16; --spacing-20; --spacing-24; --spacing-32; --spacing-40; --spacing-48; --spacing-56; --spacing-64;
```

##### 12.12 Radius Variables (`:root`)
```
--radius-none; --radius-xs; --radius-sm; --radius-md; --radius-lg; --radius-xl; --radius-2xl; --radius-3xl; --radius-pill; --radius-full;
```

##### 12.13 Shadow Variables (`:root`)
```
--shadow-none; --shadow-xs; --shadow-sm; --shadow-md; --shadow-lg; --shadow-xl; --shadow-2xl; --shadow-inner;
```

##### 12.14 Opacity Variables (`:root`)
```
--opacity-0; --opacity-5; --opacity-10; --opacity-20; --opacity-30; --opacity-40; --opacity-50; --opacity-60; --opacity-70; --opacity-80; --opacity-90; --opacity-100;
```

##### 12.15 Blur Variables (`:root`)
```
--blur-none; --blur-xs; --blur-sm; --blur-md; --blur-lg; --blur-xl;
```

##### 12.16 Motion Variables (`:root`)
```
--duration-instant; --duration-fast; --duration-normal; --duration-medium; --duration-slow;
--ease-linear; --ease; --ease-in; --ease-out; --ease-in-out; --ease-spring;
```

##### 12.17 Z-Index Variables (`:root`)
```
--z-base; --z-dropdown; --z-sticky; --z-overlay; --z-drawer; --z-modal; --z-popover; --z-tooltip; --z-toast; --z-coach-ai; --z-system;
```

##### 12.18 Dark Theme

Crear un tema alternativo utilizando `.dark { }`

Reescribir únicamente: Colors, Background, Surface, Border, Text, Shadow.

No modificar: spacing; typography; radius; motion; grid.

##### 12.19 Nomenclatura

Todas las variables deberán utilizar el siguiente formato:
```
--categoria-propiedad-valor
```

Ejemplos: `--primary-500`, `--spacing-4`, `--radius-md`, `--shadow-lg`, `--text-primary`, `--background-secondary`, `--duration-fast`

##### 12.20 Restricciones

**MUST**
- Todas las variables deberán declararse en un único archivo global.

**MUST**
- Todos los componentes deberán consumir exclusivamente Variables CSS.

**MUST**
- Mantener una nomenclatura consistente.

**MUST NOT**
- Duplicar variables.

**MUST NOT**
- Declarar variables locales para componentes.

**MUST NOT**
- Utilizar valores visuales directamente en el CSS.

**MUST NOT**
- Modificar variables fuera del Design System.

##### 12.21 Validación

Claude deberá verificar automáticamente que:
- ✓ Todas las Variables CSS provienen de los Design Tokens.
- ✓ No existen valores hardcoded.
- ✓ No existen variables duplicadas.
- ✓ Todas las variables siguen la nomenclatura oficial.
- ✓ Todos los componentes consumen Variables CSS.
- ✓ El tema Light y Dark utilizan la misma estructura de variables.

##### 12.22 Archivos Generados

Claude deberá generar automáticamente: globals.css, tokens.css, light-theme.css, dark-theme.css, variables.css, theme.css.

##### 12.23 Resultado Esperado

Claude deberá generar un sistema completo de Variables CSS basado exclusivamente en los Design Tokens definidos en este documento, permitiendo centralizar la configuración visual de la plataforma, soportar temas Light/Dark, garantizar la reutilización de estilos y eliminar completamente los valores visuales hardcoded del código fuente.

---

#### (12) REGLAS Y RESTRICCIONES OBLIGATORIAS — CONSOLIDADO GENERAL

A continuación se listan textualmente todas las frases normativas (MUST / MUST NOT) recogidas de todos los capítulos anteriores, agrupadas por capítulo, para referencia rápida de desarrollo.

##### Design Tokens Generales
- MUST: Utilizar exclusivamente los Design Tokens definidos en este documento.
- MUST: Toda propiedad visual deberá referenciar un token.
- MUST NOT: Utilizar valores HEX, RGB, tamaños, radios, sombras o espaciados directamente dentro de componentes.
- MUST NOT: Crear nuevos tokens sin actualizar el Design System.
- MUST: Todos los componentes deberán consumir exclusivamente estos Design Tokens.
- MUST: Todo nuevo componente deberá reutilizar tokens existentes.
- MUST NOT: Duplicar tokens.
- MUST NOT: Crear variantes visuales fuera del sistema.
- MUST NOT: Utilizar valores hardcoded dentro del código.

##### Typography
- MUST: Utilizar una única familia tipográfica en toda la plataforma.
- MUST: Toda tipografía deberá utilizar exclusivamente los tokens definidos en este capítulo.
- MUST NOT: Utilizar tamaños, pesos o alturas de línea personalizados.
- MUST NOT: Crear variantes tipográficas fuera del Design System.
- MUST: Utilizar únicamente los tamaños definidos en este capítulo.
- MUST: Mantener una jerarquía tipográfica consistente en toda la plataforma.
- MUST: Respetar los pesos y alturas de línea oficiales.
- MUST NOT: Modificar manualmente font-size, font-weight, line-height o letter-spacing fuera de los tokens.
- MUST NOT: Utilizar más de una familia tipográfica.

##### Spacing System
- MUST: Utilizar exclusivamente los valores de espaciado definidos en este capítulo.
- MUST: Todo margen, padding, gap, separación y tamaño espacial deberá utilizar un Spacing Token.
- MUST NOT: Utilizar valores arbitrarios.
- MUST NOT: Utilizar valores hardcoded.
- MUST: Utilizar exclusivamente los Spacing Tokens.
- MUST: Mantener una cuadrícula basada en múltiplos de 4px.
- MUST: Reutilizar siempre los mismos valores.
- MUST NOT: Utilizar valores como: 5px, 7px, 13px, 18px, 21px, 27px, 35px, 43px, 51px.
- MUST NOT: Modificar el espaciado manualmente fuera del sistema.

##### Border Radius
- MUST: Utilizar exclusivamente los Border Radius Tokens definidos en este capítulo.
- MUST: Todos los componentes deberán reutilizar estos tokens.
- MUST NOT: Definir radios personalizados.
- MUST NOT: Utilizar valores hardcoded.
- MUST: Utilizar únicamente los Border Radius Tokens oficiales.
- MUST: Mantener consistencia visual entre componentes equivalentes.
- MUST: Utilizar Radius-Pill únicamente para elementos tipo badge, chip, search o botones circulares.
- MUST: Utilizar Radius-Full únicamente para elementos completamente circulares.
- MUST NOT: Utilizar radios distintos a los definidos en este capítulo.
- MUST NOT: Combinar múltiples radios arbitrarios en un mismo componente.
- MUST NOT: Modificar el radio mediante estilos inline.

##### Elevation & Shadow System
- MUST: Utilizar exclusivamente los Shadow Tokens definidos en este capítulo.
- MUST: Toda elevación visual deberá representarse mediante un Shadow Token.
- MUST NOT: Definir sombras personalizadas.
- MUST NOT: Utilizar valores hardcoded.
- Las sombras nunca deberán utilizarse como elemento decorativo.
- MUST: Utilizar únicamente sombras definidas en este capítulo.
- MUST: Mantener el número mínimo de capas por sombra.
- MUST NOT: Aplicar múltiples sombras acumuladas innecesarias.
- MUST NOT: Utilizar efectos costosos que degraden el rendimiento.
- MUST: Todos los componentes deberán utilizar un único nivel de elevación.
- MUST: Incrementar la elevación únicamente cuando exista interacción o cambio de contexto.
- MUST NOT: Utilizar sombras para compensar problemas de contraste.
- MUST NOT: Aplicar sombras a elementos puramente tipográficos.
- MUST NOT: Crear nuevas variantes de sombras fuera del Design System.

##### Iconography System
- MUST: Utilizar una única biblioteca oficial de iconos.
- MUST: Todos los iconos deberán reutilizar los Design Tokens definidos en este documento.
- MUST NOT: Mezclar múltiples bibliotecas de iconos.
- MUST NOT: Modificar manualmente el estilo de los iconos.
- MUST: Utilizar únicamente Lucide Icons.
- MUST: Mantener el mismo estilo visual en toda la plataforma.
- MUST: Utilizar exclusivamente los tamaños oficiales.
- MUST: Utilizar exclusivamente los colores definidos por los Icon Tokens.
- MUST NOT: Mezclar iconografía Filled, Outline y Duotone.
- MUST NOT: Estirar, comprimir o deformar iconos.
- MUST NOT: Aplicar sombras, gradientes o efectos especiales.
- MUST NOT: Crear iconos personalizados salvo aprobación explícita del Design System.
- No modificar: tamaño, grosor, proporción (de iconos). Únicamente podrá cambiar el color según el estado.

##### Color System
- MUST: Utilizar exclusivamente la paleta oficial definida en este capítulo.
- MUST: Todos los componentes deberán consumir Color Tokens.
- MUST NOT: Utilizar colores HEX directamente en los componentes.
- MUST NOT: Crear nuevas variantes cromáticas fuera del Design System.
- MUST: Cumplir WCAG AA. (Relación mínima 4.5:1; texto grande 3:1)
- MUST: Todos los componentes deberán utilizar únicamente Color Tokens.
- MUST: Mantener consistencia cromática en toda la plataforma.
- MUST NOT: Utilizar colores HEX directamente dentro de componentes.
- MUST NOT: Crear nuevas variantes cromáticas.
- MUST NOT: Modificar manualmente la saturación, brillo o tonalidad de los colores oficiales.

##### Layout & Grid System
- MUST: Toda la plataforma deberá utilizar un único sistema de Grid.
- MUST: Todos los layouts deberán construirse utilizando este sistema.
- MUST NOT: Crear grids personalizados.
- MUST NOT: Modificar el número de columnas según el módulo.
- MUST: Utilizar exclusivamente el Grid oficial.
- MUST: Mantener consistencia entre todos los módulos.
- MUST: Todos los componentes deberán alinearse con la cuadrícula.
- MUST: Respetar los breakpoints oficiales.
- MUST NOT: Utilizar posiciones absolutas para construir layouts.
- MUST NOT: Crear grids diferentes para módulos específicos.
- MUST NOT: Utilizar anchos fijos cuando pueda utilizarse diseño fluido.
- Nunca modificar (en responsive): tipografía; iconografía; radios; sombras.

##### Motion System
- MUST: Toda animación deberá utilizar exclusivamente los Motion Tokens definidos en este capítulo.
- MUST: Las animaciones deberán mejorar la comprensión de la interfaz.
- MUST NOT: Utilizar animaciones decorativas.
- MUST NOT: Crear nuevas duraciones o curvas fuera del sistema.
- MUST: Animar únicamente: opacity; transform.
- MUST NOT: Animar: width; height; margin; padding; top; left; right; bottom.
- MUST: Mantener consistencia en todas las animaciones.
- MUST: Utilizar exclusivamente las duraciones oficiales.
- MUST: Utilizar exclusivamente las curvas oficiales.
- MUST NOT: Crear animaciones personalizadas fuera del sistema.
- MUST NOT: Utilizar animaciones superiores a 300ms, excepto celebraciones.
- MUST NOT: Utilizar animaciones que reduzcan la productividad del usuario.
- No utilizar loaders bloqueantes cuando sea posible utilizar Skeleton.
- No repetir automáticamente (animaciones de éxito).

##### Tailwind Theme
- MUST: Toda la interfaz deberá construirse utilizando exclusivamente el tema oficial de Tailwind CSS.
- MUST: Todos los valores visuales deberán derivarse de los Design Tokens.
- MUST NOT: Utilizar clases arbitrarias (`[]`).
- MUST NOT: Utilizar valores hardcoded.
- MUST NOT: Modificar el tema fuera del archivo oficial.
- No crear breakpoints adicionales.
- No crear keyframes adicionales.
- No instalar plugins que dupliquen funcionalidades del núcleo de Tailwind.
- No crear utilidades arbitrarias.
- MUST NOT: Utilizar `bg-[#...]`, `text-[#...]`, `border-[#...]`, `w-[...]`, `h-[...]`, `p-[...]`, `m-[...]`, `rounded-[...]`, `shadow-[...]`, `text-[...]`, `leading-[...]`, `tracking-[...]`
- MUST NOT: Utilizar clases arbitrarias (`[...]`).
- MUST NOT: Utilizar estilos inline.
- MUST NOT: Duplicar valores existentes.

##### CSS Design Tokens
- MUST: Todos los valores visuales deberán exponerse mediante Custom Properties de CSS.
- MUST: Todos los componentes deberán consumir exclusivamente Variables CSS.
- MUST NOT: Utilizar valores hardcoded.
- MUST NOT: Duplicar variables.
- No modificar (en Dark Theme): spacing; typography; radius; motion; grid.
- MUST: Todas las variables deberán declararse en un único archivo global.
- MUST: Todos los componentes deberán consumir exclusivamente Variables CSS.
- MUST: Mantener una nomenclatura consistente.
- MUST NOT: Duplicar variables.
- MUST NOT: Declarar variables locales para componentes.
- MUST NOT: Utilizar valores visuales directamente en el CSS.
- MUST NOT: Modificar variables fuera del Design System.
## 15. Seguridad, DevOps, Observabilidad e Integraciones Externas

### 15.1 Rendimiento y Escalabilidad de Base de Datos (Domain Modeling, Capítulo 15)

**Principios (MUST):** optimizar todas las consultas frecuentes; minimizar el número de consultas por petición; priorizar lecturas rápidas; mantener consistencia de datos; diseñar para crecimiento horizontal.

**Índices:** en todas las PK/FK, `email`, `status`, `created_at`, `updated_at`, `student_id`, `teacher_id`, `group_id`, `course_id`, `plan_id`, `submission_id`, `conversation_id`, `notification_id`, `level_id`, `competency_id`. Índices compuestos donde haya consultas repetitivas: (student_id, created_at), (student_id, status), (student_id, competency_id), (group_id, student_id), (course_id, group_id), (submission_id, version_number), (conversation_id, created_at), (notification_id, status).

**Índices GIN:** para JSONB, TSVECTOR, Full Text Search, Coach Memory, Metadata, Logs. **Full Text Search** aplicado sobre: `WritingSubmission.content`, `CoachMemory.memory`, `CoachMessage.message`, `WritingFeedback.explanation`, `AuditLog.new_value`.

**Particionamiento (RANGE por fecha)** sobre tablas de gran crecimiento: `AuditLog`, `CoachMessage`, `Notification`, `SystemEvent`, `XPTransaction`.

**Paginación obligatoria** en todas las consultas (limit/offset o cursor; preferir Cursor Pagination para conjuntos grandes).

**Caché con Redis** para: Dashboard, Coach Context, Leaderboards, Competencies, Notification Counters, Feature Flags, Configurations, Session Data.

**Consultas (MUST):** evitar `SELECT *`; seleccionar únicamente columnas necesarias; evitar consultas repetidas o dentro de bucles; usar JOIN únicamente cuando sea necesario.

**Materialized Views** para: Student Dashboard, Learning Analytics, Teacher Dashboard, Leaderboards, Statistics, Reports (actualizadas mediante procesos programados).

**Procesamiento asíncrono (Background Jobs):** corrección IA, generación de feedback, Coach Memory, analíticas, gamificación, notificaciones, generación de reportes, exportaciones.

**Límites:** API 100 elementos/página; Dashboard 50 registros; Historial 100 registros; Logs 500 registros.

**Monitoreo de rendimiento:** tiempo de consulta, tiempo de respuesta, uso de CPU/memoria, consultas lentas, bloqueos, deadlocks. Registrar automáticamente consultas superiores a **200 ms**. Ejecutar `EXPLAIN ANALYZE` automáticamente sobre todas las consultas críticas.

**Pool de conexiones:** configurar Minimum Connections, Maximum Connections, Idle Timeout, Connection Lifetime según el entorno.

**Restricciones (MUST):** no realizar consultas N+1; no duplicar información para mejorar rendimiento; no utilizar consultas sin índices en producción; no cargar relaciones innecesarias; no bloquear transacciones largas.

### 15.2 Seguridad de Datos (Domain Modeling, Capítulo 16)

**Principios (MUST):** principio de mínimo privilegio; proteger toda la información sensible; cifrar los datos críticos; garantizar confidencialidad, integridad y disponibilidad; registrar todos los eventos de seguridad.

**Clasificación de datos:**
- **Públicos**: Cursos, Competencias, Niveles DELF, Configuraciones públicas.
- **Internos**: Grupos, Actividades, Planes de aprendizaje, Notificaciones.
- **Confidenciales**: Usuarios, Profesores, Estudiantes, Evaluaciones, Producciones escritas, Coach Memory, Analíticas.
- **Sensibles**: Contraseñas, Tokens, Refresh Tokens, API Keys, OAuth Tokens, Claves de cifrado.

**Contraseñas (MUST):** nunca en texto plano; utilizar **Argon2id**; salt automático; rehash automático cuando sea necesario. *(Nota: contradice la especificación de bcrypt del PRD Cap. 11 — ver sección 17.1).*

**Tokens:** JWT, Refresh Token, CSRF Token, Password Reset Token, Email Verification Token — todos con fecha de expiración.

**Cifrado AES-256** para: Coach Memory, API Keys, OAuth Tokens, Secrets, configuraciones sensibles.

**Datos personales protegidos:** nombre, apellido, correo electrónico, fotografía, información académica, historial de aprendizaje.

**RBAC:** roles iniciales `SuperAdmin, Administrator, Teacher, Student, AI, System`. "Toda acción deberá validarse mediante permisos." "No utilizar validaciones únicamente en el Frontend."

**Auditoría automática de:** Login, Logout, Intentos fallidos, Cambio de contraseña, Cambio de rol, Cambio de permisos, Acceso administrativo, Exportación de datos, Eliminación de información.

**Protección contra ataques:** Rate Limiting, CSRF Protection, XSS Protection, SQL Injection Protection, CORS, CSP, Input Validation, Output Encoding.

**Validación de entradas:** tamaño, formato, tipo, longitud, rangos, archivos, MIME Type. "Nunca confiar en datos del cliente."

**Archivos permitidos:** PDF, DOCX, PNG, JPG, JPEG — validando tamaño, extensión y MIME Type.

**Gestión de secretos:** nunca almacenar API Keys, Passwords, Secrets, Tokens, Private Keys dentro del código fuente; usar variables de entorno o Secret Manager.

**Retención de datos:** Auditoría 5 años; Coach Memory hasta eliminación del usuario; Producciones escritas permanentes; Logs 180 días.

**Acceso a la base de datos (MUST):** conexiones autenticadas; TLS; restricción de acceso por red; no acceso público.

### 15.3 Estrategia de Backup y Recuperación (Domain Modeling, Capítulo 17)

**Alcance del respaldo:** base de datos PostgreSQL, migraciones, seeds, archivos del usuario, configuraciones, variables de entorno cifradas, logs, auditoría, storage, Redis (cuando aplique).

**Tipos y frecuencia:** Full Backup (semanal); Incremental Backup (cada hora); Differential Backup (diario).

**Retención:** incrementales 30 días; diarios 90 días; semanales 12 meses; mensuales 5 años.

**Regla 3-2-1:** 3 copias, 2 medios diferentes, 1 copia fuera del sitio principal.

**Cifrado:** AES-256, verificados antes de almacenarse, cifrados en tránsito y en reposo.

**Objetivos de recuperación:** **RPO ≤ 1 hora**; **RTO ≤ 2 horas**.

**Restauraciones de prueba:** ejecutadas automáticamente cada mes, verificando consistencia, integridad, tiempos de recuperación y funcionamiento de la aplicación.

**Restricciones (MUST):** nunca eliminar el único respaldo disponible; nunca sobrescribir un respaldo existente; nunca almacenar respaldos sin cifrado; nunca ejecutar restauraciones directamente sobre producción sin validación previa; toda restauración se registra en `AuditLog`.

### 15.4 Integraciones Externas (Domain Modeling, Capítulo 18)

**Principios (MUST):** toda integración desacoplada del dominio; utilizar adaptadores (Ports & Adapters); todas las credenciales en Secret Manager; toda integración reemplazable sin modificar la lógica del negocio.

**Proveedores a integrar:** OpenAI, Anthropic, Google OAuth, GitHub OAuth, Microsoft OAuth, Resend, Stripe, Cloudinary, Supabase Storage, Redis, PostHog, Sentry.

**Categorías:** AI, AUTH, PAYMENT, EMAIL, STORAGE, CACHE, ANALYTICS, MONITORING.

**Tablas del modelo de integraciones:** `ExternalProvider` (id, code, name, category, active); `ExternalCredential` (id, provider_id, key_name, encrypted_value, expires_at, active); `ExternalRequest` (id, provider_id, endpoint, method, request_body JSONB, response_status, response_time_ms); `AIModel` (id, provider_id, model_name, version, context_window, active); `AIUsage` (id, model_id, student_id, prompt_tokens, completion_tokens, total_tokens, estimated_cost); `OAuthAccount` (variante de integraciones: id, user_id, provider, provider_user_id, email, linked_at); `PaymentTransaction` (id, user_id, provider, external_id, amount, currency, status); `EmailDelivery` (id, user_id, provider, template, external_id, status, sent_at); `StorageFile` (id, user_id, provider, bucket, path, mime_type, size_bytes, uploaded_at).

**Estados de pago:** `PENDING, PAID, FAILED, REFUNDED, CANCELLED`.

**Políticas de reintento:** máximo 3 reintentos; backoff exponencial; timeout configurable por proveedor; cancelar tras el tercer fallo consecutivo.

**Restricciones (MUST):** ninguna API Key en texto plano; todas las credenciales cifradas; toda llamada externa registra tiempo de respuesta; todas las respuestas con error se registran para auditoría; reintentos automáticos obligatorios; timeout configurable; soporte de circuit breaker; operaciones externas idempotentes cuando corresponda; rotación periódica de credenciales.

### 15.5 Observabilidad (Domain Modeling, Capítulo 19)

**Principios (MUST):** monitorear todos los servicios; centralizar logs, métricas y trazas; detectar fallos en tiempo real; generar alertas automáticas; mantener trazabilidad completa de cada solicitud.

**Componentes:** Logging, Metrics, Tracing, Monitoring, Alerting, Health Checks.

**Tablas del modelo de observabilidad:**
- `ApplicationLog`: id, level (ENUM), service, module, request_id, user_id (NULL), message, metadata (JSONB), created_at. Niveles: `DEBUG, INFO, WARNING, ERROR, CRITICAL`.
- `Metric`: id, service, metric_name, metric_value (DECIMAL(15,4)), unit, collected_at.
- `Trace`: id, trace_id, parent_trace_id (NULL), request_id, service, operation, duration_ms, status (ENUM: SUCCESS, FAILED, TIMEOUT), created_at.
- `HealthCheck`: id, service, endpoint, status (ENUM: HEALTHY, DEGRADED, UNAVAILABLE), response_time_ms, checked_at.
- `Alert`: id, severity (ENUM: LOW, MEDIUM, HIGH, CRITICAL), service, title, description, triggered_at, resolved_at (NULL), status.
- `Incident`: id, alert_id, title, description, root_cause, opened_at, closed_at (NULL), status (ENUM: OPEN, INVESTIGATING, RESOLVED, CLOSED).

**Métricas registradas automáticamente:** tiempo de respuesta; tiempo de consultas SQL; tiempo de llamadas IA; uso de CPU/memoria/disco; uso de Redis/PostgreSQL; solicitudes por minuto; usuarios activos; errores HTTP/autenticación/autorización/integración; tiempo de Background Jobs; tiempo de generación de IA.

**Health Checks sobre:** API, PostgreSQL, Redis, Storage, OpenAI, Anthropic, Resend, Stripe, OAuth, Background Jobs.

**Umbrales de alerta:** CPU > 80%; Memoria > 80%; Disco > 85%; Tiempo de respuesta > 500 ms; Consultas SQL > 200 ms; Error Rate > 5%; servicio no disponible; Background Job fallido; integración externa caída.

**Logs registrados automáticamente:** inicio/cierre de sesión; errores de autenticación/autorización; llamadas a IA; llamadas externas; cambios de configuración; excepciones; despliegues; migraciones.

**Retención:** Logs 180 días; Métricas 12 meses; Trazas 90 días; Alertas 24 meses. *(Nota: el valor de retención de Incidentes no pudo determinarse — el texto fuente aparece fragmentado/corrupto en ese punto del documento original; ver sección 17.5.)*

**Herramientas a integrar:** Sentry, PostHog, OpenTelemetry, Prometheus, Grafana.

**Restricciones (MUST):** todos los servicios exponen endpoint `/health`; toda solicitud genera un `request_id`; toda excepción se registra; ningún log almacena contraseñas/tokens/información sensible; todas las alertas quedan registradas; todas las incidencias se documentan hasta su cierre.

### 15.6 Despliegue, Optimización y Escalabilidad (PRD, Capítulo 11)

**Objetivo:** infraestructura técnica para producción con alto rendimiento, seguridad, compatibilidad multiplataforma, mantenimiento continuo y capacidad de crecimiento (DELF A1-B2 y DALF C1-C2).

**Arquitectura general:** `Usuario → Frontend → API → Motor IA → Base de Datos → Storage → Analytics → Backups → Administración`.

**Tecnologías (ver también sección 5.3 — Versión B del stack):** Frontend Next.js/React/TypeScript/TailwindCSS/Framer Motion; Backend Node.js/NestJS/REST API/WebSockets/JWT; BD PostgreSQL (tablas normalizadas, índices); Almacenamiento Supabase Storage o AWS S3; IA multi-proveedor (OpenAI, Anthropic, Google Gemini) intercambiable por configuración.

**Variables de entorno (nunca expuestas al cliente):** `DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, SUPABASE_URL, SUPABASE_KEY`.

**Seguridad de aplicación:** JWT + Refresh Tokens + sesiones seguras; **contraseñas con bcrypt** *(ver conflicto en sección 17.1)*; HTTPS, CORS, Rate Limiting, CSRF, XSS, SQL Injection, Helmet, Sanitización; auditoría de inicio de sesión, errores, cambios, evaluaciones, exportaciones, administración.

**Objetivos de rendimiento:** carga inicial **< 2 segundos**; cambio entre páginas **< 300 ms**. Técnicas: Lazy Loading, Dynamic Imports, Image Optimization, compresión GZIP/Brotli, caché Redis (sesiones, progreso, resultados temporales, consultas frecuentes).

**Responsive:** compatibilidad con escritorio (1920px, 1600px, 1366px), tablet (iPad, Android), móvil (Android, iPhone).

**Accesibilidad:** cumplir **WCAG 2.1 AA** — navegación por teclado, contraste adecuado, etiquetas ARIA, lectores de pantalla, tamaños de fuente escalables, indicadores de foco visibles.

**Internacionalización:** inicialmente Français y Español; arquitectura preparada para English, Português, Italiano.

**Panel administrativo:** gestión de usuarios (crear, editar, bloquear, eliminar, restablecer contraseñas); gestión de contenidos (lecciones, actividades, ejemplos, recursos, rúbricas, insignias) sin modificar código; estadísticas (usuarios activos, tiempo promedio, actividades realizadas, errores frecuentes, nivel promedio, progreso, uso de IA).

**Analytics:** tiempo por actividad/unidad, número de intentos, errores comunes, uso de ayudas, abandono de actividades, progreso semanal.

**Backups:** diarios, semanales, mensuales; restauración parcial o completa.

**Monitoreo:** Sentry, Grafana, Prometheus — errores, tiempos de respuesta, consumo de memoria, disponibilidad, uso de CPU.

**Pruebas:** unitarias (cobertura mínima **90%**); integración (autenticación, base de datos, IA, almacenamiento, API); end-to-end (registro, login, actividades, escritura, evaluación, certificados).

**CI/CD:** GitHub, GitHub Actions — pipeline automático de pruebas, compilación, despliegue, validación.

**Despliegue:** compatible con Vercel, Railway, Render, AWS, Azure (selección por variables de configuración).

**Documentación técnica generada automáticamente:** documentación de la API, manual de instalación, guía para desarrolladores, guía de despliegue, arquitectura del sistema, estructura de carpetas, convenciones de código.

**Roadmap técnico (versiones):** ver sección 4.6.

### 15.7 Anexos Técnicos y Especificaciones de Ingeniería (PRD, Capítulo 15)

**Anexo A — Arquitectura del sistema (multicapa):** ver diagrama en sección 5.3.

**Anexo B — Modelo conceptual de datos (versión simplificada, distinta del Domain Modeling detallado):** `Usuario → Curso → Unidad → Actividad → Intento → Retroalimentación → Evaluación → Certificado`.

**Anexo C — Esquema inicial de base de datos (versión simplificada, distinta de las tablas detalladas de la sección 13):**
- `users`: id, nombre, correo, contraseña_hash, rol, idioma, fecha_creación, último_acceso.
- `courses`: id, nombre, descripción, nivel, idioma.
- `units`: id, course_id, título, orden, objetivo.
- `activities`: id, unit_id, tipo, dificultad, instrucciones, criterios.
- `submissions`: id, activity_id, user_id, texto, fecha, tiempo, palabras.
- `feedback`: id, submission_id, puntuación, fortalezas, mejoras, explicación.
- `certificates`: id, user_id, score, nivel, fecha, código_verificación.

**Anexo D — API REST (endpoints exactos):**

| Dominio | Endpoints |
|---|---|
| Autenticación | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` |
| Usuario | `GET /users/me`, `PUT /users/me`, `GET /users/progress` |
| Cursos | `GET /courses`, `GET /courses/:id` |
| Actividades | `GET /activities/:id`, `POST /activities/:id/submit`, `GET /activities/:id/feedback` |
| Evaluación | `POST /assessment/start`, `POST /assessment/finish`, `GET /assessment/result` |
| Certificados | `GET /certificates`, `GET /certificates/:id` |

**Anexo E — Casos de uso principales:**
- **Estudiante**: Registrarse, iniciar sesión, completar diagnóstico, resolver actividades, recibir retroalimentación, presentar simulacro, descargar certificado.
- **Docente**: Crear grupos, asignar actividades, revisar progreso, añadir observaciones, descargar reportes.
- **Administrador**: Gestionar usuarios, configurar contenidos, administrar permisos, consultar analíticas, configurar proveedores de IA.

**Anexo F — Flujo de navegación:** `Inicio → Autenticación → Dashboard → Unidad → Actividad → Retroalimentación → Evaluación → Certificado`.

**Anexo G — Convenciones de desarrollo:** TypeScript estricto; componentes funcionales; principios SOLID; Clean Architecture; DRY; KISS; convención de nombres consistente; linting y formateo automático.

**Anexo H — Estándares de interfaz:** consistencia en tipografía, espaciado, iconografía, colores, botones, formularios, mensajes de error, estados de carga, animaciones.

**Anexo I — Convenciones para la IA:** toda interacción registra solicitud y respuesta; manejo de tiempos de espera y reintentos; validación del formato de respuesta; cambio de proveedor mediante configuración; evitar exponer información sensible en los prompts.

**Anexo J — Matriz de trazabilidad:** cada requisito funcional se vincula con módulo responsable, componente de interfaz, servicio backend, prueba unitaria, prueba de integración, criterio de aceptación.

**Anexo K — Estrategia de pruebas:** definir pruebas para autenticación, navegación, actividades, evaluación, retroalimentación IA, panel docente, panel administrativo, certificados — cada una con objetivo, datos de entrada, resultado esperado, criterio de éxito.

**Anexo L — Estándares de documentación:** todo módulo incluye propósito, dependencias, diagrama simplificado, API pública, ejemplos de uso, limitaciones conocidas, historial de cambios.
## 16. Plan de Implementación, Gobernanza y Convenciones de Desarrollo

### 16.1 Prompt Maestro para Claude — síntesis de rol y principios (PRD, Capítulo 12)

Ver el rol de 12 sombreros que asume Claude durante el desarrollo en la sección 5.8. Principios que debe respetar durante todo el proyecto: **Modularidad** (cada módulo independiente y reutilizable: autenticación, actividades, evaluación, gamificación, analíticas, certificados); **Escalabilidad** (agregar módulos sin modificar los existentes); **Mantenibilidad** (arquitectura limpia, separación de responsabilidades, componentes reutilizables, tipado fuerte, documentación clara); **Rendimiento** (carga inicial < 2s, navegación fluida, consultas optimizadas); **Accesibilidad** (WCAG 2.1 AA en toda la plataforma).

**Flujo general del estudiante (12 pasos, versión síntesis del Prompt Maestro):** 1) Registro e inicio de sesión; 2) Diagnóstico inicial; 3) Dashboard personalizado; 4) Desarrollo de unidades didácticas; 5) Actividades guiadas; 6) Retroalimentación mediante IA; 7) Gamificación; 8) Evaluaciones parciales; 9) Simulacro DELF; 10) Evaluación final; 11) Certificación; 12) Plan personalizado de mejora.

**Integración de la neurociencia (obligatoria):** cada actividad debe favorecer al menos uno de los siguientes procesos: atención sostenida; memoria de trabajo; consolidación de memoria; evocación; transferencia; flexibilidad cognitiva; inhibición cognitiva; motivación intrínseca.

**Entregables progresivos que Claude debe generar (18 puntos):** 1) Arquitectura completa del proyecto; 2) Estructura de carpetas; 3) Esquema de la base de datos; 4) Backend funcional; 5) Frontend funcional; 6) Sistema de autenticación; 7) Módulos pedagógicos; 8) Integración con IA; 9) Dashboard del estudiante; 10) Dashboard del docente; 11) Panel administrativo; 12) Sistema de evaluación; 13) Sistema de certificación; 14) Gamificación; 15) Analíticas; 16) Pruebas automatizadas; 17) Documentación técnica; 18) Proyecto listo para despliegue en producción.

**Definición de éxito del proyecto:** la plataforma es completamente funcional en producción; todos los módulos de los capítulos anteriores están implementados; la experiencia de usuario es fluida y consistente; la IA proporciona retroalimentación útil y contextualizada; el sistema es escalable para nuevos niveles DELF y DALF; la documentación técnica está completa; las pruebas automatizadas alcanzan la cobertura establecida; rendimiento, seguridad y accesibilidad cumplen los objetivos definidos.

**Criterio de aceptación final:** "La plataforma deberá constituir un producto mínimo viable (MVP) de alta calidad, con arquitectura profesional, código mantenible y experiencia de usuario moderna, capaz de evolucionar hacia un ecosistema completo de preparación para los exámenes DELF y DALF."

### 16.2 Plan de Implementación y Desarrollo Iterativo (PRD, Capítulo 13)

**Metodología:** desarrollo incremental; arquitectura modular; integración continua; entrega continua; desarrollo guiado por pruebas (cuando sea aplicable); revisión permanente del código; documentación simultánea al desarrollo. "Cada iteración deberá producir una versión funcional del sistema."

**Cronograma general de fases (orden obligatorio):**

| Fase | Contenido |
|---|---|
| FASE 1 | Arquitectura base — configuración del proyecto, estructura de carpetas, TypeScript, TailwindCSS, base de datos, variables de entorno, sistema de rutas, tema visual, componentes reutilizables |
| FASE 2 | Autenticación — registro, login, recuperación de contraseña, JWT, Refresh Tokens, gestión de sesiones, roles (Administrador, Docente, Estudiante) |
| FASE 3 | Dashboard — progreso, actividades, logros, estadísticas, calendario, objetivos, recomendaciones IA |
| FASE 4 | Módulos pedagógicos / Contenido pedagógico — cada unidad con teoría, ejemplos, actividades, retroalimentación, evaluación, recursos |
| FASE 5 | Integración IA — Diagnóstico (evaluar nivel inicial), Tutor inteligente (responder preguntas), Corrector (analizar producciones), Generador (crear ejercicios personalizados), Mentor (diseñar planes de estudio) |
| FASE 6 | Evaluación — evaluaciones por unidad, simulacro DELF, evaluación final, certificación |
| FASE 7 | Gamificación — XP, niveles, insignias, misiones, recompensas, ranking personal, retos diarios |
| FASE 8 | Panel docente — visualizar grupos/estudiantes/progreso/estadísticas/producciones; crear actividades/anuncios/observaciones |
| FASE 9 | Panel administrador — gestionar usuarios, permisos, contenido, IA, certificados, analíticas, configuración general |
| FASE 10 | Pruebas — unitarias (cobertura mínima 90%), integración (API, IA, autenticación, BD), end-to-end (flujo completo del estudiante) |
| FASE 11 | Optimización — rendimiento, consultas, caché, imágenes, SEO, accesibilidad |
| FASE 12 | Despliegue / Producción — documentación, backups, monitoreo, analíticas, sistema de recuperación |

**Versionado semántico del proyecto (ejemplo):** `v0.1.0 → Arquitectura`, `v0.2.0 → Autenticación`, `v0.3.0 → Dashboard`, `v0.4.0 → Contenido`, `v0.5.0 → IA`, `v1.0.0 → Primera versión estable`.

**Gestión de incidencias:** clasificación Crítica/Alta/Media/Baja; registro de descripción, impacto, prioridad, estado, responsable, fecha, solución aplicada.

**Métricas del proyecto a monitorear:**
- *Rendimiento*: tiempo de carga; consumo de memoria; consultas por segundo; tiempo de respuesta.
- *Calidad*: cobertura de pruebas; deuda técnica; duplicación de código; complejidad ciclomática.
- *Pedagogía*: % de actividades completadas; progreso promedio; tiempo por actividad; tasa de aprobación; errores frecuentes.
- *IA*: solicitudes; tiempo de respuesta; precisión percibida; satisfacción del usuario; costo por interacción.

**Criterios de finalización de cada fase:** todas las funcionalidades previstas implementadas; sin errores críticos; pruebas satisfactorias; documentación actualizada; código conforme a los estándares de calidad.

**Visión a largo plazo:** ver sección 4.6.

### 16.3 Gobernanza y Mantenimiento (contenido tras el Cap. 13, sin encabezado explícito de "Capítulo 14" en el documento fuente)

**Ciclo de vida del producto:** `Planeación → Desarrollo → Pruebas → Producción → Monitoreo → Mejoras → Nueva versión`.

**Modelo de gobernanza (4 niveles de responsabilidad):**
- **Dirección académica**: definir contenidos pedagógicos; validar actividades; actualizar los criterios DELF; aprobar nuevas unidades.
- **Dirección técnica**: arquitectura del software; calidad del código; seguridad; infraestructura; integración de IA.
- **Equipo docente**: crear actividades; revisar producciones; analizar estadísticas; proponer mejoras pedagógicas.
- **Administración del sistema**: gestión de usuarios; configuración; copias de seguridad; soporte técnico; monitoreo.

**Gestión de versiones:** Semantic Versioning (1.0.0 → 1.1.0 → 1.2.0 → 2.0.0). PATCH = corrección de errores; MINOR = nuevas funcionalidades compatibles; MAJOR = cambios que rompen compatibilidad.

**Tipos de mantenimiento:** *Correctivo* (fallos del sistema, errores de interfaz, problemas de autenticación); *Adaptativo* (nuevas versiones del DELF, nuevas API, nuevas tecnologías, cambios legales); *Evolutivo* (nuevos ejercicios, nuevos idiomas, nuevas herramientas IA, nuevos módulos DELF).

**Gestión de incidencias (campos):** ID, Fecha, Usuario, Módulo, Descripción, Prioridad, Estado, Responsable, Fecha de resolución. Estados: Abierta, En análisis, En desarrollo, En pruebas, Resuelta, Cerrada.

**Política de actualizaciones (SLA):** Hotfix — aplicación inmediata, máximo **24 horas**; Actualización menor — máximo **30 días**; Actualización mayor — máximo **6 meses**.

**KPIs técnicos:** disponibilidad del sistema ≥ **99.5%**; tiempo medio de respuesta < **500 ms**; cobertura de pruebas ≥ **90%**; tiempo medio de recuperación (MTTR); frecuencia de despliegues.

**KPIs pedagógicos:** tasa de finalización por unidad; tiempo promedio por actividad; progreso medio por cohorte; reducción de errores recurrentes; incremento del puntaje entre diagnóstico y evaluación final.

**KPIs de experiencia de usuario:** satisfacción del estudiante; frecuencia de uso; retención mensual; uso de funcionalidades de IA; tiempo de permanencia.

**Gestión de contenidos:** los contenidos (textos, ejemplos, rúbricas, actividades, retroalimentaciones, insignias, recursos descargables) deben poder modificarse **sin recompilar la aplicación.**

**Compatibilidad futura:** exámenes DELF A1/A2/B1/B2, DALF C1/C2, TCF, TEF; tecnologías: asistentes de voz, modelos multimodales, realidad virtual, realidad aumentada, apps móviles, aprendizaje adaptativo con IA.

**Plan de continuidad ante fallo crítico:** 1) detectar automáticamente la incidencia; 2) activar alertas al equipo técnico; 3) restaurar la última copia válida; 4) verificar integridad de los datos; 5) restablecer el servicio; 6) elaborar informe postincidente.

**Documentación viva (actualización automática obligatoria):** changelog, manual técnico, manual del docente, manual del estudiante, documentación de API, diagramas de arquitectura, esquema de base de datos, inventario de componentes.

> **Nota editorial conservada del documento fuente:** el propio PRD incluye una recomendación explícita de sus autores tras este capítulo: *"Con este capítulo ya estarías muy cerca de un documento de ingeniería de software completo (aproximadamente un 95-98% de especificación). Aún sería recomendable añadir dos capítulos finales: Capítulo 15. Anexos Técnicos... y Capítulo 16. Prompt Maestro Definitivo, que condensaría los 15 capítulos anteriores en un único prompt optimizado... Este sería el documento que realmente utilizarías para iniciar el desarrollo completo de la plataforma."* El "Capítulo 16" mencionado en esta nota **no existe** en ninguno de los 11 documentos fuente analizados; el PRD termina en el Capítulo 15 (Anexos Técnicos).

### 16.4 Convenciones de Desarrollo — síntesis consolidada

**Convenciones de código (PRD Cap. 3 y Cap. 15, Anexo G):** TypeScript estricto; componentes funcionales; principios SOLID; Clean Architecture; DRY; KISS; convención de nombres consistente; linting y formateo automático. Componentes en PascalCase; hooks en camelCase con prefijo `use`; servicios en camelCase; tipos en PascalCase; carpetas en kebab-case; variables en camelCase; constantes en UPPER_SNAKE_CASE.

**Convenciones de base de datos:** ver catálogo completo en la sección 13.13 (Capítulo 13 del Domain Modeling).

**Convenciones de API:** endpoints REST en kebab-case (`/api/learning-plans`, `/api/writing-submissions`, `/api/coach-memory`).

**Convenciones de prompts de IA:** repositorio versionado, nunca incrustados en el código, estructura estándar de 8 secciones obligatoria (ver sección 9.6).

### 16.5 Testing — síntesis consolidada de todas las menciones

- Cobertura mínima de pruebas unitarias: **90%** (PRD Cap. 11, Cap. 12, Cap. 13).
- Pruebas de integración: autenticación, base de datos, IA, almacenamiento, API.
- Pruebas end-to-end: registro, inicio de sesión, realización de actividades, escritura, evaluación, generación de certificados.
- Matriz de trazabilidad obligatoria: cada requisito funcional vinculado a módulo, componente, servicio, prueba unitaria, prueba de integración y criterio de aceptación (PRD Cap. 15, Anexo J).
- Cada prueba definida debe indicar: objetivo, datos de entrada, resultado esperado, criterio de éxito (Anexo K).
- "Cada módulo importante deberá disponer de pruebas automatizadas" (PRD Cap. 3).
## 17. Conflictos Detectados

> Esta sección documenta, sin resolverlas, todas las contradicciones e inconsistencias identificadas entre los 11 documentos fuente (y, en algunos casos, dentro de un mismo documento). Para cada conflicto se indica el origen exacto (documento y capítulo/sección) de cada versión contradictoria. La decisión sobre cuál versión debe prevalecer corresponde al equipo de producto/ingeniería, no a este documento de consolidación.
>
> **Actualización posterior:** cada uno de los conflictos aquí listados fue resuelto de forma vinculante en la **sección 18. Decisiones de Resolución de Conflictos**, a solicitud explícita del equipo de producto. Esta sección 17 se conserva íntegra como registro histórico de las versiones originales en conflicto; no se ha eliminado ni reinterpretado ningún requisito original.

### 17.1 Arquitectura tecnológica y stack — conflicto mayor (tres versiones incompatibles)

**Conflicto A — Framework backend y ORM:**
- **Versión 1** (PRD, Capítulo 2 "Arquitectura Tecnológica"): backend mediante **capacidades backend de Next.js** (Route Handlers, Server Actions); base de datos **PostgreSQL vía Supabase**; ORM **Drizzle ORM**; autenticación **Clerk**; despliegue **Vercel**.
- **Versión 2** (PRD, Capítulos 10-13 "Despliegue, Optimización y Escalabilidad", "Prompt Maestro", "Plan de Implementación"): backend **Node.js + NestJS** con **REST API + WebSockets**; base de datos **PostgreSQL directamente** (sin mención de Supabase); autenticación **JWT + Refresh Tokens**, contraseñas con **bcrypt**; despliegue compatible con Vercel, Railway, Render, AWS o Azure.
- **Versión 3** (Domain Modeling, Capítulo 12 "Modelo Físico"): motor **PostgreSQL 17**, ORM **Prisma ORM** (no coincide ni con Drizzle de la Versión 1 ni con la ausencia de mención de ORM de la Versión 2).

Estas tres versiones aparecen en el mismo PRD (Versión 1 vs. 2) y en un documento complementario (Domain Modeling, Versión 3), sin que ninguno de los documentos reconozca explícitamente la existencia de las otras dos.

**Conflicto B — Proveedor de autenticación:**
- PRD Cap. 2 y Cap. 5: **Clerk** como proveedor oficial ("Toda la lógica de autenticación deberá delegarse en Clerk").
- PRD Cap. 11 y Cap. 12: **JWT + Refresh Tokens** implementados directamente (NestJS), sin mención de Clerk.

**Conflicto C — Algoritmo de hash de contraseñas:**
- PRD Cap. 11 ("Despliegue"): **Encriptación bcrypt**.
- Domain Modeling Cap. 16 ("Seguridad de Datos"): **Argon2id** con salt automático y rehash automático.

**Conflicto D — Proveedores de IA:**
- PRD Cap. 2 y Cap. 6: OpenAI, Anthropic Claude, "futuros compatibles" (sin nombrar un tercero específico).
- PRD Cap. 11 y Cap. 12: OpenAI, Anthropic Claude, **Google Gemini** (tercer proveedor explícito no mencionado en los capítulos anteriores).

**Conflicto E — Estructura de carpetas del proyecto:**
- PRD Cap. 3 ("Arquitectura del Proyecto"): estructura **Feature-Driven Architecture** detallada: `app/, features/, components/, services/, lib/, hooks/, providers/, stores/, types/, utils/, config/, styles/, assets/, prompts/, database/, middleware/, public/, tests/`.
- PRD Cap. 12 ("Prompt Maestro"): estructura alternativa, más simple: `/app, /components, /modules, /services, /hooks, /lib, /styles, /types, /api, /database, /public` — no incluye `/features` ni `/prompts` como carpetas de primer nivel, e introduce `/modules` y `/api`, no mencionadas en el Cap. 3.

**Conflicto F — Modelo conceptual de datos:**
- PRD Cap. 4: modelo centrado en `Usuario, Perfil, Configuración, Mi Plan, Progreso, Memoria del Coach, Unidades, Actividades, Producciones (Versiones, Retroalimentaciones, Reescrituras), Centro de Entrenamiento, Centro de Simulación, Logros, Analíticas, Dashboard`.
- PRD Cap. 15, Anexo B: modelo conceptual simplificado con entidades **`Curso`** e **`Intento`**, no presentes en el Cap. 4 ni en el Domain Modeling detallado: `Usuario → Curso → Unidad → Actividad → Intento → Retroalimentación → Evaluación → Certificado`.
- PRD Cap. 15, Anexo C: esquema de tablas simplificado (`users, courses, units, activities, submissions, feedback, certificates`) con nombres de columna en español (`nombre`, `correo`, `contraseña_hash`) que no coincide con las convenciones de nomenclatura en inglés obligatorias del Domain Modeling Cap. 13 (`Utilizar inglés en toda la base de datos`), ni con el esquema detallado de 60+ tablas en inglés del propio Domain Modeling (sección 13 de este documento).

**Conflicto G — Roles/enum del sistema:**
- Domain Modeling Cap. 1 (tabla `Role`): `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE`.
- Domain Modeling Cap. 16 (Seguridad de Datos, mismo documento): `SuperAdmin, Administrator, Teacher, Student, AI, System` — nomenclatura y capitalización distintas (`ADMIN` vs. `Administrator`; `AI_SERVICE` vs. `AI`; aparece `System`, no presente en el Cap. 1; no aparece `REVIEWER`).
- PRD Cap. 5: solo 3-4 roles (Estudiante, Profesor, Administrador, y el Coach IA descrito como "no es un usuario humano", sin ser necesariamente un valor de enum `Role`).
- PRD Cap. 13, Fase 2: "Roles mínimos: Administrador, Docente, Estudiante" (nomenclatura en español, sin `Reviewer` ni `AI_SERVICE`/`System`).

**Conflicto H — Proveedores OAuth soportados:**
- PRD Cap. 5: Google y Apple ("preparada para futuras versiones").
- Domain Modeling Cap. 1 (tabla `OAuthAccount.provider`): Google, **Microsoft**, Apple.
- Domain Modeling Cap. 18 (Integraciones Externas): Google OAuth, **GitHub OAuth**, Microsoft OAuth (añade GitHub, no mencionado en ningún otro documento).

### 17.2 Nomenclatura de ecosistemas/módulos — inconsistente entre los seis documentos que la mencionan

Ningún par de documentos usa exactamente los mismos nombres para los mismos ecosistemas. Ver la tabla de mapeo completa en la sección 6.16. Casos destacados:

- El módulo central de escritura se llama **"Laboratorio de Escritura"** en el Libro Maestro (Doc 1, marcado ⭐ como "el corazón del proyecto"), **"Laboratorio de Lectura y Escritura"** en Product Architecture (Doc 3) y UX Experience (Doc 8), y solo **"Laboratorio"** en Wireframe/Experience Blueprint (Doc 6).
- El ecosistema de hábito diario se llama **"Entrenamiento Personalizado"** y **"Gamificación y Desafíos"** (dos módulos separados) en el Libro Maestro (Doc 1); **"Centro de Entrenamiento"** en Product Architecture (Doc 3); **"Entrenamiento"** en Wireframe (Doc 6); y **"Desafíos"** de forma consistente en UX Experience (Doc 8) y en el UI Design System (Doc 7).
- El Libro Maestro (Doc 1) incluye módulos explícitos llamados **"Corrector Inteligente"** y **"Perfil y Analíticas"** que no existen como ecosistemas independientes en Product Architecture (Doc 3) ni en UX Experience (Doc 8) — sus funciones se redistribuyen como capacidades transversales del Coach IA/Simulador (corrección) y como el ecosistema "Mi Evolución"/"Evolución" (analíticas).
- Doc 6 (Cap. 2) enumera **6 ecosistemas** accesibles desde el Dashboard ("Academia, Laboratorio, Entrenamiento, Simulador, Evolución y Mi Plan"), mientras que Doc 8 (Cap. 3) enumera **9 espacios** de navegación ("Dashboard, Mi Plan, Introducción al DELF B2, Academia, Laboratorio de Lectura y Escritura, Desafíos, Simulador DELF B2, Evolución, Perfil"), añadiendo "Introducción al DELF B2" y "Perfil" como espacios de navegación de primer nivel no mencionados en Doc 6.

### 17.3 Gamificación — "¿Habrá recompensas?"

- Libro Maestro (Doc 1, Bloque H, pregunta 53): "¿Habrá recompensas? **No.**"
- Product Architecture (Doc 3, módulo "Centro de Entrenamiento"): lista explícitamente "recompensas" entre el contenido de dicho ecosistema ("misión diaria, reto semanal, práctica personalizada, gamificación, logros, rachas, **recompensas**").
- PRD Cap. 12 ("Prompt Maestro") y Cap. 13: incluyen explícitamente "recompensas" dentro de la gamificación a implementar.
- Domain Modeling Cap. 9: define un modelo de datos completo para recompensas (`Reward`, `RewardClaim`, con tipos `BADGE, AVATAR, THEME, CERTIFICATE, BONUS`).

La mayoría de los documentos posteriores al Libro Maestro contradicen la respuesta "No" inicial del Bloque H.

### 17.4 Duración de transiciones de pantalla en microinteracciones

- UI Design System, Capítulo 8 (versión preliminar): "Las animaciones deberán oscilar entre 150 y 300 milisegundos para interacciones simples y **hasta 500 milisegundos** para transiciones de pantalla o actualizaciones importantes."
- UI Design System, Capítulo 8 (versión final/revisada, mismo documento): "Las transiciones entre pantallas podrán extenderse **hasta 400 milisegundos** cuando resulte necesario mantener la continuidad visual."

Ambas cifras (400 ms y 500 ms) aparecen textualmente en el mismo documento fuente, en dos redacciones consecutivas del mismo capítulo.

### 17.5 Corrupción/fragmentación de texto fuente en Domain Modeling, Capítulo 19 (Observabilidad)

El propio archivo fuente presenta, en la sección 19.16-19.19, un fragmento de texto desordenado: *"...Integración externa ntes / Permanentes / 19.19 Herra caída / 19.17 Logs..."*. No fue posible determinar con certeza, a partir del texto disponible, el valor exacto del período de retención de la entidad `Incident` (aparecen fragmentos sueltos "Incide", "mientas", "Permanentes" sin poder reconstruirse la frase completa). Esto no es una contradicción entre documentos sino un defecto de integridad del propio documento fuente que debe señalarse antes de asumir cualquier valor.

### 17.6 Nombre del proyecto/producto

- Libro Maestro (Doc 1, Bloque A): nombre provisional del **proyecto** — "Project DELF Coach".
- Product Blueprint (Doc 2, Sección 1): tres nombres provisionales de **producto** — "Redaction Lab", "Atélier de rédaction", "Evolutif". Ninguno coincide con "Project DELF Coach".
- Todos los documentos posteriores (Product Architecture, Learning Blueprint, AI Blueprint, UI Design System, UX Experience, PRD, Domain Modeling) usan consistentemente **"Redaction Lab"**, lo que sugiere que esta fue la decisión final de naming, aunque ningún documento lo declara explícitamente como una resolución del conflicto entre Doc 1 y Doc 2.

### 17.7 Modelo de negocio — suscripción mensual

Dentro del propio Libro Maestro (Doc 1, Bloque K): la lista general del "Modelo B2C" incluye "Suscripción individual" como forma de generar ingresos, pero la pregunta puntual 69 responde "¿Suscripción mensual? No". No se aclara si "suscripción individual" se refiere a una modalidad no mensual (anual, por acceso a curso) o si existe una inconsistencia interna en el propio documento.

### 17.8 Criterios de evaluación DELF — dos marcos no unificados explícitamente

- AI Blueprint (Doc 5) y PRD Cap. 6: orden jerárquico de corrección de **10 categorías** propias: Comprensión, Intención comunicativa, Estructura, Coherencia, Cohesión, Argumentación, Registro, Vocabulario, Gramática, Ortografía.
- PRD Cap. 10 (Evaluación Final) y Domain Modeling Cap. 6: rúbrica oficial DELF de **5 criterios** (más uno adicional en el modelo de datos): `RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe` (0-5 c/u, total 25) + `RichesseLinguistique` (solo en el modelo de datos, sin rango de puntuación asociado en el PRD Cap. 10).

Ambos marcos son consistentes en el principio general (macrotextual antes que microtextual), pero ningún documento fuente presenta una tabla de equivalencia explícita entre las 10 categorías del Coach IA y los 5-6 criterios oficiales de la rúbrica DELF.

### 17.9 Nivel de detalle desigual entre versiones de un mismo documento (Wireframe vs. UX Experience)

Doc 6 ("Wireframe - Experience Blueprint", 251 líneas) y Doc 8 ("UX Experience" / "NeuroUX Blueprint", 2607 líneas) cubren los mismos conceptos (filosofía UX, viaje del estudiante, navegación, Dashboard, ecosistemas, rol del Coach IA), pero Doc 8 es sustancialmente más extenso y añade apartados sistemáticos de "Fundamentos NeuroUX" y "Directrices para Claude" ausentes en Doc 6. Doc 6 parece ser una versión anterior o un resumen ejecutivo de los mismos contenidos que Doc 8 desarrolla en profundidad. No se declara explícitamente en ninguno de los dos documentos cuál debe prevalecer en caso de discrepancia de detalle.

### 17.10 Redundancia exacta entre Domain Modeling y Modeling Design

El Documento 11 ("Modeling Design") reproduce, en su único capítulo desarrollado (Capítulo 1. Usuarios y Autenticación), un contenido **prácticamente idéntico** al Capítulo 1 del Domain Modeling (Doc 10) — mismas entidades, mismas tablas, mismos campos, mismas reglas de negocio. No se trata de una contradicción sino de una duplicación exacta entre dos documentos distintos; se documenta aquí porque el Doc 11 no aporta información adicional a la ya presente en el Doc 10, pese a presentarse como un documento de alcance diferente ("no explicar, sino especificar").

### 17.11 Duplicación literal del Capítulo 4 del PRD

El Capítulo 4 del PRD ("Arquitectura de Datos") aparece **repetido de forma idéntica dos veces consecutivas** dentro del propio archivo del PRD (líneas 1345-1875 y 1882-2413 aproximadamente), sin que exista una segunda versión con contenido distinto — a diferencia de los otros conflictos de esta sección, este es un caso de duplicación exacta del mismo texto, probablemente un error de composición del documento original, no una discrepancia de contenido.

### 17.12 Numeración de capítulos del PRD

El PRD presenta el Capítulo 14 ("Orquestación Inteligente del Ecosistema") al **inicio** del archivo, antes del Capítulo 2, sin que exista explicación de este orden. Adicionalmente, entre el Capítulo 13 ("Plan de Implementación") y el Capítulo 15 ("Anexos Técnicos") existe un bloque de contenido sustancial sobre gobernanza y mantenimiento **sin encabezado "CAPÍTULO 14" visible en el texto** (ese número ya fue usado por el capítulo de orquestación al inicio del archivo). No es posible determinar, a partir del documento fuente, si este bloque de gobernanza debía numerarse como "Capítulo 14" (con una colisión de numeración respecto al capítulo de orquestación) o si corresponde a un capítulo sin número asignado en el original.

## 18. Decisiones de Resolución de Conflictos (Arquitectura y Producto)

> Esta sección resuelve, con carácter **vinculante** para el desarrollo, los conflictos documentados en la sección 17, a solicitud explícita del equipo de producto/ingeniería. Las versiones descartadas en las fuentes originales **no se eliminan** de este documento (se conservan íntegras en la sección 17 como registro histórico, conforme a la regla de consolidación de no eliminar ni reinterpretar requisitos ya definidos). A partir de esta sección, en caso de conflicto entre una especificación original y una decisión aquí adoptada, **prevalece esta sección 18**.
>
> **Criterio general aplicado en cada decisión:** (a) especificidad y nivel de detalle de la fuente; (b) coherencia con el principio arquitectónico de "simplicidad de mantenimiento" (sección 5.2); (c) alineación con el alcance del MVP (sección 4.1); (d) minimización de la superficie de riesgo de seguridad; (e) cuando las versiones en conflicto son aditivas y no mutuamente excluyentes, se adopta la unión de ambas en lugar de descartar una.

### 18.1 Resolución del Conflicto A/B/C/D — Stack tecnológico (sección 17.1)

**Backend y despliegue:** se adopta **Next.js (App Router) con Route Handlers/Server Actions** como backend (Versión 1, sección 5.2). Se descarta NestJS como servicio HTTP independiente.
*Justificación:* evita mantener dos bases de código (frontend + backend separado) durante el MVP (sección 4.1); reduce la superficie de DevOps; es coherente con el principio de simplicidad de mantenimiento (5.2) y con el despliegue en Vercel.

**Autenticación:** se adopta **Clerk** como proveedor oficial (Versión 1).
*Justificación:* delega en un proveedor certificado la gestión de contraseñas, MFA, OAuth y cumplimiento normativo, reduciendo la superficie de seguridad que debe implementarse manualmente. Esta decisión **resuelve por diseño el Conflicto C** (bcrypt vs. Argon2id): al delegar la autenticación primaria en Clerk, el campo `User.password_hash` (sección 13.1) permanece `NULL` para todos los usuarios autenticados vía Clerk. Argon2id (Domain Modeling Cap. 16) queda reservado exclusivamente para credenciales internas de servicio que la propia plataforma deba hashear directamente, si las hubiera. Bcrypt (PRD Cap. 11) queda descartado.

**Base de datos y ORM:** se adopta **PostgreSQL 17 (vía Supabase) + Prisma ORM** (Versión 3, Domain Modeling Cap. 12).
*Justificación:* el Domain Modeling ya está reconocido como "especificación de base de datos autoritativa" (nota de la sección 12.6) y cuenta con especificación completa de artefactos a generar (`schema.prisma`, migraciones, seeds — sección 13.12). Se descarta Drizzle ORM (mencionado en PRD Cap. 2 sin desarrollo posterior).

**Proveedores de IA:** **OpenAI y Anthropic Claude** como proveedores activos en el MVP. **Google Gemini** se incorpora como proveedor "compatible futuro", ya soportado por la capa de abstracción (AI Orchestrator, sección 9.4), pero no se activa hasta que el negocio lo requiera.
*Justificación:* conserva el principio de independencia de proveedor (5.2) sin ampliar el alcance del MVP con un tercer proveedor no solicitado en los capítulos fundacionales del PRD.

**Despliegue:** **Vercel** como entorno oficial. Railway/Render/AWS/Azure quedan documentados como alternativas compatibles vía variables de configuración, sin ser el objetivo por defecto.

### 18.2 Resolución del Conflicto E — Estructura de carpetas (sección 17.1-E)

**Decisión:** se adopta la **Feature-Driven Architecture** completa del PRD Cap. 3 (sección 5.4) como estructura oficial y única (`app/, features/, components/, services/, lib/, hooks/, providers/, stores/, types/, utils/, config/, styles/, assets/, prompts/, database/, middleware/, public/, tests/`).
*Justificación:* es la versión más detallada, con reglas explícitas de dependencia entre carpetas, y sostiene mejor el principio de modularidad exigido de forma transversal (secciones 5.4, 5.6, 16.1). La estructura simplificada del PRD Cap. 12 (`/modules`, `/api`) queda descartada como especificación de arquitectura; se conserva solo como ejemplo narrativo sin valor normativo.

### 18.3 Resolución del Conflicto F — Modelo conceptual de datos (sección 17.1-F)

**Decisión:** el modelo de datos autoritativo es el esquema físico detallado del Domain Modeling (sección 13, 20 capítulos, 60+ tablas). El modelo conceptual del PRD Cap. 4 (sección 5.5) se conserva como marco explicativo de alto nivel, coherente con el modelo detallado. Los Anexos B y C del PRD Cap. 15 (entidades `Curso`/`Intento`, esquema simplificado con columnas en español) quedan **descartados como especificación técnica**, por contradecir las convenciones de nomenclatura obligatorias del propio proyecto (inglés, snake_case — sección 13.13); se conservan solo como boceto histórico.

### 18.4 Resolución del Conflicto G — Roles del sistema (sección 17.1-G)

**Decisión:** el enum oficial `Role` es el de Domain Modeling Cap. 1 (sección 12.6): `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE`, por corresponder a una tabla real del modelo físico y cumplir la convención de nomenclatura del proyecto (ENUM en UPPER_SNAKE_CASE — sección 13.13). La lista del Cap. 16 (`SuperAdmin, Administrator, Teacher, Student, AI, System`) se corrige y mapea así: `SuperAdmin→SUPER_ADMIN`, `Administrator→ADMIN`, `Teacher→TEACHER`, `Student→STUDENT`, `AI→AI_SERVICE`. El rol `System` (sin equivalente en Cap. 1) se añade formalmente como **séptimo valor** del enum — `SYSTEM` — reservado para procesos automatizados internos (jobs, migraciones, integraciones), distinto del servicio de IA. Las denominaciones en español del PRD (Estudiante, Profesor, Administrador) son etiquetas de interfaz, no valores de enum, y se mapean 1:1 a `STUDENT`, `TEACHER`, `ADMIN`.

### 18.5 Resolución del Conflicto H — Proveedores OAuth (sección 17.1-H)

**Decisión:** se adopta la unión de las fuentes, por no ser mutuamente excluyentes. Prioridad de implementación: **Google y Apple** en el lanzamiento (MVP, según especifica el PRD Cap. 5); **Microsoft** en la primera ampliación post-MVP; **GitHub** queda documentado en el catálogo de integraciones (Domain Modeling Cap. 18), pero no se prioriza para un producto educativo dirigido a estudiantes — se implementa solo si una institución cliente (B2B) lo solicita explícitamente. El enum `OAuthAccount.provider` se define desde el inicio con los cuatro valores, para evitar una migración incompatible futura (sección 13.15: "evolución de ENUM: permitido agregar nuevos valores").

### 18.6 Resolución de la nomenclatura de ecosistemas (sección 17.2)

**Decisión:** se adopta como nomenclatura oficial y única la de **Product Architecture (Doc 3) combinada con UX Experience (Doc 8, Cap. 3)**, por ser las fuentes más detalladas y mutuamente consistentes:

| # | Nombre oficial | Sustituye a (nomenclatura descartada) |
|---|---|---|
| 1 | Dashboard | Inicio (Dashboard) |
| 2 | Mi Plan | (sin equivalente en Doc 1) |
| 3 | Conoce el DELF / Introducción al DELF B2 | Academia DELF B2 (parte teórica) |
| 4 | Academia (de Escritura) | Taller de Escritura |
| 5 | Laboratorio de Lectura y Escritura | Laboratorio de Escritura / "Laboratorio" (Doc 6) |
| 6 | Centro de Entrenamiento / Desafíos | Entrenamiento Personalizado, Gamificación y Desafíos (Doc 1, como módulos separados) |
| 7 | Simulador DELF B2 | Simulador Oficial / Simulador DELF |
| 8 | Evolución (Mi Evolución) | Perfil y Analíticas |
| 9 | Perfil | (espacio propio, no desglosado en Doc 1/Doc 6) |

"Corrector Inteligente" **no** se implementa como ecosistema navegable independiente; su funcionalidad queda integrada como capacidad transversal del Coach IA / Feedback Engine, accesible desde Laboratorio, Simulador y cualquier producción escrita (coherente con la sección 6.7 y con el propio análisis de la sección 17.2). La navegación de referencia es la de **9 espacios** de UX Experience (sección 8.3), por ser la más granular; la de 6 espacios de Wireframe (Doc 6) queda como versión histórica resumida.

### 18.7 Resolución del conflicto de gamificación — recompensas (sección 17.3)

**Decisión:** **sí habrá recompensas** (`Reward`, `RewardClaim`, tipos `BADGE, AVATAR, THEME, CERTIFICATE, BONUS` — sección 11.4). La respuesta "No" del Libro Maestro (Bloque H, pregunta 53) se interpreta como una posición inicial de descubrimiento, superada por el resto de la documentación posterior (Product Architecture, PRD, Domain Modeling), que además ya define el modelo de datos completo. Se mantienen sin excepción las reglas de moderación ya definidas en la sección 8.7: las recompensas nunca deben convertirse en el objetivo principal del aprendizaje.

### 18.8 Resolución de la duración de microinteracciones (sección 17.4)

**Decisión:** **400 ms** como máximo oficial para transiciones de pantalla, por ser la cifra que la propia fuente etiqueta como su "versión final/revisada" del Capítulo 8 del UI Design System. El valor de 500 ms de la versión preliminar queda descartado.

### 18.9 Resolución de la laguna de retención de `Incident` (sección 17.5)

**Decisión:** se fija la retención de `Incident` en **24 meses**, igual que `Alert` (con la que mantiene relación 1:1 en el modelo de observabilidad — sección 15.5), por compartir ambas entidades el mismo ciclo de vida de auditoría/postmortem. Esta decisión no reconstruye el texto original corrupto; es un valor nuevo fijado por consistencia con la entidad relacionada, dado que la fuente no permite recuperar el dato original.

### 18.10 Resolución del nombre de proyecto/producto (sección 17.6)

**Decisión:** el nombre oficial del producto es **"Redaction Lab"**, ya adoptado de facto por 8 de los 11 documentos fuente. "Project DELF Coach" (Doc 1) queda documentado únicamente como nombre de trabajo interno del descubrimiento inicial (Fase 1), sin uso en producto, marca ni código.

### 18.11 Resolución de la ambigüedad de suscripción mensual (sección 17.7)

**Decisión:** se interpreta que **sí existe suscripción individual** dentro del modelo B2C, pero **no en modalidad mensual** — las modalidades válidas son pago único por curso/preparación completa, o suscripción anual/por período de preparación (alineado con el ciclo de preparación al examen, normalmente de semanas a pocos meses). Esta lectura concilia ambas afirmaciones originales sin contradicción, ya que ninguna de las dos las excluye explícitamente.

### 18.12 Resolución del mapeo de criterios de evaluación (sección 17.8)

**Decisión:** se formaliza la relación entre las 10 categorías de corrección del Coach IA (sección 9.5, uso formativo y continuo) y los 5+1 criterios oficiales de la rúbrica DELF (secciones 10.2/10.3, uso sumativo en Evaluación Final y Simulador). Ambos marcos permanecen activos y **no se fusionan** — el Coach IA sigue usando las 10 categorías durante todo el ciclo de aprendizaje (jerarquía macro→micro de la sección 9.5); la rúbrica de 5+1 criterios se usa exclusivamente para la puntuación oficial de simulacros y evaluación final. Esta tabla es la única traducción autorizada entre ambos marcos:

| Categorías del Coach IA (formativas) | Criterio DELF oficial (sumativo) |
|---|---|
| Comprensión, Intención comunicativa, Estructura | Respect de la consigne |
| Coherencia, Cohesión, Argumentación | Cohérence |
| Registro, Vocabulario | Lexique + Richesse linguistique |
| Gramática | Morphosyntaxe |
| Ortografía | Orthographe |

### 18.13 Duplicaciones no contradictorias (secciones 17.9, 17.10, 17.11, 17.12)

No requieren resolución de conflicto (no son contradicciones, sino redundancias o defectos de composición del documento fuente); se cierran aquí a efectos de trazabilidad:
- **17.9** (Wireframe vs. UX Experience): prevalece UX Experience (Doc 8) como versión de referencia por su mayor nivel de detalle; Wireframe (Doc 6) queda como resumen ejecutivo histórico.
- **17.10** (Modeling Design vs. Domain Modeling): Modeling Design (Doc 11) se considera documento redundante, sin valor normativo adicional sobre Domain Modeling.
- **17.11** (duplicación literal del PRD Cap. 4): se trata como una única ocurrencia; no se traducen ambas copias como secciones distintas de este documento.
- **17.12** (numeración de capítulos del PRD): no afecta al desarrollo; se documenta como defecto editorial del PRD original, sin acción requerida.

### 18.14 Resolución de la propagación del rol `SYSTEM` (ambigüedad detectada tras aplicar 18.4)

**Contradicción interna detectada:** la resolución 18.4 añadió `SYSTEM` como séptimo valor del enum `Role`, pero ese cambio no se había propagado al cuerpo de la sección 13.1 (tabla `Role`, que seguía listando 6 roles) ni a la lista de seeds de la sección 13.12.

**Decisión:** se actualiza la sección 13.1 y el seed de Roles (13.12) para reflejar los **7 roles iniciales vigentes**: `SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE, SYSTEM` (ver anotaciones insertadas directamente en 13.1 y 13.12). No se modifica ninguna otra regla de negocio de la sección 13.1 (unicidad de email, hash de contraseñas, RBAC, etc.), que permanecen vigentes sin cambios.
**Justificación:** mantener un único enum de roles consistente en todo el documento evita una migración de esquema incompleta y cumple la regla de la sección 13.15 ("evolución de ENUM: permitido agregar nuevos valores") sin romper compatibilidad con los 6 roles preexistentes.
**Módulos impactados:** Autenticación/RBAC (12), Base de Datos Cap. 1 y seeds (13.1, 13.12). Sin riesgo de romper datos existentes: es una adición pura, no una modificación de valores ya usados.

### 18.15 Resolución del rango de puntuación de `RichesseLinguistique` (ambigüedad detectada tras aplicar 18.12)

**Contradicción interna detectada:** la resolución 18.12 mapeó categóricamente "Registro, Vocabulario" (categorías del Coach IA) a "Lexique + Richesse linguistique" (rúbrica DELF), pero no resolvía si `RichesseLinguistique` sumaba puntos al total oficial de 25 (sección 10.2) o era independiente, dado que el PRD Cap. 10 nunca le asigna un rango de puntuación propio.

**Decisión:** el total oficial de certificación **se mantiene fijo en 25 puntos** (5 criterios × 5, sección 10.2), sin modificación, por ser un requisito explícito e inderogable ("Claude utilizará exactamente la rúbrica oficial DELF"). `RichesseLinguistique` se trata como un **indicador analítico adicional**, puntuado 0-5 en `CriterionScore` (13.6) y visible en el informe de retroalimentación del estudiante (Feedback Engine, sección 9.4), pero **excluido del cálculo de `final_score`** y de la condición de certificado ≥18/25 (sección 10.2).
**Justificación:** preserva la integridad de la rúbrica oficial del examen (requisito MUST explícito) sin descartar el dato de `RichesseLinguistique` ya modelado en Domain Modeling — se reutiliza como señal adicional de diagnóstico y progreso (coherente con Learning Analytics, sección 13.8), en vez de alterar un total de puntuación que el examen oficial define de forma cerrada.
**Módulos impactados:** Evaluation Engine, Feedback Engine (9.4), módulo de Evaluación Final y Certificación (10.2), tabla `CriterionScore` (13.6). Sin riesgo de romper la lógica de certificación existente, ya que el total de 25 puntos no cambia.

### 18.16 Resolución del proveedor de almacenamiento de archivos (ambigüedad detectada durante la auditoría de infraestructura)

**Ambigüedad detectada:** la sección 5.3 ("Versión B" del stack) menciona "Supabase Storage **o** AWS S3 (alternativa explícita)" como opciones equivalentes para el almacenamiento de archivos, y la sección 15.6 repite la misma disyuntiva. A diferencia de los conflictos A-H de la sección 17.1, esta disyuntiva nunca fue incluida formalmente en la lista de conflictos detectados ni resuelta en la resolución 18.1, quedando como una decisión abierta sin resolver.

**Decisión:** el proveedor de almacenamiento de archivos es **Supabase Storage**, no AWS S3.
**Justificación:** la resolución 18.1 ya fijó Supabase como host de PostgreSQL 17; usar también Supabase Storage evita introducir un segundo proveedor de infraestructura (y un segundo conjunto de credenciales, políticas de acceso y SDK) cuando la plataforma ya elegida cubre la necesidad de forma nativa e integrada con Row Level Security (sección 5.5). AWS S3 queda descartado como opción para el MVP; podría reconsiderarse en una fase posterior únicamente si aparece un requisito de escala o costos no cubierto por Supabase Storage — pero eso sería una nueva decisión explícita, no la reactivación de esta alternativa.
**Módulos impactados:** almacenamiento de evidencias de aprendizaje, adjuntos de producción escrita (`WritingAttachment`, sección 13.5), avatares (`Avatar`, sección 13.2), recursos de la Academia y Biblioteca de Modelos.

### 18.17 Resolución de la restricción de nivel en `WritingTask.delf_level` (ambigüedad detectada durante la auditoría de infraestructura)

**Contradicción interna detectada:** la tabla `WritingTask` (sección 13.5) define `delf_level` como `ENUM: B2` — un único valor posible — mientras que `StudentProfile.current_level`/`target_level` (sección 13.2), `CoachContext` (13.7), `StudentCompetency` (13.8) y `Exam.level` (13.6) usan consistentemente `ENUM A1-C2` (rango completo) para el mismo concepto de nivel. Esto contradice el principio explícito de la sección 5.5 ("diseñar esquemas preparados para futuras ampliaciones") y el objetivo del roadmap (sección 4.6: DALF C1, DELF A1/A2/B1 como extensiones futuras "sin modificar la arquitectura existente" — sección 5.6).

**Decisión:** `WritingTask.delf_level` se generaliza a `ENUM A1-C2`, igual que el resto de entidades del documento que representan nivel de lengua, en vez de mantenerse restringido a `B2`. El valor por defecto y único usado operativamente durante el MVP seguirá siendo `B2` (sección 4.1), pero el tipo de dato queda preparado desde el inicio para DELF A1/A2/B1 y DALF C1/C2 sin requerir una migración incompatible de tipo (sección 13.15: "evolución de ENUM: permitido agregar nuevos valores" ya cubriría esta ampliación si el enum se define con el rango completo desde el principio).
**Justificación:** evita repetir, en la implementación real del esquema, la misma inconsistencia ya presente en el documento fuente; el costo de definir el enum completo desde el inicio es nulo (no se usa ningún valor fuera de B2 en el MVP) y elimina una migración de tipo incompatible cuando se aborde el roadmap de la sección 4.6.
**Módulos impactados:** Producción Escrita (13.5, tabla `WritingTask`), Evaluación DELF (13.6) en la medida en que referencia tareas de escritura. No afecta a ningún dato ya existente, dado que el esquema físico aún no ha sido implementado (esta resolución se aplica en el momento de crear la migración `06_writing`, sección 13.14).

### 18.18 Resolución de la regla de idioma de interfaz (regla obligatoria del proyecto, instrucción directa del stakeholder)

**Contradicción detectada:** la instrucción del stakeholder ("toda la interfaz de usuario deberá estar completamente en francés, sin excepción") entra en tensión aparente con la sección 15.6 y la sección 12.2 del documento consolidado, que especifican una interfaz **bilingüe** francés+español con preferencia de idioma configurable por el usuario.

**Decisión:** no se trata de una anulación de 15.6/12.2, sino de una **precisión de arquitectura y de orden de prioridad** que ambas quedan obligadas a cumplir a partir de esta resolución:

1. **Idioma de interfaz:** la aplicación se construye con soporte de internacionalización (i18n) real, no con una interfaz monolingüe. El **francés (`fr`) es el idioma predeterminado y el idioma de diseño primario** — todo texto de UI (botones, menús, títulos, subtítulos, formularios, placeholders, mensajes de error/éxito, notificaciones, Dashboard, Academia, Laboratorio, Simulador, Entrenamiento, Gamificación, Panel del profesor, Panel administrativo orientado a usuario final) se redacta primero en francés estándar, natural y correcto, adecuado para estudiantes que preparan el DELF B2.
2. **Español como traducción disponible, no como diseño paralelo:** la arquitectura debe permitir la traducción completa al español (`es`) mediante un selector de idioma, **sin modificar el código de los componentes** — es decir, mediante un sistema de claves de traducción (i18n) y no mediante lógica condicional ni duplicación de componentes. Esto preserva la intención original de 15.6/12.2 (bilingüismo disponible para el usuario final) sin contradecir la nueva instrucción, que fija cuál de los dos idiomas es el primario/predeterminado.
3. **Coach IA:** se comunica exclusivamente en francés durante la experiencia de aprendizaje (consistente con el objetivo pedagógico del DELF B2), excepto en los puntos donde el diseño pedagógico ya definido en el documento indique explícitamente el uso del español para explicar conceptos complejos o instrucciones específicas (p. ej., onboarding inicial o ayuda contextual — a precisar módulo por módulo cuando se diseñe el Coach IA).
4. **Código fuente:** identificadores de programación (variables, funciones, componentes, clases, archivos, carpetas, servicios, APIs) y documentación técnica permanecen en **inglés**, sin excepción, siguiendo las convenciones ya fijadas en 18.2. Esta regla no era nueva — ya era la práctica seguida en todo el scaffold — pero queda formalizada aquí como regla explícita del proyecto.

**Decisión de arquitectura técnica asociada:** se adopta **`next-intl`** como librería de i18n, por ser nativa de Next.js App Router (soporta Server Components, no requiere reescribir el árbol de componentes para leer traducciones) y por integrarse mediante segmentación de rutas (`app/[locale]/...`) sin necesidad de lógica condicional dentro de cada componente — cumpliendo literalmente el requisito "sin modificar el código de los componentes". Diccionarios de mensajes: `messages/fr.json` (fuente primaria, se completa primero) y `messages/es.json` (traducción derivada). `SUPPORTED_LOCALES = ["fr", "es"]`, `DEFAULT_LOCALE = "fr"`.

**Justificación:** el bilingüismo exigido por 15.6/12.2 se preserva íntegramente como capacidad del sistema (el usuario final puede seguir usando la app en español), pero se resuelve la ambigüedad de "qué se diseña primero y qué es el estado por defecto" a favor del francés, tal como lo exige la nueva instrucción — sin necesidad de eliminar ni reinterpretar el requisito de bilingüismo ya definido (regla obligatoria 2 del protocolo del proyecto).
**Módulos impactados:** todos los módulos con interfaz de usuario (Dashboard, Mi Plan, Academia, Laboratorio, Entrenamiento, Simulador, Evolución, Perfil, Gamificación, Coach IA, Panel del Profesor, Panel Administrativo orientado a usuario final), infraestructura técnica (18.2: se añade segmentación `app/[locale]/`, `i18n/`, `messages/` a la estructura de carpetas; `middleware.ts` compone Clerk + enrutamiento de idioma), `docs/modules/dashboard.md` (se añade criterio de aceptación de idioma). Sin riesgo de romper datos existentes: es una capa de presentación, no afecta al modelo de datos ni a la lógica de negocio ya diseñada.

### 18.19 Refuerzo y cierre de la arquitectura i18n (corrección detectada tras aplicar 18.18, instrucción directa del stakeholder reiterando las reglas obligatorias antes de continuar el desarrollo)

**Contexto:** el stakeholder reitera, de forma explícita y formal, las reglas obligatorias de internacionalización que ya gobiernan el proyecto desde 18.18, pidiendo verificar su cumplimiento antes de seguir desarrollando. Se contrastaron las 7 reglas contra el estado real del scaffold (no solo contra lo que 18.18 declaraba). Resultado: 5 de las 7 reglas ya están satisfechas tal cual (idioma predeterminado `fr`, diseño primario en francés, selector sin modificar componentes vía `next-intl`, calidad del francés orientada a DELF B2, y el propio mecanismo de claves de traducción). Se detectan **dos vacíos reales** que 18.18 no cerraba del todo, resueltos aquí sin reabrir ni contradecir esa resolución.

**Vacío 1 — nombres de ruta que incumplen la convención de código en inglés (18.2), pese a que 18.18 (punto 4) declaraba esa convención como "ya... la práctica seguida en todo el scaffold":** los segmentos de ruta reales bajo `app/[locale]/(app)/` (y sus fuentes de verdad, `NAVIGATION_ITEMS` en `config/navigation.ts` y `PRIVATE_ROUTES` en `config/routes.ts`) están en español/francés (`mi-plan`, `conoce-el-delf`, `academia`, `laboratorio`, `entrenamiento`, `simulador`, `evolucion`, `perfil`, `configuracion`). Esto contradice la regla "el código fuente — variables, funciones, clases, componentes, **archivos, carpetas**, APIs y documentación técnica — permanecerá en inglés" (18.2/18.18.4): en Next.js App Router, el nombre de carpeta bajo `app/` es simultáneamente estructura de código fuente y segmento de URL, por lo que debe seguir la convención de inglés igual que cualquier otro identificador del proyecto.

**Decisión — tabla de mapeo canónico (español/francés actual → inglés, clave única a partir de esta resolución):**

| Clave actual (`NAVIGATION_ITEMS`/`PRIVATE_ROUTES`/carpeta) | Clave corregida (inglés) | Nota |
|---|---|---|
| `dashboard` | `dashboard` | ya en inglés, sin cambio |
| `mi-plan` | `my-plan` | también corrige `FEATURES` en `.eslintrc.cjs`, que tenía el mismo error |
| `conoce-el-delf` | `about-delf` | sin feature propia asignada aún (fuera de alcance de esta resolución) |
| `academia` | `academy` | ya coincide con `FEATURES` (`.eslintrc.cjs`) — solo faltaba alinear la ruta |
| `laboratorio` | `laboratory` | ídem, ya coincide con `FEATURES` |
| `entrenamiento` | `daily-training` | ídem, ya coincide con `FEATURES` |
| `simulador` | `simulator` | ídem, ya coincide con `FEATURES` |
| `evolucion` | `analytics` | ídem, ya coincide con `FEATURES` |
| `perfil` | `profile` | ídem, ya coincide con `FEATURES` |
| `configuracion` | `settings` | ídem, ya coincide con `FEATURES` |

La columna derecha no inventa nombres nuevos: para 6 de las 9 claves ya existía la forma correcta en inglés en `FEATURES` (`.eslintrc.cjs`, sección 5.4), pero la capa de enrutamiento (`config/navigation.ts`, `config/routes.ts`, carpetas de `app/`) nunca se alineó a ella — la inconsistencia era entre dos partes del propio scaffold, no una ambigüedad del documento consolidado. Esta tabla es ahora la única fuente de verdad de la clave en inglés de cada espacio.

**Cierre (refactor arquitectónico de cierre de sprint, instrucción directa del stakeholder):** la aplicación al código descrita en el párrafo anterior como pendiente ya se ejecutó — carpetas de `app/[locale]/(app)/` renombradas, `NAVIGATION_ITEMS`/`PRIVATE_ROUTES`/`FEATURES` actualizados a la tabla anterior, `features/mi-plan` renombrado a `features/my-plan`, y toda referencia de código (hrefs codificados en `PrimaryTrainingCTA`/`useContinueWhereYouLeftOff`, claves del namespace `nav` en `messages/fr.json`/`messages/es.json`, diagramas de `ARCHITECTURE.md`) actualizada en la misma pasada. Sin excepción pendiente: la tabla de mapeo de esta resolución queda íntegramente reflejada en el código.

**Aclaración de alcance:** esta corrección es exclusivamente sobre el **nombre en inglés del identificador de código/carpeta/ruta interna**. No exige traducir el propio segmento de URL por idioma (p. ej. no se requiere que la URL en español muestre `/es/mi-plan` con esa palabra ni ningún otro slug distinto) — la regla de idioma del proyecto (18.18) rige los **textos visibles de la interfaz** (vía `messages/fr.json`/`messages/es.json`), no la URL técnica, que es identificador de sistema y por tanto sigue la convención de inglés de 18.2 igual que cualquier otro nombre de carpeta.

**Vacío 2 — garantía explícita de escalabilidad a nuevos idiomas (regla obligatoria nueva, no cubierta literalmente por 18.18):** se formaliza como regla MUST el mecanismo de extensión, ya posible con la arquitectura `next-intl` adoptada en 18.18 pero nunca declarado como garantía explícita: **agregar un nuevo idioma no debe requerir modificar ningún componente**, y se limita a tres pasos mecánicos: (1) añadir el código de idioma a `routing.locales` (`i18n/routing.ts`); (2) crear el diccionario completo `messages/<locale>.json` (traducción íntegra de `messages/fr.json`, fuente primaria); (3) añadir la etiqueta del idioma al selector de idioma de la interfaz (dato de configuración, no lógica). Ningún componente de `features/` o `components/` referencia un idioma por su código de forma directa (`useTranslations`/`useFormatter` de `next-intl` son agnósticos del locale activo) — la arquitectura ya cumplía esta propiedad de facto; esta resolución solo la eleva a regla explícita y verificable.

**Regla MUST reforzada (formalización del punto 2 de 18.18):** ningún texto visible para el usuario final (incluyendo textos de estado vacío, mensajes de error/éxito, `alt`/`aria-label`, `placeholder`, tooltips y contenido de notificaciones) se escribe de forma literal dentro de un componente, página, Server Action o servicio — todo texto de interfaz vive exclusivamente en `messages/fr.json` (fuente primaria) y su traducción íntegra en `messages/es.json`, accedido mediante `useTranslations`/`getTranslations` de `next-intl`. Único texto exceptuado de esta regla: contenido pedagógico generado dinámicamente por el Coach IA/AI Orchestrator (sección 9.4) o por el motor de evaluación, que por naturaleza no es un literal fijo de interfaz y se rige por las reglas de idioma de esos módulos (18.18, punto 3), no por el sistema de claves de traducción.

**Justificación:** ambos vacíos son correcciones de cierre, no cambios de dirección — 18.18 ya había fijado correctamente la arquitectura (`next-intl`, francés predeterminado, diseño primario en francés, selector sin lógica condicional); esta resolución solo (a) corrige una inconsistencia interna del propio scaffold entre `FEATURES` y las rutas reales, detectada al verificar la regla de código en inglés contra el estado real del proyecto en vez de contra lo que 18.18 declaraba, y (b) formaliza como regla explícita una propiedad de escalabilidad que la arquitectura ya tenía de forma implícita.

**Módulos impactados:** infraestructura de enrutamiento (`config/navigation.ts`, `config/routes.ts`, `.eslintrc.cjs` — clave `FEATURES`, carpetas de `app/[locale]/(app)/`); ningún módulo con lógica de producto ya implementada se ve afectado (el único módulo con código de producto real hasta la fecha, Dashboard, ya usaba la clave `dashboard`, que no cambia). Sin impacto en datos ni en el modelo físico (13). Aplicación en código pendiente, según el alcance explícito de esta resolución (solo documento).

### 18.20 Cierre arquitectónico del módulo Mi Plan (Fase 3.2 — 10 vacíos detectados en la auditoría funcional de la Fase 3.1)

**Contexto:** la auditoría funcional exhaustiva del módulo Mi Plan (Fase 3.1, `docs/audits/mi-plan-functional-audit-2026-07-17.md`) concluyó con veredicto ⚠️ REQUIERE ACLARACIONES, identificando 10 vacíos de documentación concretos que impedían iniciar la implementación sin improvisar decisiones de producto. El rol de Arquitecto Principal (Fase 3.2) resolvió los 10 vacíos mediante decisiones arquitectónicas consistentes con las reglas MUST ya vigentes (13.4, 5.6, 5.7, 8.8, 9.7, 13.15). El razonamiento completo (problema, solución, justificación, ventajas/desventajas, impacto por área, afectación a módulos existentes) está documentado en `docs/modules/mi-plan.md`, Parte 1 — esta resolución registra únicamente las decisiones, para que formen parte oficial del proyecto.

**Decisiones:**

1. **Bloques de información de Mi Plan:** una única ruta (`/my-plan`, sin subrutas nuevas) organizada en 5 bloques — Resumen general, Calendario de entrenamiento, Objetivos y metas, Fases y tareas, Configuración del plan — traducción directa de las 10 entidades de 13.4, sin inferencia. Complementa 6.12, no la contradice.
2. **Reprogramación del plan:** flujo obligatorio de propuesta (Learning Planner) + confirmación explícita del estudiante antes de aplicar cualquier cambio — exigido por 8.8 ("las recomendaciones son sugerencias, no obligaciones") y 9.7 ("la IA... nunca decide").
3. **Umbral de inactividad:** se fija en 3 días consecutivos sin `StudySession` completada, como constante de configuración de negocio (no columna de esquema), deliberadamente distinto del umbral de 1 día de `Streak` (11.4) por tratarse de mecanismos de costo y naturaleza distintos.
4. **Transición de cierre de plan:** el cierre de un `LearningPlan` (`COMPLETED`/`CANCELLED`) y la creación de su plan sucesor son una única operación atómica, reutilizando el servicio de creación automática ya usado en el onboarding (12.4). El estado "sin plan activo" (`plan.noPlan`, ya presente en `messages/fr.json`/`es.json` del Dashboard) queda formalizado como estado defensivo de interfaz, no como flujo de producto — nunca se ofrece al estudiante una acción manual de "crear plan".
5. **Extensión de `LearningTask` (13.4):** se añade el campo `source` (ENUM: `SELF_DIRECTED` por defecto, `ACADEMY`, `LABORATORY`, `DAILY_TRAINING`, `SIMULATOR`). Las tareas `SELF_DIRECTED` se completan manualmente en Mi Plan; cualquier otro valor se completa exclusivamente mediante el evento `EXTERNAL_ACTIVITY_COMPLETED` emitido por el ecosistema de origen — nunca de forma manual. Es una extensión formal de la ficha de `LearningTask` de 13.4, no contemplada literalmente en el capítulo original; se declara explícitamente como tal, sin impacto retroactivo (`LearningTask` no tiene implementación previa).
6. **`LearningPreference` (13.2) vs. `StudySchedule` (13.4):** `StudySchedule` es la única fuente de verdad operativa de disponibilidad mientras el plan está activo. `LearningPreference` se acota a prellenar `StudySchedule` una única vez, al crear un plan nuevo — copia unidireccional, sin sincronización posterior. Aclaración de alcance, no modifica la estructura de ninguna de las dos tablas.
7. **Ciclo de vida de entidades hijas:** `LearningGoal`, `LearningPhase`, `LearningTask`, `StudySchedule` y `StudySession` de un plan cerrado/cancelado nunca se eliminan y no incorporan campo de estado propio — su vigencia se deriva siempre de `LearningPlan.status` del padre (aplicación directa de 13.15 y del patrón ya usado en `CoachMemory`, 13.7).
8. **Contrato del Learning Planner:** se invoca únicamente en tres disparadores cerrados — creación de plan, solicitud explícita de reprogramación, umbral de inactividad/evento externo relevante — nunca en cada visita del estudiante. Siempre entrega una propuesta estructurada que el Motor Pedagógico Adaptativo valida antes de persistir (9.7); nunca escribe directamente en base de datos ni se invoca desde el cliente.
9. **Nomenclatura del rol de IA de planificación:** se adopta **"Learning Planner"** (9.4) como nombre oficial único, por ser la fuente más detallada y arquitectónicamente integrada (mismo criterio que 18.6). "Mentor" (16.2, cronograma de fases) queda documentado como etiqueta de roadmap superada, mapeada 1:1 a Learning Planner.
10. **Comunicación entre Mi Plan y otros ecosistemas:** exclusivamente mediante 5 eventos de dominio — `PLAN_CREATED`, `PLAN_TASK_COMPLETED`, `PLAN_REORGANIZATION_REQUESTED`, `PLAN_INACTIVITY_THRESHOLD_REACHED`, `EXTERNAL_ACTIVITY_COMPLETED` (detalle de emisor/consumidor/payload en `docs/modules/mi-plan.md`, sección 2.9) — nunca mediante llamadas directas entre servicios de ecosistemas distintos (aplicación literal de 5.7). Mi Plan emite `PLAN_TASK_COMPLETED` pero nunca calcula ni escribe XP/rachas — esa lógica pertenece íntegramente al Servicio de Gamificación (5.7).

**Decisiones de infraestructura derivadas (a ejecutar en Fase 3.3, no en esta fase):** las 4 tablas ya existentes (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`), hoy solo-lectura para el Dashboard (RLS `SELECT` únicamente), requerirán una migración de RLS que habilite escritura real del propio estudiante sobre su fila, preservando el aislamiento por estudiante ya validado empíricamente (ver `docs/database/naming-convention-audit-2026-07-17.md` y la migración `202607170900_dashboard_rls_policies`). Las 6 entidades nuevas de 13.4 se crearán siguiendo desde su primera migración la convención de nomenclatura de constraints ya vigente (`pk_`/`fk_`/`uq_`/`idx_`/`ck_`, sección 13.13), sin repetir la deuda técnica ya corregida para el Dashboard.

**Justificación general:** ninguna de las 10 decisiones contradice una regla MUST previamente vigente del documento consolidado; todas son extensiones o precisiones sobre información incompleta o ambigua, siguiendo el mismo criterio de resolución ya aplicado en 18.15-18.19 (ambigüedad detectada durante auditoría → decisión explícita → sin reabrir lo ya resuelto).

**Módulos impactados:** ninguno de los ya implementados sufre cambios de comportamiento — Dashboard conserva su contrato de solo lectura sin modificación; `services/gamification` pasa a ser, en Fase 3.3, el primer consumidor real de un evento externo (`PLAN_TASK_COMPLETED`), a evaluar si su interfaz actual ya lo soporta. Mi Plan (`features/my-plan`) no tiene código de producto aún — esta resolución define su arquitectura antes de la primera línea de implementación. Detalle completo del razonamiento en `docs/modules/mi-plan.md`.

### 18.21 Cierre de omisiones de especificación de Mi Plan detectadas en la auditoría de implementabilidad (previa al Sprint 1)

**Contexto:** la auditoría de implementabilidad (`docs/audits/mi-plan-implementability-audit-2026-07-17.md`) detectó 3 omisiones de especificación —no decisiones arquitectónicas— que impedían iniciar el Sprint 1 sin improvisar: (1) los ENUM de `status` de `LearningGoal`/`LearningObjective`/`LearningPhase`/`LearningTask` sin valores enumerados en 13.4; (2) la relación entre `status` y `completed_at` sin regla formal en esas mismas 4 entidades; (3) `LearningTask.source` (ya decidido en 18.20.5) sin reflejarse en la ficha de 13.4. Esta resolución cierra las tres, sin modificar ninguna decisión funcional o arquitectónica previa (18.1–18.20).

**1. Valores del ENUM `status` (idénticos para las 4 entidades, por coherencia — 13.13: "mantener una única convención en todo el proyecto"):**

`NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED`

Vocabulario reutilizado, no inventado: `NOT_STARTED`/`CANCELLED` provienen literalmente de `ExamAttemptStatus` (13.6) — el enum ya existente estructuralmente más análogo, por representar también "una unidad de trabajo del estudiante aún no realizada"; `COMPLETED`/`CANCELLED` ya son compartidos con `LearningPlanStatus` (13.4). No se reutiliza `ACTIVE`/`PAUSED` (valores de `LearningPlanStatus`) porque pausar es un control exclusivo del plan completo (ver invariante de no-duplicación más abajo) — ninguna de las 4 entidades hijas necesita un estado "pausado" propio.

- **`NOT_STARTED`** — estado inicial de toda meta/objetivo/fase/tarea al crearse; ninguna sesión de estudio ni progreso registrado todavía. Coherente con el ciclo pedagógico: un plan recién creado (12.4, onboarding) tiene todas sus entidades hijas en este estado antes de la primera sesión del estudiante.
- **`IN_PROGRESS`** — al menos una unidad de trabajo por debajo de esta entidad se inició sin completarse (una `StudySession` abierta sobre una `LearningTask`, o al menos una hija en `IN_PROGRESS`/`COMPLETED` sin que todas lo estén, para `LearningPhase`/`LearningGoal`). Necesario para responder la pregunta del Dashboard "¿cómo voy?" (6.3) a nivel granular, no solo agregado.
- **`COMPLETED`** — toda la unidad de trabajo asociada se dio por terminada. Es el estado que dispara `completed_at` (ver punto 2) y, en el caso de `LearningTask`, el evento `PLAN_TASK_COMPLETED` (18.20.10).
- **`CANCELLED`** — la meta/objetivo/fase/tarea deja de ser relevante (p. ej., tras una reprogramación del plan, 18.20.2, que redistribuye prioridades) sin haberse completado. Estado terminal: no cuenta como trabajo pendiente ni como trabajo realizado, y queda excluido tanto del cálculo de `LearningProgress` como de las condiciones de completado automático de sus entidades padre (ver punto 2).

**2. Regla `status` ↔ `completed_at` (invariante de dominio, idéntica para las 4 entidades):**

**Invariante:** `completed_at IS NOT NULL` **si y solo si** `status = COMPLETED`. En cualquier otro estado (`NOT_STARTED`, `IN_PROGRESS`, `CANCELLED`), `completed_at` es obligatoriamente `NULL`. Esta equivalencia se declara como restricción de integridad del dominio (`CHECK`, a implementar en la migración correspondiente de Fase 3.3 — decisión de negocio ya cerrada aquí, ejecución pendiente).

**Cuándo se asigna `completed_at` (siempre automático, nunca elegido por el usuario ni por servicio alguno como valor arbitrario):** en el mismo instante en que `status` transiciona a `COMPLETED`, se asigna la marca de tiempo actual del servidor. Nunca se acepta un `completed_at` proporcionado externamente (ni por el estudiante ni por el evento `EXTERNAL_ACTIVITY_COMPLETED`) — lo calcula siempre el servicio que aplica la transición.

**Qué estados permiten `completed_at` no nulo:** únicamente `COMPLETED`. Ningún otro estado, sin excepción.

**Origen de la transición a `COMPLETED` por entidad (aplica la separación ya establecida en 18.20.5, extendida aquí a las 4 entidades por primera vez):**
- `LearningTask`: manual (por el estudiante) si `source = SELF_DIRECTED`; exclusivamente automática, vía el evento `EXTERNAL_ACTIVITY_COMPLETED`, en cualquier otro valor de `source`.
- `LearningObjective`: siempre manual (por el estudiante) — no existe campo `source` para esta entidad ni ningún evento documentado que la complete automáticamente; es, por eliminación, la única de las 4 entidades sin vía automática.
- `LearningPhase`: siempre automática — se calcula (nunca se edita manualmente) a partir de sus `LearningTask`: `COMPLETED` cuando el 100% de sus tareas no `CANCELLED` están en `COMPLETED`.
- `LearningGoal`: siempre automática — se calcula a partir de sus `LearningObjective`, con la misma regla: `COMPLETED` cuando el 100% de sus objetivos no `CANCELLED` están en `COMPLETED`.

Esta distinción (dos entidades con transición manual posible — `LearningTask`/`LearningObjective` — y dos calculadas — `LearningPhase`/`LearningGoal`) es la aplicación directa, sin excepción, de la regla MUST ya vigente desde 13.4: *"el progreso se calcula automáticamente a partir de las tareas completadas"* — aquí se formaliza que esa misma filosofía rige también el `status` de las entidades agregadas (`LearningPhase`, `LearningGoal`), no solo el porcentaje numérico de `LearningProgress`.

**Transiciones válidas (mismas para las 4 entidades):** `NOT_STARTED → IN_PROGRESS → COMPLETED`; `NOT_STARTED → CANCELLED`; `IN_PROGRESS → CANCELLED`; `COMPLETED → IN_PROGRESS` (reversión, **únicamente** permitida en las entidades de transición manual — `LearningTask` con `source = SELF_DIRECTED`, y `LearningObjective` — para corregir una finalización accidental; al revertir, `completed_at` vuelve a `NULL` en la misma operación). **Transiciones prohibidas, sin excepción:** `COMPLETED → CANCELLED` (una unidad de trabajo ya terminada no se cancela); cualquier transición **desde** `CANCELLED` (estado terminal, sin reactivación — coherente con el resto del proyecto: 13.7, "no se permite eliminar la memoria, solo marcarla inactiva", mismo principio de terminalidad ya aplicado a otro dominio).

**Restricciones de consistencia adicionales:** una `LearningPhase`/`LearningGoal` no puede estar en `COMPLETED` si tiene alguna `LearningTask`/`LearningObjective` hija en `NOT_STARTED` o `IN_PROGRESS` (se deriva directamente de la regla de cálculo automático); no se duplica el control de estado a dos niveles — `LearningPlan.status = PAUSED` no propaga ni requiere ningún cambio de estado en sus hijas (quedan tal cual estaban, sin necesidad de un valor "pausado" propio, evitando la duplicación de información que 13.4 prohíbe explícitamente).

**3. Consolidación documental:** `LearningTask.source` (18.20.5) y los 4 ENUM de `status` de este punto quedan reflejados literalmente en la ficha de 13.4 (editada en esta misma resolución) — 13.4, 18.20 y `docs/modules/mi-plan.md` describen, a partir de esta resolución, exactamente el mismo modelo.

**Justificación general:** ninguno de los tres puntos introduce una decisión de producto nueva ni modifica una regla ya aprobada — son, en los tres casos, la única forma de completar información que ya estaba implícita en reglas MUST previas (13.4: cálculo automático de progreso; 18.20.5: separación manual/automática por `source`; 18.20.7: terminalidad sin eliminación) pero que no había sido enumerada explícitamente a nivel de valores concretos.

**Módulos impactados:** ninguno ya implementado — mismas conclusiones que 18.20 (Dashboard sin cambios; `services/gamification` sin cambios adicionales a los ya señalados). `docs/modules/mi-plan.md` se actualiza con una adenda que remite a esta resolución, sin reescribir su Parte 1/2/3 ya aprobada.

### 18.22 Formalización de dos decisiones interpretativas del Domain Layer de Mi Plan (Sprint 3.3.2)

**Contexto:** la auditoría DDD del Domain Layer de Mi Plan (Sprint 3.3.2) aprobó la implementación con estado 🟡 REQUIERE AJUSTES, señalando que dos decisiones tomadas dentro del código (`features/my-plan/domain/entities/LearningPlan.ts` y `LearningGoal.ts`/`LearningPhase.ts`) eran inferencias razonadas del implementador, no texto literal de ninguna resolución previa, y debían formalizarse antes de que el Sprint 3.3.3 dependiera de ellas por interpretación. Esta resolución las cierra sin modificar ningún comportamiento ya implementado — únicamente los declara como decisión oficial.

**1. Transiciones de `LearningPlan.status` (ACTIVE, PAUSED, COMPLETED, CANCELLED — 13.4):**

A diferencia de los 4 ENUM de estado de 18.21, 13.4 nunca definió una tabla de transiciones válidas para `LearningPlan`. Se formaliza aquí el grafo ya implementado:

- `ACTIVE → PAUSED` y `PAUSED → ACTIVE` (transición bidireccional).
- `ACTIVE → COMPLETED`, `PAUSED → COMPLETED`.
- `ACTIVE → CANCELLED`, `PAUSED → CANCELLED`.
- `COMPLETED` y `CANCELLED` son estados terminales: ninguna transición posterior es válida, sin excepción — misma filosofía de terminalidad ya vigente en el resto del proyecto (13.7: "no se permite eliminar la memoria, solo marcarla inactiva"; 18.21: terminalidad de `CANCELLED` en las 4 entidades hijas).
- Transición prohibida explícita: no existe ninguna transición directa `PAUSED → PAUSED` ni auto-transición (`from === to`) para ningún estado.

**Justificación:** 18.20.4 presupone que `COMPLETED` y `CANCELLED` son alcanzables ("el cierre de un `LearningPlan` (`COMPLETED`/`CANCELLED`)... es una operación atómica"), y 18.21 aclara que `PAUSED` "no propaga a hijas" — ambos hechos ya asumían implícitamente que las 4 transiciones de cierre y la transición a `PAUSED` existen. Esta resolución solo hace explícito el grafo completo que las hace posibles, sin añadir ningún estado ni valor no contemplado en la ficha original de 13.4.

**Disparador de negocio de `pause()`, explícitamente fuera de alcance:** ni esta resolución ni ninguna anterior definen *cuándo* o *por qué* un plan pasa a `PAUSED` (a diferencia de `COMPLETED`/`CANCELLED`, que sí tienen disparadores documentados — cierre natural del plan, cancelación). Esa decisión de producto queda pendiente para cuando exista un caso de uso concreto que la requiera; el dominio únicamente garantiza que la transición mecánica es válida cuando se invoque.

**2. `cancel()` en `LearningGoal`/`LearningPhase` pese a ser entidades de cálculo automático:**

Se formaliza que `CANCELLED` es, en las 4 entidades de 18.21 (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`), una transición de naturaleza distinta a `NOT_STARTED`/`IN_PROGRESS`/`COMPLETED`: estas tres últimas se determinan siempre por cálculo (automático en `LearningGoal`/`LearningPhase`, manual en `LearningObjective`/`LearningTask` con `source = SELF_DIRECTED`), mientras que `CANCELLED` es siempre una decisión externa explícita (p. ej., como resultado de una reprogramación del plan, 18.20.2, que redistribuye o elimina prioridades), nunca un valor calculado a partir de los hijos.

**Justificación:** 18.21 ya declaraba, sin ambigüedad, que `CANCELLED` es válido "para las 4 entidades" en su tabla de transiciones, y que su significado ("deja de ser relevante... sin haberse completado") no depende de ningún cálculo agregado. La frase de 18.21 "`LearningPhase.status`/`LearningGoal.status` se calculan automáticamente... nunca se editan manualmente" se interpreta, y se formaliza aquí como interpretación oficial, referida específicamente a cómo se determina `COMPLETED`/`IN_PROGRESS`/`NOT_STARTED` (el resultado del cálculo de progreso), no a la transición `CANCELLED`, que es una operación de ciclo de vida distinta y no contradice la ausencia de edición manual del *progreso*.

**Consolidación documental:** ambas decisiones ya estaban implementadas y probadas en el Domain Layer del Sprint 3.3.2 antes de esta resolución; no se modifica ningún comportamiento, código, constraint ni migración — únicamente se elimina la dependencia de interpretación señalada por la auditoría.

**Módulos impactados:** ninguno ya implementado. El Domain Layer de Mi Plan (`features/my-plan/domain/`) queda alineado 1:1 con esta resolución sin requerir ningún cambio de código.
