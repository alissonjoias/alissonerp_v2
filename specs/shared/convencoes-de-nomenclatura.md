# Convenções de Nomenclatura

> **Aplicável a todo código TypeScript/TSX, SQL e arquivos do projeto.**

---

## Arquivos e pastas

| Regra | Exemplo |
|-------|---------|
| Pastas: `kebab-case` | `lib/modules/vendas/`, `docs/adr/` |
| Arquivos TypeScript: `kebab-case` | `criar-venda.use-case.ts`, `venda.entity.ts` |
| Arquivos React (componentes): `PascalCase` | `NovaVendaForm.tsx`, `VendaDetalheClient.tsx` |
| Server Actions: `kebab-case` com sufixo `.action` | `criar-venda.action.ts` |
| Testes: mesmo nome do arquivo + `.test` | `venda.entity.test.ts` |

## Código TypeScript

| Regra | Exemplo |
|-------|---------|
| Funções: `camelCase`, verbo no início | `criarVenda()`, `buscarProdutoPorId()` |
| Classes/Interfaces: `PascalCase` | `class Venda`, `interface VendaRepository` |
| Tipos: `PascalCase` | `type StatusVenda = "rascunho" \| "aprovado"` |
| Constantes: `UPPER_SNAKE_CASE` | `const MAX_ITENS_POR_VENDA = 50` |
| Variáveis: `camelCase` | `const vendaAtual = ...` |
| Arquivos de teste: sufixo `.test.ts` | `venda.entity.test.ts` |

## React / Next.js

| Regra | Exemplo |
|-------|---------|
| Componentes: `PascalCase`, nome descritivo | `NovaVendaWizard`, `PagamentoForm` |
| Custom hooks: `use` prefix | `useVenda()`, `useAuth()` |
| Contextos: `PascalCase` + `Context` | `VendaContext` |
| Event handlers: `handle` prefix | `handleSubmit`, `handleProdutoSelect` |

## SQL / Banco de dados

| Regra | Exemplo |
|-------|---------|
| Tabelas: `snake_case`, plural | `vendas`, `produtos`, `itens_venda` |
| Colunas: `snake_case` | `venda_id`, `criado_em`, `valor_total` |
| Chaves primárias: `id UUID` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Chaves estrangeiras: `{tabela}_id` | `venda_id UUID REFERENCES vendas(id)` |
| Índices: `idx_{tabela}_{coluna}` | `idx_vendas_status` |
| Triggers: `trg_{evento}_{tabela}` | `trg_updated_at_vendas` |
| Migrations: `NNNN_descricao.sql` | `0001_criar_tabela_vendas.sql` |
| Valores monetários: `INTEGER` (centavos) | `valor_total INTEGER NOT NULL` |

## Git

| Regra | Exemplo |
|-------|---------|
| Branches: `feature/NNN-slug` | `feature/001-criar-venda` |
| Commits: presente, imperativo | `adiciona wizard de nova venda` |
| Mensagens em português | |

## Princípios gerais

1. **Nomes descritivos, mesmo que longos.** `calcularValorTotalDosItensComDesconto` > `calcVal`
2. **Consistência acima de preferência.** Se o projeto usa `criarVenda`, não crie `criar_venda` ou `createSale`.
3. **Nunca abrevie sem necessidade.** `quantidade` > `qtd`, `venda` > `vnd`
4. **Português para domínio, inglês para técnico.** Entidades em português (`Venda`, `Produto`), termos técnicos em inglês (`Repository`, `interface`, `Promise`)
