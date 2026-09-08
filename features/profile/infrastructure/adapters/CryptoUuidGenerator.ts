import { randomUUID } from "node:crypto";
import type { UuidGenerator } from "@/features/profile/application/ports/UuidGenerator";

export class CryptoUuidGenerator implements UuidGenerator {
  public generate(): string {
    return randomUUID();
  }
}
