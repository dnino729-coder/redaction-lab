export interface CreateModelExampleRequestDto {
  readonly textType: string;
  readonly content: string;
  readonly rating: "EXCELLENT" | "HAS_ERRORS";
  readonly curatorialComment: string;
}

export interface UpdateModelExampleRequestDto {
  readonly modelExampleId: string;
  readonly content?: string;
  readonly curatorialComment?: string;
}

export interface RetireModelExampleRequestDto {
  readonly modelExampleId: string;
}

export interface ModelExampleResponseDto {
  readonly id: string;
  readonly textType: string;
  readonly content: string;
  readonly rating: string;
  readonly curatorialComment: string;
  readonly status: string;
}
