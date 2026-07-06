# Design: 001-auth — Autenticação, Controle de Acesso e Menu

## Módulo(s) afetado(s)
- `src/lib/modules/auth/` — módulo de autenticação e autorização
- `src/navigation/sidebar/sidebar-items.ts` — menu dinâmico (será adaptado para consumir permissões)

---

## Entidades e Value Objects

### `User` (entidade raiz)
| Campo | Tipo | Origem |
|-------|------|--------|
| `id` | `UUID` | `auth.users.id` (Supabase) |
| `email` | `string` | `auth.users.email` |
| `nome` | `string` | `usuarios.nome` |
| `role` | `Role` | `usuarios.role` |
| `ativo` | `boolean` | `usuarios.ativo` |
| `vendedorId` | `number \| null` | `usuarios.vendedor_id` |
| `depositoId` | `number \| null` | `usuarios.deposito_id` |
| `maxDesconto` | `number` | `usuarios.mx_desconto_permitido` |
| `criadoEm` | `Date` | `usuarios.created_at` |
| `atualizadoEm` | `Date` | `usuarios.updated_at` |

### `Role` (value object)
```typescript
type Role =
  | "desenvolvedor"
  | "admin"
  | "gerente_fabrica"
  | "gerente_loja"
  | "consultora"
  | "estoquista_fabrica"
  | "estoquista_loja"
  | "ourives"
  | "motoboy"
  | "entregador"
  | "pcp"
```

### `Permission` (value object)
```typescript
interface Permission {
  module: string      // ex: "vendas", "estoque", "financeiro"
  action: string      // ex: "read", "write", "approve"
}
```

### Erros de domínio
```typescript
class UserNotFoundError extends Error { code = "USER_NOT_FOUND" }
class UserInactiveError extends Error { code = "USER_INACTIVE" }
class InsufficientPermissionError extends Error { code = "FORBIDDEN" }
class InvalidRoleError extends Error { code = "INVALID_ROLE" }
```

---

## Ports (interfaces)

### `UserRepository` (port de saída)
```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(): Promise<User[]>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  deactivate(id: string): Promise<void>
  activate(id: string): Promise<void>
}
```

### `AuthService` (port de entrada — exposto para outros módulos)
```typescript
interface AuthService {
  getCurrentUser(): Promise<User>
  requireRole(role: Role | Role[]): Promise<void>
  requirePermission(module: string, action: string): Promise<void>
  hasPermission(userId: string, module: string, action: string): Promise<boolean>
  getMenuItems(userId: string): Promise<NavGroup[]>
}
```

---

## Casos de uso

### `getCurrentUserUseCase`
1. Obter session do Supabase Auth
2. Buscar `usuarios` pelo `auth.uid()`
3. Retornar `User` ou erro se inativo
4. Cache de 30s (igual legado, mas explícito)

### `loginUseCase`
1. Chamar `supabase.auth.signInWithPassword()`
2. Se erro, retornar erro amigável
3. Buscar dados do usuário em `usuarios`
4. Se `ativo = false`, retornar `UserInactiveError`
5. Retornar `User`

### `listUsersUseCase` (admin)
1. Verificar se usuário logado é admin/desenvolvedor
2. Buscar todos os usuários
3. Retornar lista

### `createUserUseCase` (admin)
1. Verificar permissão
2. Validar dados (Zod)
3. Criar em `auth.users` via admin client (service role)
4. Inserir em `usuarios`
5. Auditoria: registrar criação

### `updateUserUseCase` (admin)
1. Verificar permissão
2. Validar dados
3. Atualizar `usuarios` (nunca alterar role no `auth.users.app_metadata`)
4. Auditoria: registrar alteração com dados anteriores/novos

### `getMenuItemsUseCase`
1. Buscar role do usuário
2. Filtrar `sidebarItems` por permissões da role
3. Retornar menu filtrado (remover grupos vazios)

---

## Schema de banco

### Tabela `usuarios` (já existe no legado — recriar no novo schema)

```sql
CREATE TABLE auth.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'consultora',
  vendedor_id BIGINT REFERENCES public.vendedores(id_vendedor),
  deposito_id INTEGER,
  mx_desconto_permitido DECIMAL(5,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  tipos_ordem_permitidos JSONB NOT NULL DEFAULT '[]',
  tipos_protocolo_permitidos JSONB NOT NULL DEFAULT '[]',
  is_operador_service BOOLEAN NOT NULL DEFAULT false,
  is_transportador BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_role ON auth.usuarios(role);
CREATE INDEX idx_usuarios_ativo ON auth.usuarios(ativo);
```

