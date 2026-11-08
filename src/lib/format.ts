import { ADMIN_ROLE_LABELS, type AdminUserDto } from "../api/types";
import { format, text } from "../i18n";
import { fromDateKey } from "./date";

const parseIso = (iso: string | null): Date | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatIso = (formatter: Intl.DateTimeFormat, iso: string | null) => {
  const date = parseIso(iso);
  return date ? formatter.format(date) : text.common.empty;
};

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (iso: string | null): string =>
  formatIso(dateTime, iso);

const dayMonth = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

const dayMonthYear = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYear = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const monthName = new Intl.DateTimeFormat(undefined, { month: "short" });

const shortDateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});

const shortDate = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });

export const formatShortDateTime = (iso: string, withTime: boolean): string => {
  const date = parseIso(iso);
  if (!date) return "";

  return withTime ? shortDateTime.format(date) : shortDate.format(date);
};

export const formatMonthYear = (year: number, month: number): string =>
  monthYear.format(new Date(year, month, 1));

export const formatMonthName = (year: number, month: number): string =>
  monthName.format(new Date(year, month, 1));

export const formatDateRange = (fromKey: string, toKey: string): string => {
  const start = fromDateKey(fromKey);
  const end = fromDateKey(toKey);

  if (!start && !end) return "";
  if (!start) return dayMonthYear.format(end as Date);
  if (!end) return dayMonthYear.format(start);

  if (start.getTime() === end.getTime()) return dayMonthYear.format(start);

  const startLabel =
    start.getFullYear() === end.getFullYear()
      ? dayMonth.format(start)
      : dayMonthYear.format(start);

  return format(text.format.dateRange, {
    from: startLabel,
    to: dayMonthYear.format(end),
  });
};

const longDate = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

export const formatDate = (iso: string | null): string =>
  formatIso(longDate, iso);

export const formatAdminRole = (
  user: AdminUserDto | null,
  isSuperAdmin: boolean,
): string => {
  if (isSuperAdmin) return text.common.superAdmin;
  if (!user) return text.common.empty;
  return user.role?.name ?? ADMIN_ROLE_LABELS[user.adminRole];
};
