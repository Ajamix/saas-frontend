import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import TokenService from "./auth/tokens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PermissionAction = "read" | "create" | "update" | "delete";
export type ResourcePermissions = Record<string, PermissionAction[]>;

export function hasPermission(resource: string, action: PermissionAction): boolean {
  const token = TokenService.getAccessToken();
  if (!token) return false;

  const decodedToken = TokenService.decodeToken(token);
  if (!decodedToken?.permissions) return false;

  const permissions = decodedToken.permissions as ResourcePermissions;
  return permissions[resource]?.includes(action) ?? false;
}

export function hasAnyPermission(resource: string, actions: PermissionAction[]): boolean {
  return actions.some(action => hasPermission(resource, action));
}

export function hasAllPermissions(resource: string, actions: PermissionAction[]): boolean {
  return actions.every(action => hasPermission(resource, action));
} 