# Tarefas — Reformulação do Alisson ERP

> **Banco:** mesmo Supabase, schema `alissonerp`, 246 tabelas existentes.
> **Estratégia:** frontend novo + banco de sempre. Nada de recriar tabelas.
> **Formato:** tarefas isoladas. Cada uma pode ser executada independentemente por agentes de IA.

---

## Bloco 1 — Comercial (07/07 a 26/07)

### Tarefa 001 — Configurar projeto e deploy
**Título:** Projeto no ar — Next.js + Supabase + Vercel

**Descrição:** Criar o projeto Next.js, configurar Tailwind, apontar para o Supabase existente, subir na Vercel. Sem isso, nada funciona.

**Etapas:**
1. Inicializar Next.js App Router com TypeScript strict
2. Configurar TailwindCSS com as cores da marca (verde escuro, creme, dourado)
3. Configurar `.env` com as credenciais do Supabase existente
4. Criar cliente Supabase (server, browser e admin) em `src/lib/supabase/`
5. Deploy inicial na Vercel — só pra validar que sobe

**Data:** 07/07 a 08/07

---

### Tarefa 002 — Login e autenticação
**Título:** Tela de login conectada ao Supabase Auth

**Descrição:** Criar a tela de login com marca Alisson Joias usando o Supabase Auth que já está em produção. Email + senha, validação Zod, mensagens de erro em português. Sem middleware por enquanto — só a tela.

**Etapas:**
1. Criar tela de login (email + senha) com os componentes shadcn/ui
2. Conectar ao Supabase Auth via `signInWithPassword`
3. Tratar erros: credenciais inválidas, usuário desativado, erro de rede
4. Validar formulário com Zod + react-hook-form
5. Redirecionar para dashboard ao logar com sucesso

**Data:** 07/07 a 09/07

---

### Tarefa 003 — Middleware de proteção
**Título:** Middleware global — ninguém acessa sem login

**Descrição:** Criar middleware que protege todas as rotas. Se não autenticado, redireciona para login. Se logado e tentar acessar login, redireciona para dashboard. Rotas públicas: login, favicon, arquivos estáticos.

**Etapas:**
1. Criar `src/middleware.ts` com Supabase SSR
2. Verificar sessão em toda requisição
3. Redirecionar não autenticados → `/auth/v2/login`
4. Redirecionar autenticados em `/auth/*` → `/dashboard`
5. Lista branca para arquivos estáticos, favicon, imagens

**Data:** 08/07 a 09/07

---

### Tarefa 004 — Cargos e permissões
**Título:** Centralizar roles — uma única fonte da verdade

**Descrição:** Unificar os 11 cargos em um arquivo central. Hoje estão duplicados em 6 lugares diferentes no Sidebar do legado. Mapear as permissões de cada cargo por módulo. Criar a lógica de verificação.

**Etapas:**
1. Criar `src/lib/modules/auth/domain/roles.ts` — enum único com 11 cargos
2. Definir permissões por cargo e módulo em objeto tipado
3. Extrair regras do `role_permissoes` do banco legado como seed
4. Criar função `temPermissao(role, modulo, acao)` centralizada
5. Criar função `temAcessoModulo(role, modulo)` para o menu

**Data:** 09/07 a 10/07

---

### Tarefa 005 — Menu lateral dinâmico
**Título:** Sidebar que mostra só o que cada cargo pode ver

**Descrição:** Substituir os 6 arrays hardcoded do legado por um menu gerado dinamicamente a partir das permissões do cargo. Cada usuário vê apenas os módulos que pode acessar.

**Etapas:**
1. Atualizar `sidebar-items.ts` com a estrutura de módulos do ERP
2. Implementar filtro dinâmico baseado na role do usuário logado
3. Esconder grupos vazios (se cargo não tem nenhum item do grupo)
4. Adicionar badges "em breve" nos módulos ainda não migrados
5. Testar com cada cargo (admin vê tudo, consultora vê só comercial)

**Data:** 10/07 a 11/07

---

### Tarefa 006 — Dashboard base
**Título:** Dashboard inicial com tema da marca

**Descrição:** Criar a página inicial do dashboard com mensagem de boas-vindas, indicador de status do sistema, e o tema visual nas cores da Alisson Joias. Substituir o "em construção" por um dashboard funcional.

**Etapas:**
1. Criar dashboard com cards de boas-vindas e status do sistema
2. Configurar tema escuro com cores da marca (verde escuro, creme, dourado)
3. Adicionar componente de breadcrumb e header com título da página
4. Exibir nome e cargo do usuário logado no header

**Data:** 11/07 a 13/07

---

