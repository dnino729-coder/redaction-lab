// dashboardStore — estado de UI puramente de cliente del Dashboard (Zustand,
// sección 5.2/5.4). docs/modules/dashboard.md, sección 6: "estado de UI
// puramente de cliente (p. ej. qué recomendación fue descartada en esta
// sesión)". No persiste entre sesiones (sin `persist` middleware): al
// recargar la página, la recomendación descartada vuelve a evaluarse desde
// el servidor — es exactamente el comportamiento documentado, no un olvido.
import { create } from "zustand";

interface DashboardStoreState {
  dismissedRecommendationIds: string[];
  dismissRecommendation: (recommendationId: string) => void;
  isRecommendationDismissed: (recommendationId: string) => boolean;
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  dismissedRecommendationIds: [],
  dismissRecommendation: (recommendationId) =>
    set((state) => ({
      dismissedRecommendationIds: state.dismissedRecommendationIds.includes(recommendationId)
        ? state.dismissedRecommendationIds
        : [...state.dismissedRecommendationIds, recommendationId],
    })),
  isRecommendationDismissed: (recommendationId) =>
    get().dismissedRecommendationIds.includes(recommendationId),
}));
