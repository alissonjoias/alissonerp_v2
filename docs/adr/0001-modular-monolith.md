# ADR 0001: Modular Monolith como Base Arquitetural

> **Status:** aceito
> **Data:** 2026-07-06
> **Autor:** Rafael Lucas (architecture)
> **Substitui:** nenhum
> **Substituído por:** nenhum

---

## Contexto

Precisamos decidir a arquitetura base do novo ERP. O sistema legado sofre de acoplamento extremo — 6 arquivos com mais de 2.700 linhas, 509 rotas sem middleware, 469 chamadas fetch() cada uma implementada de forma diferente. A arquitetura precisa resolver este acoplamento sem introduzir complexidade operacional desnecessária para um sistema com ~25 usuários.

Alternativas consideradas: monolith tradicional, microserviços, modular monolith.

---

## Decisão

Usar **Modular Monolith** como base arquitetural — um único deploy (Next.js), com módulos internos isolados por domínio de negócio (`lib/modules/<modulo>/`), comunicação entre módulos apenas via interfaces explícitas (ports) ou eventos internos.

---

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que foi descartada |
|-------------|------|---------|------------------------|
| Monolith tradicional | Simples de desenvolver e debugar | Sem isolamento — tende ao mesmo caos do sistema atual | Não resolve o problema central (acoplamento) |
| Microserviços | Isolamento máximo, escalabilidade horizontal | Complexidade operacional extrema (orquestração, rede, latência) | Overkill para 25 usuários e uma empresa |
| Modular Monolith | Isolamento lógico com baixa complexidade operacional | Requer disciplina para manter os limites entre módulos | **Escolhida** — melhor equilíbrio |

---

## Consequências

### Positivas
- Código organizado por domínio — fácil de encontrar, modificar e testar
- Um único deploy — sem complexidade de orquestração
- Possibilidade de extrair módulos para microserviços no futuro se necessário
- Agentes de IA podem trabalhar em módulos independentes sem conflito

### Negativas
- Requer disciplina constante para não violar os limites entre módulos
- Se um módulo crescer muito internamente, o problema volta
- Sem deployment independente por módulo

---

## Implementação

- Estrutura: `lib/modules/<modulo>/domain/ | application/ | infrastructure/ | actions/ | tests/`
- `domain` não importa nada de `application` ou `infrastructure`
- `application` só acessa `infrastructure` via `ports` (interfaces)
- Rotas e Server Actions são infraestrutura de entrada — nunca contêm regra de negócio
- Módulo nunca acessa tabela ou repositório interno de outro módulo — apenas via port exposto ou evento

---

## Violações conhecidas

Nenhuma no momento da criação.
