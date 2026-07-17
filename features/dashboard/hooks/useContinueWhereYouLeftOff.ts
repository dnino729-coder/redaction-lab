"use client";
// useContinueWhereYouLeftOff — resuelve el destino de un único clic (bloque
// 4, regla MUST: "Continúa donde te quedaste... acceso obligatorio mediante
// un único clic", sección 2). Registra el evento `dashboard_continue_clicked`
// (sección 8) antes de navegar.
//
// La ruta exacta de destino dentro de Producción Escrita/Laboratorio (qué
// pantalla abre una entrega en curso) es responsabilidad de ese módulo, no
// del Dashboard (fuera de alcance de esta fase) — aquí se construye el
// enlace mínimo y estable: el espacio "laboratory" (renombrado de
// "laboratorio" en la resolución 18.19) con la entrega como parámetro, que
// ese módulo podrá leer al implementarse.
import { useCallback, useTransition } from "react";
import { markContinueClicked } from "../actions";
import type { ContinuationBlock } from "../types";

export function useContinueWhereYouLeftOff(continuation: ContinuationBlock) {
  const [isPending, startTransition] = useTransition();

  const href = continuation.submissionId
    ? `/laboratory?submission=${continuation.submissionId}`
    : null;

  const onNavigate = useCallback(() => {
    if (!continuation.submissionId) return;
    const submissionId = continuation.submissionId;
    startTransition(() => {
      void markContinueClicked({ submissionId });
    });
  }, [continuation.submissionId]);

  return {
    available: continuation.available && Boolean(href),
    href,
    isPending,
    onNavigate,
  };
}
