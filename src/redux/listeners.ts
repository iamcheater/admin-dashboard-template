import { createListenerMiddleware, isRejectedWithValue } from "@reduxjs/toolkit";
import { notifyWarning } from "../lib/toast";
import { sessionExpired } from "./features/auth";
import { isRejectValue } from "./types";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: (action, api) => {
    if (!isRejectValue(action.payload) || !action.payload.endsSession) return;

    api.dispatch(sessionExpired());
    notifyWarning(action.payload.message);
  },
});
