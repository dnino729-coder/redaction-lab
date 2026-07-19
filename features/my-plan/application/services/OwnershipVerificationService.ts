import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import type { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import type { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import type { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";
import type { LearningGoalRepository } from "@/features/my-plan/domain/repositories/LearningGoalRepository";
import type { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";

// Servicio de aplicación — verificación de propiedad (autorización), no de
// negocio. `LearningTask`/`LearningObjective` no tienen `student_id`
// propio (13.4): pertenecen a un `LearningPhase`/`LearningGoal`, que a su
// vez pertenece a un `LearningPlan` con `student_id`. Coordinar esa
// cadena de repositorios para responder "¿este estudiante es dueño de
// este recurso?" es exactamente responsabilidad de la Application Layer
// (coordina repositorios), no del dominio (que nunca conoce "quién" está
// ejecutando la operación).
export class OwnershipVerificationService {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningPhaseRepository: LearningPhaseRepository,
    private readonly learningGoalRepository: LearningGoalRepository,
  ) {}

  public async verifyPlanOwnership(plan: LearningPlan, studentId: StudentId): Promise<void> {
    if (!plan.studentId.equals(studentId)) {
      throw new ForbiddenException(
        `El estudiante ${studentId.value} no es propietario del plan ${plan.id.value}.`,
      );
    }
  }

  /** Verifica que `task` pertenezca (vía su fase → plan) al estudiante
   * dado, y devuelve la fase intermedia para que el Handler llamante no
   * tenga que volver a cargarla. */
  public async verifyTaskOwnership(
    task: LearningTask,
    studentId: StudentId,
  ): Promise<LearningPhase> {
    const phase = await this.learningPhaseRepository.findById(task.learningPhaseId);
    if (!phase) {
      throw new ResourceNotFoundException("LearningPhase", task.learningPhaseId.value);
    }
    const plan = await this.learningPlanRepository.findById(phase.learningPlanId);
    if (!plan) {
      throw new ResourceNotFoundException("LearningPlan", phase.learningPlanId.value);
    }
    await this.verifyPlanOwnership(plan, studentId);
    return phase;
  }

  /** Verifica que `objective` pertenezca (vía su meta → plan) al
   * estudiante dado, y devuelve la meta intermedia. */
  public async verifyObjectiveOwnership(
    objective: LearningObjective,
    studentId: StudentId,
  ): Promise<LearningGoal> {
    const goal = await this.learningGoalRepository.findById(objective.learningGoalId);
    if (!goal) {
      throw new ResourceNotFoundException("LearningGoal", objective.learningGoalId.value);
    }
    const plan = await this.learningPlanRepository.findById(goal.learningPlanId);
    if (!plan) {
      throw new ResourceNotFoundException("LearningPlan", goal.learningPlanId.value);
    }
    await this.verifyPlanOwnership(plan, studentId);
    return goal;
  }
}
