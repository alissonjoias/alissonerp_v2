"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserRepository, createAuthService } from "../infrastructure/repositories/supabase-user.repository";
import { InsufficientPermissionError } from "../domain/errors";
import type { Role } from "../domain/entities";
import type { ApiResponse } from "./login.action";

const VALID_ROLES = [
  "desenvolvedor", "admin", "gerente_fabrica", "gerente_loja",
  "consultora", "estoquista_fabrica", "estoquista_loja",
  "ourives", "motoboy", "entregador", "pcp",
] as const;

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  role: z.enum(VALID_ROLES),
  vendedorId: z.number().optional(),
});

const updateUserSchema = z.object({
  nome: z.string().min(1).optional(),
  role: z.enum(VALID_ROLES).optional(),
  vendedorId: z.number().nullable().optional(),
  maxDesconto: z.number().min(0).max(100).optional(),
});

export async function createUser(data: z.infer<typeof createUserSchema>): Promise<ApiResponse<{ id: string; nome: string }>> {
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map(e => e.message).join(", ") } };
  }

  try {
    const repo = createUserRepository();
    const authService = createAuthService(repo);
    await authService.requireRole(["admin", "desenvolvedor"]);

    const user = await repo.create(parsed.data);
    revalidatePath("/dashboard/users");
    return { data: { id: user.id, nome: user.nome } };
  } catch (err) {
    if (err instanceof InsufficientPermissionError) {
      return { error: { code: "FORBIDDEN", message: "Apenas administradores podem criar usuários." } };
    }
    return { error: { code: "INTERNAL_ERROR", message: "Erro ao criar usuário." } };
  }
}

export async function updateUser(id: string, data: z.infer<typeof updateUserSchema>): Promise<ApiResponse<null>> {
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map(e => e.message).join(", ") } };
  }

  try {
    const repo = createUserRepository();
    const authService = createAuthService(repo);
    await authService.requireRole(["admin", "desenvolvedor"]);

    const current = await repo.findById(id);
    if (!current) return { error: { code: "NOT_FOUND", message: "Usuário não encontrado." } };

    const caller = await authService.getCurrentUser();
    if (caller.id === id && parsed.data.role && parsed.data.role !== current.role) {
      return { error: { code: "FORBIDDEN", message: "Você não pode alterar seu próprio cargo." } };
    }

    await repo.update(id, parsed.data);
    revalidatePath("/dashboard/users");
    return { data: null };
  } catch (err) {
    if (err instanceof InsufficientPermissionError) {
      return { error: { code: "FORBIDDEN", message: "Apenas administradores podem editar usuários." } };
    }
    return { error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar usuário." } };
  }
}

export async function toggleUserStatus(id: string): Promise<ApiResponse<{ ativo: boolean }>> {
  try {
    const repo = createUserRepository();
    const authService = createAuthService(repo);
    await authService.requireRole(["admin", "desenvolvedor"]);

    const user = await repo.findById(id);
    if (!user) return { error: { code: "NOT_FOUND", message: "Usuário não encontrado." } };

    const caller = await authService.getCurrentUser();
    if (caller.id === id) {
      return { error: { code: "FORBIDDEN", message: "Você não pode desativar a si mesmo." } };
    }

    if (user.ativo) {
      await repo.deactivate(id);
    } else {
      await repo.activate(id);
    }

    revalidatePath("/dashboard/users");
    return { data: { ativo: !user.ativo } };
  } catch (err) {
    if (err instanceof InsufficientPermissionError) {
      return { error: { code: "FORBIDDEN", message: "Apenas administradores podem alterar status de usuários." } };
    }
    return { error: { code: "INTERNAL_ERROR", message: "Erro ao alterar status." } };
  }
}
