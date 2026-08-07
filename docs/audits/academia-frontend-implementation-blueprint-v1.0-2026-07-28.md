# Academia — Frontend Implementation Blueprint v1.1

**Estado:** FROZEN
**Fecha:** 2026-07-28.
**Versión anterior:** v1.0 (DRAFT, 2026-07-28) — auditada en AFR-001, hallazgos incorporados en esta versión.
**Autor:** Auditoría/planificación asistida (Claude Code), sin modificación de código.
**Basado en:** Frontend Contract v1.1 (FROZEN, 2026-07-20), API Contract v1.3 (2026-07-20), Application Model v1.4 (2026-07-20), Domain Model v1.1 (2026-07-19), Infrastructure Model v1.1 (2026-07-19), Functional Specification v1.3 (2026-07-20), Academia-Project-Freeze-Baseline.md, ACA-001/002/003-Report.md, Informe AFR-001, y lectura directa del código en `features/academy/` (incluyendo `features/academy/actions/`, releído completo para esta versión), `app/api/v1/academy/`, `components/ui/`, `i18n/`, `middleware.ts`, `config/routes.ts`, `tailwind.config.ts`, `messages/{es,fr}.json`, `package.json`.

**Principio rector de este documento:** el backend ya está diseñado y (salvo lo señalado explícitamente en la Sección 14) implementado. Este blueprint no modifica ni un endpoint, ni un DTO, ni un Command, ni una regla de negocio — consume exactamente lo que existe, tal como existe, incluidas sus imperfecciones documentadas.

---

## ⚠️ Precondición de gobernanza — leer antes de implementar

`Academia-Project-Freeze-Baseline.md` establece como regla de gobernanza explícita: *"ningún Sprint de nuevo desarrollo funcional (p. ej. Sprint 6.4 Frontend Integration) inicie antes de que [la validación de runtime de H-01] quede certificada con evidencia de ejecución real."* Al cierre de este documento, `Runtime-Validation-Report-Sprint-6.3.3.md` concluye **"VALIDATION NOT EXECUTABLE"** (falta de entorno: PostgreSQL real, Prisma Client generado contra BD real, Clerk de prueba, datos seed cruzados). Esto significa que, formalmente, **la implementación del frontend de Academia no debería iniciar hasta cerrar ese blocker operativo** — no es un bloqueador de diseño (no afecta nada de lo especificado aquí), es un bloqueador de proceso. Este documento puede aprobarse y congelarse igualmente; la **Fase 0 del Roadmap (Sección 23)** incluye la certificación de esa validación como precondición dura antes de la Fase 1.

---

## 1. Introducción

### 1.1 Objetivo

Especificar de forma completa y ejecutable el frontend del módulo Academia — las 15 pantallas del Frontend Contract v1.1 — de modo que su implementación consista únicamente en seguir esta especificación, sin tomar decisiones arquitectónicas nuevas durante el desarrollo.

### 1.2 Alcance

Las 15 pantallas P-01 a P-15 definidas en el Frontend Contract v1.1, sus componentes, hooks, estrategia de datos (REST y Server Actions), estrategia de estado, sistema de diseño específico de Academia, navegación, accesibilidad, responsive, performance y estrategia de testing. Cubre exclusivamente lo que el backend de Academia expone hoy (23 endpoints de negocio + 3 de salud + 6 Server Actions ya implementadas en `features/academy/actions/`).

### 1.3 Exclusiones explícitas

