export const ICON_VIEW_BOX = "0 0 24 24";
export const ICON_VIEW_BOX_SMALL = "0 0 14 14";
export const ICON_VIEW_BOX_SMALL_SQUARE = "0 0 20 20";
export const CHECK_CIRCLE_ICON_CROPPED_VIEW_BOX = "1 1 14 14";
export const EDIT_ICON_SMALL_CROPPED_VIEW_BOX = "2.043 2 12 12";
export const LINK_ICON_CROPPED_VIEW_BOX = "0.863 0.864 14.273 14.273";
export const TRASH_ICON_CROPPED_VIEW_BOX = "1.875 1.875 11.25 11.25";
export const LOCK_ICON_STROKE_WIDTH = 1.33266;
export const ADMINS_ICON_STROKE_WIDTH = 1.19939;
export const ARROW_ICON_STROKE_WIDTH = 1.6;
export const SEARCH_ICON_STROKE_WIDTH = 1.0829;
export const CLOSE_ICON_STROKE_WIDTH = 1.5;
export const POPUP_WIDTH = 250;
export const DROPDOWN_MENU_GAP = 4;
export const ROW_MENU_GAP = 4;
export const POPUP_GAP = 12;
export const POPUP_VIEWPORT_MARGIN = 16;
export const DATE_PICKER_GAP = 4;
export const TIME_FIELD_MAX_LENGTH = 2;
export const TOOLTIP_BUBBLE_MAX_WIDTH = 280;
export const TOOLTIP_GAP = 2;
export const TRUNCATED_TOOLTIP_GAP = 10;
export const TRUNCATED_TOOLTIP_TAIL_INSET = 24;
export const ICON_VIEW_BOX_15 = "0 0 15 15";
export const WARNING_ICON_VIEW_BOX = "0 0 20 20";
export const COPY_ICON_STROKE_WIDTH = 1.40625;
export const KEBAB_ICON_STROKE_WIDTH = 1.5;
export const CHEVRON_ICON_STROKE_WIDTH = 1.16585;
export const LOGOUT_ICON_VIEW_BOX = "15 15 22 22";
export const LOGOUT_ICON_STROKE_WIDTH = 2.27;
export const ICON_STROKE_WIDTH = 1.8;
export const SMALL_OUTLINE_ICON_STROKE_WIDTH = 1.4;

export const LOGO_SRC_LIGHT = "/images/logo-light.png";
export const LOGO_SRC_DARK = "/images/logo-dark.png";
export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";

export const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export const KEYBOARD_KEY = {
  ESCAPE: "Escape",
  TAB: "Tab",
  ENTER: "Enter",
  SPACE: " ",
  ARROW_DOWN: "ArrowDown",
  ARROW_UP: "ArrowUp",
  HOME: "Home",
  END: "End",
} as const;

export const AUTH_BACKGROUND_VIDEO_SRC = "/videos/auth-background.mp4";

export const TABLE_SKELETON_ROW_COUNT = 20;
export const OPTION_LIST_SKELETON_ROW_COUNT = 3;

export const MODAL_SIZE = {
  DEFAULT: "default",
  WIDE: "wide",
} as const;

export type ModalSize = (typeof MODAL_SIZE)[keyof typeof MODAL_SIZE];

export const AUTH_BACKGROUND_TYPE = {
  VIDEO: "video",
  PLAIN: "plain",
} as const;

export type AuthBackground =
  (typeof AUTH_BACKGROUND_TYPE)[keyof typeof AUTH_BACKGROUND_TYPE];

