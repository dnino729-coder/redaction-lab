// Puerto — Customer-Supplier con Coach IA (Infrastructure Model v1.1 §6).
// CMD-02/CMD-05 lo invocan **fuera** de la transacción de escritura del
// Attempt (Application Layer Spec v1.0: "ningún Command escribe... durante
// una llamada de red externa"). Si responde dentro de la ventana objetivo
// (60s), el resultado se aplica sincrónicamente (internamente equivalente
// a CMD-04); si no, retorna `PROCESSING` y un worker asíncrono de
// infraestructura invoca CMD-04 más tarde.
export type FeedbackGatewayResult =
  | { readonly status: "DELIVERED"; readonly feedbackId: string }
  | { readonly status: "PROCESSING" };

export interface FeedbackGatewayPort {
  requestFeedback(params: { attemptId: string; versionId: string }): Promise<FeedbackGatewayResult>;
}
