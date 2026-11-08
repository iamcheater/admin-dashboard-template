import type { ComponentProps } from "react";
import type { Button } from "../components/ui";

export type ButtonVariant = NonNullable<
  ComponentProps<typeof Button>["variant"]
>;

export const PRESENTATION_PATHNAMES = {
  LOGIN: "/showcase/sign-in",
  FORGOT_PASSWORD: "/showcase/forgot-password",
  RESET_PASSWORD: "/showcase/reset-password",
  BUTTONS: "/showcase/buttons",
  INPUTS: "/showcase/inputs",
  MODALS: "/showcase/modals",
  ICONS: "/showcase/icons",
  TABLES: "/showcase/tables",
} as const;

export const BUTTON_VARIANTS: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "danger",
  "danger-outline",
  "danger-soft",
  "danger-solid",
  "warning-solid",
];

export const SAMPLE_OPTION_VALUES = ["admin", "manager", "viewer", "auditor"];

export const SAMPLE_RANGE_PARAMS = {
  FROM: "createdFrom",
  TO: "createdTo",
} as const;

export const SAMPLE_SORT_BY = {
  NAME: "name",
  EMAIL: "email",
  CREATED_AT: "createdAt",
} as const;

export type SampleSortBy = (typeof SAMPLE_SORT_BY)[keyof typeof SAMPLE_SORT_BY];

export const SAMPLE_PAGE_SIZE = 5;
export const SAMPLE_STATE_ROW_COUNT = 3;

export const SAMPLE_COLUMN_WIDTH = {
  NAME: "16%",
  EMAIL: "22%",
  ROLE: "14%",
  NOTE: "20%",
  CREATED: "18%",
} as const;

export const MODAL_DEMO = {
  CONFIRM: "confirm",
  DANGER: "danger",
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
  FORM: "form",
} as const;

export type ModalDemo = (typeof MODAL_DEMO)[keyof typeof MODAL_DEMO];
