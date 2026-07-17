// Utilidades de presentación del módulo Dashboard — sin lógica pedagógica
// (esa vive en services/), solo formateo puro reutilizado entre componentes.

export function formatMinutesAsHoursLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} h`;
  return `${hours} h ${remainder} min`;
}

export function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}
