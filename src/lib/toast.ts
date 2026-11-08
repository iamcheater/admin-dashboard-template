import type { ReactNode } from "react";
import { toast } from "react-toastify";
import { isAbortCause } from "../api/client";
import { HTTP_STATUS } from "../api/constants";
import { isRejectValue } from "../redux/types";
import { TOAST_AUTO_CLOSE_MS } from "./constants";

export const notifySuccess = (message: ReactNode): void => {
  toast.success(message, { autoClose: TOAST_AUTO_CLOSE_MS.success });
};

export const notifyInfo = (message: ReactNode): void => {
  toast.info(message, { autoClose: TOAST_AUTO_CLOSE_MS.info });
};

export const notifyWarning = (message: ReactNode): void => {
  toast.warning(message, { autoClose: TOAST_AUTO_CLOSE_MS.warning });
};

export const notifyError = (message: ReactNode): void => {
  toast.error(message, { autoClose: TOAST_AUTO_CLOSE_MS.error });
};

export const notifyFailure = (cause: unknown, fallback: string): void => {
  if (isAbortCause(cause)) return;

  if (!isRejectValue(cause)) {
    notifyError(fallback);
    return;
  }

  if (cause.endsSession || cause.status === HTTP_STATUS.REQUEST_ABORTED) return;

  notifyError(cause.message || fallback);
};
