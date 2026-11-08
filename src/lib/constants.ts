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
export const HOURS_PER_DAY = 24;

export const TOAST_AUTO_CLOSE_MS = {
  success: 3 * MILLISECONDS_PER_SECOND,
  info: 4 * MILLISECONDS_PER_SECOND,
  warning: 5 * MILLISECONDS_PER_SECOND,
  error: 6 * MILLISECONDS_PER_SECOND,
} as const;

export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";
export const THEME_STORAGE_KEY = "admin-dashboard.theme";

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];

export const ADMIN_LANGUAGE_STORAGE_KEY = "admin-dashboard.language";

export const ADMIN_LANGUAGE = {
  EN: "en",
  HY: "hy",
} as const;

export type AdminLanguage =
  (typeof ADMIN_LANGUAGE)[keyof typeof ADMIN_LANGUAGE];

export const CONTENT_LANGUAGE_SEPARATOR = ",";
export const FALLBACK_CONTENT_LANGUAGES: readonly string[] = ["hy", "en", "ru"];

export const WEEKDAY = {
  SUNDAY: 0,
  MONDAY: 1,
} as const;

export interface LanguageConventions {
  weekStartsOn: number;
  uses24HourClock: boolean;
}

export const LANGUAGE_CONVENTIONS: Record<AdminLanguage, LanguageConventions> =
  {
    [ADMIN_LANGUAGE.EN]: {
      weekStartsOn: WEEKDAY.SUNDAY,
      uses24HourClock: false,
    },
    [ADMIN_LANGUAGE.HY]: {
      weekStartsOn: WEEKDAY.MONDAY,
      uses24HourClock: true,
    },
  };

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

export const PERCENT = 100;
export const FILE_SIZE_DECIMALS = 1;
export const CONTENT_TYPE_SEPARATOR = ", ";

export const DATE_KEY_LENGTH = 10;
export const YEAR_SHORT_DIGITS = 2;
