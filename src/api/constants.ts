export const HTTP_STATUS = {
  REQUEST_ABORTED: -1,
  NETWORK_FAILURE: 0,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;

export const ABORT_ERROR_NAME = "AbortError";

export const FIELD_LIMITS = {
  fullNameMax: 255,
  searchMax: 100,
  passwordMin: 8,
  passwordMax: 128,
} as const;

export const DEFAULT_API_BASE_URL = "http://localhost:3000";
