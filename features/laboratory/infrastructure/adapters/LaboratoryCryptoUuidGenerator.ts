import { randomUUID } from "node:crypto";
import type { UuidGenerator } from "@/features/laboratory/application/ports/UuidGenerator";

export class LaboratoryCryptoUuidGenerator implements UuidGenerator {
  public generate(): string {
    return randomUUID();
  }
}
