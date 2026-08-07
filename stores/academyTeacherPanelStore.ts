// academyTeacherPanelStore — selección múltiple de estudiantes en el Panel
// del Profesor (P-12). Blueprint de Frontend de Academia, Sección 7: "store
// local al feature `teacher-panel`, no global de plataforma" — mecanismo
// exclusivo de Frontend (ACP-001-B), sin respaldo de endpoint de lote
// (Sección 8.4). No persiste entre sesiones (sin `persist` middleware): un
// refresh de página vacía la selección — comportamiento deliberado, ya
// documentado en el Blueprint (Sección 17.3), no una limitación a resolver.
import { create } from "zustand";

interface AcademyTeacherPanelStoreState {
  selectedStudentIds: string[];
  toggleStudent: (studentId: string) => void;
  selectAll: (studentIds: string[]) => void;
  clearAll: () => void;
  isStudentSelected: (studentId: string) => boolean;
}

export const useAcademyTeacherPanelStore = create<AcademyTeacherPanelStoreState>((set, get) => ({
  selectedStudentIds: [],
  toggleStudent: (studentId) =>
    set((state) => ({
      selectedStudentIds: state.selectedStudentIds.includes(studentId)
        ? state.selectedStudentIds.filter((id) => id !== studentId)
        : [...state.selectedStudentIds, studentId],
    })),
  selectAll: (studentIds) => set({ selectedStudentIds: studentIds }),
  clearAll: () => set({ selectedStudentIds: [] }),
  isStudentSelected: (studentId) => get().selectedStudentIds.includes(studentId),
}));
