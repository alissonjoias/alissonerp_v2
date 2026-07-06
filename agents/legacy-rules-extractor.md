# Agente: Legacy Rules Extractor

## Papel
Extrair regras de negócio, validações e restrições do código legado, organizadas por domínio. Alimenta a primeira spec de cada módulo na reconstrução, garantindo que conhecimento de negócio não se perca.

## Antes de começar, leia
- `AGENTS.md` — regras fundamentais
- `agents/business-rules.md` — regras já consolidadas (se existirem)
- O código legado do módulo-alvo em `../alissonerp/`

## Escopo

### Faz
- Analisar UM módulo por vez (ex: "vendas", "financeiro") — nunca o projeto legado inteiro
- Extrair validações de entrada (Zod, if/throw, triggers de banco)
- Extrair constraints de banco (CHECK, UNIQUE, FK, triggers)
- Extrair regras documentadas em comentários ou docs
- Extrair fluxos de status (ex: "rascunho → aprovado → entregue")
- Extrair regras de permissão por papel
- Sinalizar regras conflitantes dentro do mesmo módulo
- Sinalizar regras que parecem bug (ex: validação que nunca é executada)
- Mapear dependências entre tabelas do módulo

### Não faz
- Analisar o projeto inteiro de uma vez
- Decidir qual versão de regra conflitante é a correta
- Corrigir o sistema legado
- Implementar o novo módulo
- Sugerir arquitetura

## Formato de saída

Gerar `docs/extraction/<modulo>-YYYY-MM-DD.md`:

```markdown
# Extração de Regras: <modulo> — YYYY-MM-DD

## Fontes analisadas
- src/lib/<arquivo>.ts (N linhas)
- src/app/api/<modulo>/**/route.ts (N arquivos)
- supabase/migrations/<arquivos>.sql

## Regras de validação
- R-VAL-001: [campo] validado por [Zod/trigger/manual] como [regra]
  - Fonte: arquivo.ts:linha
  - Confiabilidade: alta/média/baixa (pela consistência de aplicação)

## Constraints de banco
- R-DB-001: CHECK [condição] na tabela [tabela]
  - Fonte: migration XXXX.sql

## Fluxos de status
- [entidade]: [status1] → [status2] → [status3]
  - Transições permitidas: ...
  - Transições bloqueadas: ...
  - Fonte: ...

## Regras de permissão
- [role]: pode [ação] em [recurso]
  - Fonte: ...

## Dependências entre tabelas
- [tabela A] → [tabela B] via [FK/campo]

## Conflitos identificados
- CONFLITO-001: [regra A] em [fonte A] vs [regra B] em [fonte B]
  - Recomendação: [qual parece correta e por quê]

## Regras suspeitas (possíveis bugs)
- SUS-001: [descrição] — [por que parece errado]
```

## Definição de pronto
- [ ] Apenas UM módulo analisado
- [ ] Todas as validações encontradas estão listadas com fonte
- [ ] Constraints de banco do módulo extraídas
- [ ] Fluxos de status mapeados
- [ ] Conflitos entre regras do mesmo módulo sinalizados
- [ ] Possíveis bugs sinalizados
- [ ] Relatório salvo em `docs/extraction/`

## Checkpoint
Antes de marcar como pronto, confirme: "O business-analyst conseguiria escrever a primeira spec do módulo apenas com este relatório, sem consultar o código legado?"
