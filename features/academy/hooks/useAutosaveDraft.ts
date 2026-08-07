"use client";
// Blueprint §3.1/§8.2 (fila EP-02) y §8.5. Transporte Server Action
// (`autosaveDraftAction`). "Optimistic" no significa un parche de caché de
// React Query aquí (Blueprint §8.5): el contenido mostrado en pantalla vive
// en el estado local de `WritingEditor`, nunca en esta Query Key — por eso
// este hook NO implementa `onMutate`/rollback de caché, es una mutación
// estándar con 1 reintento silencioso. El debounce de 2000ms es
// responsabilidad de `WritingEditor` (Blueprint §7/§9), no de este hook.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { autosaveDraftAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, DraftHttp } from "../types";

interface AutosaveDraftInput {
  attemptId: string;
  content: string;
}

export function useAutosaveDraft() {
  const queryClient = useQueryClient();

  return useMutation<DraftHttp, AcademyErrorHttp, AutosaveDraftInput>({
    mutationFn: async ({ attemptId, content }) => {
      try {
        return await autosaveDraftAction(attemptId, content);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    // 1 reintento automático y silencioso (Blueprint §8.5) — no 0, es el
    // único caso de retry>0 entre las mutaciones de Academia.
    retry: 1,
    onSuccess: (_data, { attemptId }) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.draft(attemptId) });
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
    },
    // Sin rollback: no existe ningún valor optimista en caché que revertir
    // (Blueprint §8.5) — el contenido tecleado permanece intacto en el
    // estado local del componente, se haya guardado o no.
  });
}