### Tarefa 007 — Catálogo de produtos (listagem)
**Título:** Listagem de produtos com busca e filtros

**Descrição:** Conectar à tabela existente `erp_produtos` e exibir listagem com busca, filtros por categoria, e visualização de fotos. A vendedora precisa encontrar qualquer produto rapidamente.

**Etapas:**
1. Mapear estrutura da tabela `erp_produtos` (campos, tipos, relações)
2. Criar Server Action `buscarProdutos` (busca, paginação, filtros)
3. Criar tabela com colunas: foto, nome, SKU, categoria, preço, estoque
4. Implementar busca textual com debounce (nome, código, SKU)
5. Implementar filtro por categoria e faixa de preço
6. Conectar fotos do Supabase Storage existente

**Data:** 14/07 a 16/07

---

### Tarefa 008 — Cadastro e edição de produto
**Título:** Formulário de cadastro e edição de produto

**Descrição:** Tela de cadastro de novo produto e edição de existente, usando as tabelas já existentes. Upload de fotos via Supabase Storage. Precificação automática com markup e curva.

**Etapas:**
1. Criar formulário com react-hook-form + Zod
2. Campos: nome, SKU, categoria, descrição, preço, markup
3. Upload de fotos via Supabase Storage
4. Vincular variações (aro, tamanho) à tabela existente
5. Precificação automática (custo + markup = preço venda)

**Data:** 16/07 a 18/07

---

### Tarefa 009 — Clientes
**Título:** Cadastro e busca de clientes

**Descrição:** Conectar à tabela `public.contatos` (readonly no schema público). Criar tela de consulta com busca por nome, telefone, email. Permitir cadastro de novo cliente.

**Etapas:**
1. Mapear estrutura da tabela `public.contatos`
2. Criar tela de listagem com busca (nome, telefone, email)
3. Criar formulário de cadastro de novo cliente
4. Exibir histórico de compras do cliente (consulta `vendas_erp`)

**Data:** 16/07 a 18/07

---

### Tarefa 010 — Estoque
**Título:** Consulta de estoque por depósito e produto

**Descrição:** Conectar às tabelas existentes `depositos` e `movimentacoes_estoque`. Mostrar saldo por produto × depósito. Registrar entrada e saída com rastreio de origem (venda, ordem, ajuste).

**Etapas:**
1. Mapear tabelas: `depositos`, `movimentacoes_estoque`
2. Criar tela de consulta de saldo (produto + depósito)
3. Implementar filtro por depósito com visão consolidada
4. Criar formulário de movimentação (entrada/saída) com motivo

**Data:** 19/07 a 20/07

---

### Tarefa 011 — Vendedores
**Título:** Cadastro de vendedores vinculados ao sistema

**Descrição:** Conectar à tabela `public.vendedores`. Vincular vendedor a usuário do sistema (`alissonerp.usuarios`). Essencial para cálculo de comissão.

**Etapas:**
1. Mapear tabela `public.vendedores` e vínculo com `usuarios`
2. Criar tela de listagem de vendedores
3. Criar formulário de cadastro/edição
4. Vincular vendedor ao usuário do sistema (campo `vendedor_id`)

**Data:** 18/07

---

### Tarefa 012 — PDV: wizard de venda
**Título:** Tela de nova venda — busca cliente, produtos e total

**Descrição:** Criar o wizard de venda. A vendedora busca o cliente, adiciona produtos da listagem, define quantidade, e o sistema calcula automaticamente o total com descontos. Cada passo do wizard é um componente independente de no máximo 300 linhas. Conecta às tabelas `vendas_erp` e `itens_venda_erp`.

**Etapas:**
1. Mapear tabelas: `vendas_erp`, `itens_venda_erp`
2. Criar wizard em etapas: cliente → produtos → resumo
3. Criar componente de busca de cliente (reutiliza Tarefa 009)
4. Criar componente de busca de produto com quantidade (reutiliza Tarefa 007)
5. Criar componente de resumo: subtotal, desconto, total
6. Implementar threshold de aprovação de desconto
7. Gravar venda como rascunho nas tabelas existentes

**Data:** 21/07 a 23/07

---

### Tarefa 013 — PDV: pagamentos
**Título:** Formas de pagamento no PDV

**Descrição:** Adicionar a etapa de pagamento ao wizard de venda. Dinheiro, Pix, cartão de crédito/débito. Conectar à tabela `pagamentos_venda`. Múltiplas formas na mesma venda. Troco automático.

