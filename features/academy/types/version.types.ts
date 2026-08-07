// Blueprint §5.4.
export interface VersionHttp {
  versionId: string;
  attemptId: string;
  versionNumber: number;
  content: string;
  submittedAt: string;
  feedbackStatus: "READY" | "PROCESSING";
}
