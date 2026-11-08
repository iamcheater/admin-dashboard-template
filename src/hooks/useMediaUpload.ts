import { useCallback } from "react";
import type { UploadPurpose } from "../api/constants";
import type { UploadFile } from "../lib/media";
import { uploadMedia } from "../redux/actions/media";
import { useAppDispatch } from "../redux/store";

export function useMediaUpload(purpose: UploadPurpose): UploadFile {
  const dispatch = useAppDispatch();

  return useCallback<UploadFile>(
    (file, onProgress, signal) => {
      const upload = dispatch(uploadMedia({ file, purpose, onProgress }));
      signal.addEventListener("abort", () => upload.abort(), { once: true });
      return upload.unwrap();
    },
    [dispatch, purpose],
  );
}
