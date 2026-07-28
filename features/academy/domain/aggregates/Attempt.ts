import { AggregateRoot } from "../shared/AggregateRoot";
import { AttemptId } from "../value-objects/AttemptId";
import { AcademyUnitId } from "../value-objects/AcademyUnitId";
import { StudentId } from "../value-objects/StudentId";
import { DraftId } from "../value-objects/DraftId";
import { VersionId } from "../value-objects/VersionId";
import { FeedbackId } from "../value-objects/FeedbackId";
import { VersionNumber } from "../value-objects/VersionNumber";
import { DraftContent } from "../value-objects/DraftContent";
import { FeedbackObservation } from "../value-objects/FeedbackObservation";
import { UnitStep, UNIT_STEP_ORDER, FREE_ADVANCE_STEPS } from "../enums/UnitStep";
import { Draft } from "../entities/Draft";
import { Version } from "../entities/Version";
import { Feedback } from "../entities/Feedback";
import { FeedbackPolicy } from "../policies/FeedbackPolicy";
import { RevisionPolicy } from "../policies/RevisionPolicy";
import { ComprehensionNotVerifiedException } from "../exceptions/ComprehensionNotVerifiedException";
import { InvalidStepTransitionException } from "../exceptions/InvalidStepTransitionException";
import { NoPendingVersionException } from "../exceptions/NoPendingVersionException";
import { StepNotEligibleException } from "../exceptions/StepNotEligibleException";
import { NotInComprehendStepException } from "../exceptions/NotInComprehendStepException";
import { ProductionSubmittedEvent } from "../events/ProductionSubmittedEvent";
import { FeedbackRequestedEvent } from "../events/FeedbackRequestedEvent";
import { FeedbackDeliveredEvent } from "../events/FeedbackDeliveredEvent";
import { RevisionStartedEvent } from "../events/RevisionStartedEvent";
import { ReflectionStartedEvent } from "../events/ReflectionStartedEvent";
import { ReflectionCompletedEvent } from "../events/ReflectionCompletedEvent";

// Aggregate Root (Domain Model v1.1, AR-2) — un recorrido completo (o en
// curso) de los 11 pasos oficiales (A-02) para una `AcademyUnit`. Gobierna
// `UnitStep` (RN-1), el ciclo Borrador→Versión→Retroalimentación→
// Reescritura (RN-3, RN-4, RN-5) y la puerta de comprensión (RN-2).
// `TeacherOverride` NUNCA modifica un `Attempt` en curso (invariante 10) —
// por eso este Aggregate no expone ningún método de "reinicio forzado";
// `FORCE_RESTART` crea un `Attempt` enteramente nuevo vía `AttemptFactory`,
// dejando el anterior huérfano como historial de solo lectura.
interface AttemptProps {
  unitId: AcademyUnitId;
  studentId: StudentId;
  currentStep: UnitStep;
  comprehensionVerified: boolean;
  attemptNumber: number;
  isCurrent: boolean;
  draft: Draft | null;
  versions: Version[];
  startedAt: Date;
  completedAt: Date | null;
}

export class Attempt extends AggregateRoot<AttemptId> {
  private readonly feedbackPolicy = new FeedbackPolicy();
  private readonly revisionPolicy = new RevisionPolicy();

  private props: AttemptProps;

  private constructor(id: AttemptId, props: AttemptProps) {
    super(id);
    this.props = props;
  }

  /** Construcción de un Attempt nuevo — invocada exclusivamente por
   * `AttemptFactory` (Domain Model v1.1, Sección 3: "paso inicial siempre
   * CONTEXTUALIZE"), al iniciar una Unidad por primera vez (CMD-01) o al
   * repetirla (CMD-09/RN-12, "desde el paso CONTEXTUALIZE"). */
  public static start(params: {
    id: AttemptId;
    unitId: AcademyUnitId;
    studentId: StudentId;
    attemptNumber: number;
  }): Attempt {
    return new Attempt(params.id, {
      unitId: params.unitId,
      studentId: params.studentId,
      currentStep: UnitStep.CONTEXTUALIZE,
      comprehensionVerified: false,
      attemptNumber: params.attemptNumber,
      isCurrent: true,
      draft: null,
      versions: [],
      startedAt: new Date(),
      completedAt: null,
    });
  }

  public static reconstitute(params: {
    id: AttemptId;
    unitId: AcademyUnitId;
    studentId: StudentId;
    currentStep: UnitStep;
    comprehensionVerified: boolean;
    attemptNumber: number;
    isCurrent: boolean;
    draft: Draft | null;
    versions: Version[];
    startedAt: Date;
    completedAt: Date | null;
  }): Attempt {
    return new Attempt(params.id, {
      unitId: params.unitId,
      studentId: params.studentId,
      currentStep: params.currentStep,
      comprehensionVerified: params.comprehensionVerified,
      attemptNumber: params.attemptNumber,
      isCurrent: params.isCurrent,
      draft: params.draft,
      versions: [...params.versions],
      startedAt: params.startedAt,
      completedAt: params.completedAt,
    });
  }

