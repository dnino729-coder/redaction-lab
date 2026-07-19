// Primitivas de validación sintáctica compartidas — UUID, campos
// obligatorios, rangos, tipos, formato de fecha. Nunca validan una regla
// de negocio (eso sigue en el dominio); solo la forma del dato de
// entrada. Cada función devuelve un `string` de error o `null` si es
// válido, para que los validators de cada comando/consulta acumulen
// todos los errores encontrados antes de lanzar `ValidationException`
// una sola vez (en vez de fallar en el primer campo).
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

export function optionalString(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    return `${fieldName} debe ser un string si se proporciona.`;
  }
  return null;
}

export function requireIsoDate(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return `${fieldName} debe ser una fecha ISO-8601 válida (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

export function optionalIsoDate(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) return null;
  return requireIsoDate(value, fieldName);
}

export function requireIntegerInRange(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return `${fieldName} debe ser un entero entre ${min} y ${max} (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
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

export function collectErrors(...errors: ReadonlyArray<string | null>): string[] {
  return errors.filter((error): error is string => error !== null);
}
