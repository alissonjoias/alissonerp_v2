# ADR 0003: Sistema Single-Tenant com Suporte a Filiais

> **Status:** aceito
> **Data:** 2026-07-06
> **Autor:** Rafael Lucas (architecture)
> **Substitui:** nenhum
> **Substituído por:** nenhum

---

## Contexto

O ERP atende exclusivamente a Alisson Joias — uma única empresa. Não há planos de atender múltiplas empresas/clientes (multi-tenant). No entanto, a empresa pode ter ou vir a ter filiais. Precisamos definir como o sistema tratará múltiplas filiais sem a complexidade de isolamento multi-tenant completo.

---

## Decisão

**Sistema single-tenant com suporte a filiais via segregação organizacional interna.** Tabelas relevantes incluem coluna `filial_id` + RLS que restringe acesso à filial do usuário. Não é isolamento multi-tenant completo — é controle de acesso baseado em filial dentro de uma única empresa.

---

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que foi descartada |
|-------------|------|---------|------------------------|
| Multi-tenant completo (schema por empresa) | Isolamento total de dados | Complexidade desnecessária para uma única empresa | Não há segunda empresa — YAGNI |
| Sem suporte a filial — tudo global | Máxima simplicidade | Se abrir filial, precisa refatorar tudo | Risco de retrabalho alto |
| Single-tenant + filial_id com RBAC | Simples hoje, escala para filiais amanhã | Requer `filial_id` em queries desde o início | **Escolhida** — melhor relação simplicidade/preparação |

---

## Consequências

### Positivas
- Simplicidade operacional — um banco, um deploy
- Preparado para filiais sem refatoração
- Usuários de filiais diferentes não veem dados uns dos outros (RLS)
- Usuários com permissão global (admin, gerente) podem ver múltiplas filiais

### Negativas
- `filial_id` precisa estar em queries desde o dia 1, mesmo com uma filial só
- RLS policies precisam considerar o caso "filial_id IS NULL" (admin global)
- Relatórios cross-filial precisam de lógica extra

---

## Implementação

- Tabelas relevantes: `filial_id UUID REFERENCES filiais(id)`
- RLS: `USING (filial_id = (SELECT filial_id FROM user_profiles WHERE user_id = auth.uid()))`
- Admin/gerente: `USING (filial_id = ... OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente_loja', 'gerente_fabrica')))`
- Tabela `filiais`: id, nome, endereco, ativa
- Se não houver filial ainda, criar filial padrão e atribuir a todos os usuários

---

## Violações conhecidas

Nenhuma no momento da criação.
