// Blueprint §5.8.
import type { TextType, UnitState } from "./enums";

export interface StudentProgressSummaryHttp {
  studentId: string;
  unitsByState: Partial<Record<UnitState, number>>;
  unitsByTextType: Partial<Record<TextType, number>>;
}
