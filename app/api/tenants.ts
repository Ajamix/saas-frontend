import AuthClient from './auth-client';

export interface TenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: TenantUser[];
}

export interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getTenants = async (params: GetTenantsParams = {}): Promise<TenantsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  return AuthClient.get(`/tenants?${searchParams.toString()}`);
};

export const getTenant = async (id: string): Promise<Tenant> => {
  return AuthClient.get(`/tenants/${id}`);
};

export const updateTenant = async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
  return AuthClient.patch(`/tenants/${id}`, data);
};

export const deleteTenant = async (id: string): Promise<void> => {
  return AuthClient.delete(`/tenants/${id}`);
}; 