**Etapas:**
1. Mapear tabela `pagamentos_venda`
2. Criar componente de seleção de forma de pagamento
3. Implementar pagamento em dinheiro com cálculo de troco
4. Implementar pagamento em Pix (chave copia-e-cola)
5. Implementar pagamento em cartão (bandeira, parcelas)
6. Suportar múltiplos pagamentos na mesma venda (ex: R$100 Pix + R$50 dinheiro)

**Data:** 22/07 a 24/07

---

### Tarefa 014 — Mercado Pago e PagBank
**Título:** Integração com maquininhas de pagamento

**Descrição:** Reaproveitar a lógica de integração do legado (`src/lib/mercado-pago.ts`, `src/lib/pagbank/`). Adaptar para o novo frontend. Polling de status unificado para ambos os gateways.

**Etapas:**
1. Extrair e adaptar lógica do Mercado Pago do legado
2. Criar componente de pagamento via Point (maquininha)
3. Criar componente de pagamento via Link/Pix
4. Extrair e adaptar lógica do PagBank do legado
5. Criar polling unificado de status de pagamento

**Data:** 23/07 a 25/07

---

### Tarefa 015 — Crediário
**Título:** Vendas parceladas com controle de recebimento

**Descrição:** Conectar às tabelas existentes de crediário. Permitir venda parcelada, controlar vencimentos, fazer baixa automática. Alarmes visuais para parcelas vencidas e reservas expiradas.

**Etapas:**
1. Mapear tabelas de crediário existentes no schema `alissonerp`
2. Criar componente de parcelamento no wizard de venda
3. Implementar tela de gestão de crediário (parcelas, vencimentos, status)
4. Implementar baixa automática de parcelas
5. Adicionar alarme visual: parcelas vencidas em vermelho, reservas expiradas

**Data:** 24/07 a 26/07

---

### Tarefa 016 — Vale-troca e devoluções
**Título:** Geração e aplicação de vale-troca, fluxo de devolução

**Descrição:** Conectar às tabelas `vales_troca` e `devolucoes_venda`. Implementar geração de vale com código sequencial, aplicação com confirmação de 6 dígitos, e fluxo completo de devolução.

**Etapas:**
1. Mapear tabelas: `vales_troca`, `devolucoes_venda`
2. Criar tela de geração de vale-troca (VT-00001 sequencial)
3. Implementar aplicação de vale no PDV com código de 6 dígitos
4. Criar tela de devoluções (rascunho → aprovação → inspeção → conclusão)
5. Implementar reembolso (estorno Mercado Pago ou conta a pagar manual)

**Data:** 25/07 a 26/07

---

### Tarefa 017 — Financeiro da loja
**Título:** Contas, caixa, comissões e dashboard comercial

**Descrição:** Conectar às tabelas financeiras existentes: `contas_pagar`, `contas_receber`, `fin_caixa_baixas`. Criar dashboards de faturamento, ranking de vendedores e metas.

**Etapas:**
1. Mapear tabelas financeiras existentes
2. Criar tela de contas a pagar/receber com vencimentos e baixa
3. Criar tela de fechamento de caixa diário
4. Implementar cálculo de comissão por vendedora e período
5. Criar dashboard comercial: faturamento do dia/semana/mês
6. Criar ranking de vendedores e metas

**Data:** 25/07 a 26/07

---

## Bloco 2 — Fábrica (27/07 a 20/08)

### Tarefa 018 — Ordens de serviço
**Título:** 7 tipos de ordem — criação manual e automática

**Descrição:** Conectar às tabelas `ordens` e `itens_ordem`. Criar frontend para os 7 tipos de ordem. Criação automática a partir de venda aprovada. Acompanhamento de status.

**Etapas:**
1. Mapear tabelas: `ordens`, `itens_ordem`
2. Criar tela de listagem de ordens com filtros (tipo, status, ourives)
3. Criar formulário de criação de ordem (7 tipos)
4. Implementar criação automática a partir da venda
5. Implementar acompanhamento de status e prioridade

**Data:** 27/07 a 31/07

---

### Tarefa 019 — PCP: apontamentos e controle de peso
**Título:** Planejamento da produção — etapas, fotos e peso

**Descrição:** Conectar às tabelas `pcp` e `tipos_apontamento`. Cada etapa da produção registrada com foto obrigatória. Peso de entrada/saída com cálculo de quebra por ourives.

**Etapas:**
1. Mapear tabelas: `pcp`, `tipos_apontamento`
2. Criar tela de apontamento por etapa com upload de foto
3. Implementar controle de peso (ouro recebido × ouro entregue)
4. Implementar cálculo de quebra por ourives e período
5. Vincular apontamentos a setor e depósito existentes

**Data:** 01/08 a 04/08

---

### Tarefa 020 — Protocolo
**Título:** Entrada e saída de peças com rastreio

