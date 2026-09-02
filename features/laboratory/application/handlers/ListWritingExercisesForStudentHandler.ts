import type {
  LaboratoryExerciseReadModelPort,
  WritingExerciseListItem,
} from "../ports/LaboratoryExerciseReadModelPort";
import type { ListWritingExercisesForStudentQuery } from "../queries/ListWritingExercisesForStudentQuery";
import type { WritingExerciseResponseDto } from "../dto/WritingExerciseResponseDto";
import { validateListWritingExercisesForStudentRequest } from "../validators/writingExerciseValidators";

function toResponseDto(item: WritingExerciseListItem): WritingExerciseResponseDto {
  return {
    id: item.id,
    mode: item.mode,
    textType: item.textType,
    guidedPrompt: item.guidedPrompt,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
  };
}

export class ListWritingExercisesForStudentHandler {
  constructor(private readonly readModel: LaboratoryExerciseReadModelPort) {}

  public async handle(query: ListWritingExercisesForStudentQuery): Promise<WritingExerciseResponseDto[]> {
    const { request } = query;
    validateListWritingExercisesForStudentRequest(request);

    const items = await this.readModel.listExercisesForStudent(request.studentId, request.mode);
    return items.map(toResponseDto);
  }
}
