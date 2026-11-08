import { ADMIN_ROLE_LABELS, type AdminUserDto } from "../api/types";
import { format, text } from "../i18n";
import { DAYS_PER_WEEK, YEAR_SHORT_DIGITS } from "./constants";
import { fromDateKey, pad2, to12Hour, toTimeKey } from "./date";
import { ACTIVE_CONVENTIONS } from "./language";

const parseIso = (iso: string | null): Date | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTime = (date: Date): string => {
  const { hour, period } = to12Hour(toTimeKey(date));

  return format(text.format.time, {
    hour: ACTIVE_CONVENTIONS.uses24HourClock ? pad2(date.getHours()) : hour,
    minute: pad2(date.getMinutes()),
    period: period === "AM" ? text.datePicker.am : text.datePicker.pm,
  });
};

const formatPattern = (pattern: string, date: Date): string =>
  format(pattern, {
    day: date.getDate(),
    dayPadded: pad2(date.getDate()),
    monthNumber: date.getMonth() + 1,
    monthPadded: pad2(date.getMonth() + 1),
    month: text.format.months[date.getMonth()],
    monthShort: text.format.monthsShort[date.getMonth()],
    year: date.getFullYear(),
    yearShort: String(date.getFullYear()).slice(-YEAR_SHORT_DIGITS),
  });

const withTime = (datePattern: string, date: Date): string =>
  format(text.format.dateTime, {
    date: formatPattern(datePattern, date),
    time: formatTime(date),
  });

export const formatDateTime = (iso: string | null): string => {
  const date = parseIso(iso);
  return date ? withTime(text.format.dayMonthYear, date) : text.common.empty;
};

export const formatShortDateTime = (iso: string, includeTime: boolean): string => {
  const date = parseIso(iso);
  if (!date) return "";

  return includeTime
    ? withTime(text.format.shortDate, date)
    : formatPattern(text.format.shortDate, date);
};

export const formatMonthYear = (year: number, month: number): string =>
  formatPattern(text.format.monthYear, new Date(year, month, 1));

export const formatMonthName = (month: number): string =>
  text.format.monthsShort[month];

export const formatWeekdayNames = (): string[] =>
  Array.from(
    { length: DAYS_PER_WEEK },
    (_, offset) =>
      text.format.weekdaysShort[
        (ACTIVE_CONVENTIONS.weekStartsOn + offset) % DAYS_PER_WEEK
      ],
  );

export const formatDateRange = (fromKey: string, toKey: string): string => {
  const start = fromDateKey(fromKey);
  const end = fromDateKey(toKey);
  const dayMonthYear = (date: Date) =>
    formatPattern(text.format.dayMonthYear, date);

  if (!start && !end) return "";
  if (!start) return end ? dayMonthYear(end) : "";
  if (!end) return dayMonthYear(start);

  if (start.getTime() === end.getTime()) return dayMonthYear(start);

  const startLabel =
    start.getFullYear() === end.getFullYear()
      ? formatPattern(text.format.dayMonth, start)
      : dayMonthYear(start);

  return format(text.format.dateRange, {
    from: startLabel,
    to: dayMonthYear(end),
  });
};

export const formatDate = (iso: string | null): string => {
  const date = parseIso(iso);
  return date ? formatPattern(text.format.longDate, date) : text.common.empty;
};

export const formatAdminRole = (
  user: AdminUserDto | null,
  isSuperAdmin: boolean,
): string => {
  if (isSuperAdmin) return text.common.superAdmin;
  if (!user) return text.common.empty;
  return user.role?.name ?? ADMIN_ROLE_LABELS[user.adminRole];
};
