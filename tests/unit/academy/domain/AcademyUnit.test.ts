// AcademyUnit — el segundo Aggregate Root de Academia (junto a Attempt),
// única fuente de verdad de UnitState (invariante 6). Produce, entre
// otros, UnitCompletedEvent/UnitMasteredEvent — exactamente los eventos
// que el bloque "Academia Outbox -> Analytics/Competencies" necesitará
// consumir. Bloque "Blindar Academia con tests de Domain/Application" —
// test-only, no modifica features/academy/domain/aggregates/AcademyUnit.ts.
import { describe, it, expect } from "vitest";
import { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { TeacherOverride } from "@/features/academy/domain/entities/TeacherOverride";
import { TeacherOverrideId } from "@/features/academy/domain/value-objects/TeacherOverrideId";
import { TextType } from "@/features/academy/domain/enums/TextType";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import { OverrideAction } from "@/features/academy/domain/enums/OverrideAction";
import { MasteryCriterion } from "@/features/academy/domain/value-objects/MasteryCriterion";
import { UnitUnlockedEvent } from "@/features/academy/domain/events/UnitUnlockedEvent";
import { UnitStartedEvent } from "@/features/academy/domain/events/UnitStartedEvent";
import { UnitCompletedEvent } from "@/features/academy/domain/events/UnitCompletedEvent";
import { UnitMasteredEvent } from "@/features/academy/domain/events/UnitMasteredEvent";
import { UnitRepeatedEvent } from "@/features/academy/domain/events/UnitRepeatedEvent";
import { ExternalActivityCompletedEvent } from "@/features/academy/domain/events/ExternalActivityCompletedEvent";
import { TeacherOverrideAppliedEvent } from "@/features/academy/domain/events/TeacherOverrideAppliedEvent";
import { InvalidUnitStateTransitionException } from "@/features/academy/domain/exceptions/InvalidUnitStateTransitionException";
import { AttemptAlreadyActiveException } from "@/features/academy/domain/exceptions/AttemptAlreadyActiveException";
import { UnlockNotEligibleException } from "@/features/academy/domain/exceptions/UnlockNotEligibleException";
import { UnitNotRepeatableException } from "@/features/academy/domain/exceptions/UnitNotRepeatableException";
import { OverrideNotValidForStateException } from "@/features/academy/domain/exceptions/OverrideNotValidForStateException";
import { FIXTURE_IDS } from "./fixtures";

function buildUnit(initialState: UnitState = UnitState.LOCKED): AcademyUnit {
  return AcademyUnit.provision({
    id: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    textType: TextType.ESSAY,
    position: 2,
    initialState,
  });
}

/** Lleva la Unidad hasta REFLECTION, el único estado desde el que
 * completeFromAttempt() es válido — misma secuencia de sincronización
 * eventual (8.1) que aplican los Sync*Handlers reales. */
function buildUnitAtReflection(): AcademyUnit {
  const unit = buildUnit(UnitState.UNLOCKED);
  unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));
  unit.advanceToAwaitingFeedback();
  unit.advanceToRevision();
  unit.advanceToReflectionPhase();
  unit.pullDomainEvents();
  return unit;
}

describe("AcademyUnit.provision()", () => {
  it("nace con el initialState recibido (RN-6, decidido por UnitSequenceService fuera de este Aggregate)", () => {
    expect(buildUnit(UnitState.LOCKED).state).toBe(UnitState.LOCKED);
    expect(buildUnit(UnitState.UNLOCKED).state).toBe(UnitState.UNLOCKED);
  });
});

describe("AcademyUnit.unlock() — RN-6/RN-7", () => {
  it("primera de la secuencia: elegible sin importar predecessorState", () => {
    const unit = buildUnit(UnitState.LOCKED);
    unit.unlock({ isFirstInSequence: true, predecessorState: null });
    expect(unit.state).toBe(UnitState.UNLOCKED);
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UnitUnlockedEvent);
    expect((events[0] as UnitUnlockedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
    });
  });

  it("no primera: solo elegible si la predecesora llegó a COMPLETED o MASTERED", () => {
    const notEligible = buildUnit(UnitState.LOCKED);
    expect(() =>
      notEligible.unlock({ isFirstInSequence: false, predecessorState: UnitState.IN_PROGRESS }),
    ).toThrow(UnlockNotEligibleException);

    const eligible = buildUnit(UnitState.LOCKED);
    expect(() =>
      eligible.unlock({ isFirstInSequence: false, predecessorState: UnitState.MASTERED }),
    ).not.toThrow();
  });

  it("rechaza desbloquear una Unidad que no está LOCKED", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    expect(() => unit.unlock({ isFirstInSequence: true, predecessorState: null })).toThrow(
      UnlockNotEligibleException,
    );
  });
});

