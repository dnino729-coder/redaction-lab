# features/dashboard

Módulo independiente (Feature-Driven Architecture — sección 5.4). Estructura
interna estándar: components/, pages/, hooks/, services/, types/, schemas/,
utils/, constants/, actions/. Una feature nunca importa directamente de otra
feature (sección 5.4: "una feature nunca accederá directamente a otra
feature"); la comunicación pasa por services/ compartidos o por el Motor de
Orquestación (sección 5.7).

**Estado:** implementado (diseño aprobado en `docs/modules/dashboard.md`).
Punto de entrada: `pages/DashboardPage.tsx` (Server Component), montado en
`app/[locale]/(app)/dashboard/page.tsx`. Fachada única de datos:
`services/dashboardService.ts` (agrega `services/database`,
`services/gamification`, `services/analytics`; cachea en Redis, 15.1).
