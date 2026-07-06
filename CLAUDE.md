# CLAUDE.md — ERP Alisson Joias v2

> **Carregado automaticamente pelo Claude Code.**
> As regras completas estão em `AGENTS.md` — este arquivo contém o resumo injetado em toda sessão.

## Stack
Next.js 16 (App Router) + TypeScript strict + TailwindCSS v4 + shadcn/ui (60 componentes)
Banco: Supabase self-hosted, schema `alissonerp` (NUNCA criar tabela nova)

## Regras absolutas
1. NUNCA `any` — código 100% tipado
2. NUNCA componente > 300 linhas
3. NUNCA criar tabela/migration (banco já existe com 246 tabelas)
4. NUNCA implementar funcionalidade sem spec aprovada em `specs/changes/`
5. NUNCA usar componente fora do catálogo `agents/ui-spec.md`
6. SEMPRE react-hook-form + Zod + Field/FieldLabel/FieldError em formulários
7. SEMPRE tratar estados: loading (Spinner), vazio (Empty), erro (toast)
8. SEMPRE Server Action com validação Zod antes do caso de uso
9. SEMPRE cobertura de testes ≥ 80%
10. SEMPRE `schema: "alissonerp"` no cliente Supabase

## Antes de implementar
- Leia `specs/changes/NNN-slug/spec.md` e `design.md`
- Leia `agents/ui-spec.md` — catálogo de componentes
- Consulte `docs/extraction/` para regras de negócio do legado

## Documentação essencial
- `AGENTS.md` — guia completo (leia primeiro)
- `BLUEPRINT.md` — arquitetura e pipeline
- `docs/tarefas-reformulacao.md` — 24 tarefas com datas
- `.cursorrules` — regras para Cursor/Cline/Windsurf
