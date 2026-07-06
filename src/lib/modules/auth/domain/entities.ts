export type Role =
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
  | "pcp";

export interface User {
  id: string;
  email: string;
  nome: string;
  role: Role;
  ativo: boolean;
  vendedorId: number | null;
  depositoId: number | null;
  maxDesconto: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  nome: string;
  role: Role;
  vendedorId?: number;
}

export interface UpdateUserData {
  nome?: string;
  role?: Role;
  vendedorId?: number | null;
  maxDesconto?: number;
}
