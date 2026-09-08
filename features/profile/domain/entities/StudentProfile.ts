import { Entity } from "../shared/Entity";
import type { StudentProfileId } from "../value-objects/StudentProfileId";
import type { StudentId } from "../value-objects/StudentId";
import type { CefrLevel } from "../enums/CefrLevel";

export interface StudentProfileProps {
  studentId: StudentId;
  currentLevel: CefrLevel;
  targetLevel: CefrLevel;
  nativeLanguage: string;
  country: string | null;
  institution: string | null;
  learningGoal: string | null;
  biography: string | null;
  targetExamDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentProfileProps {
  id: StudentProfileId;
  studentId: StudentId;
  currentLevel: CefrLevel;
  targetLevel: CefrLevel;
  nativeLanguage: string;
  learningGoal: string;
  targetExamDate: Date | null;
}

// Entidad — StudentProfile (13.1/13.2, "Perfil"). Sin invariantes de
// transición de estado propias (a diferencia de LearningPlan/
// ExerciseAttempt): es un registro de perfil de una sola creación, sin
// ciclo de vida — de ahí que no exponga métodos de mutación todavía (el
// onboarding solo lo crea, nunca lo actualiza en este slice).
export class StudentProfile extends Entity<StudentProfileId> {
  private readonly props: StudentProfileProps;

  private constructor(id: StudentProfileId, props: StudentProfileProps) {
    super(id);
    this.props = props;
  }

  public static create(input: CreateStudentProfileProps): StudentProfile {
    const now = new Date();
    return new StudentProfile(input.id, {
      studentId: input.studentId,
      currentLevel: input.currentLevel,
      targetLevel: input.targetLevel,
      nativeLanguage: input.nativeLanguage,
      country: null,
      institution: null,
      learningGoal: input.learningGoal,
      biography: null,
      targetExamDate: input.targetExamDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(id: StudentProfileId, props: StudentProfileProps): StudentProfile {
    return new StudentProfile(id, props);
  }

  public get studentId(): StudentId {
    return this.props.studentId;
  }

  public get currentLevel(): CefrLevel {
    return this.props.currentLevel;
  }

  public get targetLevel(): CefrLevel {
    return this.props.targetLevel;
  }

  public get nativeLanguage(): string {
    return this.props.nativeLanguage;
  }

  public get learningGoal(): string | null {
    return this.props.learningGoal;
  }

  public get targetExamDate(): Date | null {
    return this.props.targetExamDate;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
