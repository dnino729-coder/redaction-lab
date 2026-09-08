// POST /api/v1/profile/onboarding
import type { NextRequest } from "next/server";
import { completeStudentOnboarding } from "@/features/profile/api/handlers/onboardingHandlers";

export async function POST(request: NextRequest) {
  return completeStudentOnboarding(request);
}
