# AGENTS.md — ERP Alisson Joias v2

> **Leia antes de qualquer ação.** Este documento é o guia de entrada para Rafael, Jonathan e qualquer IA que trabalhar neste projeto.

---

## Stack e ferramentas

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | TailwindCSS v4 + shadcn/ui (60+ componentes) |
| Banco | Supabase — schema `alissonerp` (246 tabelas, 364 migrations) |
| Auth | Supabase Auth (GoTrue SSR) |
| Forms | react-hook-form + Zod v4 |
| Estado | Zustand (preferências) |
| Testes | Vitest + @testing-library/react — 80% cobertura mínima |
| Deploy | Vercel (homologação) |
| Lint | Biome |

---

## Regras de ouro (não negociáveis)

1. **Nunca use `any`.** Todo código é estritamente tipado.
2. **Nenhum componente passa de 300 linhas.** Se passou, quebre em subcomponentes.
3. **SQL nunca vai pro frontend.** Migrations em `supabase/migrations/`, código usa Supabase client (HTTP).
4. **Nunca `console.log` em produção.** Use log estruturado JSON.
5. **Valores monetários em centavos (inteiro).** Nunca ponto flutuante.
6. **Toda Server Action valida input com Zod** antes do caso de uso.
7. **Nenhum segredo versionado.** Apenas em `.env.local`.
8. **Nenhuma decisão estrutural nasce no código.** Toda mudança passa por: spec → design → implementação → revisão → merge.
9. **Cobertura de testes ≥ 80%.** Teste cobre lógica de negócio (entities, value objects, errors), Server Actions e componentes com estado. Componente puramente visual (wrapper, layout) não precisa de teste isolado — a cobertura de integração já pega.
10. **Toda tela/componente segue `agents/ui-spec.md`.** Desvio do padrão = rejeitado no code review.
11. **Nenhuma funcionalidade sem spec aprovada.** Se não está na spec, não vai pro código. Anti-scope-creep: ver `agents/scope-guard.md`.

---

## Como começar (Jonathan)

```bash
git clone <repo-url>
cd erp-alisson-v2
npm install
cp .env.example .env.local   # preencher com credenciais do Supabase
npm run dev                    # http://localhost:3000
```

**Primeira tarefa:** abrir `docs/tarefas-reformulacao.md` — as tarefas 001 a 024 estão organizadas por ordem de execução com datas de entrega.

**Antes de cada tarefa:** verificar se existe extração em `docs/extraction/`. A extração de regras do legado é feita pelo Rafael (único com acesso ao código legado). Você (Jonathan) lê o relatório de extração pronto.

**Fluxo de trabalho:**
```
Rafael                          Jonathan
  │                                │
  ├─ Extrai regras do legado      │
  ├─ Gera spec + design           │
  ├─ Commita tudo                  │
  │                                │
  │ "Tarefa pronta pra             │
  │  implementar" ────────────────►│
  │                                ├─ Lê extraction + spec + design
  │                                ├─ Implementa (ui-spec.md)
  │                                ├─ Roda testes ≥ 80%
  │                                └─ Commita
```

---

## Estrutura do projeto

```
erp-alisson-v2/
├── AGENTS.md              ← você está aqui
├── BLUEPRINT.md           ← arquitetura completa
│
├── agents/                ← 9 agentes de IA (cada um tem um papel específico)
│   ├── ui-spec.md         ← 📌 PADRÃO DE UI — leia antes de criar qualquer tela
│   ├── architecture.md    ← design técnico
│   ├── business-analyst.md← spec de negócio
│   ├── code-review.md     ← revisão de código
│   ├── security.md        ← revisão de segurança
│   ├── testing.md         ← revisão de testes
│   ├── architecture-auditor.md
│   ├── legacy-rules-extractor.md
│   └── business-rules.md  ← regras de negócio consolidadas
│
├── docs/
│   ├── adr/               ← decisões de arquitetura (5 ADRs)
│   ├── security/          ← checklist de segurança
│   ├── extraction/        ← regras extraídas do legado
│   └── tarefas-reformulacao.md  ← 24 tarefas com datas
│
├── specs/
│   ├── shared/            ← convenções e como rodar
│   └── changes/           ← mudanças em andamento (001-auth, etc.)
│
├── src/
│   ├── app/               ← páginas e layouts
│   │   ├── (main)/auth/   ← login/registro
│   │   └── (main)/dashboard/  ← painel principal
│   ├── components/ui/     ← 60 componentes shadcn/ui
│   ├── lib/
│   │   ├── modules/auth/  ← módulo de autenticação
│   │   └── supabase/      ← client/server/admin
│   ├── navigation/        ← itens do menu lateral
│   ├── hooks/             ← hooks reutilizáveis
│   ├── config/            ← configuração do app
│   └── middleware.ts      ← proteção de rotas
│
├── supabase/
│   ├── migrations/        ← SQL versionado
│   └── config.toml
│
└── tests/
    └── e2e/               ← testes ponta a ponta
```

