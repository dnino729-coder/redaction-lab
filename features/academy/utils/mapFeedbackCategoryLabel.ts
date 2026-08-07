// Blueprint §6.5/§11.2 (P-09). Traduce una `FeedbackCategory` a su clave de
// traducción dentro de `academy.feedback` — evita repetir el prefijo
// `category.` en cada componente que necesite mostrar la etiqueta.
import type { FeedbackCategory } from "../types/enums";

export function mapFeedbackCategoryLabel(category: FeedbackCategory): string {
  return `category.${category}`;
}
