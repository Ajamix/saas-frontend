import AuthClient from './auth-client';

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  tenantId: string;
  roles: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    description: string;
    tenantId: string;
  }>;
  hasSetupProfile: boolean;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** Array of role UUIDs. Each value must be a valid UUID string */
  roleIds?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Array of role UUIDs. Each value must be a valid UUID string */
  roleIds?: string[];
  isActive?: boolean;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Get all users with pagination and search
export const getUsers = async (params: GetUsersParams = {}): Promise<UsersResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  return AuthClient.get(`/users?${searchParams.toString()}`);
};

// Get a specific user
export const getUser = async (id: string): Promise<User> => {
  return AuthClient.get(`/users/${id}`);
};

// Create a new user
export const createUser = async (data: CreateUserDto): Promise<User> => {
  return AuthClient.post('/users', data);
};

// Update a user
export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  return AuthClient.patch(`/users/${id}`, data);
};

// Delete a user
export const deleteUser = async (id: string): Promise<void> => {
  return AuthClient.delete(`/users/${id}`);
}; 