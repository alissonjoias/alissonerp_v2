# Spec: 001-auth — Autenticação, Controle de Acesso e Menu

## Resumo
Criar o módulo de autenticação e controle de acesso do novo ERP — login seguro, cargos (roles), permissões por cargo, menu dinâmico que mostra só o que cada pessoa pode ver, e middleware que protege todas as páginas.

## Motivação
O sistema legado tem 12 cargos com permissões, mas elas estão espalhadas em 6 lugares diferentes (arrays duplicados no menu, RLS inconsistente, arquivos conflitantes). Isso causa bugs onde:
- Uma pessoa vê um item de menu mas não consegue acessar
- Uma pessoa consegue acessar uma tela mas o link não aparece no menu
- A role "diretor" existe num lugar mas não funciona em outro

O novo sistema precisa de UMA fonte da verdade para cargos e permissões, e um middleware que impeça acesso não autorizado antes mesmo de carregar a página.

## Fluxo de trabalho

### Login
1. Usuário abre o sistema → vê tela de login
2. Digita email + senha → sistema autentica no Supabase
3. Se autenticado → redireciona para o dashboard
4. Se não → mostra erro ("email ou senha inválidos")
5. Se o usuário estiver desativado (ativo = false) → mostra "usuário desativado, procure o administrador"

### Sessão e permissões
1. Ao carregar qualquer página, o sistema verifica:
   - O usuário está logado? Se não → redireciona para login
   - O usuário está ativo? Se não → bloqueia
   - O usuário tem permissão para esta página? Se não → mostra "acesso negado"
2. O menu lateral mostra APENAS os módulos que o usuário pode acessar
3. A role do usuário fica gravada no Supabase (app_metadata), não pode ser alterada pelo próprio usuário

### Gerenciamento de usuários
1. Admin/gerente pode:
   - Ver lista de usuários
   - Criar novo usuário com email + senha + cargo
   - Editar cargo de um usuário
   - Desativar/ativar usuário (nunca deletar)
   - Vincular vendedor ao usuário (se for consultora)

### Cargos (roles) — definição única

| Cargo | O que pode fazer |
|-------|------------------|
| desenvolvedor | Tudo — acesso completo a todas as telas e ações |
| admin | Tudo — igual desenvolvedor |
| gerente_fabrica | Produção, estoque, PCP, protocolo, metal, compras |
| gerente_loja | Vendas, estoque comercial, orçamento, crediário, precificação |
| consultora | Vendas, ordens, conferência, orçamento, crediário, metal |
| estoquista_fabrica | Estoque, quebra, compras, insumos |
| estoquista_loja | Estoque comercial, estoque produtos, compras comerciais |
| ourives | PCP (só do seu depósito), apontamentos |
| motoboy | Protocolo — cria e consulta, não conclui |
| entregador | App de entregas — só entregas |
| pcp | Produção completa |

## Critérios de aceite

### Login
- [ ] Tela de login com email + senha
- [ ] Se logado, redireciona para dashboard
- [ ] Se erro, mostra mensagem amigável
- [ ] Se usuário desativado, bloqueia com mensagem específica
- [ ] "Esqueci a senha" envia email de recuperação

### Middleware de proteção
- [ ] Toda página protegida redireciona para login se não autenticado
- [ ] Toda ação no servidor verifica permissão antes de executar
- [ ] Se não tem permissão, retorna erro 403 padronizado

### Menu dinâmico
- [ ] Menu lateral mostra APENAS módulos permitidos para o cargo
- [ ] Menu é gerado por uma única fonte (arquivo central, não arrays soltos)
- [ ] Se o cargo não tem nenhum módulo, mostra página em branco (não quebra)

### Gerenciamento de usuários
- [ ] Admin vê lista de todos os usuários com cargo, email, data de criação
- [ ] Admin pode criar usuário com email + senha + cargo + vendedor vinculado
- [ ] Admin pode editar cargo de um usuário
- [ ] Admin pode desativar/ativar (nunca deletar)
- [ ] Usuário não-admin não vê tela de gerenciamento de usuários

### Segurança
- [ ] Nenhum usuário pode alterar o próprio cargo
- [ ] Nenhum usuário pode se autodesativar
- [ ] Toda criação/edição de usuário fica registrada em log de auditoria
- [ ] Service role key (bypassa RLS) só usada em código servidor, com justificativa

## Papéis afetados
- **desenvolvedor/admin:** acesso irrestrito, gerencia usuários
- **gerente_fabrica/gerente_loja:** acesso amplo dentro do seu domínio, vê menu reduzido
- **consultora/estoquista/ourives/motoboy/entregador/pcp:** acesso restrito ao seu módulo
- **todos:** login pelo mesmo lugar, cada um vê o que precisa

## Regras de negócio

- REGRA-AUTH-001: Cargos são definidos em UM arquivo central (role.ts), não duplicados
- REGRA-AUTH-002: Menu lateral consulta o arquivo central de permissões — nunca arrays soltos
- REGRA-AUTH-003: Usuário desativado (ativo = false) não acessa o sistema, mesmo com senha correta
- REGRA-AUTH-004: Usuário nunca é deletado — apenas desativado
- REGRA-AUTH-005: Toda ação administrativa em usuários gera log de auditoria
- REGRA-AUTH-006: "desenvolvedor" e "admin" têm acesso completo e idêntico
- REGRA-AUTH-007: A role "entregador" só existe para o app de entregas (não aparece no menu web)

## Dependências
- Nenhuma — este é o primeiro módulo, tudo que ele precisa é do Supabase (já configurado)

## Restrições
- Não criar nova tabela de usuários — usar `auth.users` do Supabase + tabela `usuarios` no schema `alissonerp`
- Service role key nunca exposta ao client
- Zod valida toda entrada de formulário de usuário (email, cargo, etc.)
- As tabelas legadas (`alissonerp.usuarios`, `role_permissoes`, `permissoes_usuario`) podem ser reaproveitadas ou recriadas — o architecture decide

## Conflitos identificados
- O legado tem a role `diretor` listada em ROLES_FULL_ACCESS mas não está no tipo `Role` do permissions.ts — precisa decidir: existe ou não?
- O legado tem `entregador` no permissions.ts mas não tem constante em roles.ts — precisa regularizar
- Algumas RLS policies no legado checam `= 'admin'` mas não incluem `'desenvolvedor'` — no novo sistema, toda RLS trata desenvolvedor e admin como equivalentes
