# features/my-plan

Renombrado de `features/mi-plan` (resolución 18.19, refactor arquitectónico
de cierre de sprint — corrige la única clave de código que no seguía la
convención de inglés de 18.2).

Módulo independiente (Feature-Driven Architecture — sección 5.4). Estructura
interna estándar: components/, pages/, hooks/, services/, types/, schemas/,
utils/, constants/, actions/. Una feature nunca importa directamente de otra
feature (sección 5.4: "una feature nunca accederá directamente a otra
feature"); la comunicación pasa por services/ compartidos o por el Motor de
Orquestación (sección 5.7).

Sin lógica de producto todavía — pendiente de desarrollo.
