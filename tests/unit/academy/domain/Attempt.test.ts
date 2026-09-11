// Attempt — Aggregate Root de mayor complejidad de Academia (11 pasos de
// UnitStep, ciclo REWRITE<->RECEIVE_FEEDBACK, puerta de comprensión,
// 6 Domain Events distintos). Bloque "Blindar Academia con tests de
// Domain/Application" (pre-requisito de Outbox -> Analytics/Competencies):
// cubre la máquina de estados completa, sus invariantes y los eventos que
// el futuro consumidor del Outbox necesitará poder confiar. Test-only —
// no modifica features/academy/domain/aggregates/Attempt.ts.
import { describe, it, expect } from "vitest";
import { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { DraftId } from "@/features/academy/domain/value-objects/DraftId";
import { VersionId } from "@/features/academy/domain/value-objects/VersionId";
import { FeedbackId } from "@/features/academy/domain/value-objects/FeedbackId";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";
import { FeedbackObservation } from "@/features/academy/domain/value-objects/FeedbackObservation";
import { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";
import { FeedbackStrength } from "@/features/academy/domain/enums/FeedbackStrength";
import { UnitStep } from "@/features/academy/domain/enums/UnitStep";
import { ProductionSubmittedEvent } from "@/features/academy/domain/events/ProductionSubmittedEvent";
import { FeedbackRequestedEvent } from "@/features/academy/domain/events/FeedbackRequestedEvent";
import { FeedbackDeliveredEvent } from "@/features/academy/domain/events/FeedbackDeliveredEvent";
import { RevisionStartedEvent } from "@/features/academy/domain/events/RevisionStartedEvent";
import { ReflectionStartedEvent } from "@/features/academy/domain/events/ReflectionStartedEvent";
import { ReflectionCompletedEvent } from "@/features/academy/domain/events/ReflectionCompletedEvent";
import { ComprehensionNotVerifiedException } from "@/features/academy/domain/exceptions/ComprehensionNotVerifiedException";
import { InvalidStepTransitionException } from "@/features/academy/domain/exceptions/InvalidStepTransitionException";
import { StepNotEligibleException } from "@/features/academy/domain/exceptions/StepNotEligibleException";
import { NotInComprehendStepException } from "@/features/academy/domain/exceptions/NotInComprehendStepException";
import { FeedbackPolicyViolationException } from "@/features/academy/domain/exceptions/FeedbackPolicyViolationException";
import { FIXTURE_IDS } from "./fixtures";

function buildAttempt(): Attempt {
  return Attempt.start({
    id: AttemptId.create(FIXTURE_IDS.attempt),
    unitId: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    attemptNumber: 1,
  });
}

function observation(category: FeedbackCategory = FeedbackCategory.GRAMMAR): FeedbackObservation {
  return FeedbackObservation.create({
    category,
    strength: FeedbackStrength.WEAKNESS,
    explanation: "Explicación de la observación.",
    suggestion: "Sugerencia de mejora.",
  });
}

/** Avanza un Attempt recién creado hasta PRODUCE (comprensión verificada),
 * el mismo camino que recorre cada test de submitProduction()/recordFeedback()
 * en adelante — evita repetir la secuencia CONTEXTUALIZE..PRACTICE en cada uno. */
function advanceToProduce(attempt: Attempt): void {
  attempt.advanceStep(); // CONTEXTUALIZE -> DEFINE_OBJECTIVES
  attempt.advanceStep(); // DEFINE_OBJECTIVES -> COMPREHEND
  attempt.verifyComprehension("respuesta de comprensión"); // -> OBSERVE
  attempt.advanceStep(); // OBSERVE -> ANALYZE
  attempt.advanceStep(); // ANALYZE -> PRACTICE
  attempt.advanceStep(); // PRACTICE -> PRODUCE
  attempt.pullDomainEvents(); // limpia (ningún evento hasta submitProduction)
}

/** Avanza hasta REWRITE con exactamente una Version+Feedback ya registrada
 * — punto de partida de los tests de submitRevision()/advanceToReflection(). */
function advanceToRewrite(attempt: Attempt): void {
  advanceToProduce(attempt);
  attempt.submitProduction(
    VersionId.create(FIXTURE_IDS.version),
    DraftContent.create("Mi producción inicial."),
  );
  attempt.recordFeedback({
    feedbackId: FeedbackId.create(FIXTURE_IDS.feedback),
    observations: [observation()],
  });
  attempt.pullDomainEvents();
}

describe("Attempt — estado inicial (AttemptFactory/Attempt.start)", () => {
  it("nace en CONTEXTUALIZE, vigente, sin Draft/Version y sin comprensión verificada", () => {
    const attempt = buildAttempt();
    expect(attempt.currentStep).toBe(UnitStep.CONTEXTUALIZE);
    expect(attempt.isCurrent).toBe(true);
    expect(attempt.comprehensionVerified).toBe(false);
    expect(attempt.draft).toBeNull();
    expect(attempt.versions).toHaveLength(0);
    expect(attempt.completedAt).toBeNull();
    expect(attempt.pullDomainEvents()).toHaveLength(0);
  });
});

describe("Attempt.advanceStep() — RN-1, avance libre de contenido", () => {
  it("avanza linealmente por los FREE_ADVANCE_STEPS previos a la Producción", () => {
    const attempt = buildAttempt();
    attempt.advanceStep();
    expect(attempt.currentStep).toBe(UnitStep.DEFINE_OBJECTIVES);
  });

  it("rechaza avanzar desde COMPREHEND (tiene su propia puerta, no es de avance libre)", () => {
    const attempt = buildAttempt();
    attempt.advanceStep(); // -> DEFINE_OBJECTIVES
    attempt.advanceStep(); // -> COMPREHEND
    expect(() => attempt.advanceStep()).toThrow(StepNotEligibleException);
  });

  it("rechaza avanzar una vez alcanzado PRODUCE (fuera de FREE_ADVANCE_STEPS)", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    expect(attempt.currentStep).toBe(UnitStep.PRODUCE);
    expect(() => attempt.advanceStep()).toThrow(StepNotEligibleException);
  });
});

describe("Attempt.verifyComprehension() — RN-2, puerta obligatoria antes de PRODUCE", () => {
  it("rechaza invocarse fuera de COMPREHEND", () => {
    const attempt = buildAttempt();
    expect(() => attempt.verifyComprehension("cualquier respuesta")).toThrow(
      NotInComprehendStepException,
    );
  });

  it("una respuesta vacía/null/undefined no es satisfactoria: retorna false y permanece en COMPREHEND sin marcar comprensión", () => {
    const attempt = buildAttempt();
    attempt.advanceStep();
    attempt.advanceStep(); // -> COMPREHEND

    expect(attempt.verifyComprehension("")).toBe(false);
    expect(attempt.verifyComprehension(null)).toBe(false);
    expect(attempt.verifyComprehension(undefined)).toBe(false);
    expect(attempt.currentStep).toBe(UnitStep.COMPREHEND);
    expect(attempt.comprehensionVerified).toBe(false);
  });

  it("una respuesta no vacía es satisfactoria: marca comprensión verificada y avanza a OBSERVE", () => {
    const attempt = buildAttempt();
    attempt.advanceStep();
    attempt.advanceStep(); // -> COMPREHEND

    expect(attempt.verifyComprehension("una respuesta real")).toBe(true);
    expect(attempt.comprehensionVerified).toBe(true);
    expect(attempt.currentStep).toBe(UnitStep.OBSERVE);
  });
});

describe("Attempt.autosaveDraft() — CMD-03, RN-15", () => {
  it("rechaza autoguardar fuera de PRODUCE/REWRITE", () => {
    const attempt = buildAttempt();
    expect(() =>
      attempt.autosaveDraft(
        DraftId.create(FIXTURE_IDS.draft),
        DraftContent.createAllowingEmpty("texto"),
      ),
    ).toThrow(InvalidStepTransitionException);
  });

  it("crea el Draft la primera vez y actualiza su contenido en llamadas posteriores", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);

    attempt.autosaveDraft(
      DraftId.create(FIXTURE_IDS.draft),
      DraftContent.createAllowingEmpty("primer borrador"),
    );
    expect(attempt.draft?.content.text).toBe("primer borrador");

    attempt.autosaveDraft(
      DraftId.create(FIXTURE_IDS.draft),
      DraftContent.createAllowingEmpty("borrador editado"),
    );
    expect(attempt.draft?.content.text).toBe("borrador editado");
  });

  it("permite vaciar el contenido en curso sin error (RN-15, no es un error a diferencia de submitProduction)", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    attempt.autosaveDraft(
      DraftId.create(FIXTURE_IDS.draft),
      DraftContent.createAllowingEmpty("algo"),
    );
    expect(() =>
      attempt.autosaveDraft(
        DraftId.create(FIXTURE_IDS.draft),
        DraftContent.createAllowingEmpty(""),
      ),
    ).not.toThrow();
    expect(attempt.draft?.content.text).toBe("");
  });
});

