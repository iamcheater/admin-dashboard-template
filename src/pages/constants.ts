import { ADMINS_SORT_BY } from "../api/types";

export const ADMINS_PAGE_SIZE = 20;
export const ADMINS_DEFAULT_SORT_BY = ADMINS_SORT_BY.CREATED_AT;

export const ADMIN_DIALOG = {
  INVITE: "invite",
  DELETE: "delete",
  CHANGE_ROLE: "change-role",
} as const;

export type AdminDialog = (typeof ADMIN_DIALOG)[keyof typeof ADMIN_DIALOG];

export const ADMINS_COLUMN_WIDTH = {
  NAME: "25%",
  EMAIL: "30%",
  ROLE: "15%",
  CREATED: "20%",
} as const;

export const ACCOUNT_DIALOG = {
  NAME: "name",
  PASSWORD: "password",
  LOGOUT: "logout",
} as const;

export type AccountDialog = (typeof ACCOUNT_DIALOG)[keyof typeof ACCOUNT_DIALOG];

export const ACCOUNT_FACT_SKELETON_COUNT = 4;
