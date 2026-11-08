import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePageActionParams } from "../hooks/usePageActionParams";
import { format, text } from "../i18n";
import { useAnchoredPanel } from "../hooks/useAnchoredPanel";
import {
  buildMonthGrid,
  from12Hour,
  from24Hour,
  fromDateKey,
  isAfterMonthOfKey,
  isBeforeMonthOfKey,
  isFutureMonth,
  isoToDateKey,
  isoToTimeKey,
  isPastMonth,
  monthIndexes,
  pad2,
  shiftMonth,
  to12Hour,
  to24Hour,
  toDateKey,
  toIsoDateTime,
  todayKey,
  type MeridiemPeriod,
} from "../lib/date";
import {
  DEFAULT_TIME_KEY,
  HOURS_PER_DAY,
  HOURS_PER_HALF_DAY,
  LAST_MONTH_INDEX,
  MIDNIGHT_TIME_KEY,
  MINUTES_PER_HOUR,
} from "../lib/constants";
import {
  formatDateRange,
  formatMonthName,
  formatMonthYear,
  formatShortDateTime,
  formatWeekdayNames,
} from "../lib/format";
import { ACTIVE_CONVENTIONS } from "../lib/language";
import {
  DATE_PICKER_GAP,
  KEYBOARD_KEY,
  MODAL_FOCUSABLE_SELECTOR,
  TIME_FIELD_MAX_LENGTH,
} from "./constants";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "./icons";

const PERIOD_OPTIONS: MeridiemPeriod[] = ["AM", "PM"];

const { uses24HourClock, weekStartsOn } = ACTIVE_CONVENTIONS;
const HOUR_MIN = uses24HourClock ? 0 : 1;
const HOUR_MAX = uses24HourClock ? HOURS_PER_DAY - 1 : HOURS_PER_HALF_DAY;

const formatHour = (hour: number) =>
  uses24HourClock ? pad2(hour) : String(hour);

const toClockTimeKey = (
  hour: number,
  minute: number,
  period: MeridiemPeriod,
) => (uses24HourClock ? from24Hour(hour, minute) : from12Hour(hour, minute, period));

const digitsOnly = (raw: string) => raw.replace(/\D/g, "");

