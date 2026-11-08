import {
  BYTES_PER_KILOBYTE,
  BYTES_PER_MEGABYTE,
  type MediaLimits,
} from "../api/constants";
import type { UploadProgressListener } from "../api/media";
import type { UploadedMedia } from "../api/types";
import { format, text } from "../i18n";
import { isRejectValue } from "../redux/types";
import {
  CONTENT_TYPE_SEPARATOR,
  FILE_SIZE_DECIMALS,
  PERCENT,
} from "./constants";

export type UploadFile = (
  file: File,
  onProgress: UploadProgressListener,
  signal: AbortSignal,
) => Promise<UploadedMedia>;

const roundSize = (value: number) => Number(value.toFixed(FILE_SIZE_DECIMALS));

export const formatFileSize = (bytes: number): string =>
  bytes >= BYTES_PER_MEGABYTE
    ? format(text.format.megabytes, {
        value: roundSize(bytes / BYTES_PER_MEGABYTE),
      })
    : format(text.format.kilobytes, {
        value: roundSize(bytes / BYTES_PER_KILOBYTE),
      });

export const formatContentTypes = (contentTypes: readonly string[]): string =>
  contentTypes
    .map((contentType) => contentType.slice(contentType.indexOf("/") + 1))
    .map((subtype) => subtype.toUpperCase())
    .join(CONTENT_TYPE_SEPARATOR);

export const describeMediaLimits = (limits: MediaLimits): string =>
  format(text.imageUpload.limits, {
    types: formatContentTypes(limits.contentTypes),
    size: formatFileSize(limits.maxBytes),
  });

export const describeImageFileProblem = (
  file: File,
  limits: MediaLimits,
): string | null => {
  if (!limits.contentTypes.includes(file.type)) {
    return format(text.imageUpload.wrongType, {
      types: formatContentTypes(limits.contentTypes),
    });
  }

  if (file.size > limits.maxBytes) {
    return format(text.imageUpload.tooLarge, {
      size: formatFileSize(limits.maxBytes),
    });
  }

  return null;
};

export const describeUploadFailure = (cause: unknown): string =>
  isRejectValue(cause) && cause.message
    ? cause.message
    : text.imageUpload.failed;

export const toPercent = (fraction: number): number =>
  Math.round(Math.min(1, Math.max(0, fraction)) * PERCENT);
