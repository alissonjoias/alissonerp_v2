# AGENTS.md — ERP Alisson Joias v2

> **Contexto de entrada para qualquer IA que iniciar uma sessão neste repositório.**
> Leia este documento inteiro antes de qualquer ação.

---

## O que é este projeto

Reconstrução completa do ERP da Alisson Joias — sistema de gestão para loja de joias (~25 usuários, uma empresa). O sistema anterior foi construído sem direção técnica, acumulando bugs, falhas de segurança e código sem padrão.

**Stack:** Next.js 16 (App Router) + Supabase (Postgres + Auth) + TailwindCSS  
**Arquitetura:** Modular Monolith — um deploy, módulos isolados por domínio  
**Construção:** Guiada por IA com aprovação humana obrigatória em cada etapa

---

## Regras fundamentais

1. **Nenhuma decisão estrutural nasce dentro do código.** Toda mudança passa por: spec → design → implementação → revisões → merge.
2. **Não toque em tabelas de outro módulo diretamente.** Comunicação entre módulos é por interface exposta ou evento interno.
3. **Nunca use `any`.** Todo código é estritamente tipado.
4. **Nunca `console.log` em produção.** Use log estruturado (JSON).
5. **Valores monetários em centavos (inteiro).** Nunca use ponto flutuante para dinheiro.
6. **Toda Server Action/Route Handler valida input com Zod** antes de chegar ao caso de uso.
7. **Nenhum segredo é versionado.** Apenas em variáveis de ambiente do servidor.
8. **Migrations são versionadas e aplicadas via pipeline.** Nunca alteração manual no painel do Supabase em produção.

---

## Como trabalhar neste projeto

### Pipeline de mudanças

```
specs/changes/NNN-slug/
  → spec.md (business-analyst gera, humano aprova)
  → design.md (architecture gera, humano aprova)
  → implementação (dev implementa em lib/modules/<modulo>/)
  → security-review.md (security analisa)
  → test-review.md (testing analisa)
  → code-review.md (code-review analisa)
  → humano aprova os 3 relatórios
  → merge → arquiva em specs/archive/
```

Números sequenciais, nunca reaproveitados.

### Versionamento de API

- `app/api/v1/...` — versionamento explícito desde o início
- Formato padrão: `{ "data": {}, "meta": {} }` ou `{ "error": { "code": "...", "message": "..." } }`

### Estrutura de módulo

```
lib/modules/<modulo>/
  domain/         → entities, value-objects, errors (não importa nada externo)
  application/    → use-cases, ports/interfaces (importa domain, não infra)
  infrastructure/ → repositories, events (implementa ports)
  actions/        → Server Actions (autentica, chama use-case, retorna resposta)
  tests/          → unit + integration
```

### Branches e commits

- Branch principal: `main`
- Feature branches: `feature/NNN-slug`
- Commits seguem convenção do projeto

### Ambiente

- **dev:** desenvolvimento local
- **staging:** homologação (projeto Supabase próprio)
- **produção:** produção (projeto Supabase próprio)
- Nunca use o banco de produção para testes

---

## Documentação complementar

- `BLUEPRINT.md` — documento completo de arquitetura e decisões
- `agents/` — definição de cada agente do pipeline
- `docs/adr/` — decisões de arquitetura registradas
- `docs/security/security-baseline.md` — checklist de segurança
- `agents/business-rules.md` — regras de negócio (fonte da verdade)
- `specs/shared/como-executar.md` — como rodar o projeto localmente
- `specs/shared/convencoes-de-nomenclatura.md` — convenções de código