const timeOf = (iso: string | undefined): number | null => {
  if (!iso) return null;

  const parsed = Date.parse(iso);

  return Number.isNaN(parsed) ? null : parsed;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function TimeFields({
  timeKey,
  onChange,
}: {
  timeKey: string;
  onChange: (next: string) => void;
}) {
  const initial = to12Hour(timeKey);
  const initialHour = uses24HourClock ? to24Hour(timeKey).hour : initial.hour;

  const [hourText, setHourText] = useState(formatHour(initialHour));
  const [minuteText, setMinuteText] = useState(pad2(initial.minute));
  const [period, setPeriod] = useState<MeridiemPeriod>(initial.period);

  const commit = (
    nextHourText: string,
    nextMinuteText: string,
    nextPeriod: MeridiemPeriod,
  ) => {
    if (!nextHourText || !nextMinuteText) return;

    const hour = clamp(Number(nextHourText), HOUR_MIN, HOUR_MAX);
    const minute = clamp(Number(nextMinuteText), 0, MINUTES_PER_HOUR - 1);
    onChange(toClockTimeKey(hour, minute, nextPeriod));
  };

  const onPeriodChange = (nextPeriod: MeridiemPeriod) => {
    setPeriod(nextPeriod);
    commit(hourText, minuteText, nextPeriod);
  };

  return (
    <div className="date-picker__time-fields">
      <input
        type="text"
        inputMode="numeric"
        className="date-picker__time-input"
        aria-label={text.datePicker.hour}
        maxLength={TIME_FIELD_MAX_LENGTH}
        value={hourText}
        onChange={(event) => {
          const next = digitsOnly(event.target.value);
          setHourText(next);
          commit(next, minuteText, period);
        }}
        onBlur={() => {
          const hour = clamp(
            hourText ? Number(hourText) : initialHour,
            HOUR_MIN,
            HOUR_MAX,
          );
          setHourText(formatHour(hour));
          commit(String(hour), minuteText, period);
        }}
      />

      <span className="date-picker__time-colon" aria-hidden>
        :
      </span>

      <input
        type="text"
        inputMode="numeric"
        className="date-picker__time-input"
        aria-label={text.datePicker.minute}
        maxLength={TIME_FIELD_MAX_LENGTH}
        value={minuteText}
        onChange={(event) => {
          const next = digitsOnly(event.target.value);
          setMinuteText(next);
          commit(hourText, next, period);
        }}
        onBlur={() => {
          const minute = clamp(
            Number(minuteText) || 0,
            0,
            MINUTES_PER_HOUR - 1,
          );
          setMinuteText(pad2(minute));
          commit(hourText, pad2(minute), period);
        }}
      />

      {!uses24HourClock && (
        <div
          className="date-picker__time-period"
          role="group"
          aria-label={text.datePicker.period}
        >
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`date-picker__time-period-option${option === period ? " is-active" : ""}`}
              aria-pressed={option === period}
              onClick={() => onPeriodChange(option)}
            >
              {option === "AM" ? text.datePicker.am : text.datePicker.pm}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DatePicker({
  formatValue,
  placeholder,
  label,
  fromParam,
  toParam,
  value,
  onChange,
  selectTime = false,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
  minDateTime,
  emits = "instant",
  disabled = false,
  autoFocusOnEnable = false,
  invalid = false,
  onBlur,
}: {
  formatValue?: (value: string) => string;
  placeholder?: string;
  label: string;
  fromParam?: string;
  toParam?: string;
  value?: string;
  onChange?: (next: string) => void;
  selectTime?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
  minDate?: string;
  maxDate?: string;
  minDateTime?: string;
  emits?: "instant" | "local";
  disabled?: boolean;
  autoFocusOnEnable?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
}) {
  const { getFilter, setFilters } = usePageActionParams();

  const isRange = Boolean(fromParam && toParam);
  const from = fromParam ? getFilter(fromParam) : "";
  const to = toParam ? getFilter(toParam) : "";

  const [isOpen, setIsOpen] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftTime, setDraftTime] = useState(DEFAULT_TIME_KEY);
  const [isChoosingMonth, setIsChoosingMonth] = useState(false);
  const [view, setView] = useState(() => {
    const anchorDate = new Date();
    return { year: anchorDate.getFullYear(), month: anchorDate.getMonth() };
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const today = todayKey();

  const close = (restoreFocus = true) => {
    if (restoreFocus && panelRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
    setIsChoosingMonth(false);
    setIsOpen(false);
  };

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closeRef.current(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEY.ESCAPE) {
        event.stopPropagation();
        closeRef.current();
        return;
      }

      if (event.key !== KEYBOARD_KEY.TAB) return;

      const panel = panelRef.current;
      if (!panel?.contains(document.activeElement)) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      event.stopPropagation();

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen]);

  useAnchoredPanel(triggerRef, panelRef, isOpen, "end", DATE_PICKER_GAP);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current
      ?.querySelector<HTMLElement>(MODAL_FOCUSABLE_SELECTOR)
      ?.focus();
  }, [isOpen]);

  const open = useCallback(() => {
    const startKey = isRange ? from : isoToDateKey(value ?? "");
    const anchorDate = fromDateKey(startKey) ?? new Date();

    setView({
      year: anchorDate.getFullYear(),
      month: anchorDate.getMonth(),
    });
    setDraftStart(startKey);
    setDraftEnd(isRange ? to : "");
    setDraftTime(isoToTimeKey(value ?? "") || DEFAULT_TIME_KEY);
    setIsChoosingMonth(false);
    setIsOpen(true);
  }, [isRange, from, to, value]);

  const wasDisabledRef = useRef(disabled);
  useEffect(() => {
    const wasDisabled = wasDisabledRef.current;
    wasDisabledRef.current = disabled;

    if (!autoFocusOnEnable || !wasDisabled || disabled) return;

    const trigger = triggerRef.current;
    if (!trigger) return;
    trigger.focus();
    open();
  }, [disabled, autoFocusOnEnable, open]);

  const onPick = (key: string) => {
    if (!isRange) {
      setDraftStart(key);
      return;
    }

    if (!draftStart || draftEnd) {
      setDraftStart(key);
      setDraftEnd("");
      return;
    }

    if (key < draftStart) {
      setDraftStart(key);
      return;
    }

    setDraftEnd(key);
  };

  const clock = selectTime ? draftTime : MIDNIGHT_TIME_KEY;
  const draftIso = draftStart
    ? emits === "local"
      ? `${draftStart}T${clock}:00`
      : toIsoDateTime(draftStart, clock)
    : "";
  const earliestAllowed = timeOf(minDateTime);
  const draftAt = timeOf(draftIso);
  const isBeforeMinDateTime =
    earliestAllowed !== null && draftAt !== null && draftAt < earliestAllowed;

  const onApply = () => {
    if (!draftStart || isBeforeMinDateTime) return;

    if (isRange && fromParam && toParam) {
      setFilters({
        [fromParam]: draftStart,
        [toParam]: draftEnd || draftStart,
      });
    } else {
      onChange?.(draftIso);
    }

    close();
  };

  const onClear = () => {
    if (isRange && fromParam && toParam) {
      setFilters({ [fromParam]: "", [toParam]: "" });
    } else {
      onChange?.("");
    }

    setDraftStart("");
    setDraftEnd("");
    close();
  };

  const step = (direction: number) =>
    setView(shiftMonth(view.year, view.month, direction));

  const displayed = isRange
    ? formatDateRange(from, to)
    : formatValue
      ? formatValue(value ?? "")
      : formatShortDateTime(value ?? "", selectTime);

  const hasValue = isRange ? Boolean(from || to) : Boolean(value);
  const cells = buildMonthGrid(view.year, view.month, weekStartsOn);

  const isDayBlocked = (key: string) =>
    (disableFuture && key > today) ||
    (disablePast && key < today) ||
    (Boolean(minDate) && key < minDate!) ||
    (Boolean(maxDate) && key > maxDate!);

  const isPreviousBlocked =
    (disablePast && isPastMonth(view.year, view.month - 1)) ||
    (Boolean(minDate) &&
      isBeforeMonthOfKey(view.year, view.month - 1, minDate!));
  const isNextBlocked =
    (disableFuture && isFutureMonth(view.year, view.month + 1)) ||
    (Boolean(maxDate) &&
      isAfterMonthOfKey(view.year, view.month + 1, maxDate!));

  const panel = (
    <div
      className="date-picker__panel"
      ref={panelRef}
      role="dialog"
      aria-label={label}
    >
      <div className="date-picker__header">
        <button
          type="button"
          className="date-picker__month-toggle"
          aria-expanded={isChoosingMonth}
          onClick={() => setIsChoosingMonth(!isChoosingMonth)}
        >
          {formatMonthYear(view.year, view.month)}
          <ChevronDownIcon />
        </button>

        {!isChoosingMonth && (
          <div className="date-picker__steps">
            <button
              type="button"
              className="date-picker__step"
              onClick={() => step(-1)}
              disabled={isPreviousBlocked}
              aria-label={text.datePicker.previousMonth}
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              className="date-picker__step"
              onClick={() => step(1)}
              disabled={isNextBlocked}
              aria-label={text.datePicker.nextMonth}
            >
              <ArrowRightIcon />
            </button>
          </div>
        )}
      </div>

      {isChoosingMonth ? (
        <div className="date-picker__months">
          <div className="date-picker__year">
            <button
              type="button"
              className="date-picker__step"
              onClick={() => setView({ ...view, year: view.year - 1 })}
              disabled={
                (disablePast &&
                  isPastMonth(view.year - 1, LAST_MONTH_INDEX)) ||
                (Boolean(minDate) &&
                  isBeforeMonthOfKey(
                    view.year - 1,
                    LAST_MONTH_INDEX,
                    minDate!,
                  ))
              }
              aria-label={text.datePicker.previousYear}
            >
              <ArrowLeftIcon />
            </button>
            <span className="date-picker__year-value">{view.year}</span>
            <button
              type="button"
              className="date-picker__step"
              onClick={() => setView({ ...view, year: view.year + 1 })}
              disabled={
                (disableFuture && isFutureMonth(view.year + 1, 0)) ||
                (Boolean(maxDate) &&
                  isAfterMonthOfKey(view.year + 1, 0, maxDate!))
              }
              aria-label={text.datePicker.nextYear}
            >
              <ArrowRightIcon />
            </button>
          </div>

          <div className="date-picker__month-grid">
            {monthIndexes().map((month) => (
              <button
                key={month}
                type="button"
                className={`date-picker__month${month === view.month ? " is-active" : ""}`}
                disabled={
                  (disableFuture && isFutureMonth(view.year, month)) ||
                  (disablePast && isPastMonth(view.year, month)) ||
                  (Boolean(minDate) &&
                    isBeforeMonthOfKey(view.year, month, minDate!)) ||
                  (Boolean(maxDate) &&
                    isAfterMonthOfKey(view.year, month, maxDate!))
                }
                onClick={() => {
                  setView({ ...view, month });
                  setIsChoosingMonth(false);
                }}
              >
                {formatMonthName(month)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="date-picker__weekdays">
            {formatWeekdayNames().map((weekday, index) => (
              <span key={index} className="date-picker__weekday">
                {weekday}
              </span>
            ))}
          </div>

          <div className="date-picker__grid">
            {cells.map((date, index) => {
              if (!date) {
                return <span key={index} className="date-picker__blank" />;
              }

              const key = toDateKey(date);
              const isStart = key === draftStart;
              const isEnd = Boolean(draftEnd) && key === draftEnd;
              const isBetween =
                Boolean(draftEnd) && key > draftStart && key < draftEnd;

              return (
                <button
                  key={key}
                  type="button"
                  className={`date-picker__day${isStart ? " is-start" : ""}${isEnd ? " is-end" : ""}${isBetween ? " is-between" : ""}`}
                  disabled={isDayBlocked(key)}
                  aria-pressed={isStart || isEnd}
                  aria-label={formatDateRange(key, "")}
                  onClick={() => onPick(key)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {selectTime && (
            <div className="date-picker__time">
              <span className="date-picker__time-label">
                {text.datePicker.time}
              </span>
              <TimeFields timeKey={draftTime} onChange={setDraftTime} />
            </div>
          )}

          <div className="date-picker__footer">
            <p className="date-picker__hint">
              {isBeforeMinDateTime
                ? text.datePicker.tooEarly
                : !draftStart
                  ? text.datePicker.pickStart
                  : isRange && !draftEnd
                    ? format(text.datePicker.pickEnd, {
                        date: formatDateRange(draftStart, ""),
                      })
                    : isRange
                      ? formatDateRange(draftStart, draftEnd)
                      : formatDateRange(draftStart, "")}
            </p>

            <div className="date-picker__actions">
              {hasValue && (
                <button
                  type="button"
                  className="date-picker__clear"
                  onClick={onClear}
                >
                  {text.datePicker.clear}
                </button>
              )}
              <button
                type="button"
                className="date-picker__apply"
                disabled={!draftStart || isBeforeMinDateTime}
                onClick={onApply}
              >
                {text.datePicker.apply}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="date-picker">
      <button
        type="button"
        className={`date-picker__trigger${isOpen ? " is-open" : ""}${invalid ? " is-invalid" : ""}`}
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => (isOpen ? close(false) : open())}
        onBlur={(event) => {
          if (panelRef.current?.contains(event.relatedTarget as Node | null))
            return;
          onBlur?.();
        }}
      >
        <span
          className={`date-picker__value${displayed ? "" : " is-placeholder"}`}
        >
          {displayed || placeholder || label}
        </span>
        <CalendarIcon />
      </button>

      {isOpen && createPortal(panel, document.body)}
    </div>
  );
}
