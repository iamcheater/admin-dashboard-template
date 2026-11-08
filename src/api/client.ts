import { clearSession, getToken } from "../auth/session";
import { format, text } from "../i18n";
import {
  ABORT_ERROR_NAME,
  DEFAULT_API_BASE_URL,
  HTTP_STATUS,
} from "./constants";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly endsSession: boolean;

  constructor(status: number, message: string, endsSession = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endsSession = endsSession;
  }
}

export const isAbortCause = (cause: unknown): boolean =>
  typeof cause === "object" &&
  cause !== null &&
  (cause as { name?: unknown }).name === ABORT_ERROR_NAME;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  anonymous?: boolean;
  verifiesPassword?: boolean;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    anonymous = false,
    verifiesPassword = false,
    signal,
  } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (!anonymous) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new ApiError(HTTP_STATUS.NETWORK_FAILURE, text.api.unreachable);
  }

  if (
    response.status === HTTP_STATUS.UNAUTHORIZED &&
    !anonymous &&
    !verifiesPassword
  ) {
    const message = (await readErrorMessage(response)) || text.api.sessionEnded;

    clearSession();
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, message, true);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === HTTP_STATUS.NO_CONTENT) return undefined as T;

  const rawBody = await response.text();
  return (rawBody ? JSON.parse(rawBody) : undefined) as T;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(payload.message)) return payload.message.join(". ");
    return payload.message ?? payload.error ?? response.statusText;
  } catch {
    return (
      response.statusText ||
      format(text.api.requestFailedWithStatus, { status: response.status })
    );
  }
}

export type QueryValue = string | number | boolean | string[] | undefined;

export function toQueryString(query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;

    if (Array.isArray(value)) {
      for (const entry of value) if (entry) params.append(key, entry);
      continue;
    }

    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
