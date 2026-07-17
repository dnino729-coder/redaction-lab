# Redaction Lab — Infraestructura Técnica

> Fuente de verdad: `02_Conocimiento_Consolidado_Resuelto.md`. Cada decisión de
> este documento referencia la sección correspondiente. Ninguna funcionalidad
> de producto se define aquí — solo infraestructura, convenciones y reglas.

## 1. Estructura completa de carpetas

Estructura de alto nivel (sección 5.4, Feature-Driven Architecture — confirmada
como oficial y única en la resolución 18.2):

```
redaction-lab/
├── app/                    # Next.js App Router — SOLO navegación (rutas, layouts,
│                            # loading, error, metadata). Prohibido alojar lógica aquí.
│   ├── [locale]/            # Segmento de idioma (resolución 18.18, next-intl).
│   │   ├── (public)/landing/
│   │   ├── (auth)/sign-in/, sign-up/
│   │   ├── (app)/dashboard/, my-plan/, about-delf/, academy/, laboratory/,
│   │   │        daily-training/, simulator/, analytics/, profile/, settings/
│   │   │        (rutas privadas — 12.9; segmentos en inglés, resolución 18.19)
│   │   ├── layout.tsx        # Layout raíz efectivo: <html lang={locale}>, NextIntlClientProvider, AppProviders
│   │   ├── error.tsx, loading.tsx, not-found.tsx
│   │   └── (no existe app/layout.tsx — [locale]/layout.tsx cumple ese rol; patrón oficial de next-intl)
│   ├── global-error.tsx      # Permanece fuera de [locale] (requisito de Next.js: fallback si el layout raíz falla)
│   └── api/webhooks/, health/   (Route Handlers — solo integraciones/infraestructura; SIN prefijo de idioma)
├── i18n/                     # routing.ts (locales, default, prefijo), request.ts (resolución de
│                              # mensajes por request), navigation.ts (Link/redirect/useRouter con idioma) — 18.18
├── messages/                 # Diccionarios de traducción: fr.json (fuente primaria), es.json — 18.18
├── features/                # Un feature = un ecosistema pedagógico (5.4)
│   └── {dashboard, my-plan, academy, laboratory, daily-training, simulator,
│         analytics, profile, coach, gamification, notifications, settings}/
│         ("my-plan" corregido de "mi-plan" — resolución 18.19)
│       └── components/ pages/ hooks/ services/ types/ schemas/ utils/ constants/ actions/
├── components/               # Globales reutilizables (Button, Card, Modal... — 14.6)
├── services/                 # Lógica de negocio compartida: auth/ ai/ analytics/
│                              # gamification/ storage/ database/ notifications/
├── lib/                       # Wrappers de bajo nivel (cliente Prisma, cliente Redis,
│                              # validación de entorno) — SIN lógica de negocio
├── prompts/                   # Prompt Engine (9.6): coach/ feedback/ simulation/
│                              # evaluation/ recommendations/ grammar/ writing/
├── database/                  # queries/ y repositories/ (el esquema Prisma vive en
│                              # /prisma por convención de la herramienta — nota 18.1)
├── config/                    # theme, navigation, routes, constants, metadata, environment
├── providers/                 # ThemeProvider, AuthProvider, CoachProvider,
│                              # AnalyticsProvider, ToastProvider
├── stores/                    # Zustand — un dominio por store (userStore, coachStore,
│                              # dashboardStore, settingsStore, progressStore)
├── hooks/                      # useAuth, useTheme, useDebounce, useProgress, useToast, useMediaQuery
├── types/                       # user, lesson, simulation, coach, feedback, progress
├── utils/                       # dates, strings, formatters, validators, calculations (sin lógica pedagógica)
├── assets/                      # illustrations/ icons/ avatars/ animations/ backgrounds/ logos/
├── middleware/                  # auth.ts, i18n.ts, session.ts (lógica modular)
├── middleware.ts                 # Punto de entrada raíz exigido por Next.js — compone middleware/
├── styles/                       # globals.css (capas Tailwind + variables de tokens)
├── public/                       # Estáticos
├── tests/                        # unit/ integration/ e2e/ fixtures/
├── prisma/                       # schema.prisma, migrations/, seed.ts
├── docs/                          # Documentación viva (16.3)
├── .github/workflows/             # CI/CD
└── (archivos de configuración raíz — ver sección 5 de este documento)
```