  /** CMD-16 AdvanceStep — avanza linealmente por los pasos de contenido
   * libres previos a la Producción (`FREE_ADVANCE_STEPS`), sin puerta de
   * validación propia. `COMPREHEND` queda excluido (tiene su propia
   * puerta, RN-2, ver `verifyComprehension`). */
  public advanceStep(): void {
    if (!FREE_ADVANCE_STEPS.includes(this.props.currentStep)) {
      throw new StepNotEligibleException(this.id.value, this.props.currentStep);
    }
    const currentIndex = UNIT_STEP_ORDER.indexOf(this.props.currentStep);
    const next = UNIT_STEP_ORDER[currentIndex + 1];
    if (next === undefined) {
      throw new StepNotEligibleException(this.id.value, this.props.currentStep);
    }
    this.props.currentStep = next;
  }

  /** CMD-17 VerifyComprehension — RN-2: puerta obligatoria antes de
   * `PRODUCE`. El mecanismo exacto de evaluación de `comprehensionResponse`
   * permanece PENDIENTE DE DECISIÓN DE ARQUITECTURA (heredado, Application
   * Layer Spec v1.0, CMD-17); esta implementación aplica el criterio
   * mínimo no ambiguo derivable del documento: una respuesta ausente o
   * vacía nunca es satisfactoria. Retorna `false` sin lanzar excepción si
   * la verificación no fue satisfactoria (caso válido, no un error —
   * `Attempt` permanece en `COMPREHEND`, ver EP-22). */
  public verifyComprehension(comprehensionResponse: unknown): boolean {
    if (this.props.currentStep !== UnitStep.COMPREHEND) {
      throw new NotInComprehendStepException(this.id.value);
    }
    const isSatisfactory =
      comprehensionResponse !== null &&
      comprehensionResponse !== undefined &&
      comprehensionResponse !== "";
    if (isSatisfactory) {
      this.props.comprehensionVerified = true;
      this.props.currentStep = UnitStep.OBSERVE;
    }
    return isSatisfactory;
  }

  /** CMD-03 AutosaveDraft — RN-15 (continuidad persistente). Válido en
   * `PRODUCE`/`REWRITE`; puede reemplazarse por contenido vacío durante la
   * edición (no es un error, a diferencia de `submitProduction`). */
  public autosaveDraft(draftId: DraftId, content: DraftContent): void {
    if (this.props.currentStep !== UnitStep.PRODUCE && this.props.currentStep !== UnitStep.REWRITE) {
      throw new InvalidStepTransitionException(this.props.currentStep, this.props.currentStep);
    }
    if (this.props.draft === null) {
      this.props.draft = Draft.create({ id: draftId, content });
    } else {
      this.props.draft.updateContent(content);
    }
  }

  /** CMD-02 SubmitProduction — RN-2 (puerta de comprensión), RN-5
   * (inmutabilidad de Version). Congela el Draft vigente en una nueva
   * Version y avanza a `RECEIVE_FEEDBACK`. */
  public submitProduction(versionId: VersionId, content: DraftContent): Version {
    if (!this.props.comprehensionVerified) {
      throw new ComprehensionNotVerifiedException(this.id.value);
    }
    if (this.props.currentStep !== UnitStep.PRODUCE) {
      throw new InvalidStepTransitionException(this.props.currentStep, UnitStep.RECEIVE_FEEDBACK);
    }

    const version = Version.create({ id: versionId, number: VersionNumber.first(), content });
    this.props.versions.push(version);
    this.props.draft = null;
    this.props.currentStep = UnitStep.RECEIVE_FEEDBACK;

    this.addDomainEvent(
      new ProductionSubmittedEvent(this.id.value, {
        attemptId: this.id.value,
        unitId: this.props.unitId.value,
        versionId: version.id.value,
        versionNumber: version.number.value,
      }),
    );
    this.addDomainEvent(
      new FeedbackRequestedEvent(this.id.value, {
        attemptId: this.id.value,
        versionId: version.id.value,
      }),
    );
    return version;
  }

  /** CMD-04 RecordFeedbackDelivered — RN-3 (`FeedbackPolicy`). Registra la
   * Retroalimentación (Coach IA/Profesor) sobre la Version pendiente y
   * avanza a `REWRITE`. */
  public recordFeedback(params: {
    feedbackId: FeedbackId;
    observations: FeedbackObservation[];
  }): Feedback {
    if (this.props.currentStep !== UnitStep.RECEIVE_FEEDBACK) {
      throw new InvalidStepTransitionException(this.props.currentStep, UnitStep.REWRITE);
    }
    const pendingVersion = this.latestVersion();
    if (pendingVersion.hasFeedback()) {
      throw new NoPendingVersionException(this.id.value);
    }

    this.feedbackPolicy.assertValid(params.observations);
    const sorted = this.feedbackPolicy.sortByPriority(params.observations);

    const feedback = Feedback.create({
      id: params.feedbackId,
      versionId: pendingVersion.id,
      observations: sorted,
    });
    pendingVersion.attachFeedback(feedback);
    this.props.currentStep = UnitStep.REWRITE;

    this.addDomainEvent(
      new FeedbackDeliveredEvent(this.id.value, {
        attemptId: this.id.value,
        versionId: pendingVersion.id.value,
        feedbackId: feedback.id.value,
      }),
    );
    return feedback;
  }

