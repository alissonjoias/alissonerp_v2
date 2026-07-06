import type { User, CreateUserData, UpdateUserData } from "../domain/entities";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deactivate(id: string): Promise<void>;
  activate(id: string): Promise<void>;
}

export interface AuthService {
  getCurrentUser(): Promise<User>;
  requireRole(roles: string[]): Promise<void>;
  requireRoleAtLeast(minRole: string): Promise<void>;
}