---

## Como criar uma tela nova (passo a passo)

### 1. Consulte o agente de UI
Leia `agents/ui-spec.md` — ele define exatamente quais componentes usar, como estruturar pastas, qual padrão de formulário e tabela.

### 2. Siga a estrutura de pastas
```
src/app/(main)/dashboard/<modulo>/
  ├── page.tsx              ← server component (busca dados)
  └── _components/          ← client components (exibe e interage)
      ├── <modulo>-table.tsx
      ├── <modulo>-form.tsx
      └── <modulo>-dialog.tsx
```

### 3. Use os componentes certos

| Para | Use |
|------|-----|
| Tabela com dados | `@/components/ui/table` + tanstack Table |
| Formulário | `react-hook-form` + `zod` + `@/components/ui/field` |
| Modal | `@/components/ui/dialog` |
| Notificação | `toast()` do sonner |
| Badge de status | `@/components/ui/badge` |
| Loading | `@/components/ui/spinner` ou `@/components/ui/skeleton` |
| Botão | `@/components/ui/button` |
| Input | `@/components/ui/input` |
| Layout | `@/components/ui/card` |

### 4. Server Component busca, Client Component exibe
```typescript
// page.tsx — Server Component
import { buscarDados } from "./actions";
import { Tabela } from "./_components/tabela";

export default async function Page() {
  const dados = await buscarDados();
  return <Tabela data={dados} />;
}
```

### 5. Toda Server Action valida com Zod
```typescript
"use server";
import { z } from "zod";

const schema = z.object({ nome: z.string().min(1) });

export async function minhaAction(data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } };
  }
  // ... lógica de negócio
  return { data: resultado };
}
```
### 6. Teste junto com o código (obrigatório)

```
src/lib/modules/<modulo>/
  actions/minha-action.ts          ← implementação
  tests/unit/minha-action.test.ts  ← teste NASCE JUNTO
```

A IA gera o teste na mesma resposta que o código. Exemplo mínimo:

```typescript
import { describe, it, expect } from "vitest";
import { minhaAction } from "../actions/minha-action";

describe("minhaAction", () => {
  it("deve retornar erro para input inválido", async () => {
    const result = await minhaAction({ nome: "" });
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("deve processar input válido", async () => {
    const result = await minhaAction({ nome: "Teste" });
    expect(result.data).toBeDefined();
  });
});
```

---

## Como usar os agentes de IA

Cada agente tem um papel. Você (Rafael) orquestra:

| Quando precisar de... | Chame o agente |
|-----------------------|---------------|
| Traduzir requisito do Alisson em spec | `business-analyst` |
| Desenhar a solução técnica (tabelas, ações) | `architecture` |
| Revisar segurança de uma implementação | `security` |
| Verificar cobertura de testes | `testing` |
| Revisar qualidade do código | `code-review` |
| Garantir padrão visual da tela | `ui-spec` |
| Extrair regras do sistema legado | `legacy-rules-extractor` |
| Bloquear funcionalidade fora do escopo (scope creep) | `scope-guard` |

**Fluxo completo para cada mudança:**
```
1. SKILL.md → carrega o checklist de desenvolvimento
2. spec → design → implementação → revisão (security + testing + code-review)
3. scope-guard → verifica se nada foi implementado fora da spec
4. merge
```

---

## Política de testes (obrigatório)

### Cobertura mínima
| Métrica | Mínimo | Consequência se falhar |
|---------|--------|----------------------|
| Linhas | **80%** | ❌ Código rejeitado — refazer |
| Funções | **80%** | ❌ Código rejeitado — refazer |
| Branches | **70%** | ❌ Código rejeitado — refazer |
| Statements | **80%** | ❌ Código rejeitado — refazer |

