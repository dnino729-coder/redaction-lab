import { Entity } from "../shared/Entity";
import type { TeacherOverrideId } from "../value-objects/TeacherOverrideId";
import type { OverrideAction } from "../enums/OverrideAction";

// Entity (Domain Model v1.1) — registro histórico e inmutable de una
// intervención manual de un Teacher sobre un AcademyUnit. `teacherId` es
// un string plano (UUID validado en la frontera de Application, no un VO
// propio) porque CH-01 — ratificar un TeacherId como Value Object formal
// — sigue pendiente de decisión arquitectónica (Domain Model v1.1,
// Sección de cuestiones abiertas).
interface TeacherOverrideProps {
  teacherId: string;
  action: OverrideAction;
  reason: string;
  appliedAt: Date;
}

export class TeacherOverride extends Entity<TeacherOverrideId> {
  private readonly props: TeacherOverrideProps;

  private constructor(id: TeacherOverrideId, props: TeacherOverrideProps) {
    super(id);
    this.props = props;
  }

  public static create(params: {
    id: TeacherOverrideId;
    teacherId: string;
    action: OverrideAction;
    reason: string;
  }): TeacherOverride {
    const reason = (params.reason ?? "").trim();
    if (reason.length === 0) {
      throw new Error(
        "TeacherOverride: la razón (reason) no puede estar vacía.",
      );
    }
    return new TeacherOverride(params.id, {
      teacherId: params.teacherId,
      action: params.action,
      reason,
      appliedAt: new Date(),
    });
  }

  public static reconstitute(params: {
    id: TeacherOverrideId;
    teacherId: string;
    action: OverrideAction;
    reason: string;
    appliedAt: Date;
  }): TeacherOverride {
    return new TeacherOverride(params.id, {
      teacherId: params.teacherId,
      action: params.action,
      reason: params.reason,
      appliedAt: params.appliedAt,
    });
  }

  public get teacherId(): string {
    return this.props.teacherId;
  }

  public get action(): OverrideAction {
    return this.props.action;
  }

  public get reason(): string {
    return this.props.reason;
  }

  public get appliedAt(): Date {
    return this.props.appliedAt;
  }
}
