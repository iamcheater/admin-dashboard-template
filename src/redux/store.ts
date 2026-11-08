import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { uploadMedia } from "./actions/media";
import adminsReducer from "./features/admins";
import authReducer from "./features/auth";
import mediaReducer from "./features/media";
import { listenerMiddleware } from "./listeners";

const store = configureStore({
  reducer: {
    adminsReducer,
    authReducer,
    mediaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          uploadMedia.pending.type,
          uploadMedia.fulfilled.type,
          uploadMedia.rejected.type,
        ],
      },
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
