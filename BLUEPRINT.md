# Blueprint do ERP — Documento Único de Arquitetura

> Este documento consolida todas as decisões de arquitetura, segurança e fluxo
> de trabalho do projeto. Serve como instrução completa para qualquer IA gerar
> a estrutura de pastas e arquivos inicial do repositório. Leia o documento
> inteiro antes de gerar qualquer arquivo — as seções se referenciam.

---

## 1. Contexto e decisões-chave (resumo executivo)

- Reconstrução completa de um ERP que foi construído sem direção técnica,
  acumulando falhas de arquitetura, segurança e regras de negócio.
- **Stack:** Next.js (App Router) + Supabase (Postgres + Auth).
- **Escala:** uso interno, uma única empresa (com ou sem filiais), ~25 usuários.
  Não é multi-tenant — não atende múltiplos clientes/empresas isolados.
- **Arquitetura de código:** modular monolith — um único deploy, módulos
  internos isolados por domínio de negócio, comunicação só por interface
  explícita ou evento interno.
- **Construção guiada por agentes de IA**, mas com aprovação humana obrigatória
  em cada transição de etapa (spec → design → implementação → revisão → merge).
  Nenhuma decisão estrutural nasce dentro do código sem passar por uma etapa
  documentada.

---

## 2. Estrutura completa de pastas (gerar exatamente assim)

```
/
├── AGENTS.md                          → contexto de entrada para qualquer IA
├── BLUEPRINT.md                       → este documento
│
├── agents/                            → definição de cada agente do pipeline
│   ├── business-analyst.md
│   ├── architecture.md
│   ├── security.md
│   ├── testing.md
│   ├── code-review.md
│   ├── architecture-auditor.md
│   ├── legacy-rules-extractor.md
│   └── business-rules.md              → regras de negócio consolidadas (fonte da verdade)
│
├── docs/
│   ├── adr/                           → decisões de arquitetura
│   │   ├── 0000-template.md
│   │   ├── 0001-modular-monolith.md
│   │   ├── 0002-autenticacao-autorizacao.md
│   │   ├── 0003-single-tenant-filiais.md
│   │   └── 0004-padroes-de-api.md
│   ├── security/
│   │   └── security-baseline.md       → checklist de segurança obrigatório
│   ├── extraction/                    → relatórios de extração de regras do legado
│   └── audits/                        → auditorias periódicas de deriva arquitetural
│
├── specs/
│   ├── shared/
│   │   ├── como-executar.md
│   │   └── convencoes-de-nomenclatura.md
│   ├── archive/                       → mudanças concluídas e mergeadas
│   └── changes/                       → mudanças em andamento ou planejadas
│       └── 001-exemplo-slug/
│           ├── status.md
│           ├── spec.md
│           ├── design.md
│           ├── security-review.md
│           ├── test-review.md
│           └── code-review.md
│
├── app/                                → Next.js App Router
│   ├── (rotas de página, layouts, componentes de UI)
│   └── api/
│       └── v1/...                      → Route Handlers (quando REST externo é necessário)
│
├── lib/
│   └── modules/                        → um módulo por domínio de negócio
│       └── <modulo>/
│           ├── domain/
│           │   ├── entities/
│           │   ├── value-objects/
│           │   └── errors/
│           ├── application/
│           │   ├── use-cases/
│           │   └── ports/
│           ├── infrastructure/
│           │   ├── repositories/       → implementa os ports usando o client Supabase
│           │   └── events/
│           ├── actions/                → Server Actions do módulo
│           └── tests/
│               ├── unit/
│               └── integration/
│
├── supabase/
│   ├── migrations/                     → uma migration por mudança de schema, com RLS junto
│   └── config.toml
│
└── tests/
    └── e2e/                            → testes ponta a ponta que cruzam módulos
```

---

## 3. Fluxo de trabalho (pipeline de agentes)

Toda mudança de sistema segue este fluxo, sem pular etapas:

1. Criar `specs/changes/NNN-slug/` com o próximo número sequencial disponível.
   Números nunca são reaproveitados nem reordenados.
