import type { ModelExampleRepository } from "@/features/academy/domain/repositories/ModelExampleRepository";
import { ModelExampleId } from "@/features/academy/domain/value-objects/ModelExampleId";

import type { RetireModelExampleCommand } from "../commands/RetireModelExampleCommand";
import type { ModelExampleResponseDto } from "../dto/ModelExampleDto";
import { ModelExampleMapper } from "../mappers/ModelExampleMapper";
import { validateRetireModelExampleRequest } from "../validators/modelExampleValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";

// CMD-14 RetireModelExample — baja lógica, idempotente (retirar dos veces
// produce el mismo estado final, sin excepción en el segundo intento).
export class RetireModelExampleHandler {
  constructor(
    private readonly modelExampleRepository: ModelExampleRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async handle(command: RetireModelExampleCommand): Promise<ModelExampleResponseDto> {
    const { request } = command;
    validateRetireModelExampleRequest(request);

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
      found.retire();
      await this.modelExampleRepository.save(found);
      return found;
    });

    return ModelExampleMapper.toDto(example);
  }
}