### O que testar

| Camada | Testar? | Motivo |
|--------|---------|--------|
| `domain/` entities, errors, value objects | ✅ **Sempre** | Contém regras de negócio puras |
| `actions/` Server Actions | ✅ **Sempre** | Validam input e orquestram casos de uso |
| `infrastructure/` repositories | ✅ **Sempre** | Integração com banco (com mock) |
| Componentes com estado (form, table, dialog) | ✅ **Sempre** | Interatividade, validação, fluxos |
| Componentes puramente visuais (wrapper, layout) | ⚠️ Opcional | Já coberto por testes de integração |
| Hooks customizados | ✅ Se têm lógica | `useVenda()` sim, `useMobile()` não |

### Como rodar
```bash
npm run test           # roda todos os testes
npm run test:coverage  # roda com relatório de cobertura
npm run test:watch     # modo watch (desenvolvimento)
```

### Estrutura de pastas de teste
```
src/lib/modules/<modulo>/tests/
├── unit/           ← regras de negócio, entidades, value objects
└── integration/    ← Server Actions, repositórios
```

### Exemplo mínimo por módulo
```typescript
import { describe, it, expect } from "vitest";

describe("NomeDoModulo", () => {
  it("deve validar regra X", () => {
    expect(funcao()).toBe(esperado);
  });

  it("deve rejeitar entrada inválida", () => {
    expect(() => funcao(invalido)).toThrow();
  });
});
```

---

## Padrão de componentes (obrigatório)

Toda nova tela ou componente **deve** seguir `agents/ui-spec.md`. Se desviar:

| Violação | Consequência |
|----------|-------------|
| Usou componente que não existe no catálogo | ❌ Rejeitado — use `@/components/ui/*` |
| Criou CSS customizado em vez de Tailwind | ❌ Rejeitado — use classes utilitárias |
| Arquivo > 300 linhas | ❌ Rejeitado — quebre em subcomponentes |
| Nome fora da convenção (kebab-case/PascalCase) | ❌ Rejeitado — renomeie |
| Formulário sem react-hook-form + Zod | ❌ Rejeitado — refaça |

---

## Deploy

### Ambientes
| Ambiente | Supabase | Branch | URL |
|----------|----------|--------|-----|
| **dev** | local (.env.local) | `main` (local) | `http://localhost:3000` |
| **homolog** | banco de homologação do legado | `main` (Vercel preview) | Configurar no Vercel |
| **produção** | banco de produção do legado | `main` (Vercel production) | Futuro |

### Como criar o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório `erp-alisson-v2`
3. Framework: **Next.js** (detectado automaticamente)
4. Configure as variáveis de ambiente (copie de `.env.homolog`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (opcional, só para scripts)
5. Deploy

**Importante:** crie um projeto NOVO no Vercel, separado do `alisson-joias-entregas`. Não reutilize o mesmo projeto — são sistemas diferentes.

### Homologação aponta para o banco de homologação
O `.env.homolog` deve conter as credenciais do banco de **homologação** do sistema legado. Isso permite testar com dados reais (não produção) antes de liberar.

---

## Documentação complementar

- `BLUEPRINT.md` — arquitetura completa, decisões, pipeline
- `.opencode/skills/SKILL.md` — checklist de desenvolvimento (anti-scope-creep, gates)
- `agents/scope-guard.md` — bloqueia funcionalidades sem spec
- `agents/ui-spec.md` — catálogo de componentes e padrões de tela
- `agents/business-rules.md` — regras de negócio consolidadas
- `docs/adr/` — decisões de arquitetura registradas
- `docs/security/security-baseline.md` — checklist de 30 itens
- `docs/tarefas-reformulacao.md` — 24 tarefas com datas de entrega
- `docs/extraction/PENDENTES.md` — extrações do legado que o Rafael precisa fazer
- `specs/shared/convencoes-de-nomenclatura.md` — como nomear tudo
- `specs/shared/como-executar.md` — setup local
- `.env.homolog` — variáveis de ambiente para homologação (Vercel)
- `vercel.json` — configuração de deploy
- `vitest.config.ts` — configuração de testes com thresholds de cobertura