2. **Etapa spec** — agente `business-analyst` gera `spec.md`. Humano aprova.
3. **Etapa design** — agente `architecture` gera `design.md` (e novo ADR em
   `docs/adr/`, se necessário). Humano aprova.
4. **Implementação** — segue exatamente o que foi decidido nas etapas 2 e 3,
   dentro de `lib/modules/<modulo>/`.
5. **Revisão paralela** — agentes `security`, `testing` e `code-review` geram
   seus relatórios na mesma pasta da mudança. Nenhum aprova o próprio trabalho.
6. **Merge** — só após aprovação humana dos três relatórios.
7. Mover a pasta de `specs/changes/` para `specs/archive/`. Se a mudança
   introduziu ou alterou regra de negócio, atualizar `agents/business-rules.md`.

`status.md` de cada mudança rastreia a etapa atual:
```markdown
# Status: NNN-slug
**Etapa atual:** spec | design | implementacao | revisao | pronto_para_merge | mergeado
**Bloqueado por:** (vazio, ou descrição do que falta)
## Histórico
- AAAA-MM-DD — spec gerada (business-analyst)
- AAAA-MM-DD — spec aprovada por <humano>
```

**Extraindo regras do sistema legado:** antes da primeira mudança de um módulo
que já existe no sistema antigo, rodar `agents/legacy-rules-extractor.md` sobre
o código legado daquele módulo, dividido por domínio (nunca o projeto legado
inteiro de uma vez). Resultado alimenta a primeira `spec.md` do módulo.

---

## 4. Arquitetura técnica

### Camadas e regra de dependência
`domain` não importa nada de `application` ou `infrastructure`. `application`
não importa `infrastructure` diretamente — só através de `ports` (interfaces).
Rotas (`app/`) e Server Actions são "infraestrutura de entrada": autenticam,
chamam o caso de uso, devolvem resposta no formato padrão — nunca contêm regra
de negócio diretamente.

### Comunicação entre módulos
Nunca acesso direto a tabela ou repositório interno de outro módulo. Sempre via
interface exposta (`ports` públicos) ou evento interno.

### Dados
- Um projeto Supabase por ambiente (dev/staging/produção).
- Migrations versionadas no repositório, aplicadas via pipeline — nunca
  alteração manual no painel do Supabase em produção.
- Toda entidade financeira é imutável após confirmação; correção gera novo
  registro de estorno.
- Valores monetários em inteiro (centavos), nunca ponto flutuante.

### API
- Route Handlers seguem padrão único de resposta/erro:
```json
{ "data": {}, "meta": {} }
{ "error": { "code": "REGRA_NEGOCIO_VIOLADA", "message": "...", "details": {} } }
```
- Versionamento explícito desde o início (`/v1/...`).

### Observabilidade
- Logs estruturados (JSON), nunca `console.log` solto em produção.
- Toda operação crítica (pagamento, aprovação, integração externa) gera métrica
  própria.
- Erros não tratados capturados centralmente, nunca só exibidos ao usuário.

### Deploy
- Três ambientes (dev/staging/produção), cada um com projeto Supabase próprio.
- CI roda testes, lint e verificação de dependências antes de qualquer merge.

---

## 5. Segurança (checklist obrigatório — ver `docs/security/security-baseline.md`)

**Autenticação e autorização**
- Autenticação 100% via Supabase Auth; nenhum módulo reimplementa login.
- Papel do usuário em `app_metadata` (imutável pelo client), nunca em
  `user_metadata`.
- Autorização em duas camadas: RLS no Postgres (primária) + checagem explícita
  na camada `application` para regras de processo (ex: segregação de função).
- Client padrão respeita RLS. Service role key (bypassa RLS) só em código de
  servidor específico, nunca no client, sempre com checagem manual de permissão
  e justificativa explícita no `design.md` da feature.

**Dados sensíveis**
- Segredos apenas em variáveis de ambiente do servidor, nunca versionados nem
  expostos ao client.
- Dados financeiros/pessoais sensíveis criptografados em repouso quando exigido.
- HTTPS/TLS em toda comunicação.