### Tabela `role_permissoes` (permissões por role)

```sql
CREATE TABLE auth.role_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL DEFAULT 'read',
  UNIQUE(role, modulo, acao)
);
```

### Tabela `role_permissoes` (permissões por role)

```sql
CREATE TABLE auth.role_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL DEFAULT 'read',
  UNIQUE(role, modulo, acao)
);
```

### RLS

Todas as tabelas têm RLS:
- `SELECT`: usuário pode ver a si mesmo. Admin/desenvolvedor pode ver todos.
- `INSERT/UPDATE/DELETE`: apenas admin/desenvolvedor.
- Service role bypassa RLS (para criação de usuário).

```sql
ALTER TABLE auth.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own" ON auth.usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "usuarios_select_admin" ON auth.usuarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.usuarios WHERE id = auth.uid() AND role IN ('admin', 'desenvolvedor'))
  );

CREATE POLICY "usuarios_insert_admin" ON auth.usuarios
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM auth.usuarios WHERE id = auth.uid() AND role IN ('admin', 'desenvolvedor'))
  );

CREATE POLICY "usuarios_update_admin" ON auth.usuarios
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.usuarios WHERE id = auth.uid() AND role IN ('admin', 'desenvolvedor'))
  );

-- Tabela de auditoria
CREATE TABLE auth.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.usuarios(id),
  acao VARCHAR(50) NOT NULL,
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: sem UPDATE/DELETE
ALTER TABLE auth.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_insert" ON auth.audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_log_select" ON auth.audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.usuarios WHERE id = auth.uid() AND role IN ('admin', 'desenvolvedor'))
);
```

---

## Server Actions / API

### `src/lib/modules/auth/actions/login.action.ts`
```typescript
export async function login(email: string, password: string): Promise<ApiResponse<User>>
```
- Valida Zod: `{ email: z.string().email(), password: z.string().min(1) }`
- Chama `supabase.auth.signInWithPassword()`
- Busca `usuarios`
- Se inativo, faz logout e retorna erro
- Retorna User

### `src/lib/modules/auth/actions/logout.action.ts`
```typescript
export async function logout(): Promise<ApiResponse<null>>
```
- Chama `supabase.auth.signOut()`

### `src/lib/modules/auth/actions/create-user.action.ts` (admin)
```typescript
export async function createUser(data: CreateUserInput): Promise<ApiResponse<User>>
```
- Valida Zod: email, senha, nome, role, vendedor_id (opcional)
- Requer role admin/desenvolvedor
- Cria em auth.users (service role) + usuarios
- Auditoria

### `src/lib/modules/auth/actions/update-user.action.ts` (admin)
```typescript
export async function updateUser(id: string, data: UpdateUserInput): Promise<ApiResponse<User>>
```
- Valida Zod: nome, role, vendedor_id, mx_desconto (opcionais)
- Requer admin
- NUNCA permite alterar próprio role
- Auditoria com dados anteriores/novos

### `src/lib/modules/auth/actions/toggle-user-status.action.ts` (admin)
```typescript
export async function toggleUserStatus(id: string): Promise<ApiResponse<User>>
```
- Requer admin
- NUNCA permite desativar a si mesmo
- Auditoria

---

## Decisões técnicas

1. **Schema `auth` no banco:** seguir o padrão do template `usuarios` do legado, mas num schema dedicado (`auth`) em vez de misturar com outros módulos
2. **Cache de 30s:** o servidor mantém cache em memória do usuário logado por 30 segundos (igual legado), pra não bater no banco a cada request
3. **Service role key:** usada APENAS em `createUserUseCase` para criar em `auth.users` — justificada e documentada
4. **Menu dinâmico:** `getMenuItemsUseCase` filtra `sidebar-items.ts` baseado na role do usuário — uma única fonte centralizada, sem arrays duplicados
5. **Role não fica em `app_metadata`:** fica apenas em `usuarios.role`. O `app_metadata` é lido do banco a cada verificação. Motivo: admin pode alterar a role sem o usuário precisar refazer login
6. **Logout:** limpa sessão no servidor E redireciona, não confia só no client

---

## ADRs novos
Nenhum. As decisões já estão cobertas por:
- `0002-autenticacao-autorizacao.md` — auth via Supabase + RBAC + RLS
- `0004-padroes-de-api.md` — formato de resposta padronizado
