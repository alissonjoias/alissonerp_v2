# Skill: ERP Development Workflow

> **Ativa esta skill SEMPRE que for desenvolver qualquer módulo, tela ou componente do ERP.**
> Esta skill garante que o código siga os padrões, seja seguro e não fuja do escopo.

---

## 1. Antes de escrever uma linha de código

- [ ] Li `AGENTS.md` completo
- [ ] Li `agents/ui-spec.md` — catálogo de componentes e padrões de tela
- [ ] Verifiquei se a mudança tem `spec.md` aprovado em `specs/changes/NNN-slug/`
- [ ] Verifiquei se a mudança tem `design.md` aprovado em `specs/changes/NNN-slug/`
- [ ] A tabela que vou usar JÁ existe no banco (nunca crio tabela nova)

## 2. Durante o desenvolvimento

### Regras de escopo (anti-scope-creep)
- ❌ NUNCA adiciono funcionalidade que não está na spec aprovada
- ❌ NUNCA crio tabela nova ou migration nova (banco já existe)
- ❌ NUNCA altero regra de negócio sem atualizar a spec primeiro
- ✅ Se encontro algo que deveria estar na spec mas não está → abro issue, não implemento
- ✅ Se a spec está ambígua → pergunto antes de implementar

### Padrão de código
- ✅ Todo componente novo em `_components/` com ≤ 300 linhas
- ✅ Toda Server Action valida input com Zod
- ✅ Todo formulário usa react-hook-form + `Field/FieldLabel/FieldError`
- ✅ Toda tabela usa tanstack Table do shadcn/ui
- ✅ Erros usam `toast()` do sonner, nunca `alert()` ou `console.log`
- ✅ Estados tratados: loading (Spinner/Skeleton), vazio (Empty), erro (toast)

### Segurança
- ✅ Toda Server Action verifica autenticação (`getCurrentUser()`)
- ✅ Toda Server Action verifica permissão (`requireRole()`)
- ✅ Nenhum segredo no client — apenas `NEXT_PUBLIC_*` vai pro browser
- ✅ Valores monetários em centavos (inteiro), nunca float

## 3. Depois de implementar

- [ ] Rodei `npm run test` — todos os testes passam
- [ ] Rodei `npm run test:coverage` — ≥ 80% de cobertura
- [ ] Rodei `npm run lint` — sem erros
- [ ] Verifiquei que não usei `any` em nenhum lugar
- [ ] Verifiquei que não usei `console.log` em produção
- [ ] Testei manualmente: caminho feliz, erro, vazio, loading
- [ ] Atualizei `status.md` da mudança

## 4. Gate de qualidade (merge bloqueado se)

| Falha | Bloqueio |
|-------|----------|
| Testes não passam | ❌ Merge bloqueado |
| Cobertura < 80% | ❌ Merge bloqueado |
| `any` no código | ❌ Merge bloqueado |
| Componente fora do catálogo `ui-spec` | ❌ Merge bloqueado |
| Funcionalidade sem spec aprovada | ❌ Merge bloqueado |
| Arquivo > 300 linhas | ❌ Merge bloqueado |
| Formulário sem react-hook-form + Zod | ❌ Merge bloqueado |
| `console.log` em produção | ❌ Merge bloqueado |

> ⚠️ Relatórios de revisão (security, testing, code-review, error-handler, performance, a11y, dependencies) são **temporários**. Gerar, ler, aprovar, deletar. Só o que fica no repositório é **spec.md e design.md**.

---

## Apêndice: O que significa "não fugir do escopo"

**Escopo definido** = o que está escrito no `spec.md` aprovado.

**Exemplo de scope creep proibido:**
- Spec diz "listar clientes com busca por nome"
- ❌ Implementar busca por telefone, email, CPF, cidade também (não tá na spec)
- ✅ Se a busca por nome é boa o suficiente, entregue. Se precisa de mais filtros, o `business-analyst` atualiza a spec, você aprova, e só então implementa.

**Exemplo aceitável:**
- Spec diz "listar clientes" mas não define layout
- ✅ Usar o padrão de tabela do `ui-spec.md` (é uma decisão de implementação, não de escopo)