describe("AcademyUnit.startAttempt() — CMD-01", () => {
  it("rechaza si la Unidad no está UNLOCKED", () => {
    const unit = buildUnit(UnitState.LOCKED);
    expect(() => unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt))).toThrow(
      InvalidUnitStateTransitionException,
    );
  });

  it("UNLOCKED -> IN_PROGRESS, fija el Attempt activo y emite UnitStarted", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));

    expect(unit.state).toBe(UnitState.IN_PROGRESS);
    expect(unit.activeAttemptId?.value).toBe(FIXTURE_IDS.attempt);
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UnitStartedEvent);
    expect((events[0] as UnitStartedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
      attemptId: FIXTURE_IDS.attempt,
    });
  });

  it("rechaza un segundo Attempt activo incluso si el estado persistido fuera UNLOCKED con activeAttemptId ya fijado (guard independiente del de InvalidUnitStateTransitionException)", () => {
    // Ese estado (UNLOCKED + activeAttemptId ya fijado) nunca lo produce
    // provision(), pero sí es representable vía reconstitute() (ej. una
    // inconsistencia de datos ya persistidos) — el único punto de entrada
    // por el que este guard es observable de forma aislada del guard de
    // transición de estado.
    const unit = AcademyUnit.reconstitute({
      id: AcademyUnitId.create(FIXTURE_IDS.unit),
      studentId: StudentId.create(FIXTURE_IDS.student),
      textType: TextType.ESSAY,
      position: 1,
      state: UnitState.UNLOCKED,
      activeAttemptId: AttemptId.create(FIXTURE_IDS.attempt),
      completedAt: null,
      masteredAt: null,
      teacherOverrides: [],
    });
    expect(() => unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt2))).toThrow(
      AttemptAlreadyActiveException,
    );
  });
});

describe("AcademyUnit — sincronización eventual 8.1 (IN_PROGRESS -> AWAITING_FEEDBACK -> REVISION -> REFLECTION)", () => {
  it("avanza en la secuencia oficial y rechaza cualquier salto fuera de orden", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));

    expect(() => unit.advanceToRevision()).toThrow(InvalidUnitStateTransitionException);
    unit.advanceToAwaitingFeedback();
    expect(unit.state).toBe(UnitState.AWAITING_FEEDBACK);

    expect(() => unit.advanceToReflectionPhase()).toThrow(InvalidUnitStateTransitionException);
    unit.advanceToRevision();
    expect(unit.state).toBe(UnitState.REVISION);

    unit.returnToAwaitingFeedback(); // ciclo REWRITE<->RECEIVE_FEEDBACK de Attempt
    expect(unit.state).toBe(UnitState.AWAITING_FEEDBACK);

    unit.advanceToRevision();
    unit.advanceToReflectionPhase();
    expect(unit.state).toBe(UnitState.REFLECTION);
  });
});

describe("AcademyUnit.completeFromAttempt() — CMD-07 transacción 2, RN-10 (CompletionPolicy)", () => {
  it("rechaza si la Unidad no está en REFLECTION", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    expect(() =>
      unit.completeFromAttempt({
        attemptId: AttemptId.create(FIXTURE_IDS.attempt),
        linkedMiPlanTaskId: null,
      }),
    ).toThrow(InvalidUnitStateTransitionException);
  });

  it("REFLECTION -> COMPLETED, fija completedAt y emite únicamente UnitCompleted si no hay tarea de Mi Plan vinculada", () => {
    const unit = buildUnitAtReflection();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: null,
    });

    expect(unit.state).toBe(UnitState.COMPLETED);
    expect(unit.completedAt).not.toBeNull();
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UnitCompletedEvent);
    expect((events[0] as UnitCompletedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
      attemptId: FIXTURE_IDS.attempt,
    });
  });

  it("emite también ExternalActivityCompleted (A-08) cuando existe una tarea de Mi Plan vinculada", () => {
    const unit = buildUnitAtReflection();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: "mi-plan-task-1",
    });

    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(2);
    expect(events[0]).toBeInstanceOf(UnitCompletedEvent);
    expect(events[1]).toBeInstanceOf(ExternalActivityCompletedEvent);
    expect((events[1] as ExternalActivityCompletedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
      activityRef: "mi-plan-task-1",
    });
  });
});

