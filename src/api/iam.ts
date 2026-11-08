import { request, toQueryString } from "./client";
import type {
  AdminRole,
  AdminsSortBy,
  AdminUserDto,
  LoginResponseDto,
  PaginatedDto,
} from "./types";
import type { SortOrder } from "../lib/constants";

export const login = (email: string, password: string) =>
  request<LoginResponseDto>("/auth/login", {
    method: "POST",
    body: { email, password },
    anonymous: true,
  });

export const requestPasswordReset = (email: string) =>
  request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    anonymous: true,
  });

export const resetPassword = (token: string, password: string) =>
  request<void>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
    anonymous: true,
  });

export const checkResetToken = (token: string, signal?: AbortSignal) =>
  request<void>(`/auth/reset-password/check${toQueryString({ token })}`, {
    anonymous: true,
    signal,
  });

export const changePassword = (currentPassword: string, newPassword: string) =>
  request<LoginResponseDto>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
    verifiesPassword: true,
  });

export const getMe = (signal?: AbortSignal) =>
  request<AdminUserDto>("/auth/me", { signal });

export const updateAccount = (fullName: string) =>
  request<AdminUserDto>("/auth/me", { method: "PATCH", body: { fullName } });

export interface AdminsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: AdminsSortBy;
  sortOrder?: SortOrder;
}

export interface InviteAdminBody {
  email: string;
  password: string;
  fullName?: string;
  role?: AdminRole;
}

export const listAdmins = (query: AdminsQuery, signal?: AbortSignal) =>
  request<PaginatedDto<AdminUserDto>>(`/admins${toQueryString({ ...query })}`, {
    signal,
  });

export const inviteAdmin = (body: InviteAdminBody) =>
  request<AdminUserDto>("/admins/invite", { method: "POST", body });

export const deleteAdmin = (id: string) =>
  request<void>(`/admins/${id}`, { method: "DELETE" });

export const updateAdminRole = (id: string, role: AdminRole) =>
  request<AdminUserDto>(`/admins/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
