export interface RoleItem {
  id: string;
  name: string;
  label: string;
  hierarchy: number;
}

export interface UserItem {
  id: string;
  name: string;
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
  email?: string;
  roleId: string;
  pin: string;
  password?: string;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  name: string;
  email?: string;
  roleId: string;
  isActive?: boolean;
}

export type UserFilterStatus = 'all' | 'active' | 'inactive';

export interface UsersViewProps {
  venueId: string;
}
