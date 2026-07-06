# Security Baseline — Checklist de Segurança

> **Obrigatório para toda mudança de sistema.**
> O agente `security` deve percorrer este checklist item por item durante a revisão.
> Nenhum merge é permitido com itens críticos pendentes.

---

## 1. Autenticação

- [ ] **A1** — Autenticação 100% via Supabase Auth. Nenhum módulo implementa login próprio.
- [ ] **A2** — `middleware.ts` verifica autenticação antes de qualquer rota protegida.
- [ ] **A3** — Tokens de sessão em cookies HttpOnly, nunca em localStorage.
- [ ] **A4** — Papel do usuário em `app_metadata` (imutável pelo client), nunca em `user_metadata`.
- [ ] **A5** — `signOut` invalida sessão no servidor, não apenas no client.

## 2. Autorização

- [ ] **Z1** — Toda nova tabela tem políticas RLS para SELECT, INSERT, UPDATE, DELETE.
- [ ] **Z2** — RLS policy cobre todos os papéis relevantes (admin, gerente, operador, etc.).
- [ ] **Z3** — Checagem explícita de permissão na camada `application` para regras de processo.
- [ ] **Z4** — Service role key só usada em código servidor, com justificativa no `design.md`.
- [ ] **Z5** — Nenhum client component usa service role key.

## 3. Validação de entrada

- [ ] **V1** — Toda Server Action valida input com schema Zod explícito.
- [ ] **V2** — Toda Route Handler valida input com schema Zod explícito.
- [ ] **V3** — Schemas Zod são compartilhados entre frontend e backend (não duplicados).
- [ ] **V4** — Inputs são sanitizados contra SQL injection (via Supabase client parametrizado).
- [ ] **V5** — Inputs com HTML/JS são sanitizados antes de exibir (XSS).
- [ ] **V6** — Uploads de arquivo têm validação de tipo, tamanho e nome.

## 4. Dados sensíveis

- [ ] **D1** — Nenhum segredo (API key, senha, token) versionado no repositório.
- [ ] **D2** — Segredos apenas em variáveis de ambiente do servidor (`process.env`).
- [ ] **D3** — `NEXT_PUBLIC_*` expõe apenas dados intencionalmente públicos.
- [ ] **D4** — Dados sensíveis não trafegam em URLs (query params com token, senha, etc.).
- [ ] **D5** — HTTPS/TLS em toda comunicação com serviços externos.

## 5. Auditoria

- [ ] **U1** — Ações sobre dados financeiros geram registro de auditoria (quem, quando, o quê, antes/depois).
- [ ] **U2** — Tabela de auditoria é append-only (RLS sem UPDATE/DELETE).
- [ ] **U3** — Alterações de configuração crítica geram registro de auditoria.
- [ ] **U4** — Log de auditoria inclui `user_id`, `timestamp`, `tabela`, `registro_id`, `dados_antes`, `dados_depois`.

## 6. Dependências

- [ ] **P1** — Nenhuma dependência com vulnerabilidade conhecida crítica (CI falha se houver).
- [ ] **P2** — Dependências novas avaliadas antes de adicionar (tamanho, manutenção, licença).
- [ ] **P3** — Versões de dependências são fixas (não ranges abertos) no `package.json`.

## 7. Erros e logs

- [ ] **E1** — Nenhum `console.log` em produção. Usar log estruturado (JSON).
- [ ] **E2** — Erros NUNCA expõem stack trace ao client em produção.
- [ ] **E3** — Erros de serviços externos (Mercado Pago, PagBank) são logados com detalhes para debug.
- [ ] **E4** — Erro genérico (`Internal Server Error`) nunca vaza dados sensíveis.

## 8. CSRF e headers de segurança

- [ ] **C1** — Server Actions usam proteção CSRF nativa do Next.js.
- [ ] **C2** — Headers de segurança configurados: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`.
- [ ] **C3** — CORS configurado apenas para origens explicitamente autorizadas (se aplicável).

---

## Classificação de severidade

| Severidade | Critério | Bloqueia merge? |
|------------|----------|-----------------|
| **critical** | Quebra item de segurança que expõe dados ou permite acesso não autorizado | SIM |
| **high** | Viola política de segurança estabelecida em ADR | SIM |
| **medium** | Boa prática não seguida, sem exposição imediata | NÃO (cria ticket) |
| **low** | Melhoria desejável, sem risco | NÃO (registra) |