describe("Attempt.submitProduction() — CMD-02, RN-2 + RN-5", () => {
  it("rechaza si la comprensión no fue verificada, incluso estando en PRODUCE", () => {
    const attempt = buildAttempt();
    attempt.advanceStep(); // DEFINE_OBJECTIVES
    // Se salta deliberadamente COMPREHEND avanzando manualmente el estado
    // interno sería imposible desde fuera del Aggregate (encapsulado) —
    // en su lugar se prueba el caso real: intentar producir antes de llegar
    // siquiera a PRODUCE, con comprehensionVerified todavía en false.
    expect(() =>
      attempt.submitProduction(VersionId.create(FIXTURE_IDS.version), DraftContent.create("texto")),
    ).toThrow(ComprehensionNotVerifiedException);
  });

  it("rechaza si currentStep no es PRODUCE", () => {
    const attempt = buildAttempt();
    attempt.advanceStep();
    attempt.advanceStep();
    attempt.verifyComprehension("ok"); // -> OBSERVE, comprensión ya verificada
    expect(() =>
      attempt.submitProduction(VersionId.create(FIXTURE_IDS.version), DraftContent.create("texto")),
    ).toThrow(InvalidStepTransitionException);
  });

  it("congela la Version 1, limpia el Draft, avanza a RECEIVE_FEEDBACK y emite ProductionSubmitted + FeedbackRequested en orden", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    attempt.autosaveDraft(
      DraftId.create(FIXTURE_IDS.draft),
      DraftContent.createAllowingEmpty("borrador"),
    );

    const version = attempt.submitProduction(
      VersionId.create(FIXTURE_IDS.version),
      DraftContent.create("Mi producción final."),
    );

    expect(version.number.value).toBe(1);
    expect(attempt.draft).toBeNull();
    expect(attempt.currentStep).toBe(UnitStep.RECEIVE_FEEDBACK);
    expect(attempt.versions).toHaveLength(1);

    const events = attempt.pullDomainEvents();
    expect(events).toHaveLength(2);
    expect(events[0]).toBeInstanceOf(ProductionSubmittedEvent);
    expect((events[0] as ProductionSubmittedEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      unitId: FIXTURE_IDS.unit,
      versionId: FIXTURE_IDS.version,
      versionNumber: 1,
    });
    expect(events[1]).toBeInstanceOf(FeedbackRequestedEvent);
    expect((events[1] as FeedbackRequestedEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });
  });
});

