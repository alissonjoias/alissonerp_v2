import Link from "next/link";

import { APP_CONFIG } from "@/config/app-config";
import { ForgotPasswordForm } from "../../_components/forgot-password-form";

export default function ForgotPasswordV2() {
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Recuperar senha</h1>
          <p className="text-muted-foreground text-sm">
            Informe seu email cadastrado e enviaremos um link para redefinir sua senha.
          </p>
        </div>
        <div className="space-y-4">
          <ForgotPasswordForm />
          <div className="text-center text-sm">
            <Link prefetch={false} href="/auth/v2/login" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-center px-10">
        <div className="text-sm text-muted-foreground">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
