import { AggregateRoot } from "../shared/AggregateRoot";
import { ModelExampleId } from "../value-objects/ModelExampleId";
import { TextType } from "../enums/TextType";
import { ModelExampleRating } from "../enums/ModelExampleRating";
import { ModelExampleStatus } from "../enums/ModelExampleStatus";
import { ModelExampleAlreadyRetiredException } from "../exceptions/ModelExampleAlreadyRetiredException";

// Aggregate Root (Domain Model v1.1, AR-3) — una producción ejemplar de
// la Biblioteca de Modelos, propiedad exclusiva de Academia (A-04). Sin
// Factory dedicada (Application Layer Spec v1.0, CMD-12: "constructor
// simple — sin Factory dedicada"). Mutación editorial exclusiva del
// Administrador (RN-14); de solo lectura para el flujo del estudiante
// (RN-16). Sin Domain Events — ningún evento de dominio cubre su ciclo
// editorial (Domain Model v1.1, Sección 10).
interface ModelExampleProps {
  textType: TextType;
  content: string;
  rating: ModelExampleRating;
  curatorialComment: string;
  status: ModelExampleStatus;
}

export class ModelExample extends AggregateRoot<ModelExampleId> {
  private props: ModelExampleProps;

  private constructor(id: ModelExampleId, props: ModelExampleProps) {
    super(id);
    this.props = props;
  }

  /** CMD-12 CreateModelExample. */
  public static create(params: {
    id: ModelExampleId;
    textType: TextType;
    content: string;
    rating: ModelExampleRating;
    curatorialComment: string;
  }): ModelExample {
    const content = (params.content ?? "").trim();
    const curatorialComment = (params.curatorialComment ?? "").trim();
    if (content.length === 0) {
      throw new Error("ModelExample: content no puede estar vacío.");
    }
    if (curatorialComment.length === 0) {
      throw new Error("ModelExample: curatorialComment no puede estar vacío.");
    }
    return new ModelExample(params.id, {
      textType: params.textType,
      content,
      rating: params.rating,
      curatorialComment,
      status: ModelExampleStatus.ACTIVE,
    });
  }

  public static reconstitute(params: {
    id: ModelExampleId;
    textType: TextType;
    content: string;
    rating: ModelExampleRating;
    curatorialComment: string;
    status: ModelExampleStatus;
  }): ModelExample {
    return new ModelExample(params.id, {
      textType: params.textType,
      content: params.content,
      rating: params.rating,
      curatorialComment: params.curatorialComment,
      status: params.status,
    });
  }

  /** CMD-13 UpdateModelExample — actualización parcial. RN-14: solo el
   * Administrador (verificado por Application Layer, no aquí). Lanza
   * `ModelExampleAlreadyRetiredException` si el ejemplo ya fue retirado —
   * un `ModelExample` `RETIRED` no admite edición editorial. */
  public update(params: { content?: string; curatorialComment?: string }): void {
    if (this.props.status === ModelExampleStatus.RETIRED) {
      throw new ModelExampleAlreadyRetiredException(this.id.value);
    }
    if (params.content !== undefined) {
      const content = params.content.trim();
      if (content.length === 0) {
        throw new Error("ModelExample.update: content no puede quedar vacío.");
      }
      this.props.content = content;
    }
    if (params.curatorialComment !== undefined) {
      const curatorialComment = params.curatorialComment.trim();
      if (curatorialComment.length === 0) {
        throw new Error("ModelExample.update: curatorialComment no puede quedar vacío.");
      }
      this.props.curatorialComment = curatorialComment;
    }
  }

  /** CMD-14 RetireModelExample — baja lógica, idempotente: retirar un
   * ejemplo ya `RETIRED` no produce error (Application Layer Spec v1.0,
   * CMD-14: "continuar sin error, idempotente"). */
  public retire(): void {
    this.props.status = ModelExampleStatus.RETIRED;
  }

  public get textType(): TextType {
    return this.props.textType;
  }

  public get content(): string {
    return this.props.content;
  }

  public get rating(): ModelExampleRating {
    return this.props.rating;
  }

  public get curatorialComment(): string {
    return this.props.curatorialComment;
  }

  public get status(): ModelExampleStatus {
    return this.props.status;
  }
}
