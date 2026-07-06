# Como Executar o Projeto

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Docker (opcional, para banco local)
- Conta Supabase (para projetos remote)

## Setup inicial

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd erp-alisson-v2

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher .env.local com as credenciais do Supabase (dev)

# 4. Rodar migrations (ambiente dev)
npx supabase migration up --db-url <url-do-banco-dev>

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar build de produção |
| `npm run lint` | Executar ESLint |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run test` | Executar testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |

## Ambientes

| Ambiente | Supabase Project | Branch |
|----------|-----------------|--------|
| **dev** | Projeto Supabase de desenvolvimento | `main` (local) |
| **staging** | Projeto Supabase de homologação | `main` (deploy preview) |
| **produção** | Projeto Supabase de produção | `main` (deploy produção) |

## Estrutura de variáveis de ambiente

```bash
# .env.local (dev)
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

**Nunca** versionar `.env.local` ou `.env.production`. O arquivo `.env.example` contém apenas os nomes das variáveis, sem valores.