**Auditoria**
- Toda ação sobre dado financeiro ou configuração crítica gera registro de
  auditoria (quem, quando, o quê, valor anterior/novo).
- Tabela de auditoria é append-only via política de RLS (sem `UPDATE`/`DELETE`).

**Escopo por filial (não multi-tenant)**
- Sistema é single-tenant (uma empresa). Se houver filiais, tabelas relevantes
  têm `filial_id` + RLS/permissão restringindo acesso pela filial do usuário —
  não é isolamento multi-tenant completo, é segregação organizacional interna.

**Validação de entrada**
- Toda Server Action e Route Handler valida input contra schema explícito (ex:
  Zod) antes de chegar ao caso de uso.

**Dependências**
- Dependências novas verificadas contra vulnerabilidades conhecidas antes de
  entrar no projeto; CI falha se houver vulnerabilidade crítica sem correção.

---

## 6. Decisões de arquitetura já tomadas (ADRs)

| ADR | Decisão |
|---|---|
| 0001 | Modular monolith como base arquitetural — módulos isolados por domínio, um único deploy |
| 0002 | Autenticação via Supabase Auth; autorização por RBAC + RLS em duas camadas |
| 0003 | Sistema single-tenant (uma empresa); filiais tratadas por `filial_id` + RBAC, não isolamento multi-tenant |
| 0004 | Padrão único de resposta/erro e versionamento de API (`/v1/...`) |

Cada ADR completo, com contexto e alternativas consideradas, deve ser gerado em
`docs/adr/000N-titulo.md` seguindo o template em `docs/adr/0000-template.md`.

---

## 7. Agentes do pipeline (papel resumido)

| Agente | Papel | Não faz |
|---|---|---|
| `business-analyst` | Traduz requisito em spec de negócio estruturada | Não decide arquitetura nem escreve código |
| `architecture` | Gera design técnico e ADRs a partir da spec aprovada | Não implementa nem decide regra de negócio |
| `security` | Revisa segurança contra o checklist de `security-baseline.md` | Não corrige código, só reporta |
| `testing` | Revisa cobertura de testes contra os critérios de aceite da spec | Não decide critérios de aceite novos |
| `code-review` | Revisa convenções, duplicação e complexidade | Não decide novo padrão (isso vai para `architecture`) |
| `architecture-auditor` | Roda periodicamente comparando código com ADRs, sinaliza deriva | Não corrige nada sozinho |
| `legacy-rules-extractor` | Extrai regras de negócio do sistema legado, por módulo, sinalizando conflitos | Não decide qual versão de regra divergente é a correta |

O conteúdo completo de cada agente (papel detalhado, formato de saída, definição
de pronto) deve ser gerado em `agents/<nome>.md` seguindo a mesma estrutura:
Papel → Antes de começar, leia → Escopo (faz/não faz) → Formato de saída →
Definição de pronto → Checkpoint.

---

## 8. Instrução para a IA que for gerar o esqueleto do projeto

1. Criar toda a árvore de pastas da Seção 2, incluindo pastas vazias com um
   `.gitkeep` onde ainda não houver arquivo.
2. Gerar `AGENTS.md` na raiz, resumindo as Seções 1, 3 e 8 deste documento como
   contexto de entrada para qualquer IA futura.
3. Gerar cada arquivo de `agents/` com o conteúdo detalhado a partir do resumo
   da Seção 7.
4. Gerar cada ADR de `docs/adr/` com o conteúdo detalhado a partir do resumo da
   Seção 6, seguindo o template.
5. Gerar `docs/security/security-baseline.md` a partir da Seção 5, em formato
   de checklist verificável.
6. Gerar `specs/shared/como-executar.md` e
   `specs/shared/convencoes-de-nomenclatura.md` com as convenções descritas na
   Seção 3.
7. Criar `agents/business-rules.md` vazio, com apenas a estrutura de seções,
   pronto para ser preenchido pela extração do sistema legado.
8. Não gerar nenhum módulo de negócio em `lib/modules/` ainda — isso só
   acontece quando a primeira mudança (`specs/changes/001-...`) passar pelo
   pipeline completo.
