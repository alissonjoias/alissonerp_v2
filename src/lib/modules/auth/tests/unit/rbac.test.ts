import { describe, it, expect } from "vitest";

const VALID_ROLES = [
  "desenvolvedor", "admin", "gerente_fabrica", "gerente_loja",
  "consultora", "estoquista_fabrica", "estoquista_loja",
  "ourives", "motoboy", "entregador", "pcp",
] as const;

type Role = (typeof VALID_ROLES)[number];

function temAcessoModulo(role: Role, modulo: string): boolean {
  const permissoes: Record<Role, string[]> = {
    desenvolvedor: ["*"],
    admin: ["*"],
    gerente_fabrica: ["producao", "ordens", "estoque"],
    gerente_loja: ["vendas", "crediario", "orcamentos", "financeiro", "estoque"],
    consultora: ["vendas", "orcamentos", "crediario", "ordens"],
    estoquista_fabrica: ["estoque", "ordens"],
    estoquista_loja: ["estoque"],
    ourives: ["ordens"],
    motoboy: ["protocolo"],
    entregador: ["entregas"],
    pcp: ["producao"],
  };
  return permissoes[role]?.includes("*") || permissoes[role]?.includes(modulo);
}

describe("RBAC — Controle de acesso", () => {
  describe("temAcessoModulo", () => {
    it("admin e desenvolvedor têm acesso a qualquer módulo", () => {
      expect(temAcessoModulo("admin", "vendas")).toBe(true);
      expect(temAcessoModulo("admin", "financeiro")).toBe(true);
      expect(temAcessoModulo("desenvolvedor", "vendas")).toBe(true);
      expect(temAcessoModulo("desenvolvedor", "financeiro")).toBe(true);
    });

    it("gerente_loja acessa vendas, crediário e financeiro", () => {
      expect(temAcessoModulo("gerente_loja", "vendas")).toBe(true);
      expect(temAcessoModulo("gerente_loja", "crediario")).toBe(true);
      expect(temAcessoModulo("gerente_loja", "financeiro")).toBe(true);
    });

    it("gerente_loja NÃO acessa produção", () => {
      expect(temAcessoModulo("gerente_loja", "producao")).toBe(false);
    });

    it("consultora acessa vendas e orçamentos", () => {
      expect(temAcessoModulo("consultora", "vendas")).toBe(true);
      expect(temAcessoModulo("consultora", "orcamentos")).toBe(true);
    });

    it("consultora NÃO acessa financeiro", () => {
      expect(temAcessoModulo("consultora", "financeiro")).toBe(false);
    });

    it("ourives só acessa ordens", () => {
      expect(temAcessoModulo("ourives", "ordens")).toBe(true);
      expect(temAcessoModulo("ourives", "vendas")).toBe(false);
      expect(temAcessoModulo("ourives", "financeiro")).toBe(false);
    });

    it("motoboy só acessa protocolo", () => {
      expect(temAcessoModulo("motoboy", "protocolo")).toBe(true);
      expect(temAcessoModulo("motoboy", "vendas")).toBe(false);
    });
  });
});
