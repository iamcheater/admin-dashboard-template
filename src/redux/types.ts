import { ApiError, isAbortCause } from "../api/client";
import { HTTP_STATUS } from "../api/constants";
import { text } from "../i18n";

export interface RejectValue {
  message: string;
  status: number;
  endsSession: boolean;
}

export const isRejectValue = (value: unknown): value is RejectValue =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  "status" in value &&
  "endsSession" in value;

export const toRejectValue =(cause: unknown): RejectValue => {
  if (cause instanceof ApiError) {
    return {
      message: cause.message,
      status: cause.status,
      endsSession: cause.endsSession,
    };
  }

  if (isAbortCause(cause)) {
    return {
      message: text.api.requestFailed,
      status: HTTP_STATUS.REQUEST_ABORTED,
      endsSession: false,
    };
  }

  return {
    message: cause instanceof Error ? cause.message : text.api.requestFailed,
    status: HTTP_STATUS.NETWORK_FAILURE,
    endsSession: false,
  };
};
