import type { Clock } from "@/features/laboratory/application/ports/Clock";

export class LaboratorySystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
