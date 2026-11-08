import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { text } from "../i18n";
import {
  POPUP_VIEWPORT_MARGIN,
  TOOLTIP_BUBBLE_MAX_WIDTH,
  TOOLTIP_GAP,
  KEYBOARD_KEY,
} from "./constants";
import { EyeClosedIcon, EyeOpenIcon, InfoIcon } from "./icons";

const describedById = (htmlFor?: string) =>
  htmlFor ? `${htmlFor}-description` : undefined;

export function Button({
  variant = "secondary",
  size,
  fullWidth = false,
  type = "button",
  children,
  ...rest
}: {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "outline"
    | "danger-outline"
    | "danger-soft"
    | "danger-solid"
    | "warning-solid";
  size?: "small";
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = [
    "button",
    `button--${variant}`,
    size === "small" ? "button--small" : "",
    fullWidth ? "button--full-width" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="field__required" aria-hidden>
            {text.common.requiredMark}
          </span>
        )}
      </label>
      {children}
      {hint ? (
        <span
          className={`field__hint${error ? " field__hint--invalid" : ""}`}
          id={describedById(htmlFor)}
        >
          <InfoIcon className="field__hint-icon" />
          {hint}
        </span>
      ) : (
        error && (
          <span
            className="field__error"
            id={describedById(htmlFor)}
            role="alert"
          >
            {error}
          </span>
        )
      )}
    </div>
  );
}

export function TextField({
  label,
  required,
  hint,
  error,
  id,
  ...rest
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id: string;
} & Omit<React.ComponentPropsWithRef<"input">, "id" | "required">) {
  return (
    <Field
      label={label}
      required={required}
      htmlFor={id}
      error={error}
      hint={hint}
    >
      <input
        id={id}
        className="input"
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? describedById(id) : undefined}
        {...rest}
      />
    </Field>
  );
}

export function PasswordField({
  label,
  required,
  hint,
  error,
  id,
  ...rest
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id: string;
} & Omit<React.ComponentPropsWithRef<"input">, "id" | "type" | "required">) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Field
      label={label}
      required={required}
      htmlFor={id}
      error={error}
      hint={hint}
    >
      <div className="password-field">
        <input
          id={id}
          className="input password-field__input"
          type={isRevealed ? "text" : "password"}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? describedById(id) : undefined}
          {...rest}
        />
        <button
          type="button"
          className="password-field__toggle"
          aria-label={
            isRevealed ? text.common.hidePassword : text.common.showPassword
          }
          aria-pressed={isRevealed}
          onClick={() => setIsRevealed((revealed) => !revealed)}
        >
          {isRevealed ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
      </div>
    </Field>
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "warning";
  children: ReactNode;
}) {
  return (
    <div
      className={`alert alert--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function Loading({
  label = text.common.loading,
  isFullPage = false,
}: {
  label?: string;
  isFullPage?: boolean;
}) {
  return (
    <div className={isFullPage ? "loading loading--full-page" : "loading"}>
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

type TooltipHAlign = "center" | "start" | "end";
type TooltipPlacement = "top" | "bottom" | "left" | "right";

const clippingAncestorTopOf = (element: HTMLElement): number => {
  let node = element.parentElement;

  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "hidden" ||
      overflowY === "clip"
    ) {
      return node.getBoundingClientRect().top;
    }
    node = node.parentElement;
  }

  return 0;
};

export function Tooltip({
  label,
  content,
  className,
  bubbleClassName,
  children,
}: {
  label: string;
  content?: ReactNode;
  className?: string;
  bubbleClassName?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hAlign, setHAlign] = useState<TooltipHAlign>("center");
  const [placement, setPlacement] = useState<TooltipPlacement>("top");
  const containerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const updatePlacement = () => {
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    if (!container || !rect) return;

    const center = rect.left + rect.width / 2;
    const half = TOOLTIP_BUBBLE_MAX_WIDTH / 2;

    if (center - half < POPUP_VIEWPORT_MARGIN) {
      setHAlign("start");
    } else if (center + half > window.innerWidth - POPUP_VIEWPORT_MARGIN) {
      setHAlign("end");
    } else {
      setHAlign("center");
    }

    const bubbleRect = bubbleRef.current?.getBoundingClientRect();
    const bubbleHeight = bubbleRect?.height ?? 0;
    const bubbleWidth = bubbleRect?.width ?? 0;

    const clipTop = Math.max(0, clippingAncestorTopOf(container));
    const fitsAbove = rect.top - clipTop >= bubbleHeight + TOOLTIP_GAP;

    if (fitsAbove) {
      setPlacement("top");
      return;
    }

    const spaceRight = window.innerWidth - POPUP_VIEWPORT_MARGIN - rect.right;
    const spaceLeft = rect.left - POPUP_VIEWPORT_MARGIN;

    if (spaceRight >= bubbleWidth + TOOLTIP_GAP) {
      setPlacement("right");
    } else if (spaceLeft >= bubbleWidth + TOOLTIP_GAP) {
      setPlacement("left");
    } else {
      setPlacement("bottom");
    }
  };

  return (
    <span
      className={`tooltip${className ? ` ${className}` : ""}`}
      ref={containerRef}
      onMouseEnter={updatePlacement}
      onFocus={updatePlacement}
    >
      <button
        type="button"
        className="tooltip__trigger"
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        onClick={() => {
          updatePlacement();
          setIsOpen((open) => !open);
        }}
        onKeyDown={(event) => {
          if (event.key !== KEYBOARD_KEY.ESCAPE) return;
          setIsOpen(false);
        }}
      >
        {children}
      </button>
      <span
        className={`tooltip__bubble ${placement !== "top" ? `tooltip__bubble--${placement}` : ""} ${(placement === "top" || placement === "bottom") && hAlign !== "center" ? `tooltip__bubble--${hAlign}` : ""} ${isOpen ? "is-open" : ""} ${bubbleClassName ?? ""}`}
        role="tooltip"
        id={tooltipId}
        ref={bubbleRef}
      >
        {content ?? label}
      </span>
      <span
        className={`tooltip__tail ${placement !== "top" ? `tooltip__tail--${placement}` : ""} ${isOpen ? "is-open" : ""}`}
        aria-hidden
      />
    </span>
  );
}
