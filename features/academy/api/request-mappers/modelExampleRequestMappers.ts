import type {
  CreateModelExampleRequestDto,
  UpdateModelExampleRequestDto,
  RetireModelExampleRequestDto,
} from "@/features/academy/application/dto/ModelExampleDto";
import type { ListModelExamplesByTextTypeRequestDto } from "@/features/academy/application/dto/QueryDto";

// Request Mapper (Alcance #6) — Biblioteca de Modelos.
export interface CreateModelExampleBody {
  readonly textType: unknown;
  readonly content: unknown;
  readonly rating: unknown;
  readonly curatorialComment: unknown;
}

export function toCreateModelExampleRequest(body: CreateModelExampleBody): CreateModelExampleRequestDto {
  return {
    textType: body.textType as string,
    content: body.content as string,
    rating: body.rating as "EXCELLENT" | "HAS_ERRORS",
    curatorialComment: body.curatorialComment as string,
  };
}

export interface UpdateModelExampleBody {
  readonly content?: unknown;
  readonly curatorialComment?: unknown;
}

export function toUpdateModelExampleRequest(
  modelExampleId: string,
  body: UpdateModelExampleBody,
): UpdateModelExampleRequestDto {
  return {
    modelExampleId,
    ...(body.content !== undefined ? { content: body.content as string } : {}),
    ...(body.curatorialComment !== undefined
      ? { curatorialComment: body.curatorialComment as string }
      : {}),
  };
}

export function toRetireModelExampleRequest(modelExampleId: string): RetireModelExampleRequestDto {
  return { modelExampleId };
}

export function toListModelExamplesRequest(textType: string | null): ListModelExamplesByTextTypeRequestDto {
  return { textType: textType ?? "" };
}
