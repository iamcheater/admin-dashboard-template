import type { Permission } from "../api/types";
import { MILLISECONDS_PER_SECOND } from "../lib/constants";
import { JWT_PAYLOAD_SEGMENT_INDEX, TOKEN_STORAGE_KEY } from "./constants";

export interface TokenClaims {
  sub: string;
  isSuperAdmin: boolean;
  permissions: Permission[];
  exp?: number;
}

let currentToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);

export const getToken = (): string | null => currentToken;

export function setSession(token: string): void {
  currentToken = token;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearSession(): void {
  currentToken = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function decodeToken(token: string): TokenClaims | null {
  const payload = token.split(".")[JWT_PAYLOAD_SEGMENT_INDEX];
  if (!payload) return null;

  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as Partial<TokenClaims>;

    if (typeof claims.sub !== "string") return null;

    return {
      sub: claims.sub,
      isSuperAdmin: claims.isSuperAdmin === true,
      permissions: Array.isArray(claims.permissions) ? claims.permissions : [],
      exp: typeof claims.exp === "number" ? claims.exp : undefined,
    };
  } catch {
    return null;
  }
}

const isExpired = (claims: TokenClaims): boolean =>
  claims.exp !== undefined &&
  claims.exp * MILLISECONDS_PER_SECOND <= Date.now();

export function restoreClaims(): TokenClaims | null {
  const token = getToken();
  if (!token) return null;

  const claims = decodeToken(token);
  if (!claims || isExpired(claims)) {
    clearSession();
    return null;
  }

  return claims;
}

export const grants = (
  claims: TokenClaims | null,
  permission: Permission,
): boolean => {
  if (!claims) return false;
  return claims.isSuperAdmin || claims.permissions.includes(permission);
};
