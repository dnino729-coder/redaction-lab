// Ciclo de vida editorial de `ModelExample` — Persistence Layer v1.0 §1
// (`ModelExampleStatus`): `ACTIVE` (CMD-12/13) / `RETIRED` (CMD-14, soft
// delete).
export const ModelExampleStatus = {
  ACTIVE: "ACTIVE",
  RETIRED: "RETIRED",
} as const;

export type ModelExampleStatus = (typeof ModelExampleStatus)[keyof typeof ModelExampleStatus];
