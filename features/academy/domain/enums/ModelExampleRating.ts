// Campo editorial de `ModelExample` — calificación editorial (excelente /
// con errores), Persistence Layer v1.0 §1 (`ModelExampleRating`). Sin
// equivalente como Value Object de Domain Model (campo editorial simple,
// no una regla de negocio), se modela igualmente como enum de dominio
// para tipar el Aggregate `ModelExample`.
export const ModelExampleRating = {
  EXCELLENT: "EXCELLENT",
  HAS_ERRORS: "HAS_ERRORS",
} as const;

export type ModelExampleRating = (typeof ModelExampleRating)[keyof typeof ModelExampleRating];
