import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserNotFoundError, UserInactiveError, InsufficientPermissionError } from "../../domain/errors";
import type { User, CreateUserData, UpdateUserData, Role } from "../../domain/entities";
import type { UserRepository, AuthService } from "../../application/ports";

const VALID_ROLES: Role[] = [
  "desenvolvedor", "admin", "gerente_fabrica", "gerente_loja",
  "consultora", "estoquista_fabrica", "estoquista_loja",
  "ourives", "motoboy", "entregador", "pcp",
];

// Cache em memória: TTL 30s
const userCache = new Map<string, { data: User; expires: number }>();
const CACHE_TTL = 30_000;

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role: row.role,
    ativo: row.ativo,
    vendedorId: row.vendedor_id ?? null,
    depositoId: row.deposito_id ?? null,
    maxDesconto: Number(row.mx_desconto_permitido),
    criadoEm: new Date(row.created_at),
    atualizadoEm: new Date(row.updated_at),
  };
}

export function createUserRepository(): UserRepository {
  return {
    async findById(id: string): Promise<User | null> {
      const cached = userCache.get(id);
      if (cached && cached.expires > Date.now()) return cached.data;

      const supabase = await createClient();
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return null;
      const user = mapRowToUser(data);
      userCache.set(id, { data: user, expires: Date.now() + CACHE_TTL });
      return user;
    },

    async findByEmail(email: string): Promise<User | null> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();
      return data ? mapRowToUser(data) : null;
    },

    async findAll(): Promise<User[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");
      return (data ?? []).map(mapRowToUser);
    },

    async create(input: CreateUserData): Promise<User> {
      const admin = createAdminClient();

      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });
      if (authError) throw new Error(authError.message);
      if (!authUser.user) throw new Error("Falha ao criar usuário no Supabase");

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("usuarios")
        .insert({
          id: authUser.user.id,
          email: input.email,
          nome: input.nome,
          role: input.role,
          vendedor_id: input.vendedorId ?? null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowToUser(data);
    },

    async update(id: string, input: UpdateUserData): Promise<User> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          ...(input.nome !== undefined && { nome: input.nome }),
          ...(input.role !== undefined && { role: input.role }),
          ...(input.vendedorId !== undefined && { vendedor_id: input.vendedorId }),
          ...(input.maxDesconto !== undefined && { mx_desconto_permitido: input.maxDesconto }),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowToUser(data);
    },

    async deactivate(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw new Error(error.message);
      userCache.delete(id);
    },

    async activate(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: true })
        .eq("id", id);
      if (error) throw new Error(error.message);
      userCache.delete(id);
    },
  };
}

export function createAuthService(userRepo: UserRepository): AuthService {
  return {
    async getCurrentUser(): Promise<User> {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new UserNotFoundError();

      const user = await userRepo.findById(authUser.id);
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

      // Hierarquia simples: gerente > operador
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