**Nota de fidelidad:** la sección 5.4 original lista estas carpetas en la raíz
de `redaction-lab/` (no dentro de `src/`); se respeta literalmente esa
convención para no reinterpretar la especificación.

## 2. Arquitectura definitiva

- **Patrón general:** Feature-Driven Architecture (5.4, resolución 18.2). Cada
  ecosistema pedagógico (sección 6) es un módulo independiente bajo `features/`,
  con estructura interna idéntica y responsabilidades delimitadas.
- **Backend:** Next.js App Router — Route Handlers y Server Actions (resolución
  18.1). No existe un servicio NestJS independiente.
- **Orquestación de servicios (5.6/5.7):** ningún ecosistema se comunica
  directamente con otro. Toda interacción pasa por servicios compartidos
  (`services/`) o, en fases posteriores de desarrollo, por un Motor de
  Orquestación explícito. Esta regla debe respetarse desde el primer módulo
  que se implemente.
- **Capa de IA (9.4):** el AI Orchestrator es el único componente autorizado a
  comunicarse con los proveedores de IA. Ningún módulo llama directamente a
  OpenAI/Anthropic — todo pasa por `services/ai`.
- **Base de datos (13):** PostgreSQL 17 vía Supabase + Prisma ORM (resolución
  18.1). El esquema físico completo (60+ tablas) se implementará módulo por
  módulo, en el orden de migraciones ya fijado (13.14): `01_initial_schema →
  02_authentication → 03_profiles → 04_academic_structure → 05_learning_plan →
  06_writing → 07_delf_evaluation → 08_coach_ai → 09_learning_analytics →
  10_gamification → 11_notifications → 12_administration → 13_integrations →
  14_indexes → 15_seed_data`.
- **Autenticación (12):** Clerk como proveedor único (resolución 18.1). RBAC
  con 7 roles (`SUPER_ADMIN, ADMIN, TEACHER, STUDENT, REVIEWER, AI_SERVICE,
  SYSTEM` — resoluciones 18.4/18.14).
- **Diseño (14):** todo componente visual debe referenciar los Design Tokens
  ya registrados en `tailwind.config.ts` (14.12). Prohibido usar valores HEX,
  RGB, tamaños o sombras directamente en componentes.

## 2.1 Límite entre `/prisma`, `database/` y `services/database/` (hallazgo 9 de la auditoría)

El documento fuente (5.4) define dos conceptos con nombre similar; a esto se
suma la ubicación exigida por la herramienta Prisma. Para evitar ambigüedad,
la frontera de responsabilidad es la siguiente, sin excepciones:

| Ubicación | Contiene | No contiene |
|---|---|---|
| `/prisma` | `schema.prisma` (modelos, enums, relaciones), `migrations/`, `seed.ts` | Ninguna consulta ni lógica de negocio |
| `database/queries` | Consultas Prisma reutilizables y compuestas (ej. "producciones pendientes de corrección de un estudiante") | Reglas de negocio, validaciones, efectos secundarios |
| `database/repositories` | Repositorios que envuelven `database/queries` con una interfaz orientada a entidad (ej. `WritingSubmissionRepository`) | Llamadas a servicios externos, IA, notificaciones |
| `services/database` | Orquestación de reglas de negocio que combinan uno o más repositorios (ej. "al enviar una producción, crear versión + disparar evaluación") | Acceso SQL/Prisma directo — siempre pasa por `database/` |

Regla de dependencia unidireccional: `services/database` → `database/repositories` → `database/queries` → `/prisma` (cliente). Nunca en sentido inverso.

## 3. Stack tecnológico (resolución 18.1 y anexos)

