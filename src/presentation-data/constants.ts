import type { ComponentProps } from "react";
import type { Button } from "../components/ui";

export type ButtonVariant = NonNullable<
  ComponentProps<typeof Button>["variant"]
>;

export const SHOWCASE_ROOT = "/showcase";
export const SHOWCASE_ROUTE = "/showcase/*";

export const PRESENTATION_PATHNAMES = {
  WELCOME: "/showcase/welcome",
  LOGIN: "/showcase/sign-in",
  FORGOT_PASSWORD: "/showcase/forgot-password",
  RESET_PASSWORD: "/showcase/reset-password",
  BUTTONS: "/showcase/buttons",
  INPUTS: "/showcase/inputs",
  TABLES: "/showcase/tables",
  FILTERS: "/showcase/filter-bar",
  MODALS: "/showcase/modals",
  FEEDBACK: "/showcase/feedback",
  ICONS: "/showcase/icons",
  TOKENS: "/showcase/design-tokens",
  BRAND: "/showcase/brand",
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

export const SAMPLE_OPTION_VALUES = [
  "admin",
  "manager",
  "viewer",
  "auditor",
] as const;

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

export const FILTER_PARAMS = {
  ROLE: "role",
  STATUSES: "status",
  ARCHIVED: "archived",
  MINE: "mine",
} as const;

export const SAMPLE_STATUS_VALUES = ["active", "invited", "disabled"] as const;

export const VIEW_OPTION_VALUES = ["table", "cards", "timeline"] as const;

export const COLOR_TOKEN_GROUPS = {
  surfaces: [
    "bg",
    "surface",
    "surface-2",
    "surface-3",
    "chip-bg",
    "chip-bg-hover",
    "icon-button-bg",
    "table-header-bg",
  ],
  sidebar: [
    "sidebar-bg",
    "sidebar-fg",
    "sidebar-fg-strong",
    "sidebar-muted",
    "sidebar-active-bg",
    "sidebar-divider",
    "sidebar-heading",
  ],
  text: ["text", "text-secondary", "text-muted", "border", "border-strong"],
  accent: ["accent", "accent-hover", "accent-fg", "accent-soft"],
  status: [
    "success",
    "success-soft",
    "warning",
    "warning-hover",
    "warning-soft",
    "danger",
    "danger-hover",
    "danger-soft",
    "danger-soft-hover",
    "info",
    "info-soft",
  ],
  overlays: ["overlay", "modal-backdrop"],
} as const;

export const SCALE_TOKENS = {
  spacing: ["space-xs", "space-sm", "space-md", "space-lg"],
  radii: ["radius-sm", "radius", "radius-md", "radius-pill"],
  fontSizes: [
    "font-size-label",
    "font-size-xs",
    "font-size-sm",
    "font-size-base",
  ],
  shadows: ["shadow-sm", "shadow-md", "shadow-popover"],
  breakpoints: ["desktop", "laptop", "tablet", "mobile"],
  layers: ["raised", "backdrop", "drawer", "modal", "popup", "tooltip"],
} as const;

export const SKELETON_VARIANTS = [
  "text",
  "rectangular",
  "rounded",
  "circular",
] as const;

export const SKELETON_ANIMATIONS = ["wave", "pulse", false] as const;

export const BRAND_KEYS = ["accent", "success", "warning", "danger"] as const;

export type BrandKey = (typeof BRAND_KEYS)[number];

export const BRAND_STORAGE_KEY = "admin-dashboard.showcase-brand";
export const BRAND_STYLE_ELEMENT_ID = "showcase-brand";
export const LIGHT_THEME_PROBE_CLASS = "showcase-themes__column--light";

export const RGB_MAX = 255;
export const HEX_RADIX = 16;
export const HEX_CHANNEL_LENGTH = 2;
export const BLACK_RGB = [0, 0, 0] as const;
export const WHITE_RGB = [RGB_MAX, RGB_MAX, RGB_MAX] as const;

export const BRAND_MIX = {
  LIGHT_HOVER_TOWARD_BLACK: 0.18,
  DARK_BASE_TOWARD_WHITE: 0.22,
  DARK_HOVER_TOWARD_WHITE: 0.42,
  LIGHT_SOFT_ALPHA: 0.1,
  LIGHT_SOFT_HOVER_ALPHA: 0.3,
  DARK_SOFT_ALPHA: 0.18,
  DARK_SOFT_HOVER_ALPHA: 0.3,
  READABLE_LUMINANCE: 0.6,
} as const;

export const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const;
export const PREVIEW_TOTAL_PAGES = 5;

export const EXPLORE_TARGETS = {
  authScreens: "LOGIN",
  components: "BUTTONS",
  brand: "BRAND",
  foundations: "TOKENS",
} as const;

export const SHOWCASE_JSON_INDENT = 2;
