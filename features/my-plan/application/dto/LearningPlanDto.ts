// DTOs de `LearningPlan` (13.4). Nunca se retorna la Entity de dominio
// hacia el exterior — todo Handler que expone un `LearningPlan` lo hace a
// través de `LearningPlanResponseDto` (ver mappers/LearningPlanMapper.ts).
// Fechas siempre en formato ISO-8601 (`string`), nunca `Date`, para que
// el DTO sea serializable sin ambigüedad de zona horaria.

export interface LearningPlanResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly name: string;
  readonly description: string | null;
  readonly targetLevel: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly status: string;
}

/** Meta inicial requerida por 13.4 MUST ("cada plan debe contener al
 * menos un objetivo") — se declara explícitamente en el propio Request en
 * vez de generarse dentro del Handler, ver informe de entrega, sección
 * "Ambigüedad reportada". */
export interface InitialLearningGoalRequestDto {
  readonly title: string;
  readonly description?: string | null;
  readonly priority?: string;
  readonly targetDate?: string | null;
}

export interface InitialStudyScheduleRequestDto {
  readonly daysPerWeek: number;
  readonly sessionsPerDay: number;
  readonly minutesPerSession: number;
  readonly reminderHour?: number;
  readonly reminderMinute?: number;
}

export interface CreateLearningPlanRequestDto {
  readonly studentId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly targetLevel: string;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly initialGoals: readonly InitialLearningGoalRequestDto[];
  readonly studySchedule: InitialStudyScheduleRequestDto;
}

export interface PauseLearningPlanRequestDto {
  readonly planId: string;
  readonly studentId: string;
}

export interface ResumeLearningPlanRequestDto {
  readonly planId: string;
  readonly studentId: string;
}

export interface CancelLearningPlanRequestDto {
  readonly planId: string;
  readonly studentId: string;
}

export interface GetActiveLearningPlanRequestDto {
  readonly studentId: string;
}