| Capa | Tecnología | Referencia |
|---|---|---|
| Framework | Next.js 14 (App Router) | 5.2, 18.1 |
| UI | React 18 + TypeScript estricto | 5.2 |
| Estilos | Tailwind CSS + shadcn/ui | 5.2, 14 |
| Animación | Framer Motion | 5.2 |
| Formularios | React Hook Form + Zod | 5.2 |
| Estado | Zustand (global) + TanStack Query (servidor) | 5.2 |
| Autenticación | Clerk | 18.1 |
| Base de datos | PostgreSQL 17 (Supabase) | 18.1 |
| ORM | Prisma | 18.1 |
| Almacenamiento de archivos | Supabase Storage (AWS S3 descartado) | 18.16 |
| Internacionalización (i18n) | next-intl — francés (`fr`) predeterminado, español (`es`) vía selector, `localePrefix: "as-needed"` | 18.18 |
| Caché | Redis | 15.1 |
| IA | OpenAI + Anthropic Claude (Gemini reservado, no activo) | 9.4, 18.1 |
| Observabilidad | Sentry, PostHog, OpenTelemetry (`@vercel/otel`, `instrumentation.ts`); Prometheus/Grafana consumen las métricas exportadas, sin dependencia npm propia | 15.5, hallazgo 11 |
| CI/CD | GitHub Actions (`ci.yml` valida, `deploy.yml` despliega por entorno) | 15.6, hallazgo 6 |
| Despliegue | Vercel (principal); Railway/Render/AWS/Azure compatibles | 18.1 |
| Testing | Vitest + Testing Library (unit/integración), Playwright (e2e) | 15.6, 16.2 |
| Gestor de paquetes | npm | — (decisión de tooling no especificada en el documento; se elige npm por venir incluido con Node.js, sin pasos de setup adicionales en CI, y por permitir generar un lockfile reproducible desde el primer commit — ver auditoría, hallazgo 2) |

## 4. Dependencias

### 4.1 Dependencias externas (ya reflejadas en `package.json`)

Producción: `next, react, react-dom, @clerk/nextjs, next-intl, @prisma/client,
@supabase/supabase-js, zod, react-hook-form, @hookform/resolvers, zustand,
@tanstack/react-query, framer-motion, class-variance-authority, clsx,
tailwind-merge, lucide-react, ioredis, @sentry/nextjs, posthog-js,
posthog-node, @vercel/otel, @opentelemetry/api`.

Desarrollo: `typescript, prisma, tailwindcss, postcss, autoprefixer, eslint
(+ config Next + TypeScript + eslint-plugin-import +
eslint-import-resolver-typescript), prettier (+ plugin Tailwind), vitest (+
Testing Library, jsdom), @playwright/test, tsx, husky, lint-staged`.

Lockfile: `package-lock.json` (npm, lockfileVersion 3, 957 paquetes)
comprometido en el repositorio — generado y verificado como parte de esta
auditoría (hallazgo 2, resuelto) y regenerado al incorporar `next-intl`
(resolución 18.18).

**Nota de resolución de dependencias:** `eslint-import-resolver-typescript`
se fija en la versión exacta `3.6.1` (sin `^`) porque versiones más recientes
(≥3.7) introducen una dependencia opcional en `eslint-plugin-import-x`, que
exige `@typescript-eslint/utils@^8.x` — incompatible con
`@typescript-eslint/eslint-plugin@^7.16.0`, ya fijado en este proyecto y
requerido por `eslint-config-next@14.2.x`. Confirmado mediante `npm install
--package-lock-only`, que falló con `ERESOLVE` antes de esta fijación.

### 4.2 Dependencias internas entre carpetas (reglas obligatorias, sección 5.4)

- `features/*` **nunca** importa directamente de otro `features/*`. Toda
  comunicación pasa por `services/` o por interfaces públicas.
- `services/*` **nunca** depende de componentes visuales (`components/`,
  `features/*/components`).
- `components/` (global) **nunca** contiene componentes específicos de un
  ecosistema — esos viven en `features/*/components`.
- `utils/` no contiene lógica pedagógica; `lib/` no contiene lógica de negocio
  (solo wrappers de clientes/infraestructura).
