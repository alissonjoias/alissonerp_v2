import { describe, it, expect } from "vitest";
import {
  UserNotFoundError,
  UserInactiveError,
  InsufficientPermissionError,
  InvalidRoleError,
} from "../../domain/errors";

describe("Auth — Erros de domínio", () => {
  it("UserNotFoundError tem código USER_NOT_FOUND", () => {
    const err = new UserNotFoundError();
    expect(err.code).toBe("USER_NOT_FOUND");
    expect(err.message).toContain("não encontrado");
  });

  it("UserNotFoundError aceita email como parâmetro", () => {
    const err = new UserNotFoundError("teste@email.com");
    expect(err.message).toContain("teste@email.com");
  });

  it("UserInactiveError tem código USER_INACTIVE", () => {
    const err = new UserInactiveError();
    expect(err.code).toBe("USER_INACTIVE");
    expect(err.message).toContain("desativado");
  });

  it("InsufficientPermissionError tem código FORBIDDEN", () => {
    const err = new InsufficientPermissionError();
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toContain("Acesso negado");
  });

  it("InsufficientPermissionError aceita módulo e ação", () => {
    const err = new InsufficientPermissionError("vendas", "write");
    expect(err.message).toContain("write em vendas");
  });

  it("InvalidRoleError tem código INVALID_ROLE", () => {
    const err = new InvalidRoleError("chefe");
    expect(err.code).toBe("INVALID_ROLE");
    expect(err.message).toContain("chefe");
  });
});
