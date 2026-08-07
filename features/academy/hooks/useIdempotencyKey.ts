"use client";
// Utilidad interna — Blueprint §2.6 punto 5: "debe generarse y reutilizarse
// la misma clave durante reintentos del mismo intento de usuario". Genera
// una clave una única vez por montaje del componente que invoca el hook de
// mutación (una pantalla/diálogo = un "intento"), estable mientras el
// componente permanezca montado. Solo usado por los 4 hooks REST cuyo
// endpoint exige `Idempotency-Key` (EP-05, EP-07, EP-08, EP-09) — las 6
// Server Actions no lo requieren en absoluto (confirmado en código, ninguna
// acepta ese parámetro).
import { useRef } from "react";

export function useIdempotencyKey(): string {
  const keyRef = useRef<string>();
  if (!keyRef.current) {
    keyRef.current = crypto.randomUUID();
  }
  return keyRef.current;
}
