import { randomUUID } from "node:crypto";
import type { UuidGenerator } from "@/features/my-plan/application/ports/UuidGenerator";

// Adaptador — implementa el puerto `UuidGenerator` con la API nativa de
// Node (`crypto.randomUUID()`, UUID v4) — sin dependencia externa nueva.
export class CryptoUuidGenerator implements UuidGenerator {
  public generate(): string {
    return randomUUID();
  }
}
