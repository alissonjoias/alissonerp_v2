# Extrações pendentes do sistema legado

> **Responsável:** Rafael (único com acesso ao código legado)
> **Quando:** antes do Jonathan começar a tarefa correspondente
> **Onde:** `docs/extraction/<modulo>-YYYY-MM-DD.md`

---

## Extrações já concluídas

| # | Módulo | Status |
|---|--------|--------|
| 1 | Auth (usuarios, roles, permissoes) | ✅ `docs/extraction/auth-2026-07-06.md` |

---

## Extrações a fazer (ordem de prioridade)

### Bloco 1 — Comercial (antes de 14/07)

| # | Módulo | Tarefa | Arquivos legados a analisar | Fazer até |
|---|--------|--------|---------------------------|-----------|
| 2 | Produtos | 007, 008 | `src/app/api/produtos/`, `src/lib/produtos/`, migrations de `erp_produtos` | 10/07 |
| 3 | Clientes | 009 | `src/app/api/contatos/`, migrations de `public.contatos` | 10/07 |
| 4 | Vendedores | 011 | `public.vendedores`, `src/app/api/vendedores/` | 11/07 |
| 5 | Estoque | 010 | `src/app/api/estoque/`, `src/lib/estoque/`, migrations de `movimentacoes_estoque` | 12/07 |

### Bloco 1 — Comercial (antes de 21/07)

| # | Módulo | Tarefa | Arquivos legados a analisar | Fazer até |
|---|--------|--------|---------------------------|-----------|
| 6 | Vendas | 012, 013 | `src/app/api/vendas/`, `src/lib/vendas-aprovar.ts`, `src/lib/vendas-situacoes.ts` | 17/07 |
| 7 | Financeiro | 017 | `src/app/api/financeiro/`, `src/lib/baixa-credito.ts` | 17/07 |
| 8 | Crediário | 015 | `src/app/api/crediario/`, `src/lib/crediario-*` | 18/07 |
| 9 | Vale-Troca | 016 | `src/app/api/vale-troca/`, `src/lib/vale-troca.ts` | 18/07 |
| 10 | Devoluções | 016 | `src/app/api/devolucoes/`, `src/lib/devolucoes.ts` | 18/07 |

### Bloco 2 — Fábrica (antes de 27/07)

| # | Módulo | Tarefa | Arquivos legados a analisar | Fazer até |
|---|--------|--------|---------------------------|-----------|
| 11 | Ordens | 018 | `src/app/api/ordens/`, `src/components/ordens/` | 24/07 |
| 12 | PCP | 019 | `src/app/api/pcp/`, migrações de `pcp` | 24/07 |
| 13 | Protocolo | 020 | `src/app/api/protocolo/` | 28/07 |
| 14 | Distribuição | 021 | `src/app/api/distribuicao/` | 28/07 |
| 15 | Compras | 022 | `src/app/api/compras/`, `src/lib/metal/` | 28/07 |
