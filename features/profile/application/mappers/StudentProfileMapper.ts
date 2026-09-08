import type { StudentProfile } from "@/features/profile/domain/entities/StudentProfile";
import type { StudentProfileResponseDto } from "../dto/StudentProfileDto";

export class StudentProfileMapper {
  public static toResponseDto(profile: StudentProfile): StudentProfileResponseDto {
    return {
      id: profile.id.value,
      studentId: profile.studentId.value,
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
      nativeLanguage: profile.nativeLanguage,
      learningGoal: profile.learningGoal,
      targetExamDate: profile.targetExamDate ? profile.targetExamDate.toISOString() : null,
    };
  }
}
