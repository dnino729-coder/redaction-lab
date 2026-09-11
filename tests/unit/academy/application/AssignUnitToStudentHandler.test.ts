// AssignUnitToStudentHandler — CMD-11 (recomendar), "sin efecto de
// estado" (ACP-002-A): no toca ningún Aggregate, solo crea un registro
// informativo de TeacherRecommendation. Cubre su única regla real de
// autorización (relación docente-estudiante) y su regla de existencia
// del recurso referenciado.
import { describe, it, expect } from "vitest";
import { AssignUnitToStudentHandler } from "@/features/academy/application/handlers/AssignUnitToStudentHandler";
import { AssignUnitToStudentCommand } from "@/features/academy/application/commands/AssignUnitToStudentCommand";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ForbiddenException } from "@/features/academy/application/exceptions/ForbiddenException";
import type { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import {
  makeAcademyUnitRepository,
  makeTeacherRecommendationRepository,
  makeUuidGenerator,
  makeAuthorizationGuard,
} from "./mocks";
import { FIXTURE_IDS } from "../domain/fixtures";

function buildHandler() {
  const academyUnitRepository = makeAcademyUnitRepository();
  const teacherRecommendationRepository = makeTeacherRecommendationRepository();
  const uuidGenerator = makeUuidGenerator([FIXTURE_IDS.teacherOverride]);
  const authorizationGuard = makeAuthorizationGuard();
  const handler = new AssignUnitToStudentHandler(
    academyUnitRepository as never,
    teacherRecommendationRepository as never,
    uuidGenerator as never,
    authorizationGuard as never,
  );
  return { handler, academyUnitRepository, teacherRecommendationRepository, authorizationGuard };
}

function validRequest() {
  return {
    unitId: FIXTURE_IDS.unit,
    studentId: FIXTURE_IDS.student,
    teacherId: FIXTURE_IDS.teacher,
  };
}

describe("AssignUnitToStudentHandler", () => {
  it("rechaza con ForbiddenException si no existe relación docente-estudiante, sin llegar a consultar la Unidad", async () => {
    const { handler, authorizationGuard, academyUnitRepository } = buildHandler();
    authorizationGuard.assertTeacherRelationship.mockRejectedValue(
      new ForbiddenException("ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP", "sin relación"),
    );

    await expect(
      handler.handle(AssignUnitToStudentCommand.fromRequest(validRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(academyUnitRepository.findById).not.toHaveBeenCalled();
  });

  it("rechaza con ResourceNotFoundException si la AcademyUnit no existe", async () => {
    const { handler, academyUnitRepository, teacherRecommendationRepository } = buildHandler();
    academyUnitRepository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(AssignUnitToStudentCommand.fromRequest(validRequest())),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(teacherRecommendationRepository.create).not.toHaveBeenCalled();
  });

  it("crea la TeacherRecommendation y retorna su DTO — camino feliz", async () => {
    const { handler, academyUnitRepository, teacherRecommendationRepository } = buildHandler();
    academyUnitRepository.findById.mockResolvedValue({} as unknown as AcademyUnit);

    const result = await handler.handle(AssignUnitToStudentCommand.fromRequest(validRequest()));

    expect(result.unitId).toBe(FIXTURE_IDS.unit);
    expect(result.studentId).toBe(FIXTURE_IDS.student);
    expect(result.teacherId).toBe(FIXTURE_IDS.teacher);
    expect(teacherRecommendationRepository.create).toHaveBeenCalledTimes(1);
  });
});
