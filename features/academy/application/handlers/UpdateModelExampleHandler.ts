import type { ModelExampleRepository } from "@/features/academy/domain/repositories/ModelExampleRepository";
import { ModelExampleId } from "@/features/academy/domain/value-objects/ModelExampleId";

import type { UpdateModelExampleCommand } from "../commands/UpdateModelExampleCommand";
import type { ModelExampleResponseDto } from "../dto/ModelExampleDto";
import { ModelExampleMapper } from "../mappers/ModelExampleMapper";
import { validateUpdateModelExampleRequest } from "../validators/modelExampleValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";

// CMD-13 UpdateModelExample — actualización parcial, exclusivamente
// Administrador (RN-14).
export class UpdateModelExampleHandler {
  constructor(
    private readonly modelExampleRepository: ModelExampleRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async handle(command: UpdateModelExampleCommand): Promise<ModelExampleResponseDto> {
    const { request } = command;
    validateUpdateModelExampleRequest(request);

    const example = await this.unitOfWork.execute(async () => {
      const found = await this.modelExampleRepository.findById(
        ModelExampleId.create(request.modelExampleId),
      );
      if (!found) {
        throw new ResourceNotFoundException(
          "ACADEMY_NOT_FOUND_MODEL_EXAMPLE",
          "ModelExample",
          request.modelExampleId,
        );
      }
      found.update({ content: request.content, curatorialComment: request.curatorialComment });
      await this.modelExampleRepository.save(found);
      return found;
    });

    return ModelExampleMapper.toDto(example);
  }
}
