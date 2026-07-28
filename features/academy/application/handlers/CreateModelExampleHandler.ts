import type { ModelExampleRepository } from "@/features/academy/domain/repositories/ModelExampleRepository";
import { ModelExampleId } from "@/features/academy/domain/value-objects/ModelExampleId";
import { ModelExample } from "@/features/academy/domain/aggregates/ModelExample";
import type { TextType } from "@/features/academy/domain/enums/TextType";
import type { ModelExampleRating } from "@/features/academy/domain/enums/ModelExampleRating";

import type { CreateModelExampleCommand } from "../commands/CreateModelExampleCommand";
import type { ModelExampleResponseDto } from "../dto/ModelExampleDto";
import { ModelExampleMapper } from "../mappers/ModelExampleMapper";
import { validateCreateModelExampleRequest } from "../validators/modelExampleValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";

// CMD-12 CreateModelExample — sin Factory dedicada (constructor simple,
// Domain Model v1.1 Sección 12), exclusivamente Administrador (verificado
// por Middleware/Guard de la capa API, Sprint 6.3). Sin Outbox.
export class CreateModelExampleHandler {
  constructor(
    private readonly modelExampleRepository: ModelExampleRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  public async handle(command: CreateModelExampleCommand): Promise<ModelExampleResponseDto> {
    const { request } = command;
    validateCreateModelExampleRequest(request);

    const example = await this.unitOfWork.execute(async () => {
      const created = ModelExample.create({
        id: ModelExampleId.create(this.uuidGenerator.generate()),
        textType: request.textType as TextType,
        content: request.content,
        rating: request.rating as ModelExampleRating,
        curatorialComment: request.curatorialComment,
      });
      await this.modelExampleRepository.save(created);
      return created;
    });

    return ModelExampleMapper.toDto(example);
  }
}