- `app/` no contiene lógica: solo importa y renderiza lo que exponen
  `features/*/pages` y `providers/`.
- `prompts/` es el único lugar permitido para plantillas de IA — prohibido
  incrustar prompts en el código de componentes o servicios.
- Dependencias unidireccionales y explícitas en todo momento (5.4); prohibidas
  las dependencias circulares.

## 5. Configuración inicial (archivos ya creados en este scaffold)

| Archivo | Propósito |
|---|---|
| `package.json` | Dependencias y scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `prisma:*`, `db:seed`) |
| `tsconfig.json` | TypeScript estricto (`strict: true`), sin `allowJs` (5.2: "no se permitirá código JavaScript sin tipado"), alias `@/*` por carpeta |
| `next.config.mjs` | Configuración de plataforma (imágenes, Server Actions); envuelto con `createNextIntlPlugin("./i18n/request.ts")` (18.18) |
| `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts` | Configuración de next-intl: locales soportados, locale por defecto, resolución de mensajes por request, helpers de navegación conscientes de idioma (18.18) |
| `messages/fr.json`, `messages/es.json` | Diccionarios de traducción — fr es la fuente primaria, es es la traducción derivada (18.18) |
| `tailwind.config.ts` | Registro de Design Tokens oficiales (14.12) — colores Primary/Secondary/Neutral/Success/Warning/Danger, motion tokens (400ms máx. — resolución 18.8) |
| `postcss.config.js` | Tailwind + Autoprefixer |
| `.eslintrc.json` | Next + TypeScript recomendado, prohíbe `any`, exige tipos consistentes |
| `.prettierrc.json` | Formato + plugin de orden de clases Tailwind |
| `.env.example` | Plantilla de variables (BD, Clerk, IA, Redis, observabilidad) — ninguna clave expuesta al cliente salvo `NEXT_PUBLIC_*` (15.6, 9.4) |
| `.gitignore` | Exclusiones estándar |
| `.nvmrc` | Node ≥ 20 |
| `docker-compose.yml` | Postgres 17 + Redis locales para desarrollo |
| `prisma/schema.prisma` | Solo `datasource`/`generator` — sin modelos todavía |
| `vitest.config.ts` | Umbral de cobertura 90% (15.6/16.2) |
| `playwright.config.ts` | Configuración e2e |
| `.github/workflows/ci.yml` | Lint → typecheck → tests → build → e2e |
| `.vscode/settings.json`, `.vscode/extensions.json` | Formato al guardar, extensiones recomendadas |

## 6. Convenciones (síntesis de 13.13 y 16.4 — no negociables)

| Elemento | Formato | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `LessonCard.tsx` |
| Hooks | camelCase, prefijo `use` | `useLesson.ts` |
| Servicios | camelCase | `lessonService.ts` |
| Tipos | PascalCase | `Lesson.ts` |
| Carpetas | kebab-case | `daily-training` |
| Variables | camelCase | `studentId` |
| Constantes | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| Tablas (BD) | singular, snake_case, inglés | `writing_submission` |
| Columnas (BD) | snake_case | `student_id` |
| Enum (tipo) | PascalCase | `SubmissionStatus` |
| Enum (valores) | UPPER_SNAKE_CASE | `ACTIVE` |
| Endpoints API | kebab-case | `/api/learning-plans` |
| Migraciones | `YYYYMMDDHHMM_descripcion` | `202708150900_initial_schema` |

Regla de estabilidad (13.13/13.15): una vez publicada una migración o
convención, no se renombra ni se reutiliza para una entidad distinta.

## 7. Reglas de desarrollo

1. **Modularidad ante todo** (5.4, 16.1): cada módulo se implementa,
   documenta y prueba de forma independiente.
2. **`app/` no aloja lógica** (5.4): solo estructura de navegación.
3. **Ninguna feature accede a otra feature directamente** (5.4): pasar por
   `services/` o por el Motor de Orquestación cuando exista.
4. **La IA solo se invoca a través del AI Orchestrator** (`services/ai` —
   9.4): prohibido llamar a proveedores de IA desde cualquier otro punto.
