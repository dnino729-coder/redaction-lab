import { ApplicationException } from "./ApplicationException";

// Se lanza cuando no hay sesión Clerk activa o no existe un perfil interno
// (studentId) asociado a esa sesión — mismo criterio que ForbiddenException,
// pero para el caso "no autenticado" en vez de "autenticado sin permiso".
export class UnauthorizedException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}
