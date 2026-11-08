import { createSlice } from "@reduxjs/toolkit";
import type { AdminUserDto } from "../../api/types";
import { getToken, restoreClaims, type TokenClaims } from "../../auth/session";
import {
  changePassword,
  checkResetToken,
  getProfile,
  login,
  requestPasswordReset,
  resetPassword,
  signOut,
  updateAccount,
} from "../actions/auth";

type ResetTokenStatus = "idle" | "checking" | "valid" | "invalid";

interface AuthState {
  claims: TokenClaims | null;
  user: AdminUserDto | null;
  isRestoring: boolean;
  loginLoading: boolean;
  profileLoading: boolean;
  changePasswordLoading: boolean;
  updateAccountLoading: boolean;
  forgotPasswordLoading: boolean;
  resetPasswordLoading: boolean;
  checkedResetToken: string | null;
  resetTokenStatus: ResetTokenStatus;
  resetTokenError: string | null;
}

const initialState: AuthState = {
  claims: restoreClaims(),
  user: null,
  isRestoring: getToken() !== null,
  loginLoading: false,
  profileLoading: false,
  changePasswordLoading: false,
  updateAccountLoading: false,
  forgotPasswordLoading: false,
  resetPasswordLoading: false,
  checkedResetToken: null,
  resetTokenStatus: "idle",
  resetTokenError: null,
};

export const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.claims = null;
      state.user = null;
      state.isRestoring = false;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.claims = payload;
        state.loginLoading = false;
      })
      .addCase(login.rejected, (state) => {
        state.loginLoading = false;
      });

    builder
      .addCase(getProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isRestoring = false;
        state.profileLoading = false;
      })
      .addCase(getProfile.rejected, (state, { meta }) => {
        if (meta.aborted) return;
        state.isRestoring = false;
        state.profileLoading = false;
      });

    builder.addCase(signOut.fulfilled, (state) => {
      state.claims = null;
      state.user = null;
      state.isRestoring = false;
    });

    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        state.claims = payload;
        state.changePasswordLoading = false;
      })
      .addCase(changePassword.rejected, (state) => {
        state.changePasswordLoading = false;
      });

    builder
      .addCase(updateAccount.pending, (state) => {
        state.updateAccountLoading = true;
      })
      .addCase(updateAccount.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.updateAccountLoading = false;
      })
      .addCase(updateAccount.rejected, (state) => {
        state.updateAccountLoading = false;
      });

    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.forgotPasswordLoading = true;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
      })
      .addCase(requestPasswordReset.rejected, (state) => {
        state.forgotPasswordLoading = false;
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.claims = null;
        state.user = null;
        state.resetPasswordLoading = false;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.resetPasswordLoading = false;
      });

    builder
      .addCase(checkResetToken.pending, (state, { meta }) => {
        state.checkedResetToken = meta.arg.token;
        state.resetTokenStatus = "checking";
        state.resetTokenError = null;
      })
      .addCase(checkResetToken.fulfilled, (state, { meta }) => {
        if (meta.arg.token !== state.checkedResetToken) return;
        state.resetTokenStatus = "valid";
      })
      .addCase(checkResetToken.rejected, (state, { payload, meta }) => {
        if (meta.aborted || meta.arg.token !== state.checkedResetToken) return;
        state.resetTokenStatus = "invalid";
        state.resetTokenError = payload?.message ?? null;
      });
  },
});

export const { sessionExpired } = authSlice.actions;

export default authSlice.reducer;
