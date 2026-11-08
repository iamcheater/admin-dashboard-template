import { text } from "../i18n";

export const PERMISSIONS = [
  "ADMINS_INVITE",
  "ADMINS_MANAGE",
  "ROLES_MANAGE",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> =
  text.domain.permissions;

export const ADMIN_ROLES = ["ADMIN", "MANAGER"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> =
  text.domain.adminRoles;

export const ADMINS_SORT_BY = {
  CREATED_AT: "createdAt",
  EMAIL: "email",
  FULL_NAME: "fullName",
} as const;

export type AdminsSortBy = (typeof ADMINS_SORT_BY)[keyof typeof ADMINS_SORT_BY];

export interface RoleDto {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
  adminRole: AdminRole;
  role: RoleDto | null;
  invitedBy: string | null;
  createdAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  expiresIn: string;
}

export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export type ContentLanguage = string;

export type TranslatedText = Partial<Record<ContentLanguage, string>>;

export type TranslatedTextPatch = Partial<Record<ContentLanguage, string>>;
