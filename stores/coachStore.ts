// coachStore — placeholder de infraestructura (Zustand, sección 5.2/5.4).
// Sin estado de producto todavía.
import { create } from "zustand";

interface CoachStoreState {}

export const useCoachStore = create<CoachStoreState>(() => ({}));