  /** CMD-05 SubmitRevision — congela una nueva Version tras un ciclo de
   * reescritura. Emite `RevisionStarted`, `ProductionSubmitted` y
   * `FeedbackRequested` en la misma invocación (Application Layer Spec
   * v1.0, CMD-05, nota de precisión heredada de R-06). */
  public submitRevision(versionId: VersionId, content: DraftContent): Version {
    if (this.props.currentStep !== UnitStep.REWRITE) {
      throw new InvalidStepTransitionException(this.props.currentStep, UnitStep.RECEIVE_FEEDBACK);
    }
    const previousVersion = this.latestVersion();

    const version = Version.create({
      id: versionId,
      number: previousVersion.number.next(),
      content,
    });
    this.props.versions.push(version);
    this.props.draft = null;
    this.props.currentStep = UnitStep.RECEIVE_FEEDBACK;

    this.addDomainEvent(
      new RevisionStartedEvent(this.id.value, {
        attemptId: this.id.value,
        previousVersionId: previousVersion.id.value,
      }),
    );
    this.addDomainEvent(
      new ProductionSubmittedEvent(this.id.value, {
        attemptId: this.id.value,
        unitId: this.props.unitId.value,
        versionId: version.id.value,
        versionNumber: version.number.value,
      }),
    );
    this.addDomainEvent(
      new FeedbackRequestedEvent(this.id.value, {
        attemptId: this.id.value,
        versionId: version.id.value,
      }),
    );
    return version;
  }

  /** CMD-06 AdvanceToReflection — RN-4 (`RevisionPolicy`, mínimo un ciclo
   * de reescritura). `REWRITE` -> `REFLECT`. */
  public advanceToReflection(): void {
    if (this.props.currentStep !== UnitStep.REWRITE) {
      throw new InvalidStepTransitionException(this.props.currentStep, UnitStep.REFLECT);
    }
    this.revisionPolicy.assertMinimumCycleComplete({
      attemptId: this.id.value,
      versionsCount: this.props.versions.length,
      feedbacksCount: this.props.versions.filter((v) => v.hasFeedback()).length,
    });
    this.props.currentStep = UnitStep.REFLECT;
    this.addDomainEvent(
      new ReflectionStartedEvent(this.id.value, { attemptId: this.id.value }),
    );
  }

  /** CMD-07 CompleteReflection (transacción 1 del patrón de dos
   * transacciones) — `REFLECT` -> `UNLOCK`. Dispara `ReflectionCompleted`,
   * consumido por `CompleteUnitOnReflectionCompletedHandler` (Application
   * Layer, transacción 2) para transicionar `AcademyUnit` a `COMPLETED`. */
  public completeReflection(reflectionAnswers: readonly string[]): void {
    if (reflectionAnswers.length === 0) {
      throw new Error(
        "Attempt.completeReflection: reflectionAnswers no puede estar vacío.",
      );
    }
    if (this.props.currentStep !== UnitStep.REFLECT) {
      throw new InvalidStepTransitionException(this.props.currentStep, UnitStep.UNLOCK);
    }
    this.props.currentStep = UnitStep.UNLOCK;
    this.props.completedAt = new Date();

    this.addDomainEvent(
      new ReflectionCompletedEvent(this.id.value, {
        attemptId: this.id.value,
        unitId: this.props.unitId.value,
        studentId: this.props.studentId.value,
        comprehensionVerified: this.props.comprehensionVerified,
      }),
    );
  }

  /** Invocado por Application Layer al crear un nuevo Attempt de
   * repetición (CMD-09/CMD-10 FORCE_RESTART) — marca este Attempt (ya
   * finalizado o huérfano) como no vigente. Nunca se invoca sobre un
   * Attempt activo (invariante 10: `TeacherOverride` nunca lo toca). */
  public markAsNotCurrent(): void {
    this.props.isCurrent = false;
  }

  private latestVersion(): Version {
    const version = this.props.versions[this.props.versions.length - 1];
    if (!version) {
      throw new NoPendingVersionException(this.id.value);
    }
    return version;
  }

  public get unitId(): AcademyUnitId {
    return this.props.unitId;
  }

  public get studentId(): StudentId {
    return this.props.studentId;
  }

  public get currentStep(): UnitStep {
    return this.props.currentStep;
  }

  public get comprehensionVerified(): boolean {
    return this.props.comprehensionVerified;
  }

  public get attemptNumber(): number {
    return this.props.attemptNumber;
  }

  public get isCurrent(): boolean {
    return this.props.isCurrent;
  }

  public get draft(): Draft | null {
    return this.props.draft;
  }

  public get versions(): readonly Version[] {
    return this.props.versions;
  }

  public get startedAt(): Date {
    return this.props.startedAt;
  }

  public get completedAt(): Date | null {
    return this.props.completedAt;
  }
}
