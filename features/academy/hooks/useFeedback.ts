"use client";
// Blueprint §8.2 (fila EP-18), §8.3 y §15.4.2. Transporte REST. Polling
// condicional mientras `status === "PROCESSING"`, techo de 3 minutos.
//
// El techo se calcula desde la primera respuesta `PROCESSING` observada,
// guardada en el propio QueryClient (no en un `useRef` del componente) bajo
// una clave derivada. Así el temporizador sobrevive a un desmontaje/remontaje
// por navegación atrás/adelante (Blueprint §15.4.2), mientras la entrada siga
// viva en caché. El `gcTime` por defecto (5 min) ya excede el techo de 3 min,
// por lo que no se fija uno explícito para esta clave auxiliar.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getFeedback } from "../services";

const POLL_INTERVAL_MS = 5_000;
const TIMEOUT_MS = 3 * 60_000;

function processingSinceKey(attemptId: string, versionNumber: number) {
  return [...academyKeys.feedback(attemptId, versionNumber), "processingSince"] as const;
}

export function useFeedback(attemptId: string, versionNumber: number) {
  const queryClient = useQueryClient();
  const sinceKey = processingSinceKey(attemptId, versionNumber);

  const query = useQuery({
    queryKey: academyKeys.feedback(attemptId, versionNumber),
    queryFn: () => getFeedback(attemptId, versionNumber),
    staleTime: (q) => (q.state.data?.status === "PROCESSING" ? 0 : 5 * 60_000),
    gcTime: 10 * 60_000,
    retry: 2,
    refetchInterval: (q) => {
      if (q.state.data?.status !== "PROCESSING") {
        queryClient.removeQueries({ queryKey: sinceKey });
        return false;
      }
      let since = queryClient.getQueryData<number>(sinceKey);
      if (since === undefined) {
        since = Date.now();
        queryClient.setQueryData(sinceKey, since);
      }
      const elapsed = Date.now() - since;
      return elapsed >= TIMEOUT_MS ? false : POLL_INTERVAL_MS;
    },
  });

  const since = queryClient.getQueryData<number>(sinceKey);
  const elapsedSinceProcessing = since ? Date.now() - since : 0;
  const timedOut = query.data?.status === "PROCESSING" && elapsedSinceProcessing >= TIMEOUT_MS;

  return { ...query, timedOut };
}
