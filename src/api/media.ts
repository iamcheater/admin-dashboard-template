import { text } from "../i18n";
import { ApiError, request } from "./client";
import { ABORT_ERROR_NAME, HTTP_STATUS, type UploadPurpose } from "./constants";
import type { PresignedUploadDto } from "./types";

export interface PresignUploadBody {
  purpose: UploadPurpose;
  contentType: string;
  fileSize: number;
}

export type UploadProgressListener = (fraction: number) => void;

export const presignUpload = (body: PresignUploadBody, signal?: AbortSignal) =>
  request<PresignedUploadDto>("/media/presign", {
    method: "POST",
    body,
    signal,
  });

const isSuccessStatus = (status: number) =>
  status >= HTTP_STATUS.OK && status < HTTP_STATUS.MULTIPLE_CHOICES;

export const uploadToStorage = (
  uploadUrl: string,
  file: File,
  onProgress: UploadProgressListener,
  signal?: AbortSignal,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const abortError = () =>
      new DOMException(text.api.requestFailed, ABORT_ERROR_NAME);

    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };

    xhr.onload = () => {
      signal?.removeEventListener("abort", abort);

      if (!isSuccessStatus(xhr.status)) {
        reject(new ApiError(xhr.status, text.api.storageFailed));
        return;
      }

      onProgress(1);
      resolve();
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", abort);
      reject(
        new ApiError(HTTP_STATUS.NETWORK_FAILURE, text.api.storageUnreachable),
      );
    };

    xhr.onabort = () => reject(abortError());

    signal?.addEventListener("abort", abort, { once: true });
    xhr.send(file);
  });