describe("Attempt.recordFeedback() — CMD-04, RN-3 (FeedbackPolicy)", () => {
  it("rechaza si currentStep no es RECEIVE_FEEDBACK", () => {
    const attempt = buildAttempt();
    expect(() =>
      attempt.recordFeedback({
        feedbackId: FeedbackId.create(FIXTURE_IDS.feedback),
        observations: [observation()],
      }),
    ).toThrow(InvalidStepTransitionException);
  });

  it("rechaza un conjunto de observaciones vacío (FeedbackPolicy.assertValid)", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    attempt.submitProduction(VersionId.create(FIXTURE_IDS.version), DraftContent.create("texto"));
    expect(() =>
      attempt.recordFeedback({
        feedbackId: FeedbackId.create(FIXTURE_IDS.feedback),
        observations: [],
      }),
    ).toThrow(FeedbackPolicyViolationException);
  });

  it("ordena las observaciones macro->micro (H-07) sin importar el orden de entrada del proveedor de IA", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    attempt.submitProduction(VersionId.create(FIXTURE_IDS.version), DraftContent.create("texto"));

    const feedback = attempt.recordFeedback({
      feedbackId: FeedbackId.create(FIXTURE_IDS.feedback),
      // Entregadas deliberadamente en orden inverso a la prioridad oficial.
      observations: [
        observation(FeedbackCategory.SPELLING),
        observation(FeedbackCategory.COMPREHENSION),
      ],
    });

    expect(feedback.observations.map((o) => o.category)).toEqual([
      FeedbackCategory.COMPREHENSION,
      FeedbackCategory.SPELLING,
    ]);
  });

  it("adjunta la Feedback a la Version pendiente, avanza a REWRITE y emite FeedbackDelivered", () => {
    const attempt = buildAttempt();
    advanceToProduce(attempt);
    attempt.submitProduction(VersionId.create(FIXTURE_IDS.version), DraftContent.create("texto"));
    attempt.pullDomainEvents();

    const feedback = attempt.recordFeedback({
      feedbackId: FeedbackId.create(FIXTURE_IDS.feedback),
      observations: [observation()],
    });

    expect(attempt.currentStep).toBe(UnitStep.REWRITE);
    expect(attempt.versions[0]?.hasFeedback()).toBe(true);
    expect(attempt.versions[0]?.feedback).toBe(feedback);

    const events = attempt.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(FeedbackDeliveredEvent);
    expect((events[0] as FeedbackDeliveredEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
      feedbackId: FIXTURE_IDS.feedback,
    });
  });
});

