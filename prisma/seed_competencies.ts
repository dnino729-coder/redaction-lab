/**
 * Seed del catálogo `competency` (sección 13.8: "Competencias iniciales:
 * TaskAchievement, Coherence, Cohesion, Vocabulary, Grammar, Morphosyntax,
 * Spelling, Register, Argumentation, TextStructure, Revision, Autonomy").
 * Necesario para que el bloque 6 del Dashboard muestre nombres legibles en
 * vez de UUIDs — ver nota de alcance en prisma/schema.prisma, modelo
 * `Competency`.
 *
 * `name` en francés (idioma de diseño primario, resolución 18.18) — la
 * traducción de nombres de competencias a español, si se necesita en UI,
 * se resuelve vía i18n en el módulo que las muestre, no duplicando esta
 * tabla.
 */

import type { PrismaClient } from "@prisma/client";

const INITIAL_COMPETENCIES = [
  { code: "TaskAchievement", name: "Respect de la consigne" },
  { code: "Coherence", name: "Cohérence" },
  { code: "Cohesion", name: "Cohésion" },
  { code: "Vocabulary", name: "Vocabulaire" },
  { code: "Grammar", name: "Grammaire" },
  { code: "Morphosyntax", name: "Morphosyntaxe" },
  { code: "Spelling", name: "Orthographe" },
  { code: "Register", name: "Registre" },
  { code: "Argumentation", name: "Argumentation" },
  { code: "TextStructure", name: "Structure du texte" },
  { code: "Revision", name: "Révision" },
  { code: "Autonomy", name: "Autonomie" },
] as const;

export async function seedCompetencies(prisma: PrismaClient): Promise<void> {
  for (const competency of INITIAL_COMPETENCIES) {
    await prisma.competency.upsert({
      where: { code: competency.code },
      create: competency,
      update: { name: competency.name },
    });
  }
}
