import { createSlice } from "@reduxjs/toolkit";
import { uploadMedia } from "../actions/media";

interface MediaState {
  uploadsInProgress: number;
}

const initialState: MediaState = {
  uploadsInProgress: 0,
};

export const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.uploadsInProgress += 1;
      })
      .addCase(uploadMedia.fulfilled, (state) => {
        state.uploadsInProgress -= 1;
      })
      .addCase(uploadMedia.rejected, (state) => {
        state.uploadsInProgress -= 1;
      });
  },
});

export default mediaSlice.reducer;
