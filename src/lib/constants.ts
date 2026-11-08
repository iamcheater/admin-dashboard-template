export const PATHNAMES = {
  ROOT: "/",
  CATCH_ALL: "*",

  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",
  ADMINS: "/admins",
  ACCOUNT: "/account",
} as const;

export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MILLISECONDS_PER_MINUTE =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_HALF_DAY = 12;

export const TOAST_AUTO_CLOSE_MS = {
  success: 3 * MILLISECONDS_PER_SECOND,
  info: 4 * MILLISECONDS_PER_SECOND,
  warning: 5 * MILLISECONDS_PER_SECOND,
  error: 6 * MILLISECONDS_PER_SECOND,
} as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const REGEX_PATTERN = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
  HTTPS_URL: /^https:\/\/[^\s]+$/i,
  PHONE: /^\+[1-9]\d{7,14}$/,
} as const;

export const SCROLL_TOP = 0;

export const DATE_KEY_PARTS = 3;
export const DATE_KEY_PAD = 2;
export const DAYS_PER_WEEK = 7;
export const MONTHS_PER_YEAR = 12;
export const LAST_MONTH_INDEX = MONTHS_PER_YEAR - 1;
export const DEFAULT_TIME_KEY = "12:00";
export const MIDNIGHT_TIME_KEY = "00:00";

export const PAGE_SEARCH_PARAM = "page";
export const SEARCH_SEARCH_PARAM = "search";
export const VIEW_SEARCH_PARAM = "view";
export const RESET_TOKEN_SEARCH_PARAM = "token";
export const TOGGLE_ON = "true";
export const SEARCH_DEBOUNCE_MS = 400;
export const SORT_BY_SEARCH_PARAM = "sortBy";
export const SORT_ORDER_SEARCH_PARAM = "sortOrder";

export const SORT_ORDER = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
export const FIRST_PAGE = 1;
export const PAGINATION_GAP = "gap";
export const PAGINATION_ALL_PAGES_THRESHOLD = 7;
export const PAGINATION_EDGE_PAGE_COUNT = 3;
export const PAGINATION_BOUNDARY_PAGE_COUNT = 2;

export const DATE_KEY_LENGTH = 10;
