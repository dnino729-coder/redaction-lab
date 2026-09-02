// GET /api/v1/laboratory/exercises
// POST /api/v1/laboratory/exercises
import type { NextRequest } from "next/server";
import { listWritingExercises, createWritingExercise } from "@/features/laboratory/api/handlers/writingExerciseHandlers";

export async function GET(request: NextRequest) {
  return listWritingExercises(request);
}

export async function POST(request: NextRequest) {
  return createWritingExercise(request);
}
