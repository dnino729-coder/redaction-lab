# components/ui

Componentes base de shadcn/ui (Button, Card, Modal, Dialog, Avatar, ProgressBar,
Tabs, Navbar, Sidebar, Tooltip, Input, Badge, Loading, Charts — sección 5.4/14.6).

Se instalan con la CLI oficial de shadcn/ui (`npx shadcn@latest add <componente>`)
cuando se desarrolle cada módulo que los requiera. No se generan aquí por
adelantado para no anticipar funcionalidad de producto.

**Excepción (Academia, Fase 0 — fundamentos frontend)**: `Loading`, `StatusPanel`
y sus cinco envoltorios semánticos (`EmptyState`, `ErrorState`, `ForbiddenState`,
`UnauthorizedState`, `NotFoundState`) se generaron por adelantado porque las 15
pantallas de Academia comparten literalmente los mismos 6 estados (Loading/
Empty/Error/Forbidden/Unauthorized/NotFound) en su especificación — son
primitivos genéricos de plataforma (no contienen vocabulario de dominio de
ningún feature), por lo que viven aquí y no en `features/academy/`.

**Excepción (Academia, Sprint 1.2 — P-01)**: `Select` se generó al implementar
P-01 porque el Blueprint (sección 11.1) lo exige explícitamente para el filtro
de `textType` de esa pantalla — es un primitivo genérico (`<select>` nativo
estilizado), no contiene vocabulario de dominio de Academia.

**Excepción (Academia, Sprint 1.6 — P-05)**: `Textarea` se generó al
implementar `ComprehensionGate` — el Blueprint (sección 11.1) lo atribuye a
`WritingEditor`/reflexión (P-08/P-10), pero P-05 necesita el mismo primitivo
para la respuesta de verificación de comprensión y todavía no existía.
Primitivo genérico (`<textarea>` nativo estilizado), no contiene vocabulario
de dominio de Academia.
