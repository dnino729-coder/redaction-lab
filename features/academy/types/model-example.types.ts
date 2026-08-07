// Blueprint §5.6.
import type { ModelExampleRating, ModelExampleStatus, TextType } from "./enums";

export interface ModelExampleHttp {
  modelExampleId: string;
  textType: TextType;
  content: string;
  rating: ModelExampleRating;
  curatorialComment: string;
  status: ModelExampleStatus;
}
