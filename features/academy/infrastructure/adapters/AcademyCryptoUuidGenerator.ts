import { randomUUID } from "node:crypto";
import type { UuidGenerator } from "@/features/academy/application/ports/UuidGenerator";

// Adaptador — implementa el puerto `UuidGenerator` con la API nativa de
// Node (mismo patrón que features/my-plan/infrastructure/adapters/
// CryptoUuidGenerator.ts).
export class AcademyCryptoUuidGenerator implements UuidGenerator {
  public generate(): string {
    return randomUUID();
  }
}
