import "server-only";

import { apiClient } from "@/lib/supabase/api-client";
import { getSessionCookies } from "@/lib/supabase/session";
import { UserNotFoundError, UserInactiveError, InsufficientPermissionError } from "../../domain/errors";
import type { User, CreateUserData, UpdateUserData, Role } from "../../domain/entities";
import type { UserRepository, AuthService } from "../../application/ports";

const VALID_ROLES: Role[] = [
  "desenvolvedor", "admin", "gerente_fabrica", "gerente_loja",
  "consultora", "estoquista_fabrica", "estoquista_loja",
  "ourives", "motoboy", "entregador", "pcp",
];

const userCache = new Map<string, { data: User; expires: number }>();
const CACHE_TTL = 30_000;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role: "consultora",
    ativo: row.ativo,
    vendedorId: row.vendedor_id ?? null,
    depositoId: row.deposito_id ?? null,
    maxDesconto: 0,
    criadoEm: new Date(row.created_at),
    atualizadoEm: new Date(row.updated_at),
  };
}

async function fetchUsers(path: string, token: string): Promise<User[]> {
  const res = await apiClient(path, { token, schema: "alissonerp_v2" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data ?? []).map(mapRowToUser);
}

export function createUserRepository(): UserRepository {
  return {
    async findById(id: string): Promise<User | null> {
      const cached = userCache.get(id);
      if (cached && cached.expires > Date.now()) return cached.data;

      const { accessToken } = await getSessionCookies();
      if (!accessToken) return null;

      const users = await fetchUsers(`/rest/v1/usuarios?id=eq.${id}&select=*`, accessToken);
      const user = users[0] ?? null;
      if (user) {
        userCache.set(id, { data: user, expires: Date.now() + CACHE_TTL });
      }
      return user;
    },

    async findByEmail(email: string): Promise<User | null> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) return null;

      const users = await fetchUsers(`/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=*`, accessToken);
      return users[0] ?? null;
    },

    async findAll(): Promise<User[]> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) return [];
      return fetchUsers("/rest/v1/usuarios?select=*&order=nome.asc", accessToken);
    },

    async create(input: CreateUserData): Promise<User> {
      // Cria usuário no Supabase Auth (service_role)
      const authRes = await fetch(`${API_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          email_confirm: true,
        }),
      });

      if (!authRes.ok) {
        const err = await authRes.json();
        throw new Error(err?.msg ?? "Falha ao criar usuário no Supabase");
      }

      const authUser = (await authRes.json()) as { id: string };

      // Insere na tabela usuarios (service_role bypassa RLS)
      const insertRes = await apiClient("/rest/v1/usuarios", {
        method: "POST",
        body: {
          id: authUser.id,
          email: input.email,
          nome: input.nome,
          vendedor_id: input.vendedorId ?? null,
        },
        token: SERVICE_ROLE_KEY,
        schema: "alissonerp_v2",
      });

      if (!insertRes.ok) {
        const err = await insertRes.json();
        throw new Error(err?.message ?? "Falha ao inserir usuário");
      }

      const data = await insertRes.json();
      return mapRowToUser(data);
    },

    async update(id: string, input: UpdateUserData): Promise<User> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) throw new UserNotFoundError();

      const body: Record<string, unknown> = {};
      if (input.nome !== undefined) body.nome = input.nome;
      if (input.vendedorId !== undefined) body.vendedor_id = input.vendedorId;

      const res = await apiClient(`/rest/v1/usuarios?id=eq.${id}`, {
        method: "PATCH",
        body,
        token: accessToken,
        schema: "alissonerp_v2",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message ?? "Falha ao atualizar usuário");
      }

      userCache.delete(id);

      const users = await fetchUsers(`/rest/v1/usuarios?id=eq.${id}&select=*`, accessToken);
      const user = users[0];
      if (!user) throw new UserNotFoundError();
      return user;
    },

    async deactivate(id: string): Promise<void> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) throw new UserNotFoundError();

      await apiClient(`/rest/v1/usuarios?id=eq.${id}`, {
        method: "PATCH",
        body: { ativo: false },
        token: accessToken,
        schema: "alissonerp_v2",
      });
      userCache.delete(id);
    },

    async activate(id: string): Promise<void> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) throw new UserNotFoundError();

      await apiClient(`/rest/v1/usuarios?id=eq.${id}`, {
        method: "PATCH",
        body: { ativo: true },
        token: accessToken,
        schema: "alissonerp_v2",
      });
      userCache.delete(id);
    },
  };
}

export function createAuthService(userRepo: UserRepository): AuthService {
  return {
    async getCurrentUser(): Promise<User> {
      const { accessToken } = await getSessionCookies();
      if (!accessToken) throw new UserNotFoundError();

      const userRes = await apiClient("/auth/v1/user", { token: accessToken });
      if (!userRes.ok) throw new UserNotFoundError();

      const { id } = (await userRes.json()) as { id: string };
      const user = await userRepo.findById(id);
      if (!user) throw new UserNotFoundError();
      if (!user.ativo) throw new UserInactiveError();

      return user;
    },

    async requireRole(roles: string[]): Promise<void> {
      const user = await this.getCurrentUser();
      if (!roles.includes(user.role)) {
        throw new InsufficientPermissionError();
      }
    },

    async requireRoleAtLeast(minRole: string): Promise<void> {
      const user = await this.getCurrentUser();
      const admins = ["desenvolvedor", "admin"];

      if (admins.includes(user.role)) return;
      if (user.role === minRole) return;

      const hierarchy: Record<string, number> = {
        consultora: 1,
        ourives: 1,
        motoboy: 1,
        estoquista_loja: 1,
        estoquista_fabrica: 1,
        pcp: 1,
        entregador: 1,
        gerente_loja: 2,
        gerente_fabrica: 2,
        admin: 3,
        desenvolvedor: 3,
      };

      if ((hierarchy[user.role] ?? 0) < (hierarchy[minRole] ?? 0)) {
        throw new InsufficientPermissionError();
      }
    },
  };
}
