import {
  DATE_KEY_LENGTH,
  DATE_KEY_PAD,
  DATE_KEY_PARTS,
  DAYS_PER_WEEK,
  HOURS_PER_HALF_DAY,
  MONTHS_PER_YEAR,
} from "./constants";

const pad = (value: number) => String(value).padStart(DATE_KEY_PAD, "0");

export const pad2 = pad;

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromDateKey = (key: string): Date | null => {
  const parts = key.split("-").map(Number);
  if (parts.length !== DATE_KEY_PARTS) return null;
  if (parts.some((part) => !Number.isInteger(part))) return null;

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const todayKey = (): string => toDateKey(new Date());

export const nowIso = (): string => new Date().toISOString();

export const isFutureIso = (iso: string, now = Date.now()): boolean =>
  Date.parse(iso) > now;

const LOCAL_PARTS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;

const zoneOffsetMs = (instant: number, timeZone: string): number => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      ...LOCAL_PARTS,
      second: "2-digit",
      timeZone,
    })
      .formatToParts(new Date(instant))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === 24 ? 0 : parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - instant;
};

export const instantFromLocal = (
  naive: string,
  timeZone: string | null,
): number => {
  if (!naive) return Number.NaN;
  if (!timeZone) return Date.parse(naive);

  const [date, clock = "00:00"] = naive.trim().split(/[T ]/);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second] = clock.split(":").map(Number);

  const guess = Date.UTC(year, month - 1, day, hour, minute, second || 0);
  const first = guess - zoneOffsetMs(guess, timeZone);

  return guess - zoneOffsetMs(first, timeZone);
};

export const toLocalDateTime = (
  iso: string,
  timeZone: string | null,
): string => {
  if (!iso) return "";
  if (!timeZone) return iso;

  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { ...LOCAL_PARTS, timeZone })
      .formatToParts(at)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const hour = parts.hour === "24" ? "00" : parts.hour;

  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:00`;
};

export const startOfDayIso = (key: string): string => {
  const date = fromDateKey(key);
  return date ? date.toISOString() : "";
};

export const endOfDayIso = (key: string): string => {
  const date = fromDateKey(key);
  if (!date) return "";

  const nextDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  );

  return new Date(nextDay.getTime() - 1).toISOString();
};

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const buildMonthGrid = (
  year: number,
  month: number,
  weekStartsOn: number,
): (Date | null)[] => {
  const leading =
    (new Date(year, month, 1).getDay() - weekStartsOn + DAYS_PER_WEEK) %
    DAYS_PER_WEEK;
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= daysInMonth(year, month); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);

  return cells;
};

export const shiftMonth = (
  year: number,
  month: number,
  step: number,
): { year: number; month: number } => {
  const shifted = new Date(year, month + step, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
};

export const monthIndexes = (): number[] =>
  Array.from({ length: MONTHS_PER_YEAR }, (_, index) => index);

export const isFutureMonth = (year: number, month: number): boolean => {
  const now = new Date();
  return (
    new Date(year, month, 1) > new Date(now.getFullYear(), now.getMonth(), 1)
  );
};

export const toTimeKey = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const todayKeyIn = (timeZone: string | null): string =>
  timeZone
    ? toLocalDateTime(nowIso(), timeZone).slice(0, DATE_KEY_LENGTH)
    : todayKey();

export const laterDateKey = (first: string, second?: string): string =>
  second && second > first ? second : first;

export const isoToDateKey = (iso: string): string => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? toDateKey(date) : "";
};

export const isoToTimeKey = (iso: string): string => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? toTimeKey(date) : "";
};

export const toIsoDateTime = (dateKey: string, timeKey: string): string => {
  const date = fromDateKey(dateKey);
  if (!date) return "";

  const [hours, minutes] = timeKey.split(":").map(Number);
  if (Number.isInteger(hours) && Number.isInteger(minutes)) {
    date.setHours(hours, minutes);
  }

  return date.toISOString();
};

export const isPastMonth = (year: number, month: number): boolean => {
  const now = new Date();
  return (
    new Date(year, month, 1) < new Date(now.getFullYear(), now.getMonth(), 1)
  );
};

export const isBeforeMonthOfKey = (
  year: number,
  month: number,
  dateKey: string,
): boolean => {
  const ref = fromDateKey(dateKey);
  if (!ref) return false;

  return (
    new Date(year, month, 1) < new Date(ref.getFullYear(), ref.getMonth(), 1)
  );
};

export const isAfterMonthOfKey = (
  year: number,
  month: number,
  dateKey: string,
): boolean => {
  const ref = fromDateKey(dateKey);
  if (!ref) return false;

  return (
    new Date(year, month, 1) > new Date(ref.getFullYear(), ref.getMonth(), 1)
  );
};

export type MeridiemPeriod = "AM" | "PM";

export const to12Hour = (
  timeKey: string,
): { hour: number; minute: number; period: MeridiemPeriod } => {
  const [parsedHour, parsedMinute] = timeKey.split(":").map(Number);
  const hour24 = Number.isInteger(parsedHour) ? parsedHour : HOURS_PER_HALF_DAY;
  const minute = Number.isInteger(parsedMinute) ? parsedMinute : 0;
  const period: MeridiemPeriod = hour24 >= HOURS_PER_HALF_DAY ? "PM" : "AM";
  const hour = hour24 % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY;

  return { hour, minute, period };
};

export const to24Hour = (
  timeKey: string,
): { hour: number; minute: number } => {
  const [parsedHour, parsedMinute] = timeKey.split(":").map(Number);

  return {
    hour: Number.isInteger(parsedHour) ? parsedHour : HOURS_PER_HALF_DAY,
    minute: Number.isInteger(parsedMinute) ? parsedMinute : 0,
  };
};

export const from24Hour = (hour: number, minute: number): string =>
  `${pad(hour)}:${pad(minute)}`;

export const from12Hour = (
  hour: number,
  minute: number,
  period: MeridiemPeriod,
): string => {
  const hour24 =
    period === "PM"
      ? (hour % HOURS_PER_HALF_DAY) + HOURS_PER_HALF_DAY
      : hour % HOURS_PER_HALF_DAY;

  return `${pad(hour24)}:${pad(minute)}`;
};
