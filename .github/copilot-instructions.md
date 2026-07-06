# Copilot Instructions — ERP Alisson Joias v2

> **Carregado automaticamente pelo GitHub Copilot.**

## Stack
Next.js 16 (App Router) + TypeScript strict + TailwindCSS v4 + shadcn/ui. Banco Supabase self-hosted, schema `alissonerp` (246 tabelas — NUNCA criar tabela nova).

## Regras por tipo de arquivo

### Componentes (`.tsx`)
- Máximo 300 linhas — quebre em subcomponentes se passar
- Use APENAS componentes de `@/components/ui/` (catálogo em `agents/ui-spec.md`)
- Server Component busca dados, Client Component (`"use client"`) exibe
- Trate loading (Spinner/Skeleton), vazio (Empty), erro (toast sonner)

### Formulários (`.tsx`)
- SEMPRE: `react-hook-form` + `zod` + `@hookform/resolvers`
- SEMPRE: `Controller` + `Field` + `FieldLabel` + `FieldError`
- SEMPRE: `toast()` para sucesso/erro, nunca `alert()`

### Server Actions (`action.ts`)
- SEMPRE `"use server"` no topo
- SEMPRE validar com `z.safeParse()` antes da lógica
- SEMPRE retornar `{ data }` ou `{ error: { code, message } }`
- NUNCA `console.log` — use log estruturado

### Banco de dados
- SEMPRE `supabase.from("tabela")` — NUNCA SQL raw no frontend
- SEMPRE `db: { schema: "alissonerp" }` no cliente Supabase
- NUNCA criar migration nova sem `design.md` aprovado

## Proibições absolutas
- ❌ `any` em qualquer lugar
- ❌ `console.log` em produção
- ❌ CSS customizado (use Tailwind utilitário)
- ❌ Componente fora do catálogo `agents/ui-spec.md`
- ❌ Funcionalidade sem spec.md aprovado
