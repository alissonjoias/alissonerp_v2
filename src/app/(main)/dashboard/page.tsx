import { APP_CONFIG } from "@/config/app-config";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-xl text-muted-foreground">
          Bem-vindo ao novo sistema
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm text-muted-foreground">
          Sistema em construção — os módulos serão entregues conforme o cronograma.
        </p>
      </div>
    </div>
  );
}
