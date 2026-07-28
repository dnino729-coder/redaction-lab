// Primitivas de validación sintáctica compartidas (mismo patrón que
// features/my-plan/application/validators/primitives.ts). Nunca validan
// una regla de negocio (eso vive en el dominio) — solo la forma del dato
// de entrada.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireUuid(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return `${fieldName} debe ser un UUID válido (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

export function requireNonEmptyString(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `${fieldName} es obligatorio y no puede estar vacío.`;
  }
  return null;
}

export function requireString(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string") {
    return `${fieldName} debe ser un string.`;
  }
  return null;
}

export function optionalNonEmptyString(value: unknown, fieldName: string): string | null {
  if (value === undefined) return null;
  return requireNonEmptyString(value, fieldName);
}

export function requireOneOf<T extends string>(
  value: unknown,
  fieldName: string,
  allowed: readonly T[],
): string | null {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return `${fieldName} debe ser uno de [${allowed.join(", ")}] (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

export function requireIntegerAtLeast(value: unknown, fieldName: string, min: number): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    return `${fieldName} debe ser un entero >= ${min} (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

export function requireNonEmptyArray(value: unknown, fieldName: string): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return `${fieldName} debe ser un arreglo con al menos un elemento.`;
  }
  return null;
}

export function requirePresent(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} es obligatorio.`;
  }
  return null;
}

export function collectErrors(...errors: ReadonlyArray<string | null>): string[] {
  return errors.filter((error): error is string => error !== null);
}
