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
