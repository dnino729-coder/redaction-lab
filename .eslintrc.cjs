// Redaction Lab — configuración de ESLint.
//
// NOTA: existe también un `.eslintrc.json` en la raíz, pero está vacío
// (`{}`) y es ignorado por diseño: ESLint solo carga un archivo de
// configuración por directorio, y `.eslintrc.js`/`.cjs` tiene prioridad
// sobre `.eslintrc.json` en su orden de resolución. Se conserva vacío en
// vez de eliminarlo por restricciones de escritura del entorno de
// generación de este scaffold; no representa una configuración activa.
//
// Corrige el hallazgo 1 de la auditoría de infraestructura: la regla
// anterior (`no-restricted-imports` con un patrón relativo) no detectaba
// los imports entre features hechos con el alias `@/features/*` definido
// en tsconfig.json — es decir, la forma en que realmente se importaría
// una feature desde otra. Aquí se sustituye por `import/no-restricted-paths`
// (eslint-plugin-import), que resuelve los imports a rutas de archivo real
// (vía eslint-import-resolver-typescript) y por tanto detecta la violación
// sin importar si el import es relativo o por alias.

// "my-plan" corregido de "mi-plan" (resolución 18.19, refactor
// arquitectónico de cierre de sprint): era la única clave de FEATURES que no
// seguía la convención de código en inglés (18.2) — el resto ya estaba
// correcto. Debe coincidir exactamente con el nombre real de la carpeta
// features/my-plan/.
const FEATURES = [
  "dashboard",
  "my-plan",
  "academy",
  "laboratory",
  "daily-training",
  "simulator",
  "analytics",
  "profile",
  "coach",
  "gamification",
  "notifications",
  "settings",
];

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "plugin:import/typescript"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",

    // Regla obligatoria (sección 5.4): "una feature nunca accederá
    // directamente a otra feature". Se expresa como una zona por cada
    // feature: los archivos dentro de features/<X> no pueden importar
    // desde features/<Y> para ningún Y != X. Sí pueden importar desde su
    // propia carpeta (`except`).
    "import/no-restricted-paths": [
      "error",
      {
        zones: FEATURES.map((feature) => ({
          target: `./features/${feature}`,
          from: "./features",
          except: [`./${feature}`],
          message:
            "Una feature nunca debe importar directamente de otra feature (sección 5.4). Comunícate mediante services/ compartidos o, cuando exista, el Motor de Orquestación (sección 5.7).",
        })),
      },
    ],
  },
  overrides: [
    {
      // app/ (páginas/layouts) solo debe importar desde features/*/pages,
      // providers/ y components/ globales — nunca desde services/, prompts/
      // ni subcarpetas internas de una feature distintas de `pages`.
      // Excluye app/api/**: los Route Handlers tienen su propia regla, más
      // abajo (no son componentes de página — son la capa de backend de la
      // app, análoga a una Server Action, y sí necesitan invocar servicios).
      files: ["app/**/*.{ts,tsx}"],
      excludedFiles: ["app/api/**"],
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              {
                target: "./app",
                from: "./features",
                except: FEATURES.map((f) => `./${f}/pages`),
                message:
                  "app/ solo debe importar la superficie pública de una feature (features/*/pages). Toda otra lógica (services/, hooks/, actions/) debe permanecer encapsulada dentro de la feature (sección 5.4).",
              },
            ],
          },
        ],
      },
    },
    {
      // app/api/** (Route Handlers) puede importar la fachada de servicio de
      // una feature (features/*/services) además de pages/ — descubierto al
      // implementar el módulo Dashboard: un Route Handler necesita invocar
      // el Dashboard Service (docs/modules/dashboard.md, sección 11: "Route
      // Handler interno, opcional: GET /api/dashboard/refresh"), no solo
      // renderizar una página. Sigue prohibido importar hooks/, actions/ o
      // subcarpetas internas de una feature.
      files: ["app/api/**/*.{ts,tsx}"],
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              {
                target: "./app/api",
                from: "./features",
                except: FEATURES.flatMap((f) => [`./${f}/pages`, `./${f}/services`]),
                message:
                  "app/api/ solo debe importar features/*/pages o features/*/services (la fachada pública de datos de una feature).",
              },
            ],
          },
        ],
      },
    },
  ],
};