**Descrição:** Conectar às tabelas `protocolos` e `itens_protocolo`. Peças entram e saem com QR Code. Fotos obrigatórias na entrada e devolução. Código de retirada para o cliente.

**Etapas:**
1. Mapear tabelas: `protocolos`, `itens_protocolo`
2. Criar tela de entrada de peças com fotos e QR Code
3. Criar tela de saída/devolução com fotos obrigatórias
4. Implementar código de retirada (WhatsApp)

**Data:** 05/08 a 07/08

---

### Tarefa 021 — Distribuição
**Título:** Lotes de produção e distribuição de materiais

**Descrição:** Conectar à tabela `distribuicoes`. Criar lotes, distribuir metal e pedras, vincular a ourives e ordens.

**Etapas:**
1. Mapear tabela `distribuicoes`
2. Criar tela de criação de lote de produção
3. Implementar distribuição de metal externo e pedras por lote
4. Vincular lotes a ourives e ordens

**Data:** 08/08 a 10/08

---

### Tarefa 022 — Compras
**Título:** Compra de ouro, insumos e produtos acabados

**Descrição:** Conectar às tabelas `compras_metal`, `compras_comercial` e `fornecedores`. Compra de ouro com foto da balança. Cadastro de fornecedores.

**Etapas:**
1. Mapear tabelas de compras existentes
2. Criar tela de compra de ouro com upload de foto da balança
3. Criar tela de compra comercial (produto acabado de fornecedor)
4. Criar cadastro de fornecedores

**Data:** 11/08 a 13/08

---

### Tarefa 023 — Dashboards da fábrica
**Título:** Painéis de produção, eficiência e quebra

**Descrição:** Criar dashboards consumindo dados reais das tabelas de produção. Visão gerencial: produção por período, eficiência por ourives, quebra de ouro.

**Etapas:**
1. Criar dashboard de produção (ordens por status, tipo, período)
2. Criar dashboard de eficiência (tempo médio por etapa, por ourives)
3. Criar dashboard de quebra (ouro recebido × entregue por ourives)
4. Criar relatórios exportáveis (produção, quebra, eficiência)

**Data:** 14/08 a 17/08

---

### Tarefa 024 — Transição final
**Título:** Migração da fábrica e desligamento do legado

**Descrição:** Testar o fluxo completo integrado. Migrar usuários da fábrica para o novo sistema. Validar com ourives, PCP e gerente. Desligar o frontend legado.

**Etapas:**
1. Testar fluxo ponta a ponta: venda → ordem → PCP → protocolo → devolução
2. Migrar usuários da fábrica para o novo sistema
3. Validar com ourives (apontamentos, fotos, peso)
4. Validar com PCP (planejamento, distribuição)
5. Validar com gerente (dashboards, relatórios)
6. Ajustar fluxos baseado no feedback
7. Desligar frontend legado — banco permanece o mesmo

**Data:** 18/08 a 20/08

---

## Resumo

| # | Tarefa | Dias |
|---|--------|------|
| **BLOCO 1 — COMERCIAL** |
| 001 | Projeto no ar — Next.js + Supabase + Vercel | 1–2 |
| 002 | Tela de login conectada ao Supabase Auth | 1–3 |
| 003 | Middleware global — ninguém acessa sem login | 2–3 |
| 004 | Centralizar roles — uma única fonte da verdade | 3–4 |
| 005 | Sidebar dinâmica por cargo | 4–5 |
| 006 | Dashboard base com tema da marca | 5–7 |
| 007 | Catálogo de produtos (listagem e busca) | 8–10 |
| 008 | Cadastro e edição de produto | 10–12 |
| 009 | Clientes — cadastro e busca | 10–12 |
| 010 | Estoque — consulta de saldo e movimentações | 13–14 |
| 011 | Vendedores vinculados ao sistema | 12 |
| 012 | PDV — wizard de venda | 15–17 |
| 013 | PDV — formas de pagamento | 16–18 |
| 014 | Mercado Pago e PagBank | 17–19 |
| 015 | Crediário | 18–20 |
| 016 | Vale-troca e devoluções | 19–20 |
| 017 | Financeiro da loja | 19–20 |
| **BLOCO 2 — FÁBRICA** |
| 018 | Ordens de serviço (7 tipos) | 21–25 |
| 019 | PCP — apontamentos e controle de peso | 26–29 |
| 020 | Protocolo de peças | 30–32 |
| 021 | Distribuição de produção | 33–35 |
| 022 | Compras (ouro, insumos, comerciais) | 36–38 |
| 023 | Dashboards da fábrica | 39–42 |
| 024 | Transição final | 43–45 |