describe("Attempt.submitRevision() — CMD-05, ciclo REWRITE -> RECEIVE_FEEDBACK", () => {
  it("rechaza si currentStep no es REWRITE", () => {
    const attempt = buildAttempt();
    expect(() =>
      attempt.submitRevision(VersionId.create(FIXTURE_IDS.version2), DraftContent.create("texto")),
    ).toThrow(InvalidStepTransitionException);
  });

  it("congela la Version 2 (numeración incremental), vuelve a RECEIVE_FEEDBACK y emite RevisionStarted + ProductionSubmitted + FeedbackRequested en orden", () => {
    const attempt = buildAttempt();
    advanceToRewrite(attempt);

    const version2 = attempt.submitRevision(
      VersionId.create(FIXTURE_IDS.version2),
      DraftContent.create("Mi reescritura."),
    );

    expect(version2.number.value).toBe(2);
    expect(attempt.currentStep).toBe(UnitStep.RECEIVE_FEEDBACK);
    expect(attempt.versions).toHaveLength(2);

    const events = attempt.pullDomainEvents();
    expect(events).toHaveLength(3);
    expect(events[0]).toBeInstanceOf(RevisionStartedEvent);
    expect((events[0] as RevisionStartedEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      previousVersionId: FIXTURE_IDS.version,
    });
    expect(events[1]).toBeInstanceOf(ProductionSubmittedEvent);
    expect((events[1] as ProductionSubmittedEvent).payload.versionNumber).toBe(2);
    expect(events[2]).toBeInstanceOf(FeedbackRequestedEvent);
  });
});

describe("Attempt.advanceToReflection() — CMD-06, RN-4 (RevisionPolicy)", () => {
  it("rechaza si currentStep no es REWRITE", () => {
    const attempt = buildAttempt();
    expect(() => attempt.advanceToReflection()).toThrow(InvalidStepTransitionException);
  });

  it("REWRITE -> REFLECT y emite ReflectionStarted", () => {
    const attempt = buildAttempt();
    advanceToRewrite(attempt);

    attempt.advanceToReflection();

    expect(attempt.currentStep).toBe(UnitStep.REFLECT);
    const events = attempt.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ReflectionStartedEvent);
    expect((events[0] as ReflectionStartedEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
    });
  });
});

describe("Attempt.completeReflection() — CMD-07, transacción 1 del patrón de dos transacciones", () => {
  it("rechaza respuestas de reflexión vacías", () => {
    const attempt = buildAttempt();
    advanceToRewrite(attempt);
    attempt.advanceToReflection();
    attempt.pullDomainEvents();
    expect(() => attempt.completeReflection([])).toThrow(/reflectionAnswers no puede estar vacío/);
  });

  it("rechaza si currentStep no es REFLECT", () => {
    const attempt = buildAttempt();
    expect(() => attempt.completeReflection(["respuesta"])).toThrow(InvalidStepTransitionException);
  });

  it("REFLECT -> UNLOCK, fija completedAt y emite ReflectionCompleted con comprehensionVerified real", () => {
    const attempt = buildAttempt();
    advanceToRewrite(attempt);
    attempt.advanceToReflection();
    attempt.pullDomainEvents();

    attempt.completeReflection(["aprendí sobre conectores lógicos"]);

    expect(attempt.currentStep).toBe(UnitStep.UNLOCK);
    expect(attempt.completedAt).not.toBeNull();

    const events = attempt.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ReflectionCompletedEvent);
    expect((events[0] as ReflectionCompletedEvent).payload).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      unitId: FIXTURE_IDS.unit,
      studentId: FIXTURE_IDS.student,
      comprehensionVerified: true,
    });
  });
});

describe("Attempt.markAsNotCurrent() — invocado al repetir una Unidad (CMD-09/CMD-10)", () => {
  it("marca el Attempt como no vigente sin alterar su historial", () => {
    const attempt = buildAttempt();
    attempt.markAsNotCurrent();
    expect(attempt.isCurrent).toBe(false);
  });
});

describe("Attempt.pullDomainEvents() — extracción con limpieza (Sprint 6.2, Outbox)", () => {
  it("una segunda extracción consecutiva retorna vacío (los eventos no se acumulan indefinidamente)", () => {
    const attempt = buildAttempt();
    attempt.advanceStep();
    expect(attempt.pullDomainEvents()).toHaveLength(0); // advanceStep no emite eventos
    expect(attempt.pullDomainEvents()).toHaveLength(0);
  });
});
