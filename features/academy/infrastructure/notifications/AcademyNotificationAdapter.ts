import type { Logger } from "@/features/academy/application/ports/Logger";

// Adaptador de notificaciones de Academia.
//
// Nota de alcance (no BLOCKER, disclosure explícito): `services/notifications/
// index.ts` (infraestructura compartida del proyecto) es, a día de hoy, un
// placeholder sin implementación ("Placeholder de infraestructura — sin
// lógica de negocio todavía") — no existe ningún mecanismo de notificación
// real que "reutilizar" tal como pide el encargo ("utilizando exactamente
// el mecanismo ya existente en el proyecto"). Tampoco existe, en la
// Application Layer ya Frozen de Academia (Sprint 6.1), ningún puerto
// `AcademyNotificationPort` que ningún Handler invoque — por lo que esta
// clase no implementa ninguna interfaz de Application (no puede
// inventarse una sin modificar Application Layer, prohibido en este
// Sprint). Se deja como una clase de infraestructura autocontenida, lista
// para conectarse a un futuro Event Subscriber (fuera de alcance de Sprint
// 6.2) y a la implementación real de `services/notifications` cuando
// exista, sin inventar un canal de envío (SMTP/push) que el proyecto
// todavía no tiene.
export interface AcademyNotificationEvent {
  readonly type: "ACADEMY_FEEDBACK_READY" | "ACADEMY_TEACHER_OVERRIDE_APPLIED";
  readonly recipientId: string;
  readonly payload: Record<string, unknown>;
}

export class AcademyNotificationAdapter {
  constructor(private readonly logger: Logger) {}

  public async notifyFeedbackReady(studentId: string, attemptId: string, versionNumber: number): Promise<void> {
    await this.send({
      type: "ACADEMY_FEEDBACK_READY",
      recipientId: studentId,
      payload: { attemptId, versionNumber },
    });
  }

  public async notifyTeacherOverrideApplied(studentId: string, unitId: string, action: string): Promise<void> {
    await this.send({
      type: "ACADEMY_TEACHER_OVERRIDE_APPLIED",
      recipientId: studentId,
      payload: { unitId, action },
    });
  }

  private async send(event: AcademyNotificationEvent, attempt = 1): Promise<void> {
    try {
      // `services/notifications` no expone todavía ningún método de envío
      // real (placeholder) — se registra la intención con el mismo formato
      // que tendría el envío real, sin inventar un transporte.
      this.logger.info("academy_notification_pending_real_channel", {
        type: event.type,
        recipientId: event.recipientId,
        payload: event.payload,
      });
    } catch (error) {
      if (attempt >= 3) {
        this.logger.error("academy_notification_failed", error, { type: event.type, attempt });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 500));
      return this.send(event, attempt + 1);
    }
  }
}
