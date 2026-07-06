"use server";

import { redirect } from "next/navigation";

import { apiClient } from "@/lib/supabase/api-client";
import { clearSessionCookies, getSessionCookies, setSessionCookies } from "@/lib/supabase/session";
import { UserNotFoundError, UserInactiveError } from "../domain/errors";
import type { User } from "../domain/entities";

export type ApiResponse<T> = { data?: T; error?: { code: string; message: string } };

async function fetchUserById(
  userId: string,
  token: string,
): Promise<User | null> {
  const res = await apiClient(`/rest/v1/usuarios?id=eq.${userId}&select=*`, {
    token,
    schema: "alissonerp_v2",
  });

  if (!res.ok) return null;

  const data = await res.json();
  const row = data?.[0];
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role: "consultora",
    ativo: row.ativo,
    vendedorId: row.vendedor_id ?? null,
    depositoId: row.deposito_id ?? null,
    maxDesconto: 0,
    criadoEm: new Date(row.created_at),
    atualizadoEm: new Date(row.updated_at),
  };
}

export async function login(email: string, password: string): Promise<ApiResponse<null>> {
  const res = await apiClient("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });

  if (!res.ok) {
    return {
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email ou senha inválidos.",
      },
    };
  }

  const auth = await res.json();
  await setSessionCookies(auth.access_token, auth.refresh_token);

  const user = await fetchUserById(auth.user.id, auth.access_token);

  if (!user) {
    await clearSessionCookies();
    return {
      error: {
        code: "USER_NOT_FOUND",
        message: "Usuário não encontrado no sistema.",
      },
    };
  }

  const roleFromAuth = (auth.user.user_metadata?.role) ?? user.role;
  user.role = roleFromAuth as User["role"];

  if (!user.ativo) {
    await clearSessionCookies();
    return { error: { code: "USER_INACTIVE", message: "Usuário desativado, procure o administrador." } };
  }

  return { data: null };
}

export async function logout(): Promise<void> {
  const { accessToken } = await getSessionCookies();
  if (accessToken) {
    await apiClient("/auth/v1/logout", { method: "POST", token: accessToken });
  }
  await clearSessionCookies();
  redirect("/auth/v1/login");
}

export async function getCurrentUser(): Promise<User> {
  const { accessToken } = await getSessionCookies();
  if (!accessToken) throw new UserNotFoundError();

  const userRes = await apiClient("/auth/v1/user", { token: accessToken });
  if (!userRes.ok) throw new UserNotFoundError();

  const authUser = (await userRes.json()) as {
    id: string;
    user_metadata?: { role?: string };
  };

  const user = await fetchUserById(authUser.id, accessToken);
  if (!user) throw new UserNotFoundError();
  if (!user.ativo) throw new UserInactiveError();

  const roleFromAuth = (authUser.user_metadata?.role) ?? user.role;
  user.role = roleFromAuth as User["role"];

  return user;
}
