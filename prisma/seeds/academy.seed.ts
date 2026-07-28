/**
 * ACADEMIA — Seed (Sprint 6.2, Infrastructure Layer).
 *
 * Alcance deliberadamente mínimo (instrucción explícita del encargo: "No
 * crear datos ficticios innecesarios"):
 *   1. Biblioteca de Modelos — un `ModelExample` ACTIVE por `TextType` (5
 *      filas), requisito para que QRY-06/CU-08 tengan contenido en un
 *      ambiente recién provisionado.
 *   2. La primera `AcademyUnit` (`position: 1`, `UNLOCKED`) por `TextType`
 *      para un estudiante de prueba ya existente (5 filas).
 *
 * Deliberadamente NO se siembra: ningún `Attempt` (se crea vía CMD-01
 * real, no vía seed — un `Attempt` sembrado directamente saltaría
 * `AttemptFactory` y podría violar invariantes sin que el Aggregate lo
 * protegiera); ningún `TeacherOverride`/`TeacherRecommendation` (acciones
 * de auditoría, no datos de catálogo); ninguna fila en `academy_outbox`
 * (tabla técnica, nunca poblada manualmente).
 *
 * Nota de dependencia: a diferencia de la Persistence Layer Specification
 * v1.0 (que asume una constante `TEST_STUDENT_ID` ya fija), este proyecto
 * no tiene, a la fecha de este Sprint, ningún seed general de usuarios de
 * prueba (`prisma/seed.ts` solo siembra el catálogo de competencias) — el
 * seed de Academia resuelve el primer `User` existente en la base y omite
 * la siembra de `AcademyUnit` (con una advertencia, no un error) si no
 * encuentra ninguno, en vez de asumir un UUID fijo que violaría la FK
 * `fk_academy_unit_student_id`.
 */
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

const TEXT_TYPES = ["LETTER", "ARTICLE", "ESSAY", "EMAIL", "REPORT"] as const;

function deterministicSeedId(namespace: string, discriminator: string): string {
  // UUID v4 determinista para poder re-ejecutar el seed de forma
  // idempotente (`upsert` por `id`) sin depender de un valor aleatorio
  // distinto en cada corrida. No es criptográficamente aleatorio a
  // propósito (es un seed de datos de referencia, no un identificador de
  // producción).
  const hash = `${namespace}:${discriminator}`
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 0xffffffff, 7);
  const hex = hash.toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-0000-4000-8000-${hex.padStart(12, "0").slice(0, 12)}`;
}

export async function seedAcademy(prisma: PrismaClient): Promise<void> {
  for (const textType of TEXT_TYPES) {
    const id = deterministicSeedId("model-example", textType);
    await prisma.modelExample.upsert({
      where: { id },
      create: {
        id,
        textType,
        content: `[Seed] Producción ejemplar de tipo ${textType} — contenido de referencia.`,
        rating: "EXCELLENT",
        curatorialComment: `[Seed] Comentario curatorial de referencia para ${textType}.`,
        status: "ACTIVE",
      },
      update: {},
    });
  }

  const testStudent = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!testStudent) {
    console.warn(
      "seedAcademy: no se encontró ningún User existente — se omite la siembra de AcademyUnit " +
        "(requiere un estudiante real, fk_academy_unit_student_id).",
    );
    return;
  }

  for (const textType of TEXT_TYPES) {
    await prisma.academyUnit.upsert({
      where: {
        studentId_textType_position: { studentId: testStudent.id, textType, position: 1 },
      },
      create: {
        id: randomUUID(),
        studentId: testStudent.id,
        textType,
        position: 1,
        state: "UNLOCKED",
      },
      update: {},
    });
  }
}
