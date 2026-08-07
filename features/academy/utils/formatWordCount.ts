// Blueprint §4 (árbol de carpetas) / §11.2 (`WritingEditor`): conteo
// calculado localmente a partir del contenido tecleado, nunca leído de
// `DraftHttp` — así el contador refleja lo que el usuario ve en cada
// tecleo, sin depender de que el autosave ya haya resuelto.
export interface WordCount {
  words: number;
  characters: number;
}

export function formatWordCount(content: string): WordCount {
  const trimmed = content.trim();
  return {
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    characters: content.length,
  };
}
