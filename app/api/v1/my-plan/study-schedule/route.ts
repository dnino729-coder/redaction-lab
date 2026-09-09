// GET, PATCH /api/v1/my-plan/study-schedule
import type { NextRequest } from "next/server";
import {
  getStudySchedule,
  updateStudySchedule,
} from "@/features/my-plan/api/handlers/studyScheduleHandlers";

export async function GET() {
  return getStudySchedule();
}

export async function PATCH(request: NextRequest) {
  return updateStudySchedule(request);
}
