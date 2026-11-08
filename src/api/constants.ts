export const HTTP_STATUS = {
  REQUEST_ABORTED: -1,
  NETWORK_FAILURE: 0,
  OK: 200,
  NO_CONTENT: 204,
  MULTIPLE_CHOICES: 300,
  UNAUTHORIZED: 401,
} as const;

export const ABORT_ERROR_NAME = "AbortError";

export const FIELD_LIMITS = {
  fullNameMax: 255,
  searchMax: 100,
  passwordMin: 8,
  passwordMax: 128,
  contentTitleMax: 200,
  contentTextMax: 5000,
} as const;

export const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const BYTES_PER_KILOBYTE = 1024;
export const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;

export const UPLOAD_PURPOSE = {
  AVATAR: "avatar",
  COVER: "cover",
  CONTENT: "content",
} as const;

export type UploadPurpose =
  (typeof UPLOAD_PURPOSE)[keyof typeof UPLOAD_PURPOSE];

export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface MediaLimits {
  contentTypes: readonly string[];
  maxBytes: number;
}

export const MEDIA_LIMITS: Record<UploadPurpose, MediaLimits> = {
  [UPLOAD_PURPOSE.AVATAR]: {
    contentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: 5 * BYTES_PER_MEGABYTE,
  },
  [UPLOAD_PURPOSE.COVER]: {
    contentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: 10 * BYTES_PER_MEGABYTE,
  },
  [UPLOAD_PURPOSE.CONTENT]: {
    contentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: 10 * BYTES_PER_MEGABYTE,
  },
};
