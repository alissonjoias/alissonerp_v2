import Link from "next/link";

import { APP_CONFIG } from "@/config/app-config";
import { ForgotPasswordForm } from "../../_components/forgot-password-form";

export default function ForgotPasswordV1() {
  return (
    <div className="flex h-dvh">
      <div className="hidden bg-primary lg:flex lg:w-1/3 lg:flex-col lg:items-center lg:justify-center">
        <div className="space-y-6 p-12 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl font-light text-primary-foreground">{APP_CONFIG.name}</h1>
            <p className="text-xl text-primary-foreground/80">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-creme-100 p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="text-2xl font-semibold tracking-tight">Recuperar senha</div>
            <div className="mx-auto max-w-xl text-muted-foreground">
              Informe seu email cadastrado e enviaremos um link para redefinir sua senha.
            </div>
          </div>
          <ForgotPasswordForm />
          <div className="text-center text-sm">
            <Link prefetch={false} href="/auth/v1/login" className="text-muted-foreground underline underline-offset-4 hover:text-primary">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
