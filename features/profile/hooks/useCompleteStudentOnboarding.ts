"use client";
import { useMutation } from "@tanstack/react-query";
import { completeStudentOnboarding } from "../services/profileApi";

// Mutación única del onboarding — sin query key propia (Profile todavía
// no expone ningún GET). La invalidación de las queries de My Plan que
// dependen del nuevo plan corre por cuenta de quien monta el formulario
// (ver StudentOnboardingForm — recibe onSuccess como prop, sin importar
// nada de features/my-plan).
export function useCompleteStudentOnboarding() {
  return useMutation({
    mutationFn: completeStudentOnboarding,
  });
}
