export interface LoginCredentials {
  email: string;
  password: string;
  subdomain?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenant: {
    tenantName: string;
    subdomain: string;
  };
} 