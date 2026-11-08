import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UploadPurpose } from "../../api/constants";
import {
  presignUpload,
  uploadToStorage,
  type UploadProgressListener,
} from "../../api/media";
import type { UploadedMedia } from "../../api/types";
import { toRejectValue, type RejectValue } from "../types";

export interface UploadMediaArg {
  file: File;
  purpose: UploadPurpose;
  onProgress: UploadProgressListener;
}

export const uploadMedia = createAsyncThunk<
  UploadedMedia,
  UploadMediaArg,
  { rejectValue: RejectValue }
>(
  "media/upload",
  async ({ file, purpose, onProgress }, { signal, rejectWithValue }) => {
    try {
      const { key, uploadUrl } = await presignUpload(
        { purpose, contentType: file.type, fileSize: file.size },
        signal,
      );
      await uploadToStorage(uploadUrl, file, onProgress, signal);
      return { key };
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);
