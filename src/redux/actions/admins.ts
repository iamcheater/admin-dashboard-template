import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteAdmin as deleteAdminApi,
  inviteAdmin as inviteAdminApi,
  listAdmins as listAdminsApi,
  updateAdminRole as updateAdminRoleApi,
  type AdminsQuery,
  type InviteAdminBody,
} from "../../api/iam";
import type { AdminRole, AdminUserDto, PaginatedDto } from "../../api/types";
import { toRejectValue, type RejectValue } from "../types";

export const listAdmins = createAsyncThunk<
  PaginatedDto<AdminUserDto>,
  AdminsQuery,
  { rejectValue: RejectValue }
>("admins/list", async (query, { signal, rejectWithValue }) => {
  try {
    return await listAdminsApi(query, signal);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const inviteAdmin = createAsyncThunk<
  AdminUserDto,
  InviteAdminBody,
  { rejectValue: RejectValue }
>("admins/invite", async (body, { rejectWithValue }) => {
  try {
    return await inviteAdminApi(body);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const deleteAdmin = createAsyncThunk<
  void,
  string,
  { rejectValue: RejectValue }
>("admins/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteAdminApi(id);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const updateAdminRole = createAsyncThunk<
  AdminUserDto,
  { id: string; role: AdminRole },
  { rejectValue: RejectValue }
>("admins/updateRole", async ({ id, role }, { rejectWithValue }) => {
  try {
    return await updateAdminRoleApi(id, role);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});