describe("AcademyUnit.isEligibleForMastery()/markAsMastered() — RN-8/RN-9", () => {
  function completedUnit(): AcademyUnit {
    const unit = buildUnitAtReflection();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: null,
    });
    unit.pullDomainEvents();
    return unit;
  }

  it("isEligibleForMastery() refleja el criterio de dominio (consulta pura, sin mutar estado)", () => {
    const unit = completedUnit();
    const satisfied = MasteryCriterion.evaluate({
      noSustainedCriticalWeakness: true,
      independentEncountersWithoutScaffolding: 2,
      requiredIndependentEncounters: 2,
    });
    const notSatisfied = MasteryCriterion.evaluate({
      noSustainedCriticalWeakness: true,
      independentEncountersWithoutScaffolding: 0,
      requiredIndependentEncounters: 2,
    });
    expect(unit.isEligibleForMastery(satisfied)).toBe(true);
    expect(unit.isEligibleForMastery(notSatisfied)).toBe(false);
    expect(unit.state).toBe(UnitState.COMPLETED); // sin mutación
  });

  it("rechaza markAsMastered() si la Unidad no está COMPLETED", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    expect(() => unit.markAsMastered()).toThrow(InvalidUnitStateTransitionException);
  });

  it("COMPLETED -> MASTERED, fija masteredAt y emite UnitMastered", () => {
    const unit = completedUnit();
    unit.markAsMastered();

    expect(unit.state).toBe(UnitState.MASTERED);
    expect(unit.masteredAt).not.toBeNull();
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UnitMasteredEvent);
    expect((events[0] as UnitMasteredEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
    });
  });
});

describe("AcademyUnit.repeat() — CMD-09, RN-11/RN-12/H-03 (RepetitionPolicy)", () => {
  it("rechaza repetir una Unidad que no está COMPLETED/MASTERED (RepeatableSpecification)", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    expect(() => unit.repeat(AttemptId.create(FIXTURE_IDS.attempt2))).toThrow(
      UnitNotRepeatableException,
    );
  });

  it("no altera UnitState (H-03: el logro histórico se conserva), fija el nuevo Attempt activo y emite UnitRepeated", () => {
    const unit = buildUnitAtReflection();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: null,
    });
    unit.pullDomainEvents();

    unit.repeat(AttemptId.create(FIXTURE_IDS.attempt2));

    expect(unit.state).toBe(UnitState.COMPLETED); // sin cambio
    expect(unit.activeAttemptId?.value).toBe(FIXTURE_IDS.attempt2);
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UnitRepeatedEvent);
    expect((events[0] as UnitRepeatedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      unitId: FIXTURE_IDS.unit,
      newAttemptId: FIXTURE_IDS.attempt2,
    });
  });
});

describe("AcademyUnit.applyTeacherOverride() — CMD-10, RN-13, invariante 10", () => {
  function override(action: OverrideAction): TeacherOverride {
    return TeacherOverride.create({
      id: TeacherOverrideId.create(FIXTURE_IDS.teacherOverride),
      teacherId: FIXTURE_IDS.teacher,
      action,
      reason: "Intervención docente justificada.",
    });
  }

  it("rechaza una acción no válida para el estado actual (delegado a TeacherOverridePolicy)", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    expect(() => unit.applyTeacherOverride(override(OverrideAction.FORCE_RESTART))).toThrow(
      OverrideNotValidForStateException,
    );
  });

  it("FORCE_LOCK desde un estado activo: fuerza LOCKED, limpia el Attempt activo y registra el override", () => {
    const unit = buildUnit(UnitState.UNLOCKED);
    unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));
    unit.pullDomainEvents();

    unit.applyTeacherOverride(override(OverrideAction.FORCE_LOCK));

    expect(unit.state).toBe(UnitState.LOCKED);
    expect(unit.activeAttemptId).toBeNull();
    expect(unit.teacherOverrides).toHaveLength(1);
    const events = unit.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(TeacherOverrideAppliedEvent);
    expect((events[0] as TeacherOverrideAppliedEvent).payload).toEqual({
      teacherId: FIXTURE_IDS.teacher,
      unitId: FIXTURE_IDS.unit,
      action: OverrideAction.FORCE_LOCK,
      reason: "Intervención docente justificada.",
    });
  });

  it("FORCE_RESTART desde LOCKED: desbloquea (UNLOCKED)", () => {
    const unit = buildUnit(UnitState.LOCKED);
    unit.applyTeacherOverride(override(OverrideAction.FORCE_RESTART));
    expect(unit.state).toBe(UnitState.UNLOCKED);
  });

  it("FORCE_RESTART desde COMPLETED/MASTERED: el estado NO cambia (H-03) — Application Layer invoca repeat() por separado", () => {
    const unit = buildUnitAtReflection();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: null,
    });
    unit.pullDomainEvents();

    unit.applyTeacherOverride(override(OverrideAction.FORCE_RESTART));

    expect(unit.state).toBe(UnitState.COMPLETED);
  });
});
