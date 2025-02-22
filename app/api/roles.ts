import AuthClient from './auth-client';

export interface Permission {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  tenantId: string;
  isDefault: boolean;
  permissions: Permission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Get all roles for the current tenant
export const getRoles = async (): Promise<Role[]> => {
  return AuthClient.get('/roles');
};

// Get a specific role by ID
export const getRole = async (id: string): Promise<Role> => {
  return AuthClient.get(`/roles/${id}`);
};

// Create a new role
export const createRole = async (data: CreateRoleDto): Promise<Role> => {
  return AuthClient.post('/roles', data);
};

// Update a role
export const updateRole = async (id: string, data: UpdateRoleDto): Promise<Role> => {
  return AuthClient.patch(`/roles/${id}`, data);
};

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  return AuthClient.delete(`/roles/${id}`);
}; 