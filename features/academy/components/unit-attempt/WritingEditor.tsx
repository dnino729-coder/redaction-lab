// WritingEditor — Blueprint §11.2 (P-08, reutilizado `produce`/`rewrite`),
// resolución de AFR2-01. 100% presentacional: cero hooks de datos, nunca
// invoca `useAutosaveDraft()`/`useSubmitVersion()` — recibe todo resuelto de
// `AttemptStepContainer`. El único estado que gestiona internamente es el
// contenido tecleado (local) y el debounce de 2000ms (§7/§9) — ninguno de
// los dos es un hook de datos, por lo que no viola la regla de la Sección
// 10. El debounce se implementa aquí mismo (useRef/setTimeout), no delega en
// ningún hook compartido — el Blueprint no nombra ninguno para este caso.
//
// Refs "de último valor" (`autosaveStateRef`/`onAutosaveRef`): los listeners
// nativos (`online`/`offline`/`beforeunload`) y el callback del debounce se
// registran una sola vez (dependencias vacías) pero deben leer siempre el
// valor MÁS RECIENTE de `autosaveState`/`onAutosave` en el momento exacto en
// que se ejecutan, no el que tenían en el render en que se registraron —
// de lo contrario, si `autosaveState` cambia mientras el debounce está en
// espera (p. ej. un autosave anterior se asienta), el chequeo de "cola de 1"
// evaluaría un valor obsoleto. Actualizar la ref en cada render (no dentro
// de un efecto) es el patrón estándar para esto, sin necesidad de listar
// `triggerAutosave` en ningún array de dependencias con un valor inestable.
//
// Cola de 1 (§8.5/§9, "mientras hay una mutación en vuelo, no se dispara una
// nueva"): si el debounce se cumple mientras `autosaveState==="saving"`, no
// se invoca `onAutosave` de inmediato — se marca un intento pendiente que se
// dispara, con el contenido más reciente, en cuanto el autosave en curso
// se asiente (éxito o error).
//
// Offline (§12, P-08 — única pantalla con este estado explícito): detectado
// vía los eventos nativos `online`/`offline` del navegador (no es un hook de
// datos). Al reconectar, se reintenta el autosave pendiente.
//
// `beforeunload` (§8.5/§11.2): fuerza un último intento de `onAutosave`
// (bypassa la cola de 1 — es un intento final, no uno más a encolar).
//
// Fix AFR035-01 (§12, P-08, "Responsive: editor a ancho completo (mobile);
// editor + panel lateral (desktop)"): el contenedor `lg:flex-row` tenía un
// único hijo, por lo que no producía columnas. El `<aside>` con
// `WordCountIndicator`/`AutosaveIndicator` es ahora un segundo hijo directo
// de ese contenedor — mismos datos ya calculados, sin lógica nueva.
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui";
import { AutosaveIndicator, WordCountIndicator } from "../shared";
import { SubmitButton } from "./SubmitButton";
import { productionSchema } from "../../schemas";
import { formatWordCount } from "../../utils/formatWordCount";
import type { AcademyErrorHttp } from "../../types";

const AUTOSAVE_DEBOUNCE_MS = 2000;

export interface WritingEditorProps {
  attemptId: string;
  initialContent: string;
  mode: "produce" | "rewrite";
  onAutosave: (content: string) => void;
  autosaveState: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  submitError: AcademyErrorHttp | null;
}

export function WritingEditor({
  attemptId,
  initialContent,
  mode,
  onAutosave,
  autosaveState,
  lastSavedAt,
  onSubmit,
  isSubmitting,
  submitError,
}: WritingEditorProps) {
  const t = useTranslations("academy.writingEditor");
  const [content, setContent] = useState(initialContent);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  const contentRef = useRef(initialContent);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAutosaveRef = useRef(false);
  const previousAutosaveStateRef = useRef(autosaveState);
  const autosaveStateRef = useRef(autosaveState);
  const onAutosaveRef = useRef(onAutosave);
  autosaveStateRef.current = autosaveState;
  onAutosaveRef.current = onAutosave;

  function triggerAutosave(value: string) {
    if (autosaveStateRef.current === "saving") {
      pendingAutosaveRef.current = true;
      return;
    }
    onAutosaveRef.current(value);
  }

  // Dispara el autosave pendiente (encolado por la cola de 1) en cuanto el
  // autosave en curso se asiente.
  useEffect(() => {
    const wasSaving = previousAutosaveStateRef.current === "saving";
    const isNowSettled = autosaveState !== "saving";
    if (wasSaving && isNowSettled && pendingAutosaveRef.current) {
      pendingAutosaveRef.current = false;
      onAutosaveRef.current(contentRef.current);
    }
    previousAutosaveStateRef.current = autosaveState;
  }, [autosaveState]);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
    }
    function handleOnline() {
      setIsOffline(false);
      triggerAutosave(contentRef.current);
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      onAutosaveRef.current(contentRef.current);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    contentRef.current = value;
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerAutosave(value);
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  function handleSubmit() {
    if (!productionSchema.safeParse({ content }).success) return;
    onSubmit(content);
  }

  const wordCount = formatWordCount(content);

  return (
    <div className="flex flex-col gap-4">
      {isOffline ? (
        <p role="alert" className="rounded-md bg-warning-100 px-3 py-2 text-sm text-warning-800">
          {t("offlineBanner")}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor={`writing-editor-${attemptId}`} className="text-sm font-medium text-neutral-700">
            {t(mode === "produce" ? "fieldLabelProduce" : "fieldLabelRewrite")}
          </label>
          <Textarea
            id={`writing-editor-${attemptId}`}
            value={content}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={12}
            aria-describedby={`writing-editor-wordcount-${attemptId} writing-editor-autosave-${attemptId}`}
          />
        </div>
        <aside className="flex flex-row flex-wrap items-center gap-2 lg:w-48 lg:flex-col lg:items-start lg:gap-3">
          <WordCountIndicator id={`writing-editor-wordcount-${attemptId}`} wordCount={wordCount.words} />
          <AutosaveIndicator
            id={`writing-editor-autosave-${attemptId}`}
            state={autosaveState}
            lastSavedAt={lastSavedAt}
          />
        </aside>
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-danger-600">
          {submitError.message}
        </p>
      ) : null}

      <SubmitButton isSubmitting={isSubmitting} disabled={content.trim().length === 0} onSubmit={handleSubmit} />
    </div>
  );
}
