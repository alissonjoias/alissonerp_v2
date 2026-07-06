"use server";

import { z } from "zod";

import { apiClient } from "@/lib/supabase/api-client";

const schema = z.object({
  email: z.string().email({ message: "Informe um email válido." }),
});

export type ForgotPasswordResult = { error?: { code: string; message: string } };

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const parsed = schema.safeParse({ email });
  if (!parsed.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  const res = await apiClient("/auth/v1/recover", {
    method: "POST",
    body: { email: parsed.data.email },
  });

  if (!res.ok) {
    return {
      error: {
        code: "RECOVER_FAILED",
        message: "Erro ao enviar email de recuperação. Tente novamente mais tarde.",
      },
    };
  }

  return {};
}
