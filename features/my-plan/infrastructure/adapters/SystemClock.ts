import type { Clock } from "@/features/my-plan/application/ports/Clock";

// Adaptador — implementa el puerto `Clock`. Único punto donde `new
// Date()` aparece para "el instante actual del servidor" en todo Mi
// Plan (18.21: completed_at/endDate siempre lo asigna el servidor, nunca
// un valor externo) — Domain y Application nunca instancian `Date`
// directamente para "ahora", siempre reciben la hora ya resuelta a
// través de este puerto.
export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
