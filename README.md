# Redaction Lab

Plataforma web de entrenamiento de la producción escrita DELF B2 mediante Inteligencia Artificial.

> Fuente de verdad única del proyecto: `02_Conocimiento_Consolidado_Resuelto.md`
> (documento consolidado + sección 18, resoluciones vinculantes). Toda referencia
> de sección en este repositorio remite a ese documento.

Este repositorio contiene, en esta fase, **únicamente infraestructura técnica**:
estructura de carpetas, configuración, convenciones y reglas de desarrollo. No
contiene todavía funcionalidades ni lógica de ningún módulo/ecosistema pedagógico.

## Requisitos

- Node.js ≥ 20 LTS (ver `.nvmrc`)
- npm ≥ 10 (incluido con Node — sin instalación adicional)
- Docker (para Postgres y Redis locales — ver `docker-compose.yml`)

## Arranque local

```bash
cp .env.example .env.local   # completar valores reales
docker compose up -d          # Postgres 17 + Redis locales
npm install                    # genera/actualiza package-lock.json si hace falta
npm run prisma:generate
npm run dev
```

El repositorio ya incluye un `package-lock.json` real y comprometido — en
CI y en cualquier entorno reproducible se debe usar `npm ci`, no `npm install`.

## Internacionalización (i18n)

La interfaz se diseña primero en francés (`fr`, idioma predeterminado) y se
traduce al español (`es`) mediante un selector de idioma, sin modificar el
código de los componentes (resolución 18.18). Implementado con `next-intl`:

- `i18n/routing.ts` — locales soportados (`fr`, `es`), locale por defecto (`fr`).
- `messages/fr.json` / `messages/es.json` — diccionarios de traducción.
- Rutas de página bajo `app/[locale]/...`; con `fr` no se añade prefijo de URL
  (`/dashboard`), `es` sí (`/es/dashboard`).
- El código fuente (variables, funciones, componentes, archivos, APIs) se
  mantiene siempre en inglés.

## Documentación

- `ARCHITECTURE.md` — arquitectura definitiva, stack, convenciones y reglas de desarrollo.
- `docs/` — documentación viva generada durante el desarrollo (changelog, manual técnico, ERD, etc. — sección 16.3).
- `02_Conocimiento_Consolidado_Resuelto.md` — fuente de verdad funcional/pedagógica/de datos.

## Estado del proyecto

Fase actual: **infraestructura técnica** (sin módulos implementados). Próximo
paso: desarrollo módulo por módulo, previo análisis de dependencias de cada
uno (regla obligatoria 6 del protocolo de trabajo).
