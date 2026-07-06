export class UserNotFoundError extends Error {
  code = "USER_NOT_FOUND";
  constructor(email?: string) {
    super(email ? `Usuário não encontrado: ${email}` : "Usuário não encontrado");
  }
}

export class UserInactiveError extends Error {
  code = "USER_INACTIVE";
  constructor() {
    super("Usuário desativado. Procure o administrador.");
  }
}

export class InsufficientPermissionError extends Error {
  code = "FORBIDDEN";
  constructor(module?: string, action?: string) {
    super(module && action ? `Sem permissão para ${action} em ${module}` : "Acesso negado");
  }
}

export class InvalidRoleError extends Error {
  code = "INVALID_ROLE";
  constructor(role: string) {
    super(`Cargo inválido: ${role}`);
  }
}
