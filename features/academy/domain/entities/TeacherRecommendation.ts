import { Entity } from "../shared/Entity";
import { TeacherRecommendationId } from "../value-objects/TeacherRecommendationId";

// Entity raíz de agregado minimalista (Persistence Layer v1.0, Sección 5;
// Application Layer Spec v1.0, CMD-11 AssignUnitToStudent) — registro
// puramente informativo de una recomendación pedagógica de un Teacher
// sobre una AcademyUnit para un estudiante, "sin efecto de estado"
// (resolución ARB, ACP-002-A: no carga ni invoca comportamiento de
// ningún Aggregate).
interface TeacherRecommendationProps {
  unitId: string;
  studentId: string;
  teacherId: string;
  recommendedAt: Date;
}

export class TeacherRecommendation extends Entity<TeacherRecommendationId> {
  private readonly props: TeacherRecommendationProps;

  private constructor(id: TeacherRecommendationId, props: TeacherRecommendationProps) {
    super(id);
    this.props = props;
  }

  public static create(params: {
    id: TeacherRecommendationId;
    unitId: string;
    studentId: string;
    teacherId: string;
  }): TeacherRecommendation {
    return new TeacherRecommendation(params.id, {
      unitId: params.unitId,
      studentId: params.studentId,
      teacherId: params.teacherId,
      recommendedAt: new Date(),
    });
  }

  public static reconstitute(params: {
    id: TeacherRecommendationId;
    unitId: string;
    studentId: string;
    teacherId: string;
    recommendedAt: Date;
  }): TeacherRecommendation {
    return new TeacherRecommendation(params.id, {
      unitId: params.unitId,
      studentId: params.studentId,
      teacherId: params.teacherId,
      recommendedAt: params.recommendedAt,
    });
  }

  public get unitId(): string {
    return this.props.unitId;
  }

  public get studentId(): string {
    return this.props.studentId;
  }

  public get teacherId(): string {
    return this.props.teacherId;
  }

  public get recommendedAt(): Date {
    return this.props.recommendedAt;
  }
}
