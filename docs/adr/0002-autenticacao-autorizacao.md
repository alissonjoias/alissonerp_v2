# ADR 0002: Autenticação via Supabase Auth + Autorização RBAC + RLS

> **Status:** aceito
> **Data:** 2026-07-06
> **Autor:** Rafael Lucas (architecture)
> **Substitui:** nenhum
> **Substituído por:** nenhum

---

## Contexto

O sistema legado implementa autenticação via Supabase Auth (GoTrue), mas a autorização é inconsistente: não há middleware global, cada rota verifica auth manualmente, RLS cobre apenas 6% das tabelas, e as permissões são duplicadas em arrays hardcoded no Sidebar. Precisamos de um modelo de segurança em camadas, consistente e auditável.

---

## Decisão

**Autenticação 100% via Supabase Auth** (GoTrue com cookies server-side). **Autorização em duas camadas:** RLS no PostgreSQL (camada primária, obrigatória em TODAS as tabelas) + checagem explícita na camada de aplicação para regras de processo (ex: "gerente pode aprovar desconto acima de X%").

---

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que foi descartada |
|-------------|------|---------|------------------------|
| JWT próprio + middleware custom | Controle total | Reimplementa o que o Supabase já faz bem, manutenção extra | Custo de manutenção desnecessário |
| Apenas RLS, sem checagem na aplicação | Simples, segurança no banco | Não cobre regras de processo (ex: segregação de função, limites de aprovação) | Insuficiente para regras de negócio complexas |
| Auth + RLS + app-level checks | Defesa em profundidade | Duas camadas para manter sincronizadas | **Escolhida** — custo aceitável pelo ganho de segurança |

---

## Consequências

### Positivas
- Segurança em profundidade — bypassar uma camada não compromete o sistema
- RLS garante que mesmo queries diretas (ex: Supabase client no browser) respeitem permissões
- Papéis em `app_metadata` (imutável pelo client) — usuário não pode escalar privilégios
- Middleware global impede que rotas sem auth sejam criadas por acidente

### Negativas
- Duas camadas para manter — RLS policies e application checks precisam ser consistentes
- Service role key precisa de cuidado extra (bypassa RLS — uso restrito e justificado)

---

## Implementação

- Autenticação: Supabase Auth SSR (`@supabase/ssr`), cookies HttpOnly
- Papéis: `app_metadata.role` — imutável pelo client, definido apenas pelo admin
- RLS: toda migration inclui políticas RLS para SELECT, INSERT, UPDATE, DELETE por papel
- Application: `requireAuth()` + `requireRole()` + `requirePermission()` em toda Server Action
- Middleware global (`middleware.ts`) redireciona para `/login` se não autenticado
- Service role key: apenas em código servidor, com checagem manual de permissão, justificada no `design.md`

---

## Violações conhecidas

Nenhuma no momento da criação.