5. **Prompts versionados en `prompts/`** (9.6): prohibido incrustarlos en
   componentes o servicios.
6. **TypeScript estricto obligatorio** (5.2): sin `any`, sin JavaScript sin
   tipar.
7. **Todo valor visual referencia un Design Token** (14.12): prohibido HEX/RGB
   directos en componentes.
7.1. **Cabeceras de seguridad base ya activas** (`next.config.mjs`:
   X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
   Permissions-Policy, HSTS — hallazgo 12 de la auditoría). La política
   `Content-Security-Policy` completa queda pendiente **a propósito**: fijar
   sus directivas `script-src`/`connect-src` ahora, sin conocer los dominios
   reales de Clerk/Sentry/PostHog/Supabase que se usarán, arriesgaría con
   bloquear esas integraciones o con inventar valores no verificados. Debe
   completarse en el módulo de Autenticación, con los dominios reales.
8. **Migraciones atómicas y reversibles** (13.14): una migración = un módulo
   funcional; nunca modificar una migración ya aplicada.
9. **Cobertura mínima de pruebas unitarias: 90%** (15.6/16.2); toda feature
   relevante incluye pruebas de integración y, cuando corresponda, e2e.
10. **Antes de tocar cualquier módulo**, analizar y exponer explícitamente sus
    dependencias con el resto del sistema (regla obligatoria del protocolo de
    trabajo vigente en este proyecto).
11. **No se introducen tecnologías, librerías o patrones no contemplados** en
    el documento consolidado o en sus resoluciones (sección 18) sin señalarlo
    explícitamente como decisión de infraestructura abierta.
12. **Documentación viva** (16.3): todo cambio de esquema actualiza ERD,
    `schema.prisma`, `migration.sql` y `docs/database.md`.
13. **Toda la interfaz de usuario se redacta primero en francés y se traduce
    mediante claves de i18n** (18.18): prohibido incrustar texto de UI
    literal (hardcoded) en componentes — todo texto visible pasa por
    `next-intl` (`useTranslations`/`getTranslations`) y vive en
    `messages/fr.json` (fuente) y `messages/es.json` (traducción). Los
    identificadores de código permanecen siempre en inglés.

## 8. Organización del proyecto

- **Ciclo de vida** (16.3): Planeación → Desarrollo → Pruebas → Producción →
  Monitoreo → Mejoras → Nueva versión.
- **Entornos** (13.14): Development → Testing → Staging → Production; nunca
  se ejecuta una migración directamente en producción. Mapeo concreto
  (hallazgo 6 de la auditoría, resuelto en `.github/workflows/deploy.yml`):
  Development = entorno local (`docker-compose.yml`); Testing = preview
  deploy automático de Vercel por Pull Request; Staging = job
  `deploy-staging` al hacer merge a `develop`; Production = job
  `deploy-production` al hacer merge a `main`, protegido por el Environment
  "production" de GitHub (revisores obligatorios configurables).
- **Orden de desarrollo recomendado**, alineado al orden de migraciones (13.14)
  y a las fases del PRD (16.2): Arquitectura base (ya cubierta por este
  scaffold) → Autenticación → Perfiles → Dashboard → Módulos pedagógicos
  (Academia, Laboratorio) → Integración IA (Coach, Feedback, Evaluation
  Engine) → Evaluación/Certificación → Gamificación → Espacio del Profesor →
  Panel Administrativo → Pruebas → Optimización → Despliegue.
- **Versionado semántico** (16.2/16.3): `MAJOR.MINOR.PATCH`; `v0.1.0` para
  esta fase de infraestructura.
- **Gobernanza** (16.3): Dirección académica (contenidos/criterios DELF),
  Dirección técnica (arquitectura/seguridad/IA), Equipo docente (actividades),
  Administración del sistema (usuarios/backups/soporte).

---

**Próximo paso sugerido:** análisis de dependencias del primer módulo a
desarrollar (formato: qué hace / de qué depende / qué lo consume / riesgos),
antes de escribir ningún código de producto.
