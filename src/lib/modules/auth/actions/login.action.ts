"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserInactiveError } from "../domain/errors";
import { createUserRepository, createAuthService } from "../infrastructure/repositories/supabase-user.repository";

export type ApiResponse<T> = { data?: T; error?: { code: string; message: string } };

export async function login(email: string, password: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    return {
      error: {
        code: "INVALID_CREDENTIALS",
        message: authError.message === "Invalid login credentials"
          ? "Email ou senha inválidos."
          : authError.message,
      },
    };
  }

  // Verificar se usuário está ativo
  try {
    const repo = createUserRepository();
    const authService = createAuthService(repo);
    await authService.getCurrentUser();
  } catch (err) {
    // Se inativo, faz logout e retorna erro
    await supabase.auth.signOut();
    if (err instanceof UserInactiveError) {
      return { error: { code: "USER_INACTIVE", message: err.message } };
    }
    await supabase.auth.signOut();
    return { error: { code: "USER_NOT_FOUND", message: "Usuário não encontrado no sistema." } };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/v1/login");
}

export async function getCurrentUser() {
  const repo = createUserRepository();
  const authService = createAuthService(repo);
  return authService.getCurrentUser();
}
