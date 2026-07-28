import { ValidationException } from "../exceptions/ValidationException";
import { TextType } from "@/features/academy/domain/enums/TextType";
import { ModelExampleRating } from "@/features/academy/domain/enums/ModelExampleRating";
import type {
  CreateModelExampleRequestDto,
  UpdateModelExampleRequestDto,
  RetireModelExampleRequestDto,
} from "../dto/ModelExampleDto";
import {
  requireUuid,
  requireOneOf,
  requireNonEmptyString,
  optionalNonEmptyString,
  collectErrors,
} from "./primitives";

const TEXT_TYPES = Object.values(TextType);
const RATINGS = Object.values(ModelExampleRating);

export function validateCreateModelExampleRequest(request: CreateModelExampleRequestDto): void {
  const textTypeError = requireOneOf(request.textType, "textType", TEXT_TYPES);
  if (textTypeError !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_INVALID_TEXT_TYPE", [textTypeError]);
  }
  const errors = collectErrors(
    requireNonEmptyString(request.content, "content"),
    requireNonEmptyString(request.curatorialComment, "curatorialComment"),
    requireOneOf(request.rating, "rating", RATINGS),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);
}

export function validateUpdateModelExampleRequest(request: UpdateModelExampleRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.modelExampleId, "modelExampleId"),
    optionalNonEmptyString(request.content, "content"),
    optionalNonEmptyString(request.curatorialComment, "curatorialComment"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);
  if (request.content === undefined && request.curatorialComment === undefined) {
    throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", [
      "al menos uno de content/curatorialComment debe estar presente.",
    ]);
  }
}

export function validateRetireModelExampleRequest(request: RetireModelExampleRequestDto): void {
  const errors = collectErrors(requireUuid(request.modelExampleId, "modelExampleId"));
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}
