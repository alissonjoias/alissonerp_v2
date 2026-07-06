# Alisson ERP v2 — Sistema de Gestão

> **Reformulação completa do ERP da Alisson Joias.**  
> Frontend moderno (Next.js 16 + shadcn/ui) + mesmo banco de 10 anos.

---

## 🎯 Por que este projeto existe

O ERP atual tem 245 mil linhas de código construídas em 4 meses por IA sem supervisão técnica. O resultado: bugs recorrentes, telas que travam, regras duplicadas em 6 lugares diferentes, e uma equipe que culpa o sistema diariamente.

Este é o rebuild. **Mesmo banco. Novo frontend. Arquitetura profissional.**

---

## ⚡ Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | TailwindCSS v4 + shadcn/ui (60 componentes) |
| Banco | PostgreSQL (Supabase self-hosted) — schema `alissonerp` |
| Auth | Supabase Auth (GoTrue SSR) |
| Forms | react-hook-form + Zod v4 |
| Testes | Vitest — 80% de cobertura mínima |
| Deploy | Vercel |

---

## 🚀 Quick Start

```bash
git clone https://github.com/alisson-joias/erp-alisson-v2.git
cd erp-alisson-v2
npm install --legacy-peer-deps
cp .env.homolog .env.local
npm run dev
```

Abra `http://localhost:3000` — será redirecionado para `/auth/v1/login`.

---

## 📁 Estrutura

```
erp-alisson-v2/
├── AGENTS.md              ← 📌 Guia completo para devs e IA (comece aqui)
├── BLUEPRINT.md           ← Arquitetura, pipeline, decisões
│
├── agents/                ← 10 agentes de IA especializados
├── docs/
│   ├── adr/               ← Decisões de arquitetura (5 ADRs)
│   ├── security/          ← Checklist de segurança (30 itens)
│   ├── extraction/        ← Regras extraídas do sistema legado
│   └── tarefas-reformulacao.md  ← 24 tarefas com datas de entrega
│
├── src/
│   ├── app/               ← Páginas e layouts (App Router)
│   │   ├── (main)/auth/   ← Login (/auth/v1/login)
│   │   └── (main)/dashboard/  ← Painel principal
│   ├── components/ui/     ← 60 componentes shadcn/ui
│   ├── lib/
│   │   ├── modules/       ← Módulos de negócio (auth, vendas, estoque...)
│   │   └── supabase/      ← Cliente Supabase (server, browser, admin)
│   └── middleware.ts      ← Proteção global de rotas
│
├── supabase/migrations/   ← SQL versionado
├── specs/                 ← Pipeline de mudanças (spec → design → review)
└── tests/                 ← Testes unitários, integração e e2e
```

---

## 👥 Time e Responsabilidades

| Quem | Papel | Faz o quê |
|------|-------|-----------|
| **Rafael Lucas** | Lead Developer & Architect | Extração de regras do legado, specs, designs, aprovações, deploy |
| **Jonathan** | Full Stack Developer | Implementação das tarefas seguindo spec + design + ui-spec |
| **IA (agentes)** | Automatizadores | Business analysis, architecture, security review, code review |

---

## 🔄 Fluxo de Desenvolvimento

### Pipeline (toda mudança segue este fluxo)

```
1. Extração do legado    → Rafael + legacy-rules-extractor
2. Spec de negócio       → Rafael + business-analyst → APROVAÇÃO
3. Design técnico        → Rafael + architecture → APROVAÇÃO
4. Implementação         → Jonathan (seguindo spec + design + ui-spec)
5. Revisões              → IA: security + testing + code-review
6. Scope Guard           → IA: scope-guard (bloqueia funcionalidade sem spec)
7. Merge                 → APROVAÇÃO FINAL
```

### Cronograma Geral

| Bloco | Período | Status |
|-------|---------|--------|
| Fundação (auth, login, layout) | 07/07 – 13/07 | ✅ Concluído |
| Comercial (produtos, PDV, financeiro) | 14/07 – 26/07 | ⏳ Início 14/07 |
| Fábrica (ordens, PCP, protocolo) | 27/07 – 20/08 | ⏳ Início 27/07 |

---

## 📋 Começando uma Tarefa (Jonathan)

1. Abra `docs/tarefas-reformulacao.md` — veja a próxima tarefa ⬜
2. Verifique se a extração do legado existe em `docs/extraction/`
3. Leia `spec.md` e `design.md` em `specs/changes/NNN-<modulo>/`
4. Leia **`agents/ui-spec.md`** — catálogo de 60 componentes com código
5. Implemente com **≤ 300 linhas por arquivo**, react-hook-form + Zod, validação em toda Server Action
6. Rode `npm run test:coverage` — deve bater **≥ 80%**
7. Commite

---

## 🛡️ Regras de Qualidade (não negociáveis)

| Regra | Consequência se violada |
|-------|------------------------|
| `any` proibido | ❌ Code review rejeita |
| Componente > 300 linhas | ❌ Code review rejeita |
| Cobertura < 80% | ❌ Merge bloqueado |
| Funcionalidade sem spec aprovada | ❌ scope-guard bloqueia |
| Componente fora do catálogo ui-spec | ❌ Code review rejeita |
| Formulário sem react-hook-form + Zod | ❌ Code review rejeita |
| SQL no frontend | ❌ Security review rejeita |

---

## 📚 Documentação Essencial

| Documento | Quando ler |
|-----------|-----------|
| `AGENTS.md` | Antes de qualquer ação — leia primeiro |
| `agents/ui-spec.md` | Antes de criar qualquer tela ou componente |
| `agents/scope-guard.md` | Antes de implementar — previne scope creep |
| `.opencode/skills/SKILL.md` | Checklist de desenvolvimento (4 fases) |
| `docs/tarefas-reformulacao.md` | Planejamento — 24 tarefas com datas |
| `docs/extraction/PENDENTES.md` | Extrações que o Rafael precisa fazer |
| `docs/security/security-baseline.md` | Checklist de 30 itens de segurança |
| `specs/shared/convencoes-de-nomenclatura.md` | Como nomear arquivos, funções, tabelas |

---

## 🔗 Integrações

| Sistema | Status |
|---------|--------|
| Supabase (self-hosted) | ✅ Conectado — schema `alissonerp` |
| Mercado Pago | ⏳ Tarefa 014 |
| PagBank | ⏳ Tarefa 014 |
| Tiny ERP | ⏳ Futuro |
| WhatsApp | ⏳ Futuro |

---

## 📄 Licença

Proprietário — Alisson Joias. Uso interno.
