import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  changePassword as changePasswordApi,
  checkResetToken as checkResetTokenApi,
  getMe,
  login as loginApi,
  requestPasswordReset as requestPasswordResetApi,
  resetPassword as resetPasswordApi,
  updateAccount as updateAccountApi,
} from "../../api/iam";
import type { AdminUserDto } from "../../api/types";
import {
  clearSession,
  decodeToken,
  setSession,
  type TokenClaims,
} from "../../auth/session";
import { text } from "../../i18n";
import { toRejectValue, type RejectValue } from "../types";

const applyToken = (accessToken: string): TokenClaims => {
  const claims = decodeToken(accessToken);
  if (!claims) throw new Error(text.auth.unreadableToken);

  setSession(accessToken);
  return claims;
};

export const login = createAsyncThunk<
  TokenClaims,
  { email: string; password: string },
  { rejectValue: RejectValue }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const { accessToken } = await loginApi(email, password);
    return applyToken(accessToken);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const getProfile = createAsyncThunk<
  AdminUserDto,
  void,
  { rejectValue: RejectValue }
>("auth/getProfile", async (_, { signal, rejectWithValue }) => {
  try {
    return await getMe(signal);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const signOut = createAsyncThunk<void, void>("auth/signOut", () => {
  clearSession();
});

export const updateAccount = createAsyncThunk<
  AdminUserDto,
  string,
  { rejectValue: RejectValue }
>("auth/updateAccount", async (fullName, { rejectWithValue }) => {
  try {
    return await updateAccountApi(fullName);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const changePassword = createAsyncThunk<
  TokenClaims,
  { currentPassword: string; newPassword: string },
  { rejectValue: RejectValue }
>(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { accessToken } = await changePasswordApi(
        currentPassword,
        newPassword,
      );
      return applyToken(accessToken);
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);

export const requestPasswordReset = createAsyncThunk<
  void,
  string,
  { rejectValue: RejectValue }
>("auth/requestPasswordReset", async (email, { rejectWithValue }) => {
  try {
    await requestPasswordResetApi(email);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: RejectValue }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    await resetPasswordApi(token, password);
    clearSession();
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const checkResetToken = createAsyncThunk<
  void,
  { token: string },
  { rejectValue: RejectValue }
>("auth/checkResetToken", async ({ token }, { signal, rejectWithValue }) => {
  try {
    await checkResetTokenApi(token, signal);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});
