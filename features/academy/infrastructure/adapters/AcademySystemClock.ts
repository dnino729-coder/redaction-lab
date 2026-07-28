import type { Clock } from "@/features/academy/application/ports/Clock";

// Adaptador — implementa el puerto `Clock` (mismo patrón que Mi Plan:
// features/my-plan/infrastructure/adapters/SystemClock.ts).
export class AcademySystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
