import { ABORT_ERROR_NAME, HTTP_STATUS } from "../api/constants";
import type { UploadFile } from "../lib/media";
import type { RejectValue } from "../redux/types";
import {
  FAKE_UPLOAD_FAIL_AT,
  FAKE_UPLOAD_KEY_PREFIX,
  FAKE_UPLOAD_STEP,
  FAKE_UPLOAD_STEP_MS,
} from "./constants";
import { presentationText } from "./text";

export const createFakeUpload =
  ({ fails = false }: { fails?: boolean } = {}): UploadFile =>
  (file, onProgress, signal) =>
    new Promise((resolve, reject) => {
      let progress = 0;

      const timer = window.setInterval(() => {
        progress = Math.min(1, progress + FAKE_UPLOAD_STEP);
        onProgress(progress);

        if (fails && progress >= FAKE_UPLOAD_FAIL_AT) {
          window.clearInterval(timer);
          const failure: RejectValue = {
            message: presentationText.inputs.imageUpload.failure,
            status: HTTP_STATUS.NETWORK_FAILURE,
            endsSession: false,
          };
          reject(failure);
          return;
        }

        if (progress >= 1) {
          window.clearInterval(timer);
          resolve({ key: `${FAKE_UPLOAD_KEY_PREFIX}${file.name}` });
        }
      }, FAKE_UPLOAD_STEP_MS);

      signal.addEventListener(
        "abort",
        () => {
          window.clearInterval(timer);
          reject(new DOMException(file.name, ABORT_ERROR_NAME));
        },
        { once: true },
      );
    });