- **Cualquier pantalla, endpoint, DTO, Command o Query no documentado** en los contratos Frozen o no verificado en el código real.
- **Historial de anulaciones docentes** (`GetTeacherOverrideHistoryQuery`, QRY-09): existe en Application pero **no tiene ningún endpoint HTTP que lo exponga** (confirmado en API Contract v1.3 y en el código de `api/handlers/`). No se especifica ninguna pantalla para esta funcionalidad — no puede construirse contra el backend actual. Queda como brecha documentada (Sección 14).
- **Sistema de notificaciones push/in-app**: `features/notifications/` es scaffolding vacío (sin lógica de producto). El Frontend Contract v1.1 documenta el consumo de una notificación `ACADEMY_FEEDBACK_READY`, pero no existe ningún mecanismo real de entrega. Este documento **no asume su existencia** y diseña P-09 exclusivamente con polling (Sección 8.3).
- **Sistema de diseño visual formal** (paleta completa más allá de los Design Tokens ya definidos, tipografía, iconografía, Figma/wireframes): no existe ningún artefacto de este tipo en el repositorio. Se reutilizan los Design Tokens ya congelados en `tailwind.config.ts` (colores `primary/secondary/neutral/success/warning/danger`, `transitionDuration`, `transitionTimingFunction`) y se extiende el Design System mínimo ya existente en `components/ui/`.
- **Roles adicionales de plataforma** (`SUPER_ADMIN`, `REVIEWER`, `AI_SERVICE`, `SYSTEM`): el API Contract los reserva a nivel de catálogo de plataforma, pero ningún endpoint de Academia los autoriza. El frontend de Academia solo maneja `STUDENT`, `TEACHER`, `ADMIN`.
- **Rate limiting y catálogo completo de códigos de error** (`Error.code`): ambos son ítems **PENDIENTE** explícitamente abiertos en el API Contract v1.3 (#3 y #4). El frontend no puede diseñar lógica condicional sobre `code` específicos hasta que ese catálogo exista (Sección 14).

### 1.4 Dependencias

- Backend de Academia: 23 endpoints de negocio + 3 de salud, ya implementados (`app/api/v1/academy/**/route.ts`).
- **Server Actions de Academia, ya implementadas**: `features/academy/actions/unitActions.ts` y `attemptActions.ts` (6 funciones: `startUnitAction`, `repeatUnitAction`, `autosaveDraftAction`, `advanceStepAction`, `verifyComprehensionAction`, `submitVersionAction` — ver Sección 3.1 para el detalle completo). **Corrección respecto a v1.0**: el v1.0 de este Blueprint afirmó erróneamente que este directorio estaba vacío y que el frontend usaría "100% REST, cero Server Actions". Ambas afirmaciones eran falsas — quedan corregidas en toda esta versión.
- Autenticación: Clerk (`@clerk/nextjs ^5.0.0`), ya integrado en `middleware.ts` raíz.
- Data-fetching: TanStack React Query `^5.51.0`, **ya instalado**, no usado todavía por ningún módulo con backend real (Dashboard es de solo lectura vía Server Components/servicios, no confirmado si usa React Query).
- Formularios: `react-hook-form ^7.52.0` + `@hookform/resolvers ^3.9.0` + `zod ^3.23.0`, ya instalados.
- Estado global cliente: `zustand ^4.5.0`, ya instalado.
- i18n: `next-intl ^3.17.0`, locales `fr` (por defecto, sin prefijo) y `es` (con prefijo `/es`), ya configurado en `i18n/routing.ts`. `useFormatter` (fechas/números/porcentajes) disponible vía el mismo paquete (re-exportado por `next-intl` desde `use-intl`).
- Design System base: `components/ui/` (`Button, Card, ProgressBar, Avatar, Skeleton, Badge`) — **insuficiente**, requiere extensión (Sección 11.1).
- Design Tokens: `tailwind.config.ts` — colores y motion tokens ya definidos y de uso **obligatorio** (MUST/MUST NOT documentado en el propio archivo: prohibido usar valores HEX/RGB/tamaños crudos en componentes).

### 1.5 Estado actual del backend

Confirmado por auditoría de código (no supuesto): dominio, aplicación e infraestructura de Academia están completos y funcionales (aggregates con máquinas de estado reales, 17 commands + 9 queries + sus handlers, 4 repositorios Prisma, integración real con Claude/OpenAI). Los 23 endpoints de negocio existen y enrutan correctamente. Además, **6 de esos 23 flujos ya tienen una Server Action equivalente** (Sección 3.1), reutilizando literalmente los mismos Commands/Handlers/Mappers que el REST — no hay duplicación de lógica de negocio entre ambos transportes. Existen 4 adaptadores intencionalmente "fail-closed" (docente, evidencia de competencia, enlace con Mi Plan, catálogo curricular) que **no** requieren ningún cambio de frontend — el frontend simplemente consumirá las respuestas que estos producen (ej. `403` sistemático en endpoints docentes hasta que exista el módulo de Organización Académica). Cero cobertura de tests en Academia. H-01 (BOLA) corregido en código, sin validación de runtime ejecutada.

### 1.6 Estado actual del proyecto (frontend)

`app/[locale]/(app)/academy/page.tsx` es un placeholder (`return null`). `features/academy/components/`, `hooks/`, `pages/`, `services/`, `types/`, `schemas/`, `constants/`, `utils/` contienen únicamente `.gitkeep` — no existe ningún componente, hook, ni página real de UI para Academia. **`features/academy/actions/` es la única excepción: contiene 6 Server Actions reales y funcionales** (ver Sección 3.1) — corrección respecto a v1.0, que afirmaba erróneamente que también estaba vacía. `components/academy/` no existe. `README.md` de `features/academy/` está desactualizado (dice "sin lógica de producto todavía", falso para backend y para `actions/`, cierto solo para el resto del árbol de UI). `/academy` ya está listado en `config/routes.ts` → `PRIVATE_ROUTES` (protegido por Clerk vía `middleware.ts`).

---

## 2. Principios arquitectónicos

### 2.1 Feature-First

El proyecto ya impone esta convención en los 13 módulos existentes bajo `features/`. Academia debe seguir el mismo patrón que ya usan `dashboard` (frontend) y `my-plan`/`academy` (backend): el frontend de Academia vive en `features/academy/{components,hooks,pages,services,types,schemas,constants,utils}/`, **sin** invadir `features/academy/{domain,application,infrastructure,api}/` (esas carpetas son del backend, ya congeladas, este blueprint nunca las toca). `features/academy/actions/` ya tiene contenido real del backend (Server Actions) — el frontend lo **consume** (importa las funciones), nunca lo modifica.

### 2.2 Organización del código — regla de dependencia

Dirección de dependencia obligatoria, en un solo sentido. **Existen dos rutas de transporte posibles desde `hooks/` hacia el backend** (ver Sección 3.1 para el criterio de cuál usar en cada caso):

```
app/[locale]/(app)/academy/**/page.tsx
        │  (solo importa)
        ▼
features/academy/pages/*   (orquestación de pantalla completa)
        │
        ▼
features/academy/components/*   (presentación)
        │  (usa)
        ▼
features/academy/hooks/*   (React Query + lógica de UI)
        │
        ├──(ruta A — 17 de 23 operaciones)──▶ features/academy/services/academyApi.ts ──▶ lib/apiClient.ts ──▶ app/api/v1/academy/**/route.ts (REST)
        │
        └──(ruta B — 6 operaciones, Sección 3.1)──▶ features/academy/actions/*.ts (Server Actions, YA EXISTENTES, "use server") ──▶ mismo Composition Root/Handlers
```

Ninguna capa importa de una capa inferior sin pasar por la inmediatamente superior (ej.: un componente **nunca** llama `fetch` ni una Server Action directamente, siempre pasa por un hook; un hook **nunca** referencia HTML/JSX). `app/[locale]/(app)/academy/**/page.tsx` es una capa de **enrutamiento puro**: nunca contiene lógica, solo importa y renderiza el `Page` correspondiente de `features/academy/pages/`.

### 2.3 Responsabilidad de cada capa

| Capa | Responsabilidad única | No debe hacer |
|---|---|---|
| `app/**/page.tsx` | Resolver params de ruta (`unitId`, `attemptId`, `step`, etc.), pasarlos a `features/academy/pages/*`, definir `generateMetadata` | Contener JSX de negocio, lógica de fetching |
| `features/academy/pages/*` | Componer contenedores (Container Components, Sección 10), manejar el `Suspense`/error boundary de nivel de pantalla | Hacer fetching directo, contener presentación fina |
| `features/academy/components/*` | Presentación pura o contenedores de feature (Sección 10) | Conocer la forma exacta de la respuesta HTTP cruda (reciben tipos de `types/`, no `Response`) |
| `features/academy/hooks/*` | Encapsular `useQuery`/`useMutation`, invalidación, estado derivado de servidor; para las 6 operaciones de la Sección 3.1, la `mutationFn` invoca la Server Action directamente en vez de `services/academyApi.ts` | Renderizar JSX |
| `features/academy/services/*` | Llamar al API Client con la ruta/método exactos del Contract, mapear errores HTTP a `AcademyApiError` tipado — usado por las **17** operaciones sin Server Action | Cachear (eso es responsabilidad de React Query, no del service); duplicar las 6 operaciones que ya tienen Server Action |
| `features/academy/actions/*` (YA EXISTE, backend) | Server Actions de las 6 operaciones de mayor frecuencia — el frontend las **importa** desde sus hooks | El frontend no debe crear nuevas Server Actions ni modificar las existentes |
| `features/academy/types/*` | Tipos TypeScript espejo exacto de los HTTP Response Mappers reales (Sección 5) — la misma forma sirve para la respuesta REST y para el valor de retorno de las Server Actions (ambos usan literalmente los mismos Response Mappers, confirmado en código) | Redefinir tipos ya existentes en Application/Domain (esos son del backend) |
| `features/academy/schemas/*` | Esquemas Zod de **validación de formularios** (nunca de parseo de respuesta del servidor — el servidor es la fuente de verdad) | Sustituir la validación de negocio ya hecha en el backend |

### 2.4 Flujo de datos

Unidireccional: acción de usuario → hook (`useMutation`) → **Server Action o service+API Client, según la tabla de la Sección 3.1** → backend → invalidación de queries afectadas (Sección 8) → refetch automático → nueva renderización. Nunca se muta estado de servidor directamente en el cliente sin pasar por una mutación real (no hay Optimistic UI salvo lo explícitamente listado en Sección 8.1).

### 2.5 Separación de responsabilidades (SoC) y SOLID aplicados

- **SRP**: cada hook expone exactamente una Query o una Mutation del Contract (ej. `useUnits()` ↔ EP-13 únicamente; nunca un hook "todo en uno" que combine varios endpoints salvo los explícitamente documentados como compuestos en Sección 10.2 con justificación).
- **OCP**: los componentes de presentación (Sección 10.2) reciben variantes vía props (`variant`, `state`) en vez de bifurcarse por `if`/`switch` internos — extender un nuevo estado visual no debe requerir modificar el componente, solo añadir una variante.
- **LSP**: todo componente que recibe `AcademyUnitDetail` debe funcionar igual si en el futuro se recibe un subtipo con campos adicionales (ningún componente debe hacer *type narrowing* destructivo).
- **ISP**: los tipos de `features/academy/types/` se definen por pantalla/uso, no un único "God Type" — ej. `UnitCardData` (subset para P-01) es distinto de `UnitDetailData` (P-02), aunque ambos deriven del mismo endpoint subyacente cuando aplique.
- **DIP**: los hooks dependen de una abstracción de transporte (una función async que retorna el tipo esperado — sea `services/academyApi.ts` o una Server Action de `features/academy/actions/`), nunca de `fetch` directamente dentro de un componente — permite sustituir el transporte sin tocar componentes.

### 2.6 Convenciones obligatorias (a respetar sin excepción durante toda la implementación)

1. **Nunca** usar `next/link` ni `next/navigation` directamente dentro de `features/academy/` — usar siempre los wrappers de `i18n/navigation.ts` (`Link, redirect, usePathname, useRouter, getPathname`), ya que el proyecto opera en `fr`/`es`.
2. **Nunca** hardcodear texto de interfaz — todo string visible pasa por `useTranslations("academy")` (namespace nuevo a crear, Sección 15.3) con entradas espejo en `messages/es.json` y `messages/fr.json`.
3. **Nunca** usar valores de color/espaciado crudos (HEX/RGB/px arbitrario) — usar exclusivamente las clases de Tailwind que referencian los tokens ya definidos en `tailwind.config.ts` (`bg-primary-500`, `text-danger-700`, `duration-400`, `ease-delf-ease`, etc.), regla ya impuesta por el propio archivo de configuración del proyecto.
4. **Nunca** llamar `fetch` directamente desde un componente o página — siempre a través de un hook. Dentro de un hook, la llamada real es **o bien** `fetch` vía `services/academyApi.ts` (17 operaciones), **o bien** la importación directa de la Server Action correspondiente (6 operaciones, Sección 3.1) — nunca ambas para la misma operación, nunca `fetch` hacia una ruta que ya tiene Server Action.
5. **Idempotency-Key**: aplica **únicamente** a las operaciones transportadas por REST que el Contract marca como obligatorias (EP-01, EP-03, EP-06, EP-07, EP-08, EP-09, EP-21, EP-22 — según correspondan a cada hook REST); debe generarse y reutilizarse la **misma** clave durante reintentos del mismo intento de usuario. **Las 6 Server Actions no reciben ni gestionan `Idempotency-Key`** (confirmado en código: ninguna de las 6 funciones acepta ese parámetro) — su semántica de reintento depende de que el componente invocador no vuelva a invocar la Server Action mientras la mutación anterior siga `isPending` (ya cubierto por la regla general de deshabilitar el botón de envío durante `isPending`, Sección 9).
6. Los nombres de archivo/carpeta de rutas dinámicas siguen el mismo slug en kebab-case que usa el propio backend para los valores de enum cuando aplique a URL (ver Sección 6.2).
7. Todo componente nuevo de UI genérica (no específico de Academia) que resulte reutilizable se añade a `components/ui/`, nunca se duplica dentro de `features/academy/components/`.

---

## 3. Arquitectura general del frontend

```
Next.js App Router
   │
   ▼ (resuelve locale + matcher de Clerk, ya implementado en middleware.ts)
Routes  →  app/[locale]/(app)/academy/**/page.tsx
   │        (capa de enrutamiento puro — Sección 2.3)
   ▼
Pages   →  features/academy/pages/*Page.tsx
   │        (composición de contenedores + Suspense/ErrorBoundary de pantalla)
   ▼
Features → features/academy/components/* (containers + composites + atoms)
   │        (Sección 10 — Smart vs Presentational)
   ▼
Hooks   →  features/academy/hooks/use*.ts
   │        (useQuery/useMutation de TanStack Query — Sección 7/8)
   │
   ├──▶ Services → features/academy/services/academyApi.ts ──▶ lib/apiClient.ts ──▶ Backend REST (17 operaciones)
   │
   └──▶ Server Actions → features/academy/actions/{unitActions,attemptActions}.ts (YA EXISTENTES, 6 operaciones — Sección 3.1)
   │
   ▼
Backend →  app/api/v1/academy/**/route.ts + Composition Root compartido (YA IMPLEMENTADO, no se toca)
```

**Responsabilidad de cada nivel** (complementa Sección 2.3):

- **Routes**: únicas responsables de que Next.js resuelva el árbol de archivos correcto. Sin lógica.
- **Pages**: una por pantalla (15 + 1 layout de estudiante + 1 layout de profesor/admin, Sección 4). Orquestan qué Containers se renderizan y en qué disposición; definen el `<Suspense fallback={<Skeleton/>}>` de nivel de pantalla y el `error.tsx`/`not-found.tsx` de Next.js cuando aplique.
- **Features/Components**: implementan la lógica visual y de interacción; los Container Components (Sección 10) son los únicos autorizados a invocar hooks de datos.
- **Hooks**: única puerta de entrada a React Query; encapsulan Query Keys (Sección 8), `staleTime`/`gcTime`/invalidación (Sección 8.2) y eligen la ruta de transporte correcta según la Sección 3.1.
- **Services**: capa de traducción HTTP↔dominio-frontend para las 17 operaciones sin Server Action; cada función corresponde 1:1 a un endpoint del API Contract v1.3 (nunca agrega lógica de negocio, solo transporte + mapeo de error).
- **Server Actions** (`features/academy/actions/`): ya implementadas por el backend, reutilizan los mismos Commands/Handlers/Mappers que el REST — el frontend las trata como una función async más, importable directamente en un hook.
- **API Client**: wrapper mínimo sobre `fetch` que añade `Authorization` (gestionado automáticamente por Clerk vía cookie de sesión — ver Sección 15.1), `Accept-Language` (del locale activo de next-intl), y parseo uniforme del envoltorio `{code, message, correlationId, details}` en caso de error.
- **Backend**: fuera de alcance de este documento, ya implementado.

### 3.1 Estrategia de transporte: Server Actions vs REST (resolución de AFR-F01)

**Evidencia de código** (releída completa para esta versión): `features/academy/actions/unitActions.ts` y `attemptActions.ts` contienen 6 Server Actions reales, con esta firma exacta:

```ts
// unitActions.ts
export async function startUnitAction(unitId: string): Promise<AttemptSummaryHttp>
export async function repeatUnitAction(unitId: string): Promise<AttemptSummaryHttp>

// attemptActions.ts
export async function autosaveDraftAction(attemptId: string, content: string): Promise<DraftResponseDto>
export async function advanceStepAction(attemptId: string): Promise<AttemptSummaryHttp>
export async function verifyComprehensionAction(attemptId: string, comprehensionResponse: string): Promise<VerifyComprehensionActionResult>
// donde VerifyComprehensionActionResult = { attempt: AttemptSummaryHttp; satisfied: boolean }
export async function submitVersionAction(attemptId: string, content: string): Promise<VersionHttp>
```

Ambos archivos declaran explícitamente su alcance en un comentario de cabecera: cubren únicamente "los flujos de escritura de más alta frecuencia de interacción del Estudiante dentro de una misma pantalla", evitando un salto HTTP adicional; el resto de los 23 endpoints permanece exclusivamente accesible vía REST (superficie pública completa, consumible por cualquier cliente).

**Tabla de decisión — cuál transporte usa cada hook de mutación afectado**:

| Operación | Endpoint REST equivalente | Server Action | Hook (Sección 13) | Transporte a usar |
|---|---|---|---|---|
| Iniciar unidad | EP-01 | `startUnitAction(unitId)` | `useStartUnit()` | **Server Action** |
| Repetir unidad | EP-06 | `repeatUnitAction(unitId)` | `useRepeatUnit()` | **Server Action** |
| Autoguardar borrador | EP-02 | `autosaveDraftAction(attemptId, content)` | `useAutosaveDraft()` | **Server Action** |
| Avanzar paso libre | EP-21 | `advanceStepAction(attemptId)` | `useAdvanceStep()` | **Server Action** |
| Verificar comprensión | EP-22 | `verifyComprehensionAction(attemptId, comprehensionResponse)` | `useVerifyComprehension()` | **Server Action** |
| Enviar producción/reescritura | EP-03 | `submitVersionAction(attemptId, content)` | `useSubmitVersion()` | **Server Action** |
| Todas las demás (17 operaciones: EP-04, EP-05, EP-07 a EP-20, EP-23) | — | No existe Server Action | resto de hooks de la Sección 13 | **REST** (`services/academyApi.ts`) |

**Criterio general para decisiones futuras** (si se añadiera una operación nueva fuera de alcance de este documento): usar Server Action únicamente si (a) el backend ya provee una para esa operación específica, y (b) la operación se invoca desde dentro de una interacción de una sola pantalla de Academia. Nunca crear una Server Action nueva sin que el backend la exponga primero (este Blueprint no inventa transporte, solo lo documenta).

**Implicación para `useMutation` (React Query)**: para las 6 operaciones de arriba, el `mutationFn` del hook es la importación directa de la función `"use server"` correspondiente — TanStack Query v5 no distingue entre una `mutationFn` que hace `fetch` y una que invoca una Server Action, ambas son simplemente funciones que retornan una Promise. La estrategia de Query Keys, invalidación, `staleTime`/`gcTime` y estados de UI (Secciones 8, 12) **no cambia** para estas 6 operaciones — solo cambia qué función concreta ejecuta la mutación.

**Diferencia de contrato de error a resolver en la Fase 0 del Roadmap**: las Server Actions, al lanzar una excepción (`ConflictException`, `ResourceNotFoundException`, etc.), la propagan tal cual hacia el cliente — Next.js serializa el error de un Server Action de forma más limitada que una respuesta HTTP (no hay automáticamente un envoltorio `{code, message, correlationId, details}` como en REST, salvo que la propia Server Action lo construya y la retorne como valor normal en vez de lanzarla). **Decisión congelada**: los hooks que envuelven estas 6 Server Actions deben capturar cualquier excepción en su `onError` y normalizarla a la misma forma `AcademyErrorHttp` (Sección 5.11) que ya usan los hooks REST, extrayendo `error.message` como mínimo común denominador seguro (mismo patrón de error ya usado para REST en toda pantalla) — esto no requiere modificar las Server Actions existentes, se resuelve enteramente en el hook del frontend.

**Caso especial — `verifyComprehensionAction` NO lanza en el caso "insuficiente"**: a diferencia del endpoint REST (que retorna `422` para verificación insuficiente), la Server Action **siempre resuelve con éxito** y comunica el resultado semántico vía el campo `satisfied: boolean` (`false` cuando la comprensión fue insuficiente). Esto es una diferencia de comportamiento real y verificada en código, no una inconsistencia a corregir — **decisión congelada**: `useVerifyComprehension()` y `ComprehensionGate` (Sección 12, P-05) deben leer `result.satisfied`, nunca esperar un `422`/error para este caso, dado que P-05 usa la Server Action (tabla de arriba).

---

## 4. Organización definitiva de carpetas

```
features/academy/
├── domain/                    # YA EXISTE — backend, NO TOCAR
├── application/                # YA EXISTE — backend, NO TOCAR
├── infrastructure/              # YA EXISTE — backend, NO TOCAR
├── api/                        # YA EXISTE — backend, NO TOCAR
├── actions/                    # YA EXISTE — backend, Server Actions reales
│   ├── attemptActions.ts        #   (autosaveDraftAction, advanceStepAction,
│   ├── unitActions.ts           #    verifyComprehensionAction, submitVersionAction,
│   └── index.ts                 #    startUnitAction, repeatUnitAction — Sección 3.1)
│                                # El frontend IMPORTA estas funciones desde sus
│                                # hooks; nunca las modifica ni crea nuevas.
│
├── components/                 # FRONTEND — a poblar en su totalidad
│   ├── shared/                  # Reutilizables SOLO dentro de Academia
│   │   ├── UnitStatusBadge.tsx
│   │   ├── RecommendationBadge.tsx
│   │   ├── StepProgressTracker.tsx
│   │   ├── AutosaveIndicator.tsx
│   │   ├── WordCountIndicator.tsx
│   │   ├── ProcessingIndicator.tsx
│   │   └── AcademyBreadcrumbs.tsx     # Sección 19 (resolución AFR-F07)
│   ├── unit-map/                 # Feature Module 1 (Frontend Contract §2)
│   │   ├── UnitMapContainer.tsx
│   │   ├── UnitCard.tsx
│   │   └── TextTypeSectionHeader.tsx
│   ├── unit-attempt/             # Feature Module 2 — el más grande (P-02 a P-10)
│   │   ├── UnitDetailContainer.tsx
│   │   ├── AttemptActionButton.tsx
│   │   ├── AttemptHistoryList.tsx
│   │   ├── AttemptHistoryRow.tsx
│   │   ├── AttemptStepContainer.tsx
│   │   ├── StepContentPanel.tsx
│   │   ├── StepAdvanceButton.tsx
│   │   ├── ComprehensionGate.tsx
│   │   ├── WritingEditor.tsx
│   │   ├── SubmitButton.tsx
│   │   ├── VersionWithFeedbackPanel.tsx
│   │   └── FeedbackObservationItem.tsx
│   ├── model-library/            # Feature Module 3 (estudiante, solo lectura)
│   │   ├── ModelLibraryContainer.tsx
│   │   └── ModelExampleCard.tsx
│   ├── model-library-admin/       # Feature Module 4 (ADMIN, CRUD)
│   │   └── AdminModelLibraryContainer.tsx
│   ├── teacher-panel/            # Feature Module 5
│   │   ├── TeacherPanelContainer.tsx
│   │   ├── MultiSelectToolbar.tsx
│   │   └── StudentProgressRow.tsx
│   ├── student-detail/           # Feature Module 6 (parte de P-13/P-15)
│   │   ├── StudentDetailContainer.tsx
│   │   ├── TeacherOverrideDialog.tsx
│   │   ├── RecommendUnitDialog.tsx
│   │   └── StudentUnitHistoryContainer.tsx
│   └── layouts/
│       ├── StudentAcademyLayout.tsx    # Layout Estudiante (Contract §2)
│       └── TeacherAcademyLayout.tsx    # Layout Profesor/Administrador (Contract §2)
│
├── hooks/                      # Sección 13 — un archivo por hook
│   ├── useUnits.ts
│   ├── useUnitDetail.ts
│   ├── useUnitAttempts.ts
│   ├── useContinuation.ts
│   ├── useStartUnit.ts                 # Server Action (§3.1)
│   ├── useRepeatUnit.ts                # Server Action (§3.1)
│   ├── useDraft.ts
│   ├── useAutosaveDraft.ts             # Server Action (§3.1)
│   ├── useSubmitVersion.ts             # Server Action (§3.1)
│   ├── useAdvancePhase.ts              # REST (EP-04 — sin Server Action, §3.1)
│   ├── useCompleteReflection.ts
│   ├── useAdvanceStep.ts               # Server Action (§3.1)
│   ├── useVerifyComprehension.ts       # Server Action (§3.1)
│   ├── useFeedback.ts
│   ├── useModelExamples.ts
│   ├── useCreateModelExample.ts
│   ├── useUpdateModelExample.ts
│   ├── useRetireModelExample.ts
│   ├── useProgressSummary.ts
│   ├── useStudentProgressSummary.ts
│   ├── useApplyTeacherOverride.ts
│   ├── useAssignUnitToStudent.ts
│   ├── useStudentUnitHistory.ts
│   └── useAcademyRole.ts               # resuelve rol desde Clerk (Sección 15.1)
│
├── services/
│   └── academyApi.ts            # un método por cada una de las 17 operaciones
│                                 #   sin Server Action (Sección 3.1)
│
├── types/
│   ├── unit.types.ts             # espejo de toUnitSummaryHttp/toUnitDetailHttp
│   ├── attempt.types.ts          # espejo de toAttemptSummaryHttp
│   ├── draft.types.ts            # espejo de toDraftHttp
│   ├── version.types.ts          # espejo de toVersionHttp
│   ├── feedback.types.ts         # espejo de toVersionFeedbackHttp
│   ├── model-example.types.ts
│   ├── teacher.types.ts          # TeacherOverride + TeacherRecommendation
│   ├── progress.types.ts
│   ├── continuation.types.ts
│   ├── student-unit-history.types.ts
│   ├── enums.ts                  # UnitState, UnitStep, TextType, etc. (espejo 1:1)
│   └── api-error.types.ts        # {code, message, correlationId, details?}
│
├── schemas/                     # Zod — SOLO validación de formularios de entrada
│   ├── comprehension.schema.ts
│   ├── reflection.schema.ts
│   ├── teacher-override.schema.ts
│   ├── recommend-unit.schema.ts
│   └── model-example.schema.ts
│
├── constants/
│   ├── steps.ts                  # UNIT_STEP_ORDER, FREE_ADVANCE_STEPS, slugs URL↔enum
│   ├── query-keys.ts             # Sección 8 — jerarquía centralizada de Query Keys
│   └── routes.ts                 # helpers de construcción de ruta (Sección 6)
│
├── utils/
│   ├── formatWordCount.ts
│   ├── mapFeedbackCategoryLabel.ts   # traduce enum → clave i18n
│   └── isTerminalUnitState.ts        # COMPLETED | MASTERED
│
├── pages/                       # Un archivo por pantalla, importado por app/**/page.tsx
│   ├── UnitMapPage.tsx                       (P-01)
│   ├── UnitDetailPage.tsx                    (P-02)
│   ├── AttemptHistoryPage.tsx                (P-03)
│   ├── AttemptStepPage.tsx                   (P-04 a P-10, un solo Page paramétrico)
│   ├── ModelLibraryPage.tsx                  (P-11)
│   ├── TeacherPanelPage.tsx                  (P-12)
│   ├── StudentDetailPage.tsx                 (P-13)
│   ├── AdminModelLibraryPage.tsx             (P-14)
│   └── StudentUnitHistoryPage.tsx            (P-15)
│
└── README.md                    # ACTUALIZAR al iniciar Fase 1 (hoy desactualizado)
```

### 4.1 Justificación de decisiones de carpeta

- **`actions/` ya existe con contenido real** (corrección de v1.0, AFR-F01): no es una carpeta a poblar por el frontend — ya contiene 6 Server Actions del backend que el frontend consume desde sus hooks (Sección 3.1). El resto de las operaciones (17 de 23) usa exclusivamente el contrato REST vía `services/academyApi.ts`.
- **`pages/AttemptStepPage.tsx` único para 10 pasos**: el Frontend Contract v1.1 ya especifica que P-04 a P-10 comparten una única ruta paramétrica (`/academy/attempts/{attemptId}/{step}`); un solo componente de página que despacha por `step` (switch/lookup, Sección 6.2) evita 7 archivos casi idénticos y refleja fielmente la intención del contrato ("mismo Editor de Escritura" reutilizado entre `produce`/`rewrite`, por ejemplo).
- **`components/shared/` vs por-feature**: los componentes atómicos del Frontend Contract (`UnitStatusBadge`, etc.) se usan en 3+ feature modules distintos cada uno — viven en `shared/` de Academia, no en `components/ui/` (son específicos del dominio Academia, no genéricos de plataforma). `AcademyBreadcrumbs` se añade aquí por el mismo motivo (Sección 19).
- **`schemas/` no incluye esquemas de respuesta del servidor**: el servidor ya valida (Domain + Application layers, ya congeladas); duplicar esa validación en el cliente violaría el principio rector ("el frontend se adapta al backend"). Zod se usa **únicamente** para formularios de entrada de usuario (reflexión, override docente, alta de ejemplo modelo), nunca para re-parsear la respuesta HTTP ni el valor de retorno de una Server Action.

---

## 5. Contratos de datos — DTOs reales que el frontend recibirá (evidencia de código, no del Contract idealizado)

**Nota crítica de discrepancia disclosed**: existen diferencias reales entre lo que el API Contract v1.3/OpenAPI documentan como forma de respuesta y lo que los Response Mappers HTTP (`features/academy/api/response-mappers/*.ts`) producen realmente hoy. Este blueprint especifica el frontend contra la **forma real** (lo que el código entrega), no contra la promesa documental, con cada discrepancia señalada explícitamente. Las mismas formas de tipo aplican sin importar si el dato llegó por REST o por Server Action (ambos transportes reutilizan los mismos Response Mappers, confirmado en código — Sección 3.1).

### 5.1 `AcademyUnitSummaryHttp` / `AcademyUnitDetailHttp`

```ts
interface AcademyUnitSummaryHttp {
  unitId: string;        // uuid
  studentId: string;     // uuid
  textType: TextType;
  position: number;
  state: UnitState;
  activeAttemptId: string | null;
}

interface AcademyUnitDetailHttp extends AcademyUnitSummaryHttp {
  completedAt: string | null;   // ISO-8601
  masteredAt: string | null;    // ISO-8601
  eligibleForUnlock: boolean;
  repeatable: boolean;
  teacherOverrideCount: number;
}
```

**⚠️ Gap disclosed**: el Contract documenta también `unlockedAt`, `attemptCount` e **`isRecommended`** en este DTO — ninguno de los tres se produce hoy en el Response Mapper real. **Impacto directo en P-01/P-13**: el componente `RecommendationBadge` (Frontend Contract §5) no puede renderizarse con datos reales — el frontend debe tratar `isRecommended` como **siempre ausente/false** hasta que el backend lo implemente, y el badge queda especificado pero condicionalmente oculto (Sección 22, ítem 4 de Riesgos).

### 5.2 `AttemptSummaryHttp`

```ts
interface AttemptSummaryHttp {
  attemptId: string;
  unitId: string;
  currentStep: UnitStep;
  startedAt: string;
  isCurrent: boolean;
}
```

**⚠️ Gap disclosed**: falta `versionCount` (documentado en Application Model v1.4, no producido por el Mapper HTTP). Ningún componente debe asumir su presencia (afecta a `AttemptHistoryRow`, que deberá derivar el conteo de versiones a partir del array `versions[]` de `StudentUnitHistoryHttp` cuando esté disponible, o mostrarlo solo donde el dato exista realmente — ver P-03/P-15).

### 5.3 `DraftHttp`

```ts
interface DraftHttp {
  attemptId: string;
  content: string;
  wordCount: number;
  characterCount: number;
  lastSavedAt: string;
}
```

### 5.4 `VersionHttp`

```ts
interface VersionHttp {
  versionId: string;
  attemptId: string;
  versionNumber: number;
  content: string;
  submittedAt: string;
  feedbackStatus: "READY" | "PROCESSING";
}
```

### 5.5 `FeedbackHttp` (respuesta de EP-18, también embebida en EP-03/`submitVersionAction` cuando ya hay feedback)

```ts
interface FeedbackObservationHttp {
  category: FeedbackCategory;
  strength: "STRENGTH" | "WEAKNESS";
  explanation: string;
  suggestion: string;
  // priority: NO presente — ver gap abajo
}

interface FeedbackHttp {
  feedbackId: string | null;
  versionId: string;
  versionNumber: number;
  status: "READY" | "PROCESSING";
  observations: FeedbackObservationHttp[];
  deliveredAt: string | null;
}
```

**⚠️ Gap disclosed**: falta `priority` (entero) en cada observación, pese a que `FeedbackObservationDTO` de Application y el enum `FeedbackCategory` sí definen una prioridad macro→micro (`FEEDBACK_CATEGORY_PRIORITY`, Sección 6). **Mitigación válida sin tocar backend**: el frontend puede derivar el orden localmente mapeando `category` contra la constante de prioridad ya conocida y congelada del enum (Sección 6.5).

### 5.6 `ModelExampleHttp`

```ts
interface ModelExampleHttp {
  modelExampleId: string;
  textType: TextType;
  content: string;
  rating: "EXCELLENT" | "HAS_ERRORS";
  curatorialComment: string;
  status: "ACTIVE" | "RETIRED";
}
```

### 5.7 `TeacherOverrideHttp` / `TeacherRecommendationHttp`

```ts
interface TeacherOverrideHttp {
  overrideId: string;
  unitId: string;
  action: "FORCE_LOCK" | "FORCE_RESTART";
  reason: string;
  appliedBy: string;   // teacherId
  appliedAt: string;
}

interface TeacherRecommendationHttp {
  recommendationId: string;
  studentId: string;
  unitId: string;
  recommendedBy: string;  // teacherId
  recommendedAt: string;
}
```

### 5.8 `StudentProgressSummaryHttp`

```ts
interface StudentProgressSummaryHttp {
  studentId: string;
  unitsByState: Partial<Record<UnitState, number>>;
  unitsByTextType: Partial<Record<TextType, number>>;
}
```

### 5.9 `ContinuationStateHttp` (EP-15, puede ser `204 No Content` → `null`)

```ts
type ContinuationStateHttp = {
  unit: AcademyUnitDetailHttp;
  attempt: AttemptSummaryHttp;
  draft: { content: string; lastSavedAt: string } | null;
} | null;
```

### 5.10 `StudentUnitHistoryHttp` (EP-23)

```ts
interface StudentUnitHistoryHttp {
  studentId: string;
  unitId: string;
  unitState: UnitState;
  attemptsCount: number;
  attempts: Array<AttemptSummaryHttp & { versions: VersionWithFeedbackHttp[] }>;
}

interface VersionWithFeedbackHttp {
  version: VersionHttp;
  feedback: FeedbackHttp | null;
}
```

### 5.11 `AcademyErrorHttp` (envoltorio uniforme de error — REST nativo; para Server Actions, normalizado en el hook, Sección 3.1)

```ts
interface AcademyErrorHttp {
  code: string;          // vocabulario PENDIENTE — Sección 14, no diseñar switch por code todavía
  message: string;       // único campo seguro para mostrar al usuario
  correlationId: string; // incluir en reportes de soporte/telemetría, nunca mostrar crudo al usuario
  details?: Record<string, unknown>;
}
```

### 5.12 `VerifyComprehensionActionResult` (exclusivo de la Server Action, sin equivalente REST directo)

```ts
interface VerifyComprehensionActionResult {
  attempt: AttemptSummaryHttp;
  satisfied: boolean;   // false = verificación insuficiente (sin lanzar error, ver Sección 3.1)
}
```

---

## 6. Enums — espejo exacto y su mapeo a comportamiento de UI

### 6.1 `UnitState` (8 valores)

```ts
type UnitState =
  | "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "AWAITING_FEEDBACK"
  | "REVISION" | "REFLECTION" | "COMPLETED" | "MASTERED";
```

Es la **única** fuente de verdad de progreso (Invariante 6 del Domain Model) — ningún componente debe inferir progreso a partir de `currentStep`; `UnitCard`/`UnitStatusBadge` se pintan exclusivamente en función de `UnitState`.

### 6.2 `UnitStep` (11 valores) y su slug de URL

```ts
export const UNIT_STEP_ORDER = [
  "CONTEXTUALIZE", "DEFINE_OBJECTIVES", "COMPREHEND", "OBSERVE", "ANALYZE",
  "PRACTICE", "PRODUCE", "RECEIVE_FEEDBACK", "REWRITE", "REFLECT", "UNLOCK",
] as const;

export const FREE_ADVANCE_STEPS = [
  "CONTEXTUALIZE", "DEFINE_OBJECTIVES", "OBSERVE", "ANALYZE", "PRACTICE",
] as const; // avanzables vía advanceStepAction/EP-21 sin gate; COMPREHEND tiene su propio gate

export const STEP_TO_URL_SLUG: Record<Exclude<UnitStep, "UNLOCK">, string> = {
  CONTEXTUALIZE: "contextualize",
  DEFINE_OBJECTIVES: "define-objectives",
  COMPREHEND: "comprehend",
  OBSERVE: "observe",
  ANALYZE: "analyze",
  PRACTICE: "practice",
  PRODUCE: "produce",
  RECEIVE_FEEDBACK: "feedback",
  REWRITE: "rewrite",
  REFLECT: "reflect",
};
```

`UNLOCK` **no tiene slug de URL propio** — se resuelve dentro de la misma pantalla que `REFLECT` (P-10, "resumen de cierre", decisión ya tomada por el Frontend Contract v1.1). La transición `REWRITE → REFLECT` (dominio: `Attempt.advanceToReflection()`, precondición `currentStep === REWRITE` + `RevisionPolicy.assertMinimumCycleComplete`) se ejecuta explícitamente en P-09, no de forma implícita (Sección 12, P-09 y Sección 21).

### 6.3 `TextType` (5 valores)

```ts
type TextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";
```

Usado como filtro en P-01/P-11/P-14 y como selector cerrado (nunca campo libre) en el formulario de P-14.

### 6.4 `FeedbackStrength` / `OverrideAction` / `ModelExampleRating` / `ModelExampleStatus`

```ts
type FeedbackStrength = "STRENGTH" | "WEAKNESS";
type OverrideAction = "FORCE_LOCK" | "FORCE_RESTART";
type ModelExampleRating = "EXCELLENT" | "HAS_ERRORS";
type ModelExampleStatus = "ACTIVE" | "RETIRED";
```

### 6.5 `FeedbackCategory` (10 valores, con prioridad macro→micro — usado para ordenar client-side, ver gap 5.5)

```ts
export const FEEDBACK_CATEGORY_PRIORITY: Record<string, number> = {
  COMPREHENSION: 1, COMMUNICATIVE_INTENT: 2, STRUCTURE: 3, COHERENCE: 4,
  COHESION: 5, ARGUMENTATION: 6, REGISTER: 7, VOCABULARY: 8, GRAMMAR: 9,
  SPELLING: 10,
};
```

`FeedbackObservationItem` (Sección 11) ordena su lista con `.sort((a,b) => FEEDBACK_CATEGORY_PRIORITY[a.category] - FEEDBACK_CATEGORY_PRIORITY[b.category])`.

---

## 7. Estrategia de estado

| Tipo de estado | Mecanismo | Ejemplos concretos |
|---|---|---|
| Estado de servidor (todo lo que viene de un endpoint o Server Action) | **TanStack React Query** | Lista de unidades (EP-13), detalle de unidad (EP-14), borrador (EP-17/autosave), feedback (EP-18), progreso (EP-12/EP-20), historial (EP-16/EP-23), biblioteca de modelos (EP-19) |
| Selección multi-estudiante en Panel del Profesor (P-12/P-13) | **Zustand** (store local al feature `teacher-panel`, no global de plataforma) | `selectedStudentIds: string[]` — mecanismo exclusivo de Frontend (ACP-001-B), no existe en backend |
| Filtro de `textType` en P-01/P-11/P-14 | **URL State** (`searchParams`, vía `useSearchParams`/`useRouter` de `i18n/navigation`) | Permite compartir/recargar la página con el filtro activo |
| Paso actual dentro de un intento (`step` de la URL) | **URL State** (segmento de ruta dinámico, nunca duplicado en estado de cliente) | La URL es la fuente de verdad de "en qué paso estoy" |
| Contenido del editor de escritura mientras se autoguarda (P-08) | **Local State** (`useState`/`useRef` dentro de `WritingEditor`, con debounce hacia `autosaveDraftAction`) | Nunca en Zustand/Context — es efímero y de un solo componente |
| Apertura/cierre de diálogos (`TeacherOverrideDialog`, `RecommendUnitDialog`) | **Local State** del componente contenedor que lo abre | Coherente con Frontend Contract §8 |
| Rol de UI (`STUDENT`/`TEACHER`/`ADMIN`) | Derivado de **Clerk** (`useUser()`/`useAuth()` de `@clerk/nextjs`), envuelto en `useAcademyRole()` | Nunca se guarda en Zustand/Context propio |
| Attempt activo compartido entre P-04 y P-10 | **React Query cache** (mismo Query Key `academyKeys.continuation()`/`academyKeys.attempt(id)`), **no** Context ni Zustand | React Query actúa como el "Context" implícito vía cache compartida |

**Qué nunca debe almacenarse globalmente**: contenido de formularios no enviados (excepto el debounce local del editor), datos de servidor duplicados fuera de React Query, el JWT/sesión (gestionado íntegramente por Clerk), ni ningún `Idempotency-Key` generado (Sección 2.6, punto 5 — y no aplica en absoluto a las 6 operaciones vía Server Action).

---

## 8. Estrategia de datos — React Query, endpoint por endpoint

### 8.1 Convención de Query Keys (jerarquía centralizada en `constants/query-keys.ts`)

```ts
export const academyKeys = {
  all: ["academy"] as const,
  units: (textType?: TextType) => [...academyKeys.all, "units", { textType }] as const,
  unit: (unitId: string) => [...academyKeys.all, "unit", unitId] as const,
  unitAttempts: (unitId: string) => [...academyKeys.all, "unit", unitId, "attempts"] as const,
  continuation: () => [...academyKeys.all, "continuation"] as const,
  draft: (attemptId: string) => [...academyKeys.all, "attempt", attemptId, "draft"] as const,
  feedback: (attemptId: string, versionNumber: number) =>
    [...academyKeys.all, "attempt", attemptId, "feedback", versionNumber] as const,
  modelExamples: (textType?: TextType) => [...academyKeys.all, "model-examples", { textType }] as const,
  myProgress: () => [...academyKeys.all, "progress", "me"] as const,
  studentProgress: (studentId: string) => [...academyKeys.all, "progress", studentId] as const,
  studentUnitHistory: (studentId: string, unitId: string) =>
    [...academyKeys.all, "history", studentId, unitId] as const,
};
```

### 8.2 Tabla completa (los 23 endpoints de negocio; columna "Transporte" añadida — resolución AFR-F01)

| Endpoint | Transporte | Query Key | staleTime | gcTime | Invalidación disparada por | Prefetch | Retry | Optimistic |
|---|---|---|---|---|---|---|---|---|
| EP-13 `GET /units` | REST | `academyKeys.units(textType)` | 30s | 5min | EP-01, EP-06 (nueva unidad activa) | Sí, al entrar a P-01 | 2 | No |
| EP-14 `GET /units/{id}` | REST | `academyKeys.unit(id)` | 15s | 5min | EP-01, EP-06, EP-07, EP-05 | Sí, hover `UnitCard` | 2 | No |
| EP-01 `POST /units/{id}/attempts` | **Server Action** `startUnitAction` | mutación, sin key propia | — | — | invalida `unit(id)`, `units()`, `continuation()` | No aplica | 0 | No |
| EP-16 `GET /units/{id}/attempts` | REST | `academyKeys.unitAttempts(id)` | 15s | 5min | EP-01, EP-06 | No | 2 | No |
| EP-06 `POST /units/{id}/repetitions` | **Server Action** `repeatUnitAction` | mutación | — | — | invalida `unit(id)`, `units()`, `unitAttempts(id)`, `continuation()` | No | 0 | No |
| EP-07 `POST /units/{id}/teacher-overrides` | REST | mutación | — | — | invalida `unit(id)`, `studentProgress(studentId)` | No | 0 | No |
| EP-08 `POST /students/{id}/unit-recommendations` | REST | mutación | — | — | ninguna (RN-13, informativa) | No | 0 | No |
| EP-09 `POST /model-examples` | REST | mutación | — | — | invalida `modelExamples()` | No | 0 | No |
| EP-19 `GET /model-examples` | REST | `academyKeys.modelExamples(textType)` | **60s** (`Cache-Control` real) | 10min | EP-09, EP-10, EP-11 | Sí, al entrar a P-01 | 2 | No |
| EP-10 `PATCH /model-examples/{id}` | REST | mutación | — | — | invalida `modelExamples()` | No | 0 | No |
| EP-11 `DELETE /model-examples/{id}` | REST | mutación | — | — | invalida `modelExamples()` | No | 0 | No |
| EP-12 `GET /progress-summary` | REST | `academyKeys.myProgress()` | 30s | 5min | EP-01, EP-05, EP-06, EP-07 | No | 2 | No |
| EP-20 `GET /students/{id}/progress-summary` | REST | `academyKeys.studentProgress(id)` | 30s | 5min | EP-07, EP-08 | No | 2 | No |
| EP-15 `GET /continuation` | REST | `academyKeys.continuation()` | **0** | 5min | EP-01, EP-02, EP-03, EP-04, EP-05, EP-21, EP-22, EP-06 | Sí | 2 | No |
| EP-02 `PUT /attempts/{id}/draft` | **Server Action** `autosaveDraftAction` | invalida `draft(id)`, `continuation()` | — | — | — | No | **1** (silencioso) | **Sí** (único optimistic real) |
| EP-17 `GET /attempts/{id}/draft` | REST | `academyKeys.draft(id)` | 0 | 5min | EP-02 | Sí, al entrar a P-08 | 1 | No |
| EP-03 `POST /attempts/{id}/versions` | **Server Action** `submitVersionAction` | invalida `unit(id)`, `continuation()`, `feedback(id, versionNumber)` si `feedbackStatus===READY` | — | — | — | No | 0 | No |
| **EP-04 `PATCH /attempts/{id}/phase`** | **REST** (sin Server Action, §3.1) | `useAdvancePhase()`, mutación | — | — | invalida `continuation()`, `unit(id)` (el `currentStep` cambia) | No | 0 | No |
| EP-05 `POST /attempts/{id}/reflection` | REST | mutación | — | — | invalida `unit(id)`, `units()`, `continuation()`, `myProgress()` | No | 0 | No |
| EP-18 `GET /attempts/{id}/feedback` | REST | `academyKeys.feedback(id, versionNumber)` | 0 mientras `PROCESSING`, 5min si `READY` | 10min | — (polling propio) | No | 2 | No |
| EP-21 `PATCH /attempts/{id}/step` | **Server Action** `advanceStepAction` | invalida `continuation()` | — | — | — | No | 0 | No |
| EP-22 `POST /attempts/{id}/comprehension` | **Server Action** `verifyComprehensionAction` | invalida `continuation()` (solo si `satisfied===true`) | — | — | — | No | 0 | No |
| EP-23 `GET /students/{id}/units/{u}/history` | REST | `academyKeys.studentUnitHistory(id,u)` | 15s | 5min | EP-07 | No | 2 | No |

### 8.3 Polling de retroalimentación (EP-18) — mecanismo real ante la ausencia de notificaciones

El Frontend Contract v1.1 documenta el consumo de una notificación `ACADEMY_FEEDBACK_READY`, pero `features/notifications/` es scaffolding vacío sin lógica de producto. **Decisión congelada**: P-09 usa `useQuery` con `refetchInterval` condicional:

```ts
refetchInterval: (query) => query.state.data?.status === "PROCESSING" ? 5000 : false,
```

Con un techo duro de **3 minutos** (36 intentos de 5s), coherente con el límite máximo documentado (`timeout EP-03: 60s objetivo/3min máximo`). Al alcanzar el techo sin `READY`, se muestra un estado de error específico con reintento manual, nunca un error genérico.

### 8.4 Panel del Profesor (P-12) — sin endpoint de lote

`useStudentProgressSummary(studentId)` se invoca una vez por cada estudiante en `selectedStudentIds` mediante `useQueries` — nunca un `Promise.all` manual fuera de React Query.

### 8.5 Optimistic update de autoguardado (EP-02) — rollback, recuperación y sincronización (resolución de AFR2-04)

**Precisión necesaria sobre qué significa "optimistic" en este caso concreto**: a diferencia de un optimistic update clásico de React Query (que parchea `queryClient.setQueryData` antes de que la mutación resuelva, y lo revierte en `onError`), `useAutosaveDraft()` **no** parchea ninguna Query Key antes de tiempo. El contenido del `<textarea>` (`WritingEditor`, Sección 11.2) vive en estado local de React (`useState`), no en la caché de React Query — por lo tanto lo que el usuario ve mientras escribe **nunca depende de si la mutación de autosave ya resolvió o no**. "Optimistic" describe exclusivamente que la UI no bloquea ni espera la respuesta del servidor para seguir aceptando texto, no que exista un valor pre-escrito en caché que deba revertirse.

- **Estado visual durante la mutación**: `autosaveState` (prop de `WritingEditor`, Sección 11.2) pasa a `"saving"`; el `<textarea>` permanece editable, el usuario puede seguir escribiendo sin ninguna restricción.
- **Reintentos**: 1 reintento automático y silencioso si la mutación falla (ya documentado en la tabla de la Sección 8.2). El reintento reenvía el **último contenido conocido en el momento del reintento** (no necesariamente el mismo que falló, si el usuario siguió escribiendo mientras tanto), consistente con la regla de "cola de 1" ya definida en la Sección 9.
- **Rollback: deliberadamente NO existe, y se documenta explícitamente por qué.** No hay ningún valor que revertir: el contenido mostrado en pantalla es siempre el que el usuario tecleó, nunca un valor optimista escrito en una caché compartida. Si la mutación (incluido el reintento) falla definitivamente, **el texto tecleado permanece exactamente como está** — nunca se borra, nunca se sustituye por el último contenido guardado con éxito en el servidor.
- **Recuperación**: tras agotar el reintento único sin éxito, `autosaveState` pasa a `"error"` y permanece así (no se limpia automáticamente con un temporizador) hasta que ocurra el **siguiente intento de autosave real** — disparado por el próximo cambio de contenido tras el debounce de 2000ms (Sección 9). No existe un botón de "reintentar" manual específico para el autosave (a diferencia del reintento manual de EP-18/feedback en P-09, que sí lo tiene, Sección 8.3) — la naturaleza continua de la escritura ya genera reintentos naturales en cada pausa de tecleo.
- **Sincronización posterior**: en cuanto un intento de autosave (automático o el siguiente disparado por el usuario) resuelve con éxito, `autosaveState` vuelve a `"saved"` y `lastSavedAt` se actualiza con el timestamp devuelto por `autosaveDraftAction`.
- **Invalidación de caché**: únicamente en éxito, se invalidan `academyKeys.draft(attemptId)` y `academyKeys.continuation()` (ya documentado en la Sección 8.2). En fallo (incluido tras agotar el reintento), **no se invalida ni se modifica ninguna Query Key** — no hay nada que revertir porque nunca se escribió nada de forma optimista en la caché.
- **Cierre de pestaña con mutación pendiente/fallida**: `beforeunload` (Sección 11.2, `WritingEditor`) fuerza un último intento de `onAutosave` — si ese último intento también falla porque la pestaña se cierra antes de completarse, el contenido no persistido se pierde (limitación inherente a cualquier autosave sin Service Worker/almacenamiento local de respaldo, fuera de alcance de este Blueprint — no se propone una solución nueva, se documenta como limitación conocida).

---

## 9. Estrategia de formularios

| Formulario | Pantalla | Validación (Zod) | Notas |
|---|---|---|---|
| Verificación de comprensión | P-05 | `comprehensionResponse: z.string().min(1)` | El resultado se lee de `verifyComprehensionAction(...).satisfied` (Sección 3.1), **no** de un código de error — decisión congelada distinta de un flujo REST puro |
| Producir/Reescribir (Editor) | P-08 | `content: z.string().min(1)` (rango exacto de `WordCountRange` **no documentado numéricamente** — Sección 14) | Autosave usa `autosaveDraftAction` sin este schema (guardado continuo, no "envío"); solo el envío final (`submitVersionAction`) valida contra este schema |
| Reflexión | P-10 | `responses: z.array(z.string().min(1)).min(1)` | Número de preguntas no fijado en ningún documento (contenido, no estructura) |
| Anulación docente | P-13 | `{ action: z.enum(["FORCE_LOCK","FORCE_RESTART"]), reason: z.string().min(1) }` | Confirmación modal obligatoria antes de envío (UX §12 del Contract) |
| Recomendar unidad | P-13 | `{ unitId: z.string().uuid() }` | Selector cerrado de unidades elegibles |
| Alta/edición de Ejemplo Modelo | P-14 | `{ textType: z.enum([...5 valores]), content: z.string().min(1), rating: z.enum(["EXCELLENT","HAS_ERRORS"]), curatorialComment: z.string().min(1) }` (creación); edición: mismo schema `.partial()` en `content`/`curatorialComment` | Confirmación modal obligatoria antes de retirar |

**Manejo de errores de formulario**: `react-hook-form` con `zodResolver`; errores **client-side** inline (`aria-describedby`). Errores **server-side**: para operaciones REST, `422`/`409` capturados en `onError` y mapeados a `setError()` de RHF cuando `details.fieldErrors` los identifica por campo; para operaciones vía Server Action, la excepción capturada se normaliza primero (Sección 3.1) y luego sigue el mismo tratamiento. Sin `fieldErrors` disponibles (catálogo de `code` pendiente, Sección 14), se muestra el `message` genérico en un banner de formulario.

**Autosave (P-08, `WritingEditor`)**: debounce de 2000ms antes de disparar `useAutosaveDraft()` (→ `autosaveDraftAction`); mientras hay una mutación en vuelo, no se dispara una nueva (cola de 1). `AutosaveIndicator` refleja 4 estados: `idle`, `saving`, `saved (hace Xs)`, `error`.

**Confirmaciones obligatorias** (`Dialog` modal, nunca `window.confirm`): EP-07 (anulación docente), EP-11 (retirar ejemplo modelo).

**Estados de envío**: todo botón de envío usa 3 estados visuales (`idle → submitting → success/error`), nunca doble-envío posible (deshabilitado durante `isPending`).

---

## 10. Estrategia de componentes

| Categoría | Definición | Regla de ubicación |
|---|---|---|
| **Compartidos** (cross-feature, dentro de Academia) | Usados por ≥2 Feature Modules de Academia | `features/academy/components/shared/` |
| **Específicos** | Usados por un único Feature Module | `features/academy/components/<feature>/` |
| **Inteligentes (Container)** | Invocan hooks de datos (React Query/Zustand), manejan `isLoading/isError/data`, pasan props ya resueltas a sus hijos presentacionales | Sufijo `Container` en el nombre |
| **Presentacionales** | Reciben todo por props, cero hooks de datos, 100% testeables sin mocks de red | El resto |

**Justificación**: separar Container/Presentational permite testear la lógica visual (Sección 20) sin levantar React Query, y permite reutilizar `UnitCard`/`FeedbackObservationItem` en más de un Container.

**Resolución de AFR2-01 (`WritingEditor` / `ComprehensionGate`)**: AFR-002 detectó que estos dos componentes no tenían props suficientes para funcionar como presentacionales puros, pese a estar clasificados como tales. **Decisión congelada: se mantiene la Opción A — ambos siguen siendo presentacionales puros**, sin excepción a la regla de esta sección. Ninguno de los dos invoca `useQuery`/`useMutation` — reciben todos los datos, callbacks y estados de mutación ya resueltos desde `AttemptStepContainer` (Sección 10.1), que es quien invoca `useDraft`, `useAutosaveDraft`, `useSubmitVersion` y `useVerifyComprehension`. Sus props completas quedan especificadas en la Sección 11.2. Se eligió la Opción A (sobre reclasificarlos como Container) porque no requiere renombrar componentes, no añade entradas nuevas al catálogo de 8 Containers ya congelado (Sección 10.1), y es el cambio mínimo consistente con la regla ya existente de esta sección — la Opción B habría requerido actualizar el árbol de carpetas (Sección 4), el catálogo de Containers y todas las referencias cruzadas en las 15 pantallas.

### 10.1 Componentes Container — especificación completa (resolución de AFR-F03)

Cada Container documenta: responsabilidad, props, hooks utilizados, mutations, queries, estados, navegación, eventos, errores, responsive, accesibilidad.

#### `UnitMapContainer` (P-01)
- **Responsabilidad**: orquestar la carga del mapa de unidades y el banner de continuación, agrupar por `textType`.
- **Props**: `{ initialTextTypeFilter?: TextType }` (derivado de `searchParams` por la Page).
- **Hooks**: `useUnits(textType)`, `useContinuation()`, `useAcademyRole()`.
- **Mutations**: ninguna directa (delega inicio/repetición a P-02).
- **Queries**: EP-13, EP-15.
- **Estados**: Loading (skeleton agrupado), Empty, Success, Error, Offline, Retry (Sección 12, P-01).
- **Navegación**: renderiza `UnitCard` con `onSelect` → `router.push` a P-02; si `useContinuation()` no es null, banner → `AttemptStepPage` vía `STEP_TO_URL_SLUG`.
- **Eventos**: `onFilterChange(textType)` actualiza `searchParams` (URL State, Sección 7).
- **Errores**: banner con `message` + reintento manual (`refetch`).
- **Responsive**: grid 1/2/3-4 columnas (Sección 18).
- **Accesibilidad**: `<h2>` por sección de `textType`; ver Sección 17.

#### `UnitDetailContainer` (P-02)
- **Responsabilidad**: mostrar detalle de unidad y ejecutar inicio/repetición.
- **Props**: `{ unitId: string }`.
- **Hooks**: `useUnitDetail(unitId)`, `useStartUnit()`, `useRepeatUnit()`, `useContinuation()` (para decidir si "continuar" navega directo al paso real sin llamada adicional).
- **Mutations**: `useStartUnit()` → `startUnitAction` (Server Action); `useRepeatUnit()` → `repeatUnitAction` (Server Action).
- **Queries**: EP-14.
- **Estados**: Loading, Error, Forbidden (403 defensivo), Not Found (Sección 12, P-02).
- **Navegación**: tras iniciar/repetir con éxito → `AttemptStepPage` en `contextualize`; link a P-03.
- **Eventos**: `onStart()`, `onRepeat()`, `onViewHistory()`.
- **Errores**: `startUnitAction` propaga `ConflictException` normalizada (ya resuelta internamente por la propia Server Action reutilizando el intento activo existente, ver Sección 3.1 código) — el Container no necesita manejar ese caso especial, ya llega resuelto como éxito.
- **Responsive**: cabecera + acciones en columna (mobile) / cabecera + panel lateral (desktop).
- **Accesibilidad**: botón de acción primario como primer elemento enfocable tras el encabezado.

#### `AttemptStepContainer` (P-04 a P-10)
- **Responsabilidad**: despachar la UI correcta según el segmento `step` de la URL, validar que coincide con el `currentStep` real del intento, orquestar los hooks propios de cada sub-paso, y **pasar hacia sus hijos presentacionales (`WritingEditor`, `ComprehensionGate`) todos los datos, callbacks y estados de mutación ya resueltos** (resolución de AFR2-01 — ninguno de los dos hijos invoca un hook por sí mismo).
- **Props**: `{ attemptId: string; step: string }`.
- **Hooks**: `useContinuation()` (o `useUnitAttempts`/query puntual) para validar `currentStep` real vs `step` de URL; según el paso: `useAdvanceStep()`, `useVerifyComprehension()`, `useModelExamples()`, `useDraft()`, `useAutosaveDraft()`, `useSubmitVersion()`, `useFeedback()`, `useAdvancePhase()` (solo en P-09, ver más abajo), `useCompleteReflection()` (solo en P-10).
- **Mutations**: variable según `step` (ver tabla Sección 8.2/21).
- **Queries**: variable según `step`.
- **Estados**: Loading, Error, Forbidden, Not Found comunes a P-04–P-10; Empty solo no aplica; estados especiales propios de cada paso (Sección 12).
- **Navegación**: si `step` de la URL no coincide con `currentStep` real, redirige (`router.replace`) al slug correcto (`STEP_TO_URL_SLUG[currentStep]`) — nunca confía en la URL como fuente de verdad de progreso. En P-05, es este Container quien decide navegar a `.../observe` al recibir `satisfied===true` de `useVerifyComprehension()` — `ComprehensionGate` nunca navega por sí mismo. En P-08, es este Container quien navega a `.../feedback` tras `useSubmitVersion()` exitoso — `WritingEditor` nunca navega por sí mismo.
- **Eventos**: `onAdvance()` (delegado al hook correspondiente según `step`); en P-05, pasa `onVerify={(response) => useVerifyComprehension().mutate(...)}` a `ComprehensionGate`; en P-08, pasa `onAutosave`/`onSubmit` (ligados a `useAutosaveDraft()`/`useSubmitVersion()`) a `WritingEditor` (props completas de ambos, Sección 11.2).
- **Errores**: 409 si el paso real ya cambió (condición de carrera con otra pestaña) → mismo patrón de redirección.
- **Responsive**: `StepProgressTracker` compacto en mobile.
- **Accesibilidad**: foco automático + `aria-live` al cambiar de paso.

#### `ModelLibraryContainer` (P-11, y reutilizado dentro de P-06)
- **Responsabilidad**: listar ejemplos modelo filtrados por `textType`.
- **Props**: `{ textType?: TextType; readOnly: true }`.
- **Hooks**: `useModelExamples(textType)`.
- **Mutations**: ninguna (solo lectura para `STUDENT`).
- **Queries**: EP-19.
- **Estados**: Loading, Empty, Error (Sección 12, P-11).
- **Navegación**: ninguna hija (P-11) / vuelve al paso de origen (dentro de P-06).
- **Eventos**: `onFilterChange(textType)`.
- **Errores**: banner + reintento.
- **Responsive**: grid 1/2/3 columnas.
- **Accesibilidad**: cada `ModelExampleCard` navegable por teclado.

#### `AdminModelLibraryContainer` (P-14)
- **Responsabilidad**: CRUD completo de ejemplos modelo (incluye `RETIRED`).
- **Props**: ninguna (pantalla autocontenida).
- **Hooks**: `useModelExamples()` (sin filtrar por `status`), `useCreateModelExample()`, `useUpdateModelExample()`, `useRetireModelExample()`.
- **Mutations**: EP-09, EP-10, EP-11 (todas REST).
- **Queries**: EP-19.
- **Estados**: Loading, Empty, Error, 422 con `fieldErrors` (si el catálogo lo soporta, Sección 14).
- **Navegación**: ninguna, autocontenida.
- **Eventos**: `onCreate()`, `onEdit(id)`, `onRetire(id)` (con confirmación modal previa).
- **Errores**: banner de formulario si no hay `fieldErrors`.
- **Responsive**: grid de tarjetas editable + modal de formulario.
- **Accesibilidad**: formulario con validación inline; `Dialog` con foco atrapado antes de retirar.

#### `TeacherPanelContainer` (P-12)
- **Responsabilidad**: exponer selección múltiple de estudiantes y su progreso agregado.
- **Props**: ninguna.
- **Hooks**: `useStudentProgressSummary(studentId)` (×N vía `useQueries`), store Zustand de `selectedStudentIds`.
- **Mutations**: ninguna directa.
- **Queries**: EP-20 (×N).
- **Estados**: Loading por fila, Empty (sin selección), Error por fila individual, Forbidden parcial (Sección 12, P-12 — bloqueador funcional documentado en Sección 14/22).
- **Navegación**: cada `StudentProgressRow` → P-13.
- **Eventos**: `onToggleStudent(studentId)`, `onSelectAll()`/`onClearAll()`.
- **Errores**: aislados por fila, no bloquean el resto.
- **Responsive**: tabla → tarjetas apiladas en mobile.
- **Accesibilidad**: checkboxes reales, `aria-selected`.

#### `StudentDetailContainer` (P-13)
- **Responsabilidad**: mostrar progreso de un estudiante y ejecutar acciones docentes.
- **Props**: `{ studentId: string }`.
- **Hooks**: `useStudentProgressSummary(studentId)`, `useApplyTeacherOverride()`, `useAssignUnitToStudent()`.
- **Mutations**: EP-07, EP-08 (ambas REST).
- **Queries**: EP-20.
- **Estados**: Loading, Empty, Error, Forbidden (completo de pantalla — estado más probable en producción hoy, Sección 14), Not Found.
- **Navegación**: link a P-15 por unidad.
- **Eventos**: `onOverride(unitId, action, reason)`, `onRecommend(unitId)` — ambos abren `Dialog` de confirmación antes de mutar. Pasa a `TeacherOverrideDialog`/`RecommendUnitDialog` (Sección 11.2) sus props ya resueltas (`onConfirm`, `isSubmitting`, `submitError`) — ninguno de los dos diálogos invoca hooks por sí mismo (resolución de AFR4-02). `eligibleUnits` de `RecommendUnitDialog` no tiene hoy una fuente de datos real (Sección 11.2, nota de gap) — comparte el bloqueador de la Sección 14, ítem 1.
- **Errores**: 409 en `FORCE_RESTART` sobre unidad no terminal → mensaje directo (sin restricción de "lenguaje formativo", exenta para paneles docentes).
- **Responsive**: columna en mobile; `Tabs` opcional en desktop si el contenido lo amerita (decisión de detalle no bloqueante).
- **Accesibilidad**: diálogos con focus trap y devolución de foco al cerrar.

#### `StudentUnitHistoryContainer` (P-15)
- **Responsabilidad**: mostrar historial completo de intentos+versiones+feedback de una unidad de un estudiante, solo lectura.
- **Props**: `{ studentId: string; unitId: string }`.
- **Hooks**: `useStudentUnitHistory(studentId, unitId)`.
- **Mutations**: ninguna (solo lectura).
- **Queries**: EP-23.
- **Estados**: Loading, Empty (unidad sin intentos, no error), Error, Forbidden (mismo gap de P-12/P-13), Not Found.
- **Navegación**: entra desde P-13, sin hijos.
- **Eventos**: `onToggleAttempt(attemptId)` si se implementa como accordion (mobile).
- **Errores**: banner + reintento.
- **Responsive**: accordion en mobile, expandido en desktop.
- **Accesibilidad**: `aria-expanded`/`aria-controls` si es colapsable.

### 10.2 Componentes presentacionales/atómicos — sin cambios respecto a v1.0, con adiciones (resolución de AFR-F03)

Ver Sección 11 para el catálogo completo (incluye ahora `AttemptActionButton`, `StepContentPanel`, `StepAdvanceButton`, `AttemptHistoryList`/`Row`, `TextTypeSectionHeader`, `SubmitButton` y la variante editable de `ModelExampleCard`, previamente solo nombrados sin especificación en v1.0).

---

## 11. Design System específico de Academia

### 11.1 Extensión obligatoria de `components/ui/` (fuera de `features/academy/`, porque son primitivos genéricos de plataforma, no de Academia)

El Design System actual (`Button, Card, ProgressBar, Avatar, Skeleton, Badge`) es insuficiente — construido únicamente para Dashboard. Academia requiere, como precondición de la Fase 1 (Sección 23):

| Componente nuevo | Necesario para |
|---|---|
| `Input` | Formularios (P-13, P-14) |
| `Textarea` | `WritingEditor` (P-08), reflexión (P-10) |
| `Select` | Filtro `textType` (P-01, P-11, P-14), selector de acción docente (P-13) |
| `Dialog` | `TeacherOverrideDialog`, `RecommendUnitDialog`, confirmaciones (P-11, P-13) |
| `Checkbox` | `MultiSelectToolbar` (P-12) |
| `Tabs` | Si P-13 requiere separar secciones (unidades / historial / acciones) |
| `Toast`/`Alert` | Confirmación de acciones asíncronas |
| `Tooltip` | Explicación de badges de estado, para accesibilidad |

### 11.2 Componentes específicos de Academia (`features/academy/components/`) — plantilla completa

#### `UnitCard`
- **Responsabilidad**: representar una unidad en el mapa (P-01) o en listados de progreso.
- **Props**: `{ unit: AcademyUnitSummaryHttp; onSelect: (unitId: string) => void }`.
- **Variantes**: por `state` (8 variantes, tokens `primary/success/warning/neutral`: `LOCKED`→`neutral`, `UNLOCKED`→`primary`, `IN_PROGRESS`/`AWAITING_FEEDBACK`/`REVISION`/`REFLECTION`→`warning`, `COMPLETED`/`MASTERED`→`success` + ícono distintivo).
- **Estados**: normal, hover, focus-visible, disabled (si `LOCKED`).
- **Eventos**: `onClick` → navega a P-02.
- **Accesibilidad**: `<Link>` real; texto accesible completo; icono + texto siempre acompañan el color (WCAG 1.4.1).
- **Responsive**: grid 1/2/3-4 columnas.
- **Casos borde**: `activeAttemptId` presente pero `state` no refleja aún el cambio — confía ciegamente en `state`, nunca heurísticas propias.

#### `RecommendationBadge`
- **Responsabilidad**: indicar unidad recomendada por un profesor.
- **Props**: `{ isRecommended: boolean }`.
- **⚠️ Nota de gap**: `isRecommended` nunca llega en `true` desde el backend real hoy (Sección 5.1) — implementado completo, sin caso de uso observable en producción hasta cerrar ese gap.

#### `StepProgressTracker`
- **Responsabilidad**: mostrar los 11 pasos y cuál está activo, dentro de P-04 a P-10.
- **Props**: `{ currentStep: UnitStep }`.
- **Variantes**: completado / activo / futuro / (COMPREHEND con sub-estado "verificación pendiente").
- **Accesibilidad**: `aria-current="step"`, lista semántica `<ol>`.
- **Responsive**: horizontal scroll con snap en mobile.

#### `AutosaveIndicator` / `WordCountIndicator` / `ProcessingIndicator`
- Atómicos, sin estado propio — `aria-live="polite"`.

#### `ComprehensionGate` (P-05) — props completas (resolución de AFR2-01)
- **Responsabilidad**: formulario de verificación de comprensión, 100% presentacional — nunca invoca `useVerifyComprehension()` ni ningún otro hook de datos; recibe todo resuelto de `AttemptStepContainer`.
- **Props**:
  ```ts
  interface ComprehensionGateProps {
    onVerify: (comprehensionResponse: string) => void; // ligado a useVerifyComprehension().mutate en el Container
    isSubmitting: boolean;                              // useVerifyComprehension().isPending
    isInsufficient: boolean;                             // true cuando el último resultado fue satisfied===false
    submitError: AcademyErrorHttp | null;                 // solo fallos reales de la Server Action (nunca el caso "insuficiente", que no es un error — Sección 3.1)
  }
  ```
- **Estados**: `idle`, `submitting` (`isSubmitting===true`), `insufficient` (`isInsufficient===true`, mensaje formativo, nunca lenguaje de fracaso), `error` (`submitError!==null`).
- **Eventos**: `onSubmit` interno del formulario → llama a `props.onVerify(comprehensionResponse)`. El componente **no decide** cuándo ha "pasado" ni navega — al recibir `satisfied===true`, es `AttemptStepContainer` quien navega a `.../observe` (Sección 10.1); `ComprehensionGate` simplemente deja de renderizarse en ese momento.
- **Casos borde**: reintentos ilimitados (sin límite documentado); `isInsufficient` se resetea a `false` en cuanto el usuario modifica el campo tras un resultado insuficiente (para no mostrar el mensaje formativo sobre una respuesta ya editada).

#### `WritingEditor` (P-08, reutilizado `produce`/`rewrite`) — props completas (resolución de AFR2-01)
- **Responsabilidad**: edición de texto largo con autosave y envío final, 100% presentacional — nunca invoca `useAutosaveDraft()`/`useSubmitVersion()` directamente; recibe todo resuelto de `AttemptStepContainer`. El único estado que gestiona internamente es el contenido tecleado (local, vía `useState`/`useRef`) y el debounce de 2000ms (Sección 7/9) — ninguno de los dos es un hook de datos, por lo que no viola la regla de la Sección 10.
- **Props**:
  ```ts
  interface WritingEditorProps {
    attemptId: string;
    initialContent: string;
    mode: "produce" | "rewrite";
    onAutosave: (content: string) => void;       // ligado a useAutosaveDraft().mutate; invocado tras el debounce interno
    autosaveState: "idle" | "saving" | "saved" | "error"; // derivado de useAutosaveDraft().isPending/isSuccess/isError en el Container
    lastSavedAt: string | null;                   // para "guardado hace Xs" en AutosaveIndicator
    onSubmit: (content: string) => void;          // ligado a useSubmitVersion().mutate
    isSubmitting: boolean;                        // useSubmitVersion().isPending
    submitError: AcademyErrorHttp | null;         // useSubmitVersion().error, normalizado (Sección 3.1)
  }
  ```
- **Estados**: `editing` (siempre activo mientras se escribe), `saving` (`autosaveState==="saving"`), `submitting` (`isSubmitting===true`), `submitted` (tras `onSubmit` exitoso, el Container navega y desmonta el editor).
- **Conteo de palabras/caracteres**: calculado **localmente** a partir del contenido tecleado (`utils/formatWordCount`, Sección 4), nunca leído de `DraftHttp` — así el contador refleja lo que el usuario ve en cada tecleo, sin depender de que el autosave ya haya resuelto.
- **Detección de offline**: gestionada internamente mediante los eventos nativos `online`/`offline` del navegador (no es un hook de datos, no viola la regla de la Sección 10); al perder conexión, se muestra el banner Offline (Sección 12, P-08) y se reintenta el autosave pendiente al reconectar.
- **Accesibilidad**: `<textarea>` con `aria-describedby` apuntando a `WordCountIndicator`/`AutosaveIndicator`.
- **Casos borde**: `beforeunload` invoca `props.onAutosave(content)` una última vez para forzar el flush del debounce antes de cerrar la pestaña.

#### `SubmitButton`
- **Responsabilidad**: botón de envío final del `WritingEditor`, con los 3 estados de envío estándar (Sección 9).
- **Props**: `{ isSubmitting: boolean; disabled: boolean; onSubmit: () => void }`.
- **Variantes**: primaria (Design Tokens `primary`), deshabilitada mientras `content` está vacío o `isSubmitting`.
- **Estados**: `idle`, `submitting` (spinner + disabled), `disabled` (contenido vacío).
- **Accesibilidad**: `aria-busy="true"` mientras `isSubmitting`.
- **Responsive**: ancho completo en mobile, ancho de contenido en desktop.
- **Casos borde**: doble-clic no debe disparar doble envío (garantizado por `disabled` durante `isPending`).

#### `AttemptActionButton` (P-02)
- **Responsabilidad**: botón único de acción principal de la unidad — su texto/acción cambia según `state`+`activeAttemptId`.
- **Props**: `{ unit: AcademyUnitDetailHttp; onStart: () => void; onContinue: () => void; onRepeat: () => void }`.
- **Variantes**: "Comenzar" (`UNLOCKED` sin intento activo), "Continuar" (`activeAttemptId` presente), "Repetir" (`repeatable===true`, `COMPLETED`/`MASTERED`).
- **Estados**: `idle`, `submitting` (durante `useStartUnit`/`useRepeatUnit`), `disabled` (`LOCKED`).
- **Accesibilidad**: texto accesible explícito con la acción real (nunca solo un ícono).
- **Responsive**: ancho completo en mobile.
- **Casos borde**: `LOCKED` con intento previo (repetición histórica no vigente) — prevalece "bloqueada" sobre cualquier otra variante.

#### `StepContentPanel` (P-04, P-06, P-07)
- **Responsabilidad**: renderizar el contenido editorial/pedagógico de un paso sin gate.
- **Props**: `{ step: UnitStep }`.
- **⚠️ Nota de gap** (ya documentada en Sección 14, ítem 3): la fuente del contenido no está definida en ningún contrato — este componente queda especificado estructuralmente (recibe `step`, renderiza contenido) pero **sin fuente de datos real** hasta que se tome esa decisión de producto.
- **Estados**: `loading` (mientras se resuelva la fuente de contenido, cuando exista), `loaded`.
- **Accesibilidad**: contenido dentro de `<article>`/`<section>` semántico.
- **Responsive**: ancho completo, tipografía limitada a `max-width` de lectura (Sección 18, breakpoint `xl`).

#### `StepAdvanceButton` (P-04, P-06, P-07)
- **Responsabilidad**: disparar `useAdvanceStep()` (→ `advanceStepAction`, Sección 3.1) y navegar al siguiente slug.
- **Props**: `{ attemptId: string; onAdvanced: (nextStep: UnitStep) => void }`.
- **Estados**: `idle`, `submitting`.
- **Accesibilidad**: único punto de acción, foco predecible.
- **Responsive**: ancho completo en mobile.
- **Casos borde**: doble-clic protegido por `disabled` durante `isPending`.

#### `AttemptHistoryList` / `AttemptHistoryRow` (P-03, reutilizado parcialmente en P-15 vía `StudentUnitHistoryContainer`)
- **Responsabilidad**: listar intentos de una unidad, solo lectura.
- **Props** `AttemptHistoryRow`: `{ attempt: AttemptSummaryHttp }`.
- **Variantes**: fila `isCurrent===true` resaltada.
- **Casos borde**: `versionCount` no disponible (Sección 5.2) — la fila no lo muestra, no se inventa.
- **Accesibilidad**: `<table>`/`<th scope="col">` si es tabla; `<ul>`/`<li>` si son tarjetas (mobile).
- **Responsive**: tabla → tarjetas en mobile.

#### `TextTypeSectionHeader` (P-01)
- **Responsabilidad**: encabezado de sección agrupando `UnitCard` por `textType`.
- **Props**: `{ textType: TextType; count: number }`.
- **Accesibilidad**: `<h2>` real, no `<div>` estilizado.
- **Responsive**: sticky al hacer scroll dentro de su sección (mobile).

#### `VersionWithFeedbackPanel` / `FeedbackObservationItem`
- **Responsabilidad**: mostrar una versión enviada junto a su retroalimentación, ordenada macro→micro (Sección 6.5). Reutilizado en P-09 y P-15.
- **Props** `FeedbackObservationItem`: `{ category: FeedbackCategory; strength: "STRENGTH"|"WEAKNESS"; explanation: string; suggestion: string }`.
- **Variantes**: `STRENGTH` (`success`) vs `WEAKNESS` (`warning`, nunca `danger`).

#### `TeacherOverrideDialog` (P-13) — props completas (resolución de AFR4-02)
- **Responsabilidad**: diálogo modal de confirmación en dos pasos para aplicar una anulación docente (`FORCE_LOCK`/`FORCE_RESTART`) sobre una unidad. 100% presentacional — **nunca invoca `useApplyTeacherOverride()`**; los hooks y la mutación permanecen exclusivamente en `StudentDetailContainer` (Sección 10.1), que es quien los posee y quien pasa todo ya resuelto vía props.
- **Props**:
  ```ts
  interface TeacherOverrideDialogProps {
    isOpen: boolean;
    unitId: string;
    onClose: () => void;
    onConfirm: (input: { unitId: string; action: "FORCE_LOCK" | "FORCE_RESTART"; reason: string }) => void; // ligado a useApplyTeacherOverride().mutate en el Container
    isSubmitting: boolean;                     // useApplyTeacherOverride().isPending
    submitError: AcademyErrorHttp | null;      // useApplyTeacherOverride().error, normalizado
  }
  ```
  Nota de ownership: el llamador (`StudentDetailContainer`) invoca `useApplyTeacherOverride()`, y pasa `onConfirm={(input) => mutate(input)}`, `isSubmitting={isPending}`, `submitError={error}` — el diálogo nunca conoce React Query. La apertura (`isOpen`) también la controla el Container como estado local propio (Sección 7: "Apertura/cierre de diálogos... Local State del componente contenedor que lo abre").
- **Estado local del diálogo**: únicamente el estado del propio formulario controlado (react-hook-form: `action` seleccionado, `reason` tecleado) y el paso de confirmación interno del componente (`"form" | "confirming"` — primero se completa el formulario, luego se exige una confirmación explícita adicional antes de invocar `onConfirm`, cumpliendo la "confirmación de dos pasos" del Frontend Contract §12).
- **Estados**: `idle` (formulario en blanco, sin envío en curso), `submitting` (`isSubmitting===true`), `success` (no se renderiza ningún estado visual propio de "éxito" dentro del diálogo — al resolver `onConfirm` con éxito, `StudentDetailContainer` invoca `onClose` en su propio `onSuccess` de `useApplyTeacherOverride()`, cerrando el diálogo inmediatamente; la confirmación visual de éxito la muestra la pantalla P-13, no el diálogo), `error` (`submitError !== null`, banner interno, el diálogo permanece abierto para permitir reintentar).
- **Eventos**: `onOpen` (disparado por el Container, no es responsabilidad del diálogo — Sección 7); `onClose` (cierra el diálogo sin confirmar — cubre tanto "cerrar" vía ícono/`Esc`/click fuera del modal como "cancelar" vía el botón explícito "Cancelar": **es el mismo callback en ambos casos**, no existen dos callbacks distintos, ya que ambas acciones tienen idéntico efecto — descartar el formulario sin mutar); `onConfirm` (dispara la mutación solo tras el paso de confirmación explícita).
- **Errores**: `submitError` se renderiza como banner dentro del propio diálogo (el diálogo no se cierra automáticamente en error, para permitir reintentar sin perder lo ya tecleado).
- **Loading**: mientras `isSubmitting===true`, los botones de confirmar/cancelar quedan deshabilitados (`aria-busy="true"` en el botón de confirmar).
- **Accesibilidad**: focus trap dentro del `Dialog` (`components/ui/Dialog`, Sección 11.1); foco inicial en el primer campo del formulario al abrir; devolución de foco al elemento que disparó la apertura al invocar `onClose`.
- **Responsive**: modal a ancho completo en mobile; ancho fijo centrado en desktop (mismo patrón que el resto de `Dialog` del proyecto).
- **Casos borde**: cierre del diálogo (`onClose`) mientras `isSubmitting===true` — no permitido, `onClose` debe ignorarse mientras la mutación está en curso (mismo criterio que "deshabilitado durante `isPending`" ya usado en toda la Sección 9); reapertura del diálogo tras un `error` previo — el formulario se reinicia en blanco, `submitError` se limpia.

#### `RecommendUnitDialog` (P-13) — props completas (resolución de AFR4-02)
- **Responsabilidad**: diálogo modal de confirmación en dos pasos para recomendar una unidad a un estudiante (RN-13 — nunca cambia `UnitState`, es puramente informativo). 100% presentacional — **nunca invoca `useAssignUnitToStudent()`**; el hook y la mutación permanecen exclusivamente en `StudentDetailContainer`.
- **Props**:
  ```ts
  interface RecommendUnitDialogProps {
    isOpen: boolean;
    studentId: string;
    eligibleUnits: AcademyUnitSummaryHttp[]; // ver nota de gap abajo
    onClose: () => void;
    onConfirm: (input: { studentId: string; unitId: string }) => void; // ligado a useAssignUnitToStudent().mutate en el Container
    isSubmitting: boolean;                    // useAssignUnitToStudent().isPending
    submitError: AcademyErrorHttp | null;     // useAssignUnitToStudent().error, normalizado
  }
  ```
- **⚠️ Nota de gap (misma naturaleza que Sección 14, ítem 1)**: `eligibleUnits` es la lista de unidades del estudiante entre las cuales el profesor elige cuál recomendar. **Hoy no existe, en ninguno de los 24 hooks de la Sección 13, ninguna Query que devuelva esa lista** — `useStudentProgressSummary(studentId)` solo retorna conteos agregados (`unitsByState`/`unitsByTextType`), no unidades individuales con `unitId`. Esta prop queda especificada estructuralmente (el diálogo la recibe y renderiza un selector cerrado, Sección 9), pero `StudentDetailContainer` no tiene hoy ninguna fuente de datos real para poblarla — comparte exactamente el mismo bloqueador funcional ya documentado en la Sección 14 (ítem 1: falta de un endpoint del módulo de Organización Académica), extendido aquí a nivel de unidad y no solo de listado de estudiantes. No se inventa ningún endpoint nuevo para resolverlo.
- **Estado local**: selección del `unitId` dentro del selector cerrado, y el mismo patrón de confirmación en dos pasos que `TeacherOverrideDialog`.
- **Estados**: idénticos a `TeacherOverrideDialog` (`idle`, `submitting`, `success` — cierre inmediato vía `onClose` desde el `onSuccess` del Container, sin estado visual propio de éxito —, `error`).
- **Eventos**: idénticos a `TeacherOverrideDialog` — `onClose` cubre tanto "cerrar" como "cancelar" (mismo callback, mismo efecto); `onConfirm` solo tras el paso de confirmación explícita.
- **Errores/Loading/Accesibilidad/Responsive**: idénticos a `TeacherOverrideDialog`.
- **Casos borde**: mismos que `TeacherOverrideDialog` (`onClose` ignorado durante `isSubmitting`, formulario reiniciado tras error); adicionalmente, si `eligibleUnits` llega vacío (gap ya documentado arriba), el selector se muestra deshabilitado con un estado informativo, nunca un error.

#### `MultiSelectToolbar` (P-12)
- **Responsabilidad**: exponer la selección múltiple de estudiantes (mecanismo exclusivo de Frontend, sin respaldo de endpoint de lote — Sección 8.4).
- **Estado**: Zustand (`selectedStudentIds`).

#### `ModelExampleCard` (P-06, P-11, P-14) — resolución de ambigüedad (AFR4-03)
- **Decisión congelada: un único componente, con `onEdit`/`onRetire` opcionales** (Opción A — menor cambio respecto a la especificación existente; no requiere dividir el componente, renombrar archivos, ni tocar el árbol de la Sección 4).
- **Responsabilidad**: presentar un ejemplo modelo; si se le pasan `onEdit`/`onRetire`, además expone las acciones de edición/retiro (uso exclusivo de P-14/`AdminModelLibraryContainer`).
- **Props**:
  ```ts
  interface ModelExampleCardProps {
    example: ModelExampleHttp;
    onEdit?: (id: string) => void;    // presente únicamente cuando el llamador es AdminModelLibraryContainer (P-14)
    onRetire?: (id: string) => void;  // idem — ambos se pasan juntos o ninguno, nunca uno solo
  }
  ```
- **Regla de renderizado**: si `onEdit`/`onRetire` están definidos, se renderizan los controles de edición/retiro; si están `undefined` (caso de P-06/P-11, `ModelLibraryContainer`), la tarjeta se renderiza en modo exclusivamente de lectura, sin ningún control adicional.
- **Variantes**: `rating` (`EXCELLENT`/`HAS_ERRORS`, tono visual distinto), `status` (`ACTIVE`/`RETIRED` — `RETIRED` solo es visible en la práctica cuando `onEdit`/`onRetire` están presentes, ya que P-06/P-11 solo reciben ejemplos `ACTIVE` del backend, Sección 12).
- **Accesibilidad**: navegable por teclado; contenido largo con expansión accesible (`<details>` o equivalente).
- **Responsive**: grid 1/2/3 columnas.
- **Casos borde**: con `onEdit`/`onRetire` presentes, sobre un ejemplo ya `RETIRED` — el control de retiro se oculta/deshabilita (no tiene sentido retirar dos veces).

---

## 12. Las 15 pantallas

*(Plantilla idéntica en las 15. Se añade el campo "Unauthorized" en todas — resolución AFR-F06 — y se corrige P-09 para incluir explícitamente EP-04 — resolución AFR-F02.)*

### P-01 — Mapa de unidades

- **Objetivo**: mostrar todas las unidades de Academia del estudiante autenticado, agrupadas por `textType`, permitiendo iniciar la navegación hacia cualquier unidad no bloqueada.
- **Usuario**: Estudiante.
- **Ruta**: `/academy` → `app/[locale]/(app)/academy/page.tsx`.
- **Permisos**: `STUDENT` (rol resuelto vía `useAcademyRole()`, Sección 15.1). Si el rol resuelto es `TEACHER`/`ADMIN`, redirigir a `/academy/teacher` o `/academy/admin/model-examples` respectivamente.
- **Layout**: `StudentAcademyLayout` (Sección 4).
- **Endpoint(s)**: EP-13 `GET /units` (opcionalmente `?textType=`), EP-15 `GET /continuation` (ambos REST).
- **Command(s)**: ninguno.
- **Query(s)**: `ListAcademyUnitsForStudentQuery`, `GetContinuationStateQuery`.
- **DTOs consumidos**: `AcademyUnitSummaryHttp[]` + `meta: PaginationMeta`; `ContinuationStateHttp | null`.
- **Componentes**: `UnitMapContainer`, `UnitCard`×N, `UnitStatusBadge`, `RecommendationBadge`, `TextTypeSectionHeader`.
- **Hooks**: `useUnits(textType?)`, `useContinuation()`.
- **Estados**:
  - **Loading**: 6-8 `Skeleton` con la forma de `UnitCard`, agrupados bajo `TextTypeSectionHeader` esqueleto.
  - **Empty**: caso teórico (matriculación fuera de alcance de Academia) — mensaje "Tu plan de unidades se está preparando", sin acción, nunca un error.
  - **Success**: grid completo agrupado por `textType`.
  - **Error**: banner con `message` del `AcademyErrorHttp` + botón "Reintentar".
  - **Unauthorized**: N/A a nivel de pantalla — gestionado por `middleware.ts` (Clerk), ningún usuario sin sesión llega a renderizar esta pantalla (Sección 15.1).
  - **Forbidden**: no aplica en esta pantalla.
  - **Not Found**: no aplica (ruta estática sin parámetros).
- **Responsive**: grid 1 col (mobile) / 2 (tablet) / 3-4 (desktop); `TextTypeSectionHeader` sticky en mobile.
- **Accesibilidad**: `<h2>` por sección; cada `UnitCard` con área de toque ≥44×44px (WCAG 2.5.5); orden de tabulación = orden visual.
- **Navegación**: entra desde Dashboard; si `useContinuation()` no es null, banner "Continuar donde quedaste" → navega directo al paso vía `STEP_TO_URL_SLUG`. Sin breadcrumbs (pantalla raíz de Academia, Sección 19).
- **Casos borde**: `activeAttemptId` no-null pero `state` aún `UNLOCKED` (ventana de invalidación) — se resuelve solo con la invalidación de EP-01/`startUnitAction`.
- **Riesgos**: `isRecommended` nunca `true` en la práctica (gap 5.1).
- **Dependencias**: `useAcademyRole()` debe resolver antes de decidir renderizar o redirigir.
- **Tests futuros**: unit tests de `UnitCard` por cada variante de `state`; integration test de `UnitMapContainer` con MSW; E2E "estudiante ve su mapa y navega a una unidad UNLOCKED".
- **Criterios de aceptación**:
  1. Given un estudiante autenticado, When navega a `/academy`, Then ve sus unidades agrupadas por `textType` con el `UnitState` de cada una reflejado visualmente (color + ícono + texto, nunca solo color).
  2. Given que `useContinuation()` retorna un estado no-null, When la pantalla carga, Then se muestra un banner "Continuar donde quedaste" que navega directo al paso real del intento activo.
  3. Given que el rol resuelto es `TEACHER` o `ADMIN`, When se intenta acceder a `/academy`, Then se redirige a `/academy/teacher` o `/academy/admin/model-examples` sin renderizar el mapa.
  4. Given que EP-13 falla, When ocurre el error, Then se muestra un banner con el `message` del error y un botón "Reintentar" que vuelve a ejecutar la query.

### P-02 — Detalle de unidad

- **Objetivo**: mostrar el estado completo de una unidad específica y las acciones disponibles (iniciar, continuar, repetir, ver historial).
- **Usuario**: Estudiante.
- **Ruta**: `/academy/units/[unitId]`.
- **Permisos**: `STUDENT`, propiedad verificada por backend (H-01 remediado, sin validación de runtime — Sección 1.5).
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-14 `GET /units/{unitId}` (REST). **Command(s) vía Server Action**: `startUnitAction(unitId)` (EP-01), `repeatUnitAction(unitId)` (EP-06) — Sección 3.1.
- **Query(s)**: `GetAcademyUnitDetailQuery`.
- **DTOs consumidos**: `AcademyUnitDetailHttp`; respuesta de acción: `AttemptSummaryHttp`.
- **Componentes**: `UnitDetailContainer`, `UnitStatusBadge`, `AttemptActionButton`.
- **Hooks**: `useUnitDetail(unitId)`, `useStartUnit()`, `useRepeatUnit()`.
- **Estados**:
  - **Loading**: skeleton de cabecera + botón deshabilitado.
  - **Empty**: no aplica.
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware (igual que P-01).
  - **Forbidden**: 403 (defensivo, no debería ocurrir tras H-01) → "No tienes acceso a esta unidad", sin revelar existencia.
  - **Not Found**: `404` → `notFound()`.
- **Responsive**: columna única (mobile); cabecera + panel lateral (desktop).
- **Accesibilidad**: `AttemptActionButton` primer elemento enfocable tras el encabezado.
- **Navegación**: `AttemptActionButton` → si activo, navega al paso real (`useContinuation()`); si no, `startUnitAction` → primer paso. Link a P-03. Breadcrumb: `Academia / {Unidad}` (Sección 19).
- **Casos borde**: `startUnitAction` sobre unidad `LOCKED` — botón deshabilitado client-side; 409 si se fuerza igual (defensa en profundidad).
- **Riesgos**: ninguno adicional a P-01.
- **Dependencias**: P-01 (entrada), P-03 (salida).
- **Tests futuros**: unit test de `AttemptActionButton`; integration test "iniciar unidad → redirige al primer paso" (mockeando la Server Action, no un endpoint HTTP).
- **Criterios de aceptación**:
  1. Given una unidad `UNLOCKED` sin `activeAttemptId`, When se presiona el botón de acción principal, Then se invoca `startUnitAction(unitId)` y, en éxito, navega a `.../contextualize`.
  2. Given una unidad con `activeAttemptId` no nulo, When se accede a P-02, Then `AttemptActionButton` muestra "Continuar" en vez de "Comenzar".
  3. Given una unidad `state: LOCKED`, When se renderiza P-02, Then el botón de acción está deshabilitado y el bloqueo se comunica también por texto, no solo por color/disabled.
  4. Given que el backend responde `403`, When ocurre, Then se muestra "No tienes acceso a esta unidad" sin revelar si la unidad existe.
  5. Given que el backend responde `404`, When ocurre, Then se invoca `notFound()` de Next.js.

### P-03 — Historial de intentos

- **Objetivo**: listar todos los intentos históricos de una unidad (solo lectura).
- **Usuario**: Estudiante.
- **Ruta**: `/academy/units/[unitId]/history`.
- **Permisos**: `STUDENT`, mismo criterio de propiedad que P-02.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-16 `GET /units/{unitId}/attempts` (REST).
- **Command(s)**: ninguno.
- **Query(s)**: `GetAttemptHistoryQuery`.
- **DTOs consumidos**: `AttemptSummaryHttp[]` + `meta`.
- **Componentes**: `AttemptHistoryList`, `AttemptHistoryRow`.
- **Hooks**: `useUnitAttempts(unitId)`.
- **Estados**:
  - **Loading**: lista de `Skeleton` tipo fila.
  - **Empty**: "Todavía no hay intentos registrados para esta unidad".
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden**: igual que P-02.
  - **Not Found**: igual que P-02.
- **Responsive**: tabla colapsa a tarjetas en mobile.
- **Accesibilidad**: `<table>`/`<th scope="col">` o `<ul>`/`<li>`.
- **Navegación**: breadcrumb `Academia / {Unidad} / Historial` (Sección 19); sin drill-down adicional requerido.
- **Casos borde**: `versionCount` no disponible (gap 5.2).
- **Riesgos**: ninguno nuevo.
- **Dependencias**: P-02.
- **Tests futuros**: unit test de `AttemptHistoryRow`; integration test de Empty vs poblado.
- **Criterios de aceptación**:
  1. Given una unidad sin ningún intento registrado, When se accede a P-03, Then se muestra el estado Empty ("Todavía no hay intentos registrados"), nunca un error.
  2. Given una unidad con N intentos, When EP-16 resuelve, Then se listan las N filas con `currentStep`, `startedAt` e `isCurrent`, sin mostrar `versionCount` (dato no disponible, Sección 5.2).
  3. Given un intento con `isCurrent: true`, When se renderiza la lista, Then esa fila queda visualmente distinguida del resto.

### P-04 — Pasos previos a producción (Contextualizar / Definir objetivos)

- **Objetivo**: presentar contenido introductorio de la unidad y permitir avanzar libremente entre estos dos pasos sin gate de validación.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/[step]` con `step ∈ {contextualize, define-objectives}`.
- **Permisos**: `STUDENT`, propiedad verificada por backend.
- **Layout**: `StudentAcademyLayout`.
- **Command(s) vía Server Action**: `advanceStepAction(attemptId)` (EP-21) — Sección 3.1.
- **Query(s)**: ninguno propio (gap de contenido editorial, Sección 14 ítem 3).
- **DTOs consumidos**: `AttemptSummaryHttp` (respuesta de `advanceStepAction`).
- **Componentes**: `AttemptStepContainer`, `StepProgressTracker`, `StepContentPanel`, `StepAdvanceButton`.
- **Hooks**: `useAdvanceStep()`, `useContinuation()`.
- **Estados**:
  - **Loading**: skeleton de `StepContentPanel`.
  - **Empty**: no aplica.
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden**: intento de otro estudiante → mismo tratamiento que P-02.
  - **Not Found**: `attemptId` inexistente.
- **Responsive**: `StepProgressTracker` compacto en mobile.
- **Accesibilidad**: `StepAdvanceButton` único punto de acción, foco automático + `aria-live` al cambiar de paso.
- **Navegación**: `StepAdvanceButton` → `advanceStepAction` → siguiente slug. Sin breadcrumbs propios (el `StepProgressTracker` cumple esa función dentro del flujo lineal, Sección 19).
- **Casos borde**: `step` de URL no coincide con `currentStep` real → redirección defensiva (Sección 10.1, `AttemptStepContainer`).
- **Riesgos**: contenido editorial no especificado (Sección 14, ítem 3).
- **Dependencias**: P-01/P-02 (entrada), P-05 (salida).
- **Tests futuros**: integration test de avance entre pasos libres.
- **Criterios de aceptación**:
  1. Given un intento en `currentStep: CONTEXTUALIZE`, When se presiona `StepAdvanceButton`, Then se invoca `advanceStepAction(attemptId)` y, en éxito, la URL cambia a `.../define-objectives`.
  2. Given que el segmento `step` de la URL no coincide con el `currentStep` real, When `AttemptStepContainer` monta, Then redirige (`router.replace`) al slug correcto sin mostrar contenido incorrecto.
  3. Given un intento de otro estudiante, When se intenta acceder, Then se recibe 403 y se trata igual que en P-02.

### P-05 — Comprender (con verificación obligatoria)

- **Objetivo**: presentar el material a comprender y bloquear el avance hasta verificar comprensión suficiente.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/comprehend`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Command(s) vía Server Action**: `verifyComprehensionAction(attemptId, comprehensionResponse)` (EP-22) — retorna `{ attempt, satisfied }`, **nunca lanza por "insuficiente"** (Sección 3.1).
- **Query(s)**: ninguno propio (gap de contenido editorial).
- **DTOs consumidos**: `VerifyComprehensionActionResult` (Sección 5.12).
- **Componentes**: `AttemptStepContainer`, `ComprehensionGate`.
- **Hooks**: `useVerifyComprehension()`.
- **Estados**:
  - **Loading**: skeleton del material + formulario deshabilitado.
  - **Empty**: no aplica.
  - **Estado especial "Verificación insuficiente"** (`satisfied===false`, **no es un error/excepción** con esta Server Action — corrección respecto a v1.0, que lo describía como un 422): mensaje formativo, invita a releer y reintentar.
  - **Error genérico**: solo ante fallo real de la Server Action (excepción normalizada, Sección 3.1).
  - **Unauthorized**: N/A — middleware.
  - **Forbidden/Not Found**: igual patrón.
- **Responsive**: split view en desktop, apilado en mobile.
- **Accesibilidad**: mensaje de "insuficiente" vía `aria-live="assertive"`.
- **Navegación**: `satisfied===true` → navega a `.../observe`. Sin breadcrumbs propios.
- **Casos borde**: reenvío inmediato tras `satisfied===false` — permitido, sin mínimo de tiempo de lectura impuesto.
- **Riesgos**: mismo gap de contenido editorial que P-04.
- **Dependencias**: P-04 (entrada), P-06 (salida).
- **Tests futuros**: integration test de los 2 desenlaces (`satisfied: true/false`) + fallo genérico de la Server Action.
- **Criterios de aceptación**:
  1. Given el formulario con una respuesta no vacía, When se envía, Then se invoca `verifyComprehensionAction` y el resultado se lee de `result.satisfied`, nunca de un código HTTP.
  2. Given `result.satisfied === false`, When se recibe, Then se muestra el estado "Verificación insuficiente" con mensaje formativo (nunca lenguaje de fracaso) y se permite reintentar sin límite.
  3. Given `result.satisfied === true`, When se recibe, Then `AttemptStepContainer` navega a `.../observe`.
  4. Given un intento de envío con el campo vacío, When se presiona enviar, Then el botón permanece deshabilitado por validación Zod client-side.

### P-06 — Observar / Analizar

- **Objetivo**: exponer ejemplos modelo filtrados por el `textType` de la unidad, para observación y análisis guiado.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/[step]` con `step ∈ {observe, analyze}`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-19 `GET /model-examples?textType=` (REST). **Command(s) vía Server Action**: `advanceStepAction(attemptId)` (EP-21).
- **Query(s)**: `ListModelExamplesByTextTypeQuery`.
- **DTOs consumidos**: `ModelExampleHttp[]`.
- **Componentes**: `AttemptStepContainer`, `ModelExampleCard` (variante lectura, reutilizado de `model-library`), `StepAdvanceButton`.
- **Hooks**: `useModelExamples(textType)`, `useAdvanceStep()`.
- **Estados**:
  - **Loading**: grid de `Skeleton` tipo `ModelExampleCard`.
  - **Empty**: "Todavía no hay ejemplos modelo para este tipo de texto".
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden/Not Found**: igual patrón.
- **Responsive**: grid 1/2/3 columnas.
- **Accesibilidad**: cada `ModelExampleCard` navegable por teclado.
- **Navegación**: `StepAdvanceButton` → siguiente paso (`analyze` o `practice`).
- **Casos borde**: `textType` sin ejemplos `ACTIVE` — Empty, nunca error.
- **Riesgos**: ninguno nuevo.
- **Dependencias**: P-05 (entrada), P-07 (salida), comparte componente con P-11.
- **Tests futuros**: test de Empty vs poblado.
- **Criterios de aceptación**:
  1. Given una unidad con `textType` sin ningún `ModelExample` con `status: ACTIVE`, When se carga P-06, Then se muestra el estado Empty, nunca error.
  2. Given que existen ejemplos activos, When EP-19 resuelve, Then se renderiza el grid de `ModelExampleCard` (variante lectura).
  3. Given que se presiona `StepAdvanceButton`, When la acción resuelve con éxito, Then se navega al siguiente paso (`analyze` o `practice` según cuál de los dos steps sea el actual).

### P-07 — Practicar

- **Objetivo**: espacio de "actividades de práctica" antes de la producción formal.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/practice`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Command(s) vía Server Action**: `advanceStepAction(attemptId)` (EP-21).
- **Query(s)**: ninguno (gap de contenido, "Actividades IA" sin respaldo de datos).
- **DTOs consumidos**: `AttemptSummaryHttp`.
- **Componentes**: `AttemptStepContainer`, `StepContentPanel`, `StepAdvanceButton`.
- **Hooks**: `useAdvanceStep()`.
- **Estados**: idéntico a P-04 (Loading/Error/Forbidden/NotFound; Empty no aplica; Unauthorized N/A — middleware).
- **Responsive**: idéntico a P-04.
- **Accesibilidad**: idéntico a P-04.
- **Navegación**: → `.../produce`.
- **Casos borde**: ninguno adicional.
- **Riesgos**: "Actividades de práctica" sin respaldo de datos real (Sección 14).
- **Dependencias**: P-06 (entrada), P-08 (salida).
- **Tests futuros**: test de avance de paso.
- **Criterios de aceptación**:
  1. Given un intento en paso `PRACTICE`, When se presiona `StepAdvanceButton`, Then se invoca `advanceStepAction` y navega a `.../produce`.
  2. Given que no existe contenido interactivo propio de este paso (gap documentado, Sección 14 ítem 3), When se implemente `StepContentPanel`, Then debe quedar preparado para recibir la fuente de contenido que se determine en un ACP futuro, sin bloquear el avance de paso.

### P-08 — Producir / Reescribir (Editor de Escritura)

- **Objetivo**: redactar y enviar una producción o reescritura, con autoguardado continuo.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/[step]` con `step ∈ {produce, rewrite}`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-17 `GET /attempts/{attemptId}/draft` (REST). **Command(s) vía Server Action**: `autosaveDraftAction(attemptId, content)` (EP-02), `submitVersionAction(attemptId, content)` (EP-03, bifurca internamente producción/reescritura según el número de versiones ya existentes).
- **Query(s)**: `GetAttemptHistoryQuery` (solo referencia interna de la Server Action, el frontend no la invoca directamente).
- **DTOs consumidos**: `DraftHttp`, `VersionHttp`.
- **Componentes**: `WritingEditor`, `AutosaveIndicator`, `WordCountIndicator`, `SubmitButton`.
- **Hooks**: `useDraft(attemptId)`, `useAutosaveDraft()`, `useSubmitVersion()`.
- **Estados**:
  - **Loading**: skeleton del área de texto + contador.
  - **Empty**: `GET /draft` en `404` → editor inicia vacío, no es error.
  - **Error**: autosave con error persistente tras reintento único → `AutosaveIndicator` en rojo, sin bloquear edición local.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden/Not Found**: patrón estándar.
  - **Offline**: única pantalla con este estado explícito — banner + reintento de autosave al reconectar.
- **Responsive**: editor a ancho completo (mobile); editor + panel lateral (desktop).
- **Accesibilidad**: `<textarea>` con `label` asociado; `aria-live="polite"` en autosave.
- **Navegación**: envío exitoso → navega a `.../feedback`.
- **Casos borde**: contenido vacío → botón deshabilitado + 422/excepción como defensa en profundidad; `beforeunload` para flush de autosave pendiente.
- **Riesgos**: rango de `WordCountRange` no documentado (Sección 14).
- **Dependencias**: P-07 (entrada), P-09 (salida); punto de reentrada desde P-09 en el ciclo de reescritura.
- **Tests futuros**: unit test de debounce; integration test de envío con feedback `READY`/`PROCESSING`; test de recuperación tras refrescar (EP-17).
- **Criterios de aceptación**:
  1. Given un borrador existente (`GET /attempts/{id}/draft` con 200), When se entra a P-08, Then el editor inicia con `initialContent` igual al `content` del borrador.
  2. Given que no existe borrador previo (`404`), When se entra a P-08, Then el editor inicia vacío, sin mostrar error.
  3. Given que el usuario deja de teclear por 2000ms, When se cumple el debounce, Then se invoca `autosaveDraftAction` exactamente una vez (Sección 8.5).
  4. Given un envío final con contenido no vacío, When `submitVersionAction` resuelve, Then se navega a `.../feedback`.
  5. Given que el navegador pierde conectividad, When ocurre, Then se muestra el banner Offline y el contenido tecleado no se pierde.

### P-09 — Recibir retroalimentación

- **Objetivo**: mostrar la retroalimentación formativa de la versión enviada, con espera activa si aún se está generando, **y ejecutar la transición de fase hacia la reflexión una vez completado el ciclo obligatorio de reescritura** (corrección AFR-F02).
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/feedback`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-18 `GET /attempts/{attemptId}/feedback?versionNumber=` (REST). **`EP-04 PATCH /attempts/{attemptId}/phase`** (REST, sin Server Action — Sección 3.1) — se invoca desde el botón "Continuar a reflexión" de esta pantalla.
- **Command(s)**: `AdvanceToReflectionCommand` (vía `useAdvancePhase()`, EP-04). Ninguno para la generación de feedback (`RecordFeedbackDeliveredCommand` es una exclusión deliberada del API Contract, disparado internamente por el pipeline de IA).
- **Query(s)**: `GetVersionFeedbackQuery`.
- **DTOs consumidos**: `FeedbackHttp`; respuesta de la acción "Continuar a reflexión": `AttemptSummaryHttp`.
- **Componentes**: `VersionWithFeedbackPanel`, `FeedbackObservationItem`×N, `ProcessingIndicator`.
- **Hooks**: `useFeedback(attemptId, versionNumber)` (polling, Sección 8.3), **`useAdvancePhase()`** (nuevo en esta versión — resolución AFR-F02).
- **Estados**:
  - **Loading**: skeleton de `VersionWithFeedbackPanel`.
  - **Empty**: no aplica.
  - **Error genérico**: 5xx/network (en la consulta de feedback) o error de `useAdvancePhase()` (banner específico, no bloquea la lectura del feedback ya mostrado).
  - **Estado especial "Procesando"**: `ProcessingIndicator` mientras `status==="PROCESSING"`; tras el techo de 3 minutos, error específico con reintento manual.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden/Not Found**: patrón estándar.
- **Responsive**: observaciones en lista vertical siempre.
- **Accesibilidad**: `aria-live="polite"` al pasar de `PROCESSING`→`READY`.
- **Navegación**: **precisión de esta versión (resolución AFR-F02)** — el botón "Reescribir" navega directo a `.../rewrite` (no requiere `EP-04`, el `currentStep` sigue en el ciclo de revisión). El botón **"Continuar a reflexión"** solo se habilita cuando el dominio lo permite (`currentStep === REWRITE` y al menos un ciclo de reescritura con feedback entregado — precondición real de `Attempt.advanceToReflection()`/`RevisionPolicy.assertMinimumCycleComplete`, verificada en código); al presionarlo, invoca `useAdvancePhase()` (EP-04) y, solo si resuelve con éxito, navega a `.../reflect` (P-10). Si `useAdvancePhase()` falla (ej. 409 porque la precondición no se cumple todavía), la navegación no ocurre y se muestra el error inline, permaneciendo en P-09.
- **Casos borde**: cierre/reapertura de pestaña mientras `PROCESSING` — el polling retoma desde cero, sin estado perdido.
- **Riesgos**: dependencia de polling en ausencia de notificaciones reales (Sección 8.3); observaciones sin `priority`, ordenadas client-side (mitigación ya congelada).
- **Dependencias**: P-08 (entrada), P-08 en modo reescritura o P-10 (salida, ahora explícitamente mediada por `EP-04`).
- **Tests futuros**: test de las 3 fases de feedback; test de techo de 3 minutos; test de ordenamiento por prioridad; **test nuevo**: "Continuar a reflexión" deshabilitado/rechazado si la precondición de dominio no se cumple, y navega a P-10 solo tras `useAdvancePhase()` exitoso.
- **Criterios de aceptación**:
  1. Given `status: PROCESSING` en la respuesta de EP-18, When la pantalla está montada, Then el polling reintenta cada 5s hasta `READY` o hasta el techo de 3 minutos.
  2. Given `status: READY`, When se recibe, Then se muestran las observaciones ordenadas macro→micro según `FEEDBACK_CATEGORY_PRIORITY`.
  3. Given que la precondición de dominio de `Attempt.advanceToReflection()` no se cumple, When se presiona "Continuar a reflexión", Then `useAdvancePhase()` falla (409), no ocurre navegación, y se muestra el error inline permaneciendo en P-09.
  4. Given que la precondición sí se cumple, When se presiona "Continuar a reflexión" y `useAdvancePhase()` resuelve con éxito, Then se navega a `.../reflect`.

### P-10 — Reflexionar y cerrar (incluye resumen de desbloqueo)

- **Objetivo**: capturar la reflexión final del estudiante y presentar el resumen de cierre de la unidad (incluye el paso interno `UNLOCK`, sin pantalla propia).
- **Usuario**: Estudiante.
- **Ruta**: `/academy/attempts/[attemptId]/reflect`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-05 `POST /attempts/{attemptId}/reflection` (REST, sin Server Action).
- **Command(s)**: `CompleteReflectionCommand`.
- **Query(s)**: ninguno propio para el formulario; la respuesta ya es `AcademyUnitDetailHttp` (EP-05 compone el detalle completo de la unidad, confirmado en código).
- **DTOs consumidos**: `AcademyUnitDetailHttp`.
- **Componentes**: formulario de reflexión (`Textarea`×N de `components/ui/`), resumen de cierre reutilizando `UnitStatusBadge`.
- **Hooks**: `useCompleteReflection()`.
- **Estados**:
  - **Loading**: skeleton del formulario.
  - **Empty**: no aplica.
  - **Error**: 409 si el intento no está en `REFLECTION` (por ejemplo, si se llega sin haber pasado por `EP-04` en P-09 — reforzado ahora que esa transición está explícitamente wireada, Sección 21) → redirigir al paso real; 5xx genérico con reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden/Not Found**: patrón estándar.
- **Responsive**: formulario a ancho completo (mobile); formulario + resumen lateral (desktop).
- **Accesibilidad**: cada pregunta con su propio `label`/`Textarea`; validación anunciada por campo.
- **Navegación**: tras éxito → "Volver al mapa" (P-01) o "Repetir esta unidad" (si `repeatable:true`, vía `repeatUnitAction`). Breadcrumb: `Academia / {Unidad}` (mismo criterio que P-02, ya que P-10 es la culminación del recorrido de esa unidad).
- **Casos borde**: número de preguntas no fijado en ningún contrato (contenido, no estructura).
- **Riesgos**: `EvaluateMasteryCommand` (CMD-08) nunca otorgará `MASTERED` en el estado actual (adaptador fail-closed) — el resumen debe estar preparado para `COMPLETED` como desenlace normal.
- **Dependencias**: P-09 (entrada, ahora mediada por `EP-04`), P-01/P-02 (salida).
- **Tests futuros**: test de validación de formulario; test del resumen con `state: COMPLETED`.
- **Criterios de aceptación**:
  1. Given un intento en `currentStep: REFLECT` con el formulario completo (≥1 respuesta), When se envía, Then se invoca `CompleteReflectionCommand` (EP-05) y se muestra el resumen de cierre con `state: COMPLETED` (o `MASTERED`, teóricamente).
  2. Given un intento que no está en `REFLECTION` (llegada por URL manual sin pasar por `EP-04`), When se intenta enviar, Then el backend responde 409 y se redirige al paso real.
  3. Given `repeatable: true` en el resumen de cierre, When el estudiante lo solicita, Then se invoca `repeatUnitAction`.

### P-11 — Biblioteca de Modelos (consulta independiente, Estudiante)

- **Objetivo**: permitir consultar la biblioteca de ejemplos modelo fuera del flujo de una unidad activa.
- **Usuario**: Estudiante.
- **Ruta**: `/academy/model-examples`.
- **Permisos**: `STUDENT`.
- **Layout**: `StudentAcademyLayout`.
- **Endpoint(s)**: EP-19 `GET /model-examples?textType=` (REST).
- **Command(s)**: ninguno.
- **Query(s)**: `ListModelExamplesByTextTypeQuery`.
- **DTOs consumidos**: `ModelExampleHttp[]` (filtrado server-side a `status:"ACTIVE"` para `STUDENT`).
- **Componentes**: `ModelLibraryContainer`, `ModelExampleCard` (variante lectura).
- **Hooks**: `useModelExamples(textType?)`.
- **Estados**: idéntico a P-06 (Loading/Empty/Error; Unauthorized N/A — middleware), sin Forbidden/Not Found propios.
- **Responsive**: idéntico a P-06.
- **Accesibilidad**: idéntico a P-06.
- **Navegación**: accesible desde P-01 (link permanente en el layout de Estudiante). Sin breadcrumbs (pantalla de primer nivel).
- **Casos borde**: filtro `textType` vacío → los 5 tipos combinados (composición ya resuelta en `handleListModelExamples`).
- **Riesgos**: ninguno nuevo.
- **Dependencias**: comparte `ModelExampleCard` con P-06/P-14.
- **Tests futuros**: test de filtro por `textType`.
- **Criterios de aceptación**:
  1. Given ningún filtro de `textType` seleccionado, When se carga P-11, Then se muestran los 5 tipos de texto combinados.
  2. Given un `textType` sin ejemplos `ACTIVE`, When se filtra, Then se muestra el estado Empty.

### P-12 — Panel del Profesor

- **Objetivo**: permitir a un profesor seleccionar uno o varios estudiantes y ver su progreso agregado.
- **Usuario**: Profesor.
- **Ruta**: `/academy/teacher`.
- **Permisos**: `TEACHER`.
- **Layout**: `TeacherAcademyLayout`.
- **Endpoint(s)**: EP-20 `GET /students/{studentId}/progress-summary` (REST, ×N).
- **Command(s)**: ninguno directo.
- **Query(s)**: `GetStudentProgressSummaryQuery` (×N).
- **DTOs consumidos**: `StudentProgressSummaryHttp[]`.
- **Componentes**: `TeacherPanelContainer`, `MultiSelectToolbar`, `StudentProgressRow`.
- **Hooks**: `useStudentProgressSummary(studentId)` vía `useQueries`.
- **Estados**:
  - **Loading**: skeleton de `StudentProgressRow`×N.
  - **Empty**: ningún estudiante seleccionado todavía.
  - **Error**: por fila individual.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden parcial**: si `TeacherStudentRelationshipAdapter` deniega (siempre `false` hoy) → fila específica "Sin relación docente con este estudiante".
  - **Not Found**: no aplica a nivel de pantalla.
- **Responsive**: tabla → tarjetas apiladas en mobile.
- **Accesibilidad**: checkboxes reales, `aria-selected`.
- **Navegación**: cada `StudentProgressRow` → P-13. Breadcrumb: `Academia / Panel del Profesor` (Sección 19).
- **Casos borde**: selección de 20+ estudiantes — sin límite documentado, cada uno dispara una query independiente.
- **Riesgos**: no existe endpoint para listar "los estudiantes de este profesor" (Sección 14, ítem 1) — pantalla especificada íntegra pero no operable con datos reales hoy.
- **Dependencias**: bloqueado funcionalmente por el gap de arriba.
- **Tests futuros**: test de selección múltiple; test de fila individual en Forbidden sin afectar las demás.
- **Criterios de aceptación**:
  1. Given cero estudiantes seleccionados, When se carga P-12, Then se muestra el estado Empty (no un error).
  2. Given un estudiante seleccionado cuya relación docente-estudiante no existe (comportamiento actual del backend, `hasRelationship()===false`), When se resuelve EP-20 para ese estudiante, Then su fila muestra "Sin relación docente con este estudiante" sin afectar las demás filas seleccionadas.
  3. Given múltiples estudiantes seleccionados, When una fila falla, Then las demás filas siguen mostrando su propio estado de forma independiente (`useQueries`).

### P-13 — Detalle de estudiante y acciones docentes

- **Objetivo**: ver el progreso detallado de un estudiante y ejecutar acciones docentes (anular unidad, recomendar unidad).
- **Usuario**: Profesor.
- **Ruta**: `/academy/teacher/students/[studentId]`.
- **Permisos**: `TEACHER` + relación docente-estudiante (hoy siempre `false`, ver P-12 Riesgos).
- **Layout**: `TeacherAcademyLayout`.
- **Endpoint(s)**: EP-20, EP-07, EP-08 (todos REST).
- **Command(s)**: `ApplyTeacherOverrideCommand`, `AssignUnitToStudentCommand`.
- **Query(s)**: `GetStudentProgressSummaryQuery`.
- **DTOs consumidos**: `StudentProgressSummaryHttp`; `TeacherOverrideHttp`, `TeacherRecommendationHttp`.
- **Componentes**: `StudentDetailContainer`, `TeacherOverrideDialog`, `RecommendUnitDialog`.
- **Hooks**: `useStudentProgressSummary(studentId)`, `useApplyTeacherOverride()`, `useAssignUnitToStudent()`.
- **Estados**:
  - **Loading**: skeleton de resumen de progreso.
  - **Empty**: estudiante sin unidades provisionadas (teórico).
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden**: 403 completo de pantalla — estado más probable en producción hoy.
  - **Not Found**: `studentId` inexistente.
- **Responsive**: columna en mobile; `Tabs` opcional en desktop.
- **Accesibilidad**: diálogos con focus trap y devolución de foco.
- **Navegación**: link a P-15. Breadcrumb: `Academia / Panel del Profesor / {Estudiante}` (Sección 19).
- **Casos borde**: `FORCE_RESTART` sobre unidad no terminal → 409, mensaje directo (sin restricción de lenguaje formativo, exenta para paneles docentes).
- **Riesgos**: mismo bloqueador funcional de relación docente que P-12.
- **Dependencias**: P-12 (entrada), P-15 (salida).
- **Tests futuros**: test de confirmación obligatoria; test de 403 completo de pantalla.
- **Criterios de aceptación**:
  1. Given una relación docente-estudiante inexistente (comportamiento actual del backend), When se accede a P-13, Then se muestra Forbidden completo de pantalla.
  2. Given una anulación docente (`FORCE_LOCK`/`FORCE_RESTART`) solicitada, When se confirma en el `Dialog` modal, Then se invoca `ApplyTeacherOverrideCommand` (EP-07) con `reason` no vacío.
  3. Given `FORCE_RESTART` sobre una unidad que no está `COMPLETED`/`MASTERED`, When se envía, Then el backend responde 409 y se muestra el mensaje sin lenguaje formativo (permitido en paneles docentes).

### P-14 — Gestión de Biblioteca de Modelos (Administrador)

- **Objetivo**: CRUD completo de ejemplos modelo (crear, editar, retirar).
- **Usuario**: Administrador.
- **Ruta**: `/academy/admin/model-examples`.
- **Permisos**: `ADMIN`.
- **Layout**: `TeacherAcademyLayout` (Sección 4 — el Frontend Contract v1.1 §2 define únicamente 2 layouts, "Layout Estudiante" y "Layout Profesor/Administrador"; no existe ni se crea un `AdminAcademyLayout` separado).
- **Endpoint(s)**: EP-19, EP-09, EP-10, EP-11 (todos REST).
- **Command(s)**: `CreateModelExampleCommand`, `UpdateModelExampleCommand`, `RetireModelExampleCommand`.
- **Query(s)**: `ListModelExamplesByTextTypeQuery`.
- **DTOs consumidos**: `ModelExampleHttp[]` (incluye `RETIRED`, a diferencia de P-06/P-11).
- **Componentes**: `AdminModelLibraryContainer`, `ModelExampleCard` (variante editable — Sección 11.2), formulario de alta/edición.
- **Hooks**: `useModelExamples()`, `useCreateModelExample()`, `useUpdateModelExample()`, `useRetireModelExample()`.
- **Estados**: idéntico patrón a P-11, más 422 con `fieldErrors` si el catálogo lo soporta (Sección 14). Unauthorized: N/A — middleware.
- **Responsive**: grid de tarjetas editable + modal de formulario.
- **Accesibilidad**: formulario con validación inline; `Dialog` con foco atrapado antes de retirar.
- **Navegación**: pantalla autocontenida, sin hijos. Breadcrumb: `Academia / Biblioteca de Modelos (Admin)`.
- **Casos borde**: retirar un ejemplo consumido activamente por un estudiante en ese instante — sin invalidación cross-usuario en tiempo real (mismo gap de notificaciones, Sección 8.3).
- **Riesgos**: rango de longitud de `content` no documentado (Sección 14).
- **Dependencias**: ninguna entrada de otra pantalla.
- **Tests futuros**: test de CRUD completo; test de confirmación obligatoria antes de retirar.
- **Criterios de aceptación**:
  1. Given un formulario de alta de Ejemplo Modelo completo y válido, When se envía, Then se invoca `CreateModelExampleCommand` (EP-09) y el nuevo ejemplo aparece en el grid tras la invalidación de `modelExamples()`.
  2. Given una solicitud de retiro (`RetireModelExampleCommand`, EP-11), When se confirma en el `Dialog` modal, Then el `status` del ejemplo pasa a `RETIRED` (nunca se borra físicamente).
  3. Given un ejemplo ya `RETIRED`, When se renderiza en la variante editable, Then el botón "Retirar" queda oculto/deshabilitado.

### P-15 — Historial académico detallado (vista docente)

- **Objetivo**: mostrar, para un estudiante y unidad específicos, el historial completo de intentos con sus versiones y retroalimentación asociada.
- **Usuario**: Profesor.
- **Ruta**: `/academy/teacher/students/[studentId]/units/[unitId]/history`.
- **Permisos**: `TEACHER` + relación docente-estudiante (mismo gap de P-12/P-13).
- **Layout**: `TeacherAcademyLayout`.
- **Endpoint(s)**: EP-23 `GET /students/{studentId}/units/{unitId}/history` (REST).
- **Command(s)**: ninguno (solo lectura).
- **Query(s)**: `GetStudentUnitHistoryQuery`.
- **DTOs consumidos**: `StudentUnitHistoryHttp`.
- **Componentes**: `StudentUnitHistoryContainer`, `AttemptHistoryRow` (reutilizado), `VersionWithFeedbackPanel`/`FeedbackObservationItem` (reutilizados de P-09).
- **Hooks**: `useStudentUnitHistory(studentId, unitId)`.
- **Estados**:
  - **Loading**: skeleton de lista de intentos con paneles anidados.
  - **Empty**: unidad sin intentos — estado Empty explícito, nunca error.
  - **Error**: banner + reintento.
  - **Unauthorized**: N/A — middleware.
  - **Forbidden**: sin relación docente (mismo gap funcional que P-12/P-13).
  - **Not Found**: `studentId`/`unitId` inexistentes.
- **Responsive**: accordion en mobile, expandido en desktop.
- **Accesibilidad**: `aria-expanded`/`aria-controls` si es colapsable.
- **Navegación**: entra desde P-13; sin hijos. Breadcrumb: `Academia / Panel del Profesor / {Estudiante} / {Unidad} / Historial` (ruta más profunda del módulo — 5 segmentos, ver Sección 19).
- **Casos borde**: `attemptsCount` mayor a `attempts.length` real — renderizar según el array real.
- **Riesgos**: mismo bloqueador funcional de relación docente que P-12/P-13.
- **Dependencias**: P-13 (entrada única).
- **Tests futuros**: test de Empty; test de renderizado anidado; test de reutilización de `FeedbackObservationItem`.
- **Criterios de aceptación**:
  1. Given una unidad de un estudiante sin ningún intento, When se accede a P-15, Then se muestra el estado Empty explícito, nunca error.
  2. Given una relación docente-estudiante inexistente, When se accede, Then se muestra Forbidden (mismo criterio que P-12/P-13).
  3. Given `attemptsCount` distinto de `attempts.length` real, When se renderiza, Then se listan exactamente los elementos de `attempts[]`, nunca el valor de `attemptsCount`.

---

## 13. Hooks — catálogo completo

| Hook | Tipo | Transporte | Endpoint(s)/Server Action | Parámetros | Retorno (forma simplificada) |
|---|---|---|---|---|---|
| `useUnits(textType?)` | Query | REST | EP-13 | `textType?: TextType` | `{ units: AcademyUnitSummaryHttp[], meta, isLoading, isError, error }` |
| `useUnitDetail(unitId)` | Query | REST | EP-14 | `unitId: string` | `AcademyUnitDetailHttp` + estado |
| `useUnitAttempts(unitId)` | Query | REST | EP-16 | `unitId: string` | `AttemptSummaryHttp[]` + estado |
| `useContinuation()` | Query | REST | EP-15 | — | `ContinuationStateHttp` (nullable) + estado |
| `useStartUnit()` | Mutation | **Server Action** | `startUnitAction` | — | `mutate(unitId)` |
| `useRepeatUnit()` | Mutation | **Server Action** | `repeatUnitAction` | — | `mutate(unitId)` |
| `useDraft(attemptId)` | Query | REST | EP-17 | `attemptId: string` | `DraftHttp \| null` + estado |
| `useAutosaveDraft()` | Mutation | **Server Action** | `autosaveDraftAction` | — | `mutate({attemptId, content})` |
| `useSubmitVersion()` | Mutation | **Server Action** | `submitVersionAction` | — | `mutate({attemptId, content})` |
| `useAdvancePhase()` | Mutation | **REST** (sin Server Action) | EP-04 | — | `mutate({attemptId})` — usado en P-09 (resolución AFR-F02) |
| `useCompleteReflection()` | Mutation | REST | EP-05 | — | `mutate({attemptId, responses: string[]})` |
| `useAdvanceStep()` | Mutation | **Server Action** | `advanceStepAction` | — | `mutate({attemptId})` |
| `useVerifyComprehension()` | Mutation | **Server Action** | `verifyComprehensionAction` | — | `mutate({attemptId, comprehensionResponse})` → `{ attempt, satisfied }` |
| `useFeedback(attemptId, versionNumber)` | Query (polling, §8.3) | REST | EP-18 | `attemptId, versionNumber` | `FeedbackHttp` + estado |
| `useModelExamples(textType?)` | Query | REST | EP-19 | `textType?: TextType` | `ModelExampleHttp[]` + estado |
| `useCreateModelExample()` | Mutation | REST | EP-09 | — | `mutate(input)` |
| `useUpdateModelExample()` | Mutation | REST | EP-10 | — | `mutate({modelExampleId, ...patch})` |
| `useRetireModelExample()` | Mutation | REST | EP-11 | — | `mutate(modelExampleId)` |
| `useProgressSummary()` | Query | REST | EP-12 | — | `StudentProgressSummaryHttp` + estado (no consumido por ninguna de las 15 pantallas — Sección 21) |
| `useStudentProgressSummary(studentId)` | Query | REST | EP-20 | `studentId: string` | `StudentProgressSummaryHttp` + estado |
| `useApplyTeacherOverride()` | Mutation | REST | EP-07 | — | `mutate({unitId, action, reason})` |
| `useAssignUnitToStudent()` | Mutation | REST | EP-08 | — | `mutate({studentId, unitId})` |
| `useStudentUnitHistory(studentId, unitId)` | Query | REST | EP-23 | `studentId, unitId` | `StudentUnitHistoryHttp` + estado |
| `useAcademyRole()` | Derivado de Clerk | — | — | — | `{ role: "STUDENT"\|"TEACHER"\|"ADMIN"\|null, isLoaded }` |

Los 6 hooks marcados **Server Action** normalizan cualquier excepción a la forma `AcademyErrorHttp` dentro de su `onError` (Sección 3.1). Todos los hooks de mutación siguen la misma forma de retorno de TanStack Query v5 (`{ mutate, mutateAsync, isPending, isError, error, isSuccess }`).

---

## 14. Información faltante — decisiones no tomadas, explícitamente documentadas

| # | Qué falta | Por qué falta | Impacto | Quién debe decidirlo y cuándo |
|---|---|---|---|---|
| 1 | Endpoint que liste "los estudiantes de un profesor" | El Domain Model solo modela `TeacherStudentRelationshipPort.hasRelationship()` (booleano 1:1), nunca una colección | P-12/P-13/P-15 quedan completamente especificadas pero **no operables** con datos reales hasta que exista | Requiere el módulo de "Organización Académica" (no iniciado) + un ACP de API Contract. Bloqueador funcional real, no de diseño. |
| 2 | Rango numérico exacto de `WordCountRange` | Ningún documento leído fija el número | `WritingEditor`/`WordCountIndicator` no pueden validar un límite real | Debe fijarse en un ACP de Domain Model/Functional Specification antes de implementar validación de rango real. |
| 3 | Fuente de contenido editorial de pasos sin gate (Contextualizar, Definir objetivos, Observar, Analizar, Practicar) | Ningún DTO/endpoint modela "contenido de la unidad" | P-04, P-06, P-07 quedan con `StepContentPanel` especificado estructuralmente pero sin fuente de datos real | Decisión de producto (estático/tabla Prisma/CMS), antes de Fase 2 del Roadmap. |
| 4 | Catálogo completo de valores de `Error.code` | Ítem explícitamente abierto (#4) en API Contract v1.3 | El frontend no puede implementar lógica condicional por tipo de error | Pendiente de un "Error Catalog de Platform Core"; un ACP futuro debe cerrarlo. |
| 5 | Política de rate limiting | Ítem explícitamente abierto (#3) en API Contract v1.3 | Sin UX específica de 429 más allá de manejo genérico | Mismo proceso que el ítem 4. |
| 6 | Breakpoints responsive oficiales | Frontend Contract v1.1 §10 los marca "PENDIENTE DE DECISIÓN DE FRONTEND" | — | **Resuelto**: `tailwind.config.ts` no sobreescribe `screens` → breakpoints por defecto de Tailwind, adoptados aquí (Sección 18). |
| 7 | Mecanismo real de entrega de `ACADEMY_FEEDBACK_READY` | `features/notifications/` sin implementación | P-09 no puede usar push real | **Resuelto**: polling acotado (Sección 8.3). |
| 8 | Número y contenido exacto de preguntas de reflexión (P-10) | Contenido pedagógico, no estructura de datos | El formulario se especifica estructuralmente, contenido pendiente | Decisión de producto/contenido, no de arquitectura. |

No quedan ítems pendientes de AFR-001 en esta tabla — los 8 ítems listados ya estaban documentados en v1.0 y ninguno de los hallazgos de AFR-001 los modifica; los hallazgos de AFR-001 (Server Actions, EP-04, Containers, atribución de EP-12, formatos i18n, Unauthorized, breadcrumbs) quedan resueltos en las secciones respectivas, no aquí.

---

## 15. Autenticación, autorización e i18n en el frontend

### 15.1 Autenticación

100% vía Clerk (`@clerk/nextjs`). El `middleware.ts` raíz ya protege `/academy` (listada en `PRIVATE_ROUTES` de `config/routes.ts`) — ningún usuario sin sesión Clerk llega siquiera a renderizar una página de Academia (por eso el campo "Unauthorized" de las 15 pantallas, Sección 12, se resuelve uniformemente como "N/A, middleware"). El Bearer JWT del API Contract se resuelve **server-side** dentro de cada Route Handler (`resolveAcademyActor()`); las Server Actions (Sección 3.1) también invocan `resolveAcademyActor()` internamente — el frontend **nunca** maneja un JWT manualmente en ningún transporte.

### 15.2 Autorización de UI (rol)

`useAcademyRole()` (Sección 13) replica en el cliente la misma prioridad de resolución de rol que `ClerkRoleResolver.ts` usa server-side (`claims.role → claims.metadata.role → claims.publicMetadata.role`), leyendo `useUser()` de Clerk. **Diferencia deliberada respecto al backend**: si no reconoce ningún rol, el frontend lo trata como "no resuelto" (nunca asume `STUDENT` como hace el backend) hasta que Clerk cargue, evitando un parpadeo de UI incorrecta. La autorización real y definitiva **siempre** la impone el backend (403 si corresponde).

### 15.3 Internacionalización

Nuevo namespace `academy` a crear en `messages/es.json` y `messages/fr.json` (hoy solo existen `common, nav, auth, dashboard`). Todo componente de Academia usa `useTranslations("academy")` (sub-namespaces por Feature Module). Nunca usar `next/link`/`next/navigation` directos — siempre los wrappers de `i18n/navigation.ts`.

**Fechas, horas, números, porcentajes y pluralización (resolución de AFR-F05)**: `next-intl` re-exporta `useFormatter` (de `use-intl`, ya confirmado disponible en las dependencias del proyecto). **Decisión congelada**:
- Toda fecha/hora mostrada al usuario (`startedAt`, `submittedAt`, `lastSavedAt`, `appliedAt`, `recommendedAt`, `deliveredAt`, `completedAt`, `masteredAt`) se formatea vía `useFormatter().dateTime(new Date(valor), { dateStyle: "medium", timeStyle: "short" })` — **nunca** `toLocaleDateString()`/`Date.prototype` directo ni concatenación manual de strings.
- Todo número (conteos, `wordCount`, `characterCount`, `teacherOverrideCount`) se formatea vía `useFormatter().number(valor)`.
- Ningún porcentaje se muestra hoy en ninguna de las 15 pantallas (no hay campo de progreso porcentual en ningún DTO — `unitsByState`/`unitsByTextType` son conteos, no porcentajes); si se añadiera en el futuro, usar `useFormatter().number(valor, { style: "percent" })`.
- **Pluralización**: `next-intl` soporta sintaxis ICU (`{count, plural, one {# intento} other {# intentos}}`) directamente en los mensajes de `messages/*.json` — obligatorio para cualquier texto que dependa de una cantidad variable (ej. "X intentos registrados" en P-03, "X estudiantes seleccionados" en P-12). No se define aquí el texto exacto de cada mensaje (contenido, no arquitectura), pero la sintaxis ICU es la única forma admitida — nunca concatenación manual tipo `` `${count} intentos` `` sin manejo de singular/plural.

### 15.4 Ciclo de vida de sesión y navegación (resolución de AFR4-01)

**Solo comportamiento de frontend — no se asume ni se inventa ningún cambio de backend.**

#### 15.4.1 Expiración de sesión Clerk durante una mutación

- **Comportamiento esperado**: `resolveAcademyActor()` (invocado internamente tanto por los Route Handlers REST como por las 6 Server Actions, Sección 15.1) lanza `UnauthorizedException` cuando la sesión Clerk ya no es válida — para REST esto se traduce en `401` (Sección 5.11); para Server Actions, la excepción se normaliza igual que cualquier otra (Sección 3.1). **Decisión congelada**: cualquier `401` REST, o cualquier excepción normalizada de una Server Action cuyo origen sea `UnauthorizedException`, se trata en el `apiClient`/hook de forma global, no como un error específico de la mutación en curso.
- **UX**: no se muestra un banner de error de formulario para este caso — se redirige inmediatamente a `/sign-in` (ruta ya listada en `PUBLIC_ROUTES`, `config/routes.ts`) usando el mecanismo nativo de Clerk (`useClerk()`), igual que ya hace `middleware.ts` para el acceso inicial a `/academy`.
- **Recuperación**: tras reautenticarse, Clerk gestiona la redirección de vuelta (comportamiento nativo ya configurado en el proyecto) — el contenido no persistido de la mutación en curso (ej. texto no autoguardado en `WritingEditor`, más allá de lo ya cubierto por `beforeunload`, Sección 8.5) se pierde; no existe en el proyecto ningún mecanismo de "return URL"/borrador local de respaldo (Sección 8.5 ya documenta esta limitación para el caso de cierre de pestaña, y aplica igual aquí).
- **Navegación**: la redirección a `/sign-in` reemplaza la pantalla activa; no se intenta volver automáticamente a la pantalla exacta donde ocurrió la expiración (sin evidencia de un mecanismo de "return URL" en el proyecto — Sección "Información insuficiente" del informe AFR-005).
- **Retry tras reautenticación**: **no existe reintento automático de la acción original.** Ni el `apiClient` ni ninguno de los 24 hooks de la Sección 13 vuelven a ejecutar por sí solos la mutación que estaba en curso cuando expiró la sesión — el usuario debe repetir manualmente la acción (ej. volver a escribir/enviar) una vez reautenticado. No se propone ningún mecanismo de cola/replay porque ninguna dependencia del proyecto (React Query, Zustand) lo provee de forma nativa para este caso y no hay evidencia de que se requiera.
- **Aplicación uniforme a P-05, P-08 y P-09**: esta Sección 15.4.1 aplica **de forma idéntica y sin excepción** a las tres pantallas con mutaciones más sensibles del flujo de aprendizaje: en P-05 (`verifyComprehensionAction`), P-08 (`autosaveDraftAction`/`submitVersionAction`) y P-09 (`useAdvancePhase()`/EP-04), una sesión expirada durante cualquiera de estas mutaciones produce exactamente la misma redirección a `/sign-in` descrita arriba — no existe ninguna variante de comportamiento por pantalla. En P-08 específicamente, esto significa que el contenido no autoguardado del `WritingEditor` se pierde bajo las mismas condiciones ya documentadas en la Sección 8.5 (ningún flush adicional se dispara por expiración de sesión, distinto del `beforeunload` que sí cubre el cierre de pestaña).

#### 15.4.2 Botón Atrás / Adelante del navegador

- **Polling (P-09)**: al navegar fuera de P-09 (atrás/adelante), `AttemptStepContainer` se desmonta y, con él, el `useFeedback()` que sostiene el polling — TanStack Query v5 detiene automáticamente `refetchInterval` en cuanto no quedan observadores activos para esa Query Key (comportamiento nativo de la librería, sin lógica adicional que implementar). No se requiere cancelación manual.
- **React Query / restauración de estado**: al volver a P-09 (adelante) dentro de la ventana de `gcTime` (10min, Sección 8.2), la Query Key `academyKeys.feedback(attemptId, versionNumber)` sirve el último valor cacheado inmediatamente; si `status` seguía `PROCESSING`, `staleTime: 0` fuerza un refetch inmediato y el polling se reanuda; si ya era `READY`, `staleTime: 5min` evita un refetch innecesario (mismas reglas ya definidas en la Sección 8.2, aplicadas aquí a la navegación de historial, no solo a la primera carga).
- **Navegación entre P-04 y P-10**: cada paso es un segmento de URL real (`STEP_TO_URL_SLUG`, Sección 6.2), por lo que atrás/adelante ya usa el historial nativo del navegador sin necesidad de lógica adicional. La validación defensiva ya existente en `AttemptStepContainer` ("si `step` de la URL no coincide con `currentStep` real, redirige", Sección 10.1) es la que cubre el caso de volver, vía historial, a un paso que ya dejó de ya ser válido (ej. el intento avanzó mientras tanto en otra pestaña) — no se introduce ningún mecanismo nuevo, se reutiliza el ya congelado.
- **Aclaración sobre `PROCESSING`/`READY`/estado de "timeout" (no existe un estado `FAILED` de backend)**: `FeedbackHttp.status` (Sección 5.5) solo admite `"READY"` o `"PROCESSING"` — no hay ningún tercer valor `FAILED` provisto por el backend. El único estado de error en P-09 es el sintético de cliente descrito en la Sección 8.3 (techo de 3 minutos sin `READY`). **Decisión congelada para que la navegación atrás/adelante no pueda burlar ese techo**: el conteo de los 3 minutos se calcula a partir de `dataUpdatedAt`/el timestamp de la primera respuesta `PROCESSING` observada para esa Query Key (persistido en la propia entrada de caché de React Query, no en un temporizador local del componente) — de modo que si el usuario navega fuera de P-09 y vuelve (atrás/adelante) antes de que expire la ventana de `gcTime` (10min, Sección 8.2), el tiempo transcurrido sigue contando desde el primer `PROCESSING` real, sin reiniciarse. Si `gcTime` ya expiró (la entrada de caché fue recolectada), la vuelta a P-09 dispara una consulta fresca a EP-18 y el conteo de 3 minutos se reinicia desde cero — comportamiento aceptado, no es una falla, ya que el propio caché se consideró obsoleto por inactividad prolongada.

#### 15.4.3 Refresh (F5)

- **Qué se conserva**: todo el estado de servidor (unidades, intentos, feedback, borradores ya autoguardados) — un refresh destruye por completo el `QueryClient` de React Query en memoria, por lo que todo se vuelve a solicitar fresco al backend en el siguiente montaje; el filtro `textType` de P-01/P-11/P-14 también se conserva porque vive en la URL (`searchParams`, Sección 7), no en memoria.
- **Qué se pierde**: (a) el contenido tecleado en `WritingEditor` no autoguardado desde el último debounce exitoso (mismo caso y misma limitación conocida que la Sección 8.5, `beforeunload` no siempre alcanza a completar el flush); (b) `selectedStudentIds` de P-12 (Zustand, Sección 7) — vuelve a un arreglo vacío.
- **Comportamiento deliberado**: la pérdida de `selectedStudentIds` en refresh es **intencional, no una limitación a resolver** — ninguna dependencia del proyecto usada para Academia incluye el middleware `persist` de Zustand, y no existe ningún requisito documentado (Frontend Contract v1.1, ACP-001-B) que exija que la selección múltiple sobreviva a un refresh de página.

---

## 16. React Query — jerarquía y convenciones (ampliación de Sección 8)

Ya definida completa en Sección 8.1 (`academyKeys`). Regla adicional: **invalidación siempre por prefijo de jerarquía**, nunca por Query Key exacta cuando el efecto debe propagarse — nunca invalidar `academyKeys.all` completo salvo en un evento verdaderamente global como cierre de sesión. Esta regla aplica idénticamente sin importar si la mutación que dispara la invalidación llegó por REST o por Server Action (Sección 3.1) — la invalidación siempre ocurre en el `onSuccess` del hook de React Query, nunca dentro de la Server Action misma.

---

## 17. Accesibilidad (WCAG 2.1 AA) — transversal, no diferida

Aplicable a las 15 pantallas desde el día uno de implementación:

- **Perceptible**: contraste mínimo 4.5:1 texto normal / 3:1 texto grande y componentes gráficos — verificar los Design Tokens de `tailwind.config.ts` contra este mínimo antes de su uso en texto sobre fondo (ej. `warning-500` sobre blanco — verificar en Fase 1, no asumir).
- **Operable**: navegación completa por teclado en las 15 pantallas, sin trampas de foco en diálogos, orden de tabulación = orden visual, sin límites de tiempo forzados en formularios.
- **Comprensible**: mensajes de error siempre asociados a su control (`aria-describedby`), idioma de página correctamente declarado.
- **Robusto**: uso de HTML semántico antes que `<div>` genérico con roles ARIA añadidos artificialmente.
- **Anuncios dinámicos** (`aria-live`): `polite` para indicadores de progreso/autosave/procesamiento; `assertive` únicamente para la verificación de comprensión insuficiente (P-05).

---

## 18. Responsive

Mobile First, usando los breakpoints congelados en Sección 14 (ítem 6):

| Breakpoint | Ancho | Comportamiento general |
|---|---|---|
| Base (mobile) | `<640px` | 1 columna en toda grilla; navegación de Feature Module vía menú/drawer; `StepProgressTracker` compacto |
| `sm` | `≥640px` | Sin cambio mayor de layout, ajustes de padding |
| `md` (tablet) | `≥768px` | Grillas de 2 columnas; tablas de P-03/P-12 aún colapsadas a tarjetas |
| `lg` (desktop) | `≥1024px` | Grillas de 3-4 columnas; `WritingEditor` con panel lateral; tablas reales en P-03/P-12/P-15 |
| `xl` | `≥1280px` | Ancho máximo de contenido limitado (legibilidad de `WritingEditor`/observaciones) |

---

## 19. Navegación y breadcrumbs (resolución de AFR-F07)

**Estrategia oficial**: `AcademyBreadcrumbs` (componente compartido, Sección 4) se muestra **únicamente** en las pantallas cuya ruta tiene 2 o más segmentos significativos por debajo de `/academy` **y** que no forman parte del recorrido lineal de aprendizaje (P-04 a P-10), ya que ese recorrido ya tiene su propio indicador de posición (`StepProgressTracker`), y añadir breadcrumbs ahí sería redundante con la información que el propio Contrato ya decidió mostrar de otra forma.

| Pantalla | ¿Breadcrumbs? | Ruta mostrada |
|---|---|---|
| P-01 | No (raíz de Academia) | — |
| P-02 | Sí | `Academia / {Unidad}` |
| P-03 | Sí | `Academia / {Unidad} / Historial` |
| P-04 a P-10 | No (usa `StepProgressTracker` en su lugar) | — |
| P-11 | No (nivel raíz, accesible desde el layout) | — |
| P-12 | Sí | `Academia / Panel del Profesor` |
| P-13 | Sí | `Academia / Panel del Profesor / {Estudiante}` |
| P-14 | Sí | `Academia / Biblioteca de Modelos (Admin)` |
| P-15 | Sí | `Academia / Panel del Profesor / {Estudiante} / {Unidad} / Historial` |

`AcademyBreadcrumbs` recibe una lista de `{ label: string; href?: string }` construida por cada `Page` (Sección 4), usa los wrappers de `i18n/navigation.ts` para los enlaces, y el último elemento nunca es un link (representa la pantalla actual).

### 19.1 Mapa global de navegación (resolución de AFR4-04)

```
Estudiante (Layout: StudentAcademyLayout)

  P-01 (Mapa de unidades)
    │
    ├──▶ P-02 (Detalle de unidad)
    │      │
    │      ├──▶ P-03 (Historial de intentos)
    │      │
    │      └──▶ [iniciar/continuar intento]
    │             │
    │             ▼
    │           P-04 (Contextualizar / Definir objetivos)
    │             │
    │             ▼
    │           P-05 (Comprender)
    │             │
    │             ▼
    │           P-06 (Observar / Analizar)
    │             │
    │             ▼
    │           P-07 (Practicar)
    │             │
    │             ▼
    │           P-08 (Producir / Reescribir) ◀────────────┐
    │             │                                        │
    │             ▼                                        │
    │           P-09 (Recibir retroalimentación) ──────────┘
    │             │      (botón "Reescribir", ciclo de revisión)
    │             │
    │             │ (botón "Continuar a reflexión" → EP-04, solo si
    │             │  la precondición de dominio se cumple, Sección 12 P-09)
    │             ▼
    │           P-10 (Reflexionar y cerrar)
    │             │
    │             └──▶ vuelve a P-01, o a P-02 (si `repeatable: true`)
    │
    └──▶ P-11 (Biblioteca de Modelos) ──▶ (sin hijos, vuelve a P-01)

Profesor (Layout: TeacherAcademyLayout)

  P-12 (Panel del Profesor)
    │
    └──▶ P-13 (Detalle de estudiante y acciones docentes)
           │
           └──▶ P-15 (Historial académico detallado) ──▶ (sin hijos, vuelve a P-13)

Administrador (Layout: TeacherAcademyLayout)

  P-14 (Gestión de Biblioteca de Modelos) — pantalla autocontenida, sin hijos ni padres
```

**Declaración explícita: no existe ningún recorrido que conecte los 3 sub-flujos entre sí.** Un usuario `STUDENT` nunca alcanza P-12/P-13/P-14/P-15 navegando desde P-01–P-11: no hay ningún link ni botón en ninguna de las 11 pantallas de Estudiante que apunte a una ruta de Profesor/Administrador. Del mismo modo, un usuario `TEACHER`/`ADMIN` nunca alcanza P-01–P-11 navegando desde P-12–P-15. El único punto de contacto entre sub-flujos es el redireccionamiento por rol ya documentado en P-01 (Sección 12: *"Si el rol resuelto es TEACHER/ADMIN, redirigir a `/academy/teacher` o `/academy/admin/model-examples`"*) — y ese redireccionamiento ocurre **antes** de renderizar el mapa de unidades, no es una navegación real dentro de la experiencia de Estudiante. Esta separación es intencional y ya estaba establecida en el Frontend Contract v1.1 §2 ("2 Layouts... Layout Profesor/Administrador — nunca 'recorre' unidades"); este mapa no introduce ninguna ruta, endpoint ni decisión nueva — únicamente consolida en un solo lugar la navegación que ya estaba especificada, dispersa, en cada una de las 15 pantallas de la Sección 12.

---

## 20. Performance

- **Lazy loading / code splitting**: cada `pages/*Page.tsx` se carga vía el propio code-splitting automático de rutas de Next.js App Router.
- **Suspense/Streaming**: cada `page.tsx` envuelve su `Page` en `<Suspense fallback={<PantallaSkeleton/>}>`.
- **Memoización**: `UnitCard`/`ModelExampleCard`/`FeedbackObservationItem` memoizados (`React.memo`).
- **Prefetch**: especificado por endpoint en Sección 8.2 — usar `queryClient.prefetchQuery` en `onMouseEnter`/`onFocus` de `UnitCard` y al entrar a P-01 para `continuation()`/`modelExamples()`.
- **Virtualización**: no necesaria hoy (paginación en memoria, `limit` máximo 100); optimización futura si la Biblioteca de Modelos creciera más allá de unos cientos de ítems.
- **División de bundles**: separar el layout de Estudiante y el de Profesor/Administrador en chunks distintos.

---

## 21. Testing (estrategia, no implementación)

| Nivel | Alcance | Herramienta |
|---|---|---|
| **Unit** | Componentes presentacionales puros, utils | Vitest + Testing Library |
| **Component** | Contenedores con hooks mockeados (React Query `QueryClientProvider` de test + MSW para REST; mock directo de módulo para las Server Actions, Sección 3.1) | Vitest + Testing Library + MSW |
| **Integration** | Flujo completo de una pantalla contra mocks que respetan exactamente los contratos de Sección 5, incluidas las 6 Server Actions | Vitest + Testing Library + MSW (REST) + mocks de módulo (`vi.mock`) para `features/academy/actions/*` |
| **E2E** | Flujos de usuario cross-pantalla reales, incluyendo el flujo P-09→P-10 mediado por `EP-04` | Playwright |

**Regla de cobertura mínima congelada**: cada uno de los 23 endpoints de negocio (incluidos los 6 transportados vía Server Action) debe tener al menos un test de integración que ejercite su camino feliz y su principal camino de error.

---

## 22. Matriz de trazabilidad (cobertura 100% real — resolución de AFR-F02)

| Pantalla | Ruta | Endpoint(s)/Transporte | Command/Query | DTO(s) | Hook(s) | Componente(s) principal(es) | Tests futuros |
|---|---|---|---|---|---|---|---|
| P-01 | `/academy` | EP-13, EP-15 (REST) | `ListAcademyUnitsForStudentQuery`, `GetContinuationStateQuery` | `AcademyUnitSummaryHttp[]`, `ContinuationStateHttp` | `useUnits`, `useContinuation` | `UnitMapContainer` | Unit+Integration+E2E |
| P-02 | `/academy/units/[unitId]` | EP-14 (REST); EP-01, EP-06 (**Server Action**) | `GetAcademyUnitDetailQuery`, `StartUnitCommand`, `RepeatUnitCommand` | `AcademyUnitDetailHttp`, `AttemptSummaryHttp` | `useUnitDetail`, `useStartUnit`, `useRepeatUnit` | `UnitDetailContainer` | Unit+Integration |
| P-03 | `/academy/units/[unitId]/history` | EP-16 (REST) | `GetAttemptHistoryQuery` | `AttemptSummaryHttp[]` | `useUnitAttempts` | `AttemptHistoryList` | Unit |
| P-04 | `.../{contextualize,define-objectives}` | EP-21 (**Server Action**) | `AdvanceStepCommand` | `AttemptSummaryHttp` | `useAdvanceStep`, `useContinuation` | `AttemptStepContainer` | Integration |
| P-05 | `.../comprehend` | EP-22 (**Server Action**) | `VerifyComprehensionCommand` | `VerifyComprehensionActionResult` | `useVerifyComprehension` | `ComprehensionGate` | Unit+Integration |
| P-06 | `.../{observe,analyze}` | EP-19 (REST); EP-21 (**Server Action**) | `ListModelExamplesByTextTypeQuery`, `AdvanceStepCommand` | `ModelExampleHttp[]`, `AttemptSummaryHttp` | `useModelExamples`, `useAdvanceStep` | `ModelExampleCard` | Unit |
| P-07 | `.../practice` | EP-21 (**Server Action**) | `AdvanceStepCommand` | `AttemptSummaryHttp` | `useAdvanceStep` | `AttemptStepContainer` | Integration |
| P-08 | `.../{produce,rewrite}` | EP-17 (REST); EP-02, EP-03 (**Server Action**) | `AutosaveDraftCommand`, `SubmitProductionCommand`/`SubmitRevisionCommand` | `DraftHttp`, `VersionHttp` | `useDraft`, `useAutosaveDraft`, `useSubmitVersion` | `WritingEditor` | Unit+Integration+E2E |
| P-09 | `.../feedback` | EP-18 (REST); **EP-04 (REST)** | `GetVersionFeedbackQuery`, **`AdvanceToReflectionCommand`** | `FeedbackHttp`, `AttemptSummaryHttp` | `useFeedback`, **`useAdvancePhase`** | `VersionWithFeedbackPanel` | Unit+Integration+E2E (nuevo: transición P-09→P-10) |
| P-10 | `.../reflect` | EP-05 (REST) | `CompleteReflectionCommand` | `AcademyUnitDetailHttp` | `useCompleteReflection` | formulario de reflexión | Unit+Integration |
| P-11 | `/academy/model-examples` | EP-19 (REST) | `ListModelExamplesByTextTypeQuery` | `ModelExampleHttp[]` | `useModelExamples` | `ModelLibraryContainer` | Unit |
| P-12 | `/academy/teacher` | EP-20 (REST, ×N) | `GetStudentProgressSummaryQuery` | `StudentProgressSummaryHttp[]` | `useStudentProgressSummary` | `TeacherPanelContainer` | Unit+Integration |
| P-13 | `/academy/teacher/students/[studentId]` | EP-20, EP-07, EP-08 (REST) | `GetStudentProgressSummaryQuery`, `ApplyTeacherOverrideCommand`, `AssignUnitToStudentCommand` | `StudentProgressSummaryHttp`, `TeacherOverrideHttp`, `TeacherRecommendationHttp` | `useStudentProgressSummary`, `useApplyTeacherOverride`, `useAssignUnitToStudent` | `StudentDetailContainer` | Unit+Integration |
| P-14 | `/academy/admin/model-examples` | EP-19, EP-09, EP-10, EP-11 (REST) | `ListModelExamplesByTextTypeQuery`, `CreateModelExampleCommand`, `UpdateModelExampleCommand`, `RetireModelExampleCommand` | `ModelExampleHttp[]` | `useModelExamples`, `useCreateModelExample`, `useUpdateModelExample`, `useRetireModelExample` | `AdminModelLibraryContainer` | Unit+Integration |
| P-15 | `.../students/[studentId]/units/[unitId]/history` | EP-23 (REST) | `GetStudentUnitHistoryQuery` | `StudentUnitHistoryHttp` | `useStudentUnitHistory` | `StudentUnitHistoryContainer` | Unit+Integration |

**Cobertura real confirmada (corrección de la afirmación falsa de v1.0)**:
- **22 de 23 endpoints de negocio** usados por al menos una pantalla (21 ya lo estaban en v1.0 + **EP-04, ahora wireado en P-09**).
- **1 de 23 legítimamente excluido**: EP-12 — verificado directamente contra el Frontend Contract v1.1 §7: *"no consumido directamente — P-01 usa EP-13; reservado para un futuro bloque de resumen propio si se requiere"*. Su consumidor futuro **no está determinado** (corrección de AFR-F04 — v1.0 atribuía este consumo a `dashboard` sin respaldo documental; esa atribución se retira).
- **QRY-09** correctamente excluida (sin endpoint HTTP, Sección 1.3/14).
- **17/17 Commands** correctamente contabilizados: 13 wireados directamente a una pantalla, 3 legítimamente excluidos del API público (`RecordFeedbackDeliveredCommand`/CMD-04, `EvaluateMasteryCommand`/CMD-08, `ProvisionAcademyUnitsForStudentCommand`/CMD-15), y **`AdvanceToReflectionCommand`, ahora wireado en P-09** (antes ausente sin justificación en v1.0 — AFR-F02).
- **9/9 Queries** correctamente contabilizadas: 8 wireadas, 1 (`GetTeacherOverrideHistoryQuery`/QRY-09) legítimamente excluida.

---

## 23. Riesgos y mitigaciones

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| 1 | Bloqueador de gobernanza: Sprint 6.4 Frontend formalmente no debería iniciar hasta certificar la validación de runtime de H-01 | Alta (proceso, no técnica) | Incluir la certificación de esa validación como precondición dura de la Fase 0 del Roadmap (Sección 24) |
| 2 | P-12/P-13/P-15 no operables con datos reales (sin endpoint de listado de estudiantes por profesor; `hasRelationship()` siempre `false`) | Alta (funcional) | Documentado explícitamente (Sección 14, ítem 1); construir igualmente la UI completa, comunicando al equipo que esas 3 pantallas no son demostrables end-to-end hoy |
| 3 | Ausencia total de mecanismo de notificación real (`ACADEMY_FEEDBACK_READY`) | Media | Resuelta con polling acotado (Sección 8.3) |
| 4 | Discrepancias disclosed entre Contract e implementación real de DTOs (`isRecommended`, `versionCount`, `unlockedAt`, `attemptCount`, `priority`) | Media | Frontend construido contra la forma real (Sección 5), con cada gap señalado en el componente afectado |
| 5 | Rango de `WordCountRange` y contenido editorial de varios pasos no definidos | Media | Documentado en Sección 14 (ítems 2, 3, 8) |
| 6 | Cero cobertura de tests históricamente en Academia (backend); riesgo de repetir el patrón en frontend | Media | Regla de cobertura mínima congelada en Sección 21 |
| 7 | Design System insuficiente (`components/ui/` solo 6 primitivos) | Baja-Media | Extensión ya especificada como precondición de Fase 1 (Sección 11.1) |
| 8 | Vocabulario de `Error.code` y rate limiting pendientes a nivel de plataforma | Baja | Frontend diseñado para no depender de `code` específicos |
| 9 | Reconciliar la estrategia de transporte (REST vs Server Actions ya existentes) para 6 operaciones — **nuevo en v1.1** | Media (ya resuelta en este documento) | Sección 3.1 documenta exactamente qué hook usa cada transporte; sin ambigüedad restante |

---

## 24. Roadmap de implementación

No se agrupa por número de pantalla — se agrupa por dependencia funcional real.

### Fase 0 — Fundación (precondición dura antes de cualquier código de producto)
- Certificar la validación de runtime de H-01 (gobernanza, Riesgo 1).
- Extender `components/ui/` (Input, Textarea, Select, Dialog, Checkbox, Tabs, Toast, Tooltip — Sección 11.1).
- Crear `lib/apiClient.ts` genérico para las 17 operaciones REST (Sección 3).
- **Revisar y confirmar en el equipo el contrato de las 6 Server Actions ya existentes** (`features/academy/actions/`) antes de escribir los 6 hooks que las consumen — no requiere cambios en esas Server Actions, solo verificación de que su firma no ha cambiado desde esta auditoría.
- Crear `features/academy/{types,constants,services}/` completos — sin UI todavía.
- Crear namespace `academy` en `messages/{es,fr}.json`, con soporte ICU de pluralización desde el inicio (Sección 15.3).
- Resolver (decisión de producto externa a este documento) los ítems 2 y 3 de la Sección 14 lo suficiente para no bloquear la Fase 2.

### Fase 1 — Flujo principal del estudiante (mapa + detalle + historial)
P-01, P-02, P-03. Endpoints/Acciones: EP-13, EP-14, EP-15, EP-16 (REST); EP-01, EP-06 (Server Action).

### Fase 2 — Flujo completo de aprendizaje (los 10 pasos de un intento)
P-04 a P-10 completas. EP-21, EP-22, EP-03, EP-02 (Server Action); EP-19, EP-17, EP-18, **EP-04**, EP-05 (REST). Incluye ahora explícitamente la transición P-09→P-10 mediada por `useAdvancePhase()` (EP-04, resolución AFR-F02) como parte de esta misma fase — no se añade como fase separada porque es parte inseparable del mismo recorrido.

### Fase 3 — Biblioteca de Modelos (consulta, estudiante)
P-11. EP-19 (REST, uso independiente del flujo).

### Fase 4 — Profesor
P-12, P-13, P-15. EP-20, EP-07, EP-08, EP-23 (REST) — no operable con datos reales hasta resolver Sección 14, ítem 1 (Riesgo 2).

### Fase 5 — Administrador (Biblioteca de Modelos, CRUD)
P-14. EP-09, EP-10, EP-11 (REST).

### Fase 6 — Optimización
Auditoría de accesibilidad real, medición de performance (Web Vitals), ajuste de `staleTime`/prefetch, revisión de bundle size, cierre de la suite de tests de integración/E2E completa.

---

## 25. Cambios respecto a v1.0

| Hallazgo AFR | Corrección aplicada | Sección(es) modificada(s) |
|---|---|---|
| AFR-F01 (Critical) | Se corrigió la premisa falsa "100% REST, cero Server Actions". Se documentaron las 6 Server Actions reales de `features/academy/actions/` (`startUnitAction`, `repeatUnitAction`, `autosaveDraftAction`, `advanceStepAction`, `verifyComprehensionAction`, `submitVersionAction`), con su firma exacta, su comportamiento de error, y el criterio de cuándo usar cada transporte. | 1.4, 1.5, 1.6, 2.2, 2.3, 2.4, 2.5, 2.6, 3, 3.1 (nueva), 4, 4.1, 5.12 (nueva), 8.2, 9, 12 (P-02, P-04, P-05, P-06, P-07, P-08), 13, 21, 23 |
| AFR-F02 (Critical) | Se localizó y wireó `EP-04`/`AdvanceToReflectionCommand` (transición `REWRITE→REFLECT`, precondición verificada en `Attempt.advanceToReflection()`) al botón "Continuar a reflexión" de P-09. Se corrigió la matriz de trazabilidad y la afirmación de cobertura "23/23", ahora exacta. | 6.2, 8.2, 12 (P-09, P-10), 13, 22, 24 |
| AFR-F03 (Major) | Se completó la especificación de los 8 Container Components (responsabilidad, props, hooks, mutations, queries, estados, navegación, eventos, errores, responsive, accesibilidad) y de los componentes presentacionales previamente solo nombrados (`SubmitButton`, `AttemptActionButton`, `StepContentPanel`, `StepAdvanceButton`, `AttemptHistoryList`/`Row`, `TextTypeSectionHeader`, variante editable de `ModelExampleCard`). | 10.1 (nueva), 10.2, 11.2 |
| AFR-F04 (Minor) | Se retiró la atribución no respaldada de EP-12 a `dashboard`; se reemplazó por "consumidor futuro no determinado", con cita directa del Frontend Contract v1.1 §7. | 21 |
| AFR-F05 (Minor) | Se documentó la estrategia oficial de `useFormatter` para fechas/horas/números, y el uso obligatorio de sintaxis ICU para pluralización. | 15.3 |
| AFR-F06 (Minor) | Se añadió explícitamente el campo "Unauthorized" en las 15 pantallas, indicando que se resuelve uniformemente por `middleware.ts` (Clerk). | 12 (las 15 pantallas), 15.1 |
| AFR-F07 (Minor) | Se documentó la estrategia oficial de breadcrumbs: aplica a P-02, P-03, P-12, P-13, P-14, P-15; no aplica a P-01, P-11 (nivel raíz) ni a P-04–P-10 (cubierto por `StepProgressTracker`). | 19 (nueva), 4, 12 |
