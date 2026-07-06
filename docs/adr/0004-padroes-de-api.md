# ADR 0004: Padrão Único de API e Versionamento

> **Status:** aceito
> **Data:** 2026-07-06
> **Autor:** Rafael Lucas (architecture)
> **Substitui:** nenhum
> **Substituído por:** nenhum

---

## Contexto

O sistema legado tem 509 rotas de API sem padrão: algumas retornam `{ data }`, outras retornam o dado direto, erros são inconsistentes (algumas retornam 500 com stack trace, outras 200 com `{ error: "..." }`). O frontend tem 469 chamadas `fetch()` cada uma tratando resposta de um jeito diferente. Precisamos de um contrato único para toda comunicação frontend ↔ backend e também para APIs externas (ex: integração com site, Tiny ERP).

---

## Decisão

**Toda resposta de API segue o formato padrão `{ data, meta }` ou `{ error }`. Versionamento explícito desde o início (`/api/v1/...`).**

Server Actions (Next.js) são o meio primário de comunicação frontend ↔ backend. Route Handlers (`/api/v1/...`) só quando é necessário expor endpoints REST externos (webhooks, integrações, API pública).

---

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que foi descartada |
|-------------|------|---------|------------------------|
| Cada rota define seu formato | Flexibilidade total | Inconsistência — mesmo problema do legado | Já sabemos que isso falha |
| tRPC | Type-safe, sem código duplicado | Abstração extra, curva de aprendizado para IA, acopla frontend ao backend | Server Actions resolvem type-safety de forma mais simples |
| GraphQL | Cliente escolhe os campos | Overkill para ~25 usuários, complexidade de cache e segurança | Desnecessário |
| Server Actions + REST padronizado | Simples, type-safe, consistente | Dois mecanismos (actions + routes) para manter | **Escolhida** — cada um no seu caso de uso |

---

## Consequências

### Positivas
- Cliente HTTP único no frontend — substitui os 469 `fetch()` do legado
- Todo erro tem código de máquina + mensagem humana
- Versionamento permite evolução sem quebrar integrações existentes
- Server Actions são type-safe por padrão (importadas diretamente no frontend)

### Negativas
- Duas formas de expor funcionalidade (Server Actions + Route Handlers) — precisa de disciplina para não misturar
- Versionamento explícito adiciona uma camada de indireção nas URLs

---

## Implementação

### Formato padrão de resposta:

**Sucesso:**
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "pageSize": 20 }
}
```

**Erro:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O campo 'preco' é obrigatório",
    "details": { "field": "preco", "constraint": "required" }
  }
}
```

### Códigos de erro padronizados:
- `VALIDATION_ERROR` — input inválido
- `NOT_FOUND` — recurso não encontrado
- `UNAUTHORIZED` — não autenticado
- `FORBIDDEN` — autenticado mas sem permissão
- `BUSINESS_RULE_VIOLATION` — regra de negócio violada
- `EXTERNAL_SERVICE_ERROR` — erro em integração externa
- `INTERNAL_ERROR` — erro inesperado

### Server Actions:
- Nome: `nomeDaAction(data) → Promise<ApiResponse<T>>`
- Validação Zod antes de chamar use-case
- Retorna sempre `ApiResponse<T>`

### Route Handlers:
- `app/api/v1/<recurso>/route.ts`
- Mesmo padrão de resposta
- Autenticação via middleware + validação Zod
- Documentação OpenAPI gerada automaticamente

---

## Violações conhecidas

Nenhuma no momento da criação.
