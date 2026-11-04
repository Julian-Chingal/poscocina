export interface RoleItem {
  id: string;
  name: string;
  label: string;
  hierarchy: number;
}

export interface UserItem {
  id: string;
  name: string;
  documentNumber?: string | null;
  companyId?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  roleId: string;
  roleName: string;
  roleLabel: string;
  roleHierarchy: number;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  documentNumber: string;
  email?: string;
  roleId: string;
  pin: string;
  password?: string;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  name: string;
  documentNumber?: string | null;
  email?: string;
  roleId: string;
  isActive?: boolean;
}

export type UserFilterStatus = 'all' | 'active' | 'inactive';

export interface UsersViewProps {
  venueId: string;
}
