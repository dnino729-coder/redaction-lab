// GET /api/v1/my-plan/study-schedule
import { getStudySchedule } from "@/features/my-plan/api/handlers/studyScheduleHandlers";

export async function GET() {
  return getStudySchedule();
}
