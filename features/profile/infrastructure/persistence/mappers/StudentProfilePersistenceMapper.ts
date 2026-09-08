import type { StudentProfile as StudentProfileModel, Prisma } from "@prisma/client";
import { StudentProfile } from "@/features/profile/domain/entities/StudentProfile";
import { StudentProfileId } from "@/features/profile/domain/value-objects/StudentProfileId";
import { StudentId } from "@/features/profile/domain/value-objects/StudentId";
import type { CefrLevel } from "@/features/profile/domain/enums/CefrLevel";

// Mapper de persistencia — Dominio ⇄ fila `student_profile`. Nunca se
// devuelve el tipo generado por Prisma hacia Application.
export class StudentProfilePersistenceMapper {
  public static toDomain(row: StudentProfileModel): StudentProfile {
    return StudentProfile.reconstitute(StudentProfileId.create(row.id), {
      studentId: StudentId.create(row.userId),
      currentLevel: row.currentLevel as CefrLevel,
      targetLevel: row.targetLevel as CefrLevel,
      nativeLanguage: row.nativeLanguage,
      country: row.country,
      institution: row.institution,
      learningGoal: row.learningGoal,
      biography: row.biography,
      targetExamDate: row.targetExamDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public static toCreateData(profile: StudentProfile): Prisma.StudentProfileUncheckedCreateInput {
    return {
      id: profile.id.value,
      userId: profile.studentId.value,
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
      nativeLanguage: profile.nativeLanguage,
      learningGoal: profile.learningGoal,
      targetExamDate: profile.targetExamDate,
      updatedAt: profile.updatedAt,
    };
  }
}
