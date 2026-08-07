// Blueprint §5.3.
export interface DraftHttp {
  attemptId: string;
  content: string;
  wordCount: number;
  characterCount: number;
  lastSavedAt: string;
}
