import { createSlice } from "@reduxjs/toolkit";
import type { AdminUserDto, PaginationMetaDto } from "../../api/types";
import {
  deleteAdmin,
  inviteAdmin,
  listAdmins,
  updateAdminRole,
} from "../actions/admins";

interface AdminsState {
  admins: AdminUserDto[];
  meta: PaginationMetaDto | null;
  listError: string | null;
  listLoading: boolean;
  inviteLoading: boolean;
  deleteLoading: boolean;
  updateRoleLoading: boolean;
}

const initialState: AdminsState = {
  admins: [],
  meta: null,
  listError: null,
  listLoading: false,
  inviteLoading: false,
  deleteLoading: false,
  updateRoleLoading: false,
};

export const adminsSlice = createSlice({
  name: "Admins",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(listAdmins.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(listAdmins.fulfilled, (state, { payload }) => {
        state.admins = payload.data;
        state.meta = payload.meta;
        state.listLoading = false;
      })
      .addCase(listAdmins.rejected, (state, { payload, meta }) => {
        if (meta.aborted) return;
        state.listError = payload?.message ?? null;
        state.listLoading = false;
      });

    builder
      .addCase(inviteAdmin.pending, (state) => {
        state.inviteLoading = true;
      })
      .addCase(inviteAdmin.fulfilled, (state) => {
        state.inviteLoading = false;
      })
      .addCase(inviteAdmin.rejected, (state) => {
        state.inviteLoading = false;
      });

    builder
      .addCase(deleteAdmin.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteAdmin.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deleteAdmin.rejected, (state) => {
        state.deleteLoading = false;
      });

    builder
      .addCase(updateAdminRole.pending, (state) => {
        state.updateRoleLoading = true;
      })
      .addCase(updateAdminRole.fulfilled, (state) => {
        state.updateRoleLoading = false;
      })
      .addCase(updateAdminRole.rejected, (state) => {
        state.updateRoleLoading = false;
      });
  },
});

export default adminsSlice.reducer;
