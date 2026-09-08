import type { NextResponse } from "next/server";
import { createProfileContainer } from "@/features/profile/infrastructure/composition/profileContainer";
import { resolveProfileActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { CompleteStudentOnboardingCommand } from "@/features/profile/application/commands/CompleteStudentOnboardingCommand";

interface CompleteOnboardingBody {
  currentLevel?: unknown;
  targetLevel?: unknown;
  nativeLanguage?: unknown;
  learningGoal?: unknown;
  daysPerWeek?: unknown;
  sessionsPerDay?: unknown;
  minutesPerSession?: unknown;
  reminderHour?: unknown;
  reminderMinute?: unknown;
  targetExamDate?: unknown;
}

export async function completeStudentOnboarding(request: Request): Promise<NextResponse> {
  try {
    const actor = await resolveProfileActor();
    const container = createProfileContainer();
    const body = (await request.json()) as CompleteOnboardingBody;

    const dto = await container.handlers.completeStudentOnboarding.handle(
      CompleteStudentOnboardingCommand.fromRequest({
        studentId: actor.studentId,
        currentLevel: body.currentLevel as string,
        targetLevel: body.targetLevel as string,
        nativeLanguage: body.nativeLanguage as string,
        learningGoal: body.learningGoal as string,
        daysPerWeek: body.daysPerWeek as number,
        sessionsPerDay: body.sessionsPerDay as number,
        minutesPerSession: body.minutesPerSession as number,
        reminderHour: (body.reminderHour as number | null | undefined) ?? undefined,
        reminderMinute: (body.reminderMinute as number | null | undefined) ?? undefined,
        targetExamDate: (body.targetExamDate as string | null | undefined) ?? undefined,
      }),
    );
    return jsonSuccess(dto, 201);
  } catch (error) {
    return jsonError(error);
  }
}
