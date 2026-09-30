// UnitContentBlockRenderer — Academy Content v1 (Bloque 3F). Presentacional
// puro (mismo criterio que StepContentPanel/StepAdvanceButton/
// ComprehensionGate): no invoca hooks de datos, solo proyecta un
// `UnitContentBlockHttp` ya resuelto a JSX. `data` es `Json` sin schema
// validado por el backend (ver PrismaAcademyReadModelPort.getUnitStepContent)
// — cada rama valida defensivamente su propia forma antes de renderizar y
// no revienta el árbol si `data` no calza (retorna `null`, nunca lanza).
//
// `MODEL_EXAMPLE_REF` existe en el enum pero hoy ningún step que pase por
// este renderer (CONTEXTUALIZE/DEFINE_OBJECTIVES/COMPREHEND/PRACTICE) lo
// usa — OBSERVE/ANALYZE ya tienen su propia sección dedicada
// (`renderModelExamplesSection`, AttemptStepContainer) que consume
// `ModelExample` directamente, sin pasar por este componente. Se deja un
// fallback mínimo, honesto, sin integrarlo con `ModelExampleCard` — esa
// integración no fue pedida en este bloque.
import type { UnitContentBlockHttp } from "../../types";

export interface UnitContentBlockRendererProps {
  block: UnitContentBlockHttp;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function UnitContentBlockRenderer({ block }: UnitContentBlockRendererProps) {
  const { type, data } = block;

  switch (type) {
    case "RICH_TEXT": {
      if (!isRecord(data) || typeof data.html !== "string") return null;
      // Contenido editorial (nunca generado por el estudiante ni por
      // ningún input de usuario) — mismo criterio de confianza que el
      // resto de la plataforma para contenido de catálogo (ModelExample.content
      // también se muestra sin sanitizar). No es una superficie de XSS por
      // input de usuario.
      return (
        // eslint-disable-next-line react/no-danger -- contenido editorial de confianza, ver comentario arriba
        <div
          className="space-y-2 text-sm leading-relaxed text-neutral-800 [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      );
    }

    case "INSTRUCTION": {
      if (!isRecord(data) || typeof data.text !== "string") return null;
      return <p className="text-sm text-neutral-700">{data.text}</p>;
    }

    case "TIP": {
      if (!isRecord(data) || typeof data.text !== "string") return null;
      return (
        <p className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-700">
          {data.text}
        </p>
      );
    }

    case "QUESTION": {
      if (!isRecord(data) || typeof data.text !== "string") return null;
      return <p className="text-sm font-medium text-neutral-900">{data.text}</p>;
    }

    case "CHECKLIST": {
      if (!isRecord(data) || !Array.isArray(data.items)) return null;
      const items = data.items.filter((item): item is string => typeof item === "string");
      if (items.length === 0) return null;
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    case "EXAMPLE": {
      if (!isRecord(data) || !Array.isArray(data.pairs)) return null;
      const pairs = data.pairs.filter(
        (pair): pair is { informal: string; formel: string } =>
          isRecord(pair) && typeof pair.informal === "string" && typeof pair.formel === "string",
      );
      if (pairs.length === 0) return null;
      return (
        <ul className="space-y-2 text-sm">
          {pairs.map((pair, index) => (
            <li key={index} className="rounded-md border border-neutral-200 px-3 py-2">
              <span className="block text-neutral-400 line-through">{pair.informal}</span>
              <span className="block text-neutral-900">{pair.formel}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "MODEL_EXAMPLE_REF":
      // Sin caso de uso real todavía (ver comentario de cabecera) — no se
      // inventa una integración con ModelExample fuera de alcance de este
      // bloque.
      return null;

    default:
      return null;
  }
}
