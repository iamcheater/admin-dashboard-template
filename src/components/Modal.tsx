import { useEffect, useRef, useState, type ReactNode } from "react";
import { text } from "../i18n";
import { prefersReducedMotion } from "../lib/motion";
import {
  KEYBOARD_KEY,
  MODAL_FOCUSABLE_SELECTOR,
  MODAL_SIZE,
  type ModalSize,
} from "./constants";
import { CloseIcon } from "./icons";
import {
  closeLayer,
  isTopLayer,
  openLayer,
  trapTabFocus,
} from "./modal-layers";

const labelOf = (description: ReactNode): string | undefined =>
  typeof description === "string" ? description : undefined;

export function Modal({
  icon,
  tone = "default",
  size = MODAL_SIZE.DEFAULT,
  title,
  description,
  isDismissible = false,
  onClose,
  children,
}: {
  icon?: ReactNode;
  tone?: "default" | "danger" | "success" | "warning" | "plain";
  size?: ModalSize;
  title?: string;
  description?: ReactNode;
  isDismissible?: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [previouslyFocused] = useState<HTMLElement | null>(
    () => document.activeElement as HTMLElement | null,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const requestClose = () => {
    if (isClosing) return;
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setIsClosing(true);
  };

  const requestCloseRef = useRef(requestClose);
  useEffect(() => {
    requestCloseRef.current = requestClose;
  });

  useEffect(() => {
    const card = cardRef.current;

    return () => {
      requestAnimationFrame(() => {
        if (card?.isConnected) return;
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      });
    };
  }, [previouslyFocused]);

  useEffect(() => {
    const card = cardRef.current;
    if (card && !card.contains(document.activeElement)) {
      const first = card.querySelector<HTMLElement>(MODAL_FOCUSABLE_SELECTOR);
      (first ?? card).focus();
    }
  }, []);

  useEffect(() => {
    const layer = openLayer();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopLayer(layer)) return;

      if (event.key === KEYBOARD_KEY.ESCAPE) {
        requestCloseRef.current();
        return;
      }

      if (cardRef.current) trapTabFocus(event, cardRef.current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      closeLayer(layer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className={`modal-overlay${isClosing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      onAnimationEnd={(event) => {
        if (!isClosing) return;
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <div
        className={`modal-card modal-card--${size}`}
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? labelOf(description) ?? text.common.dialog}
        tabIndex={-1}
      >
        {isDismissible && (
          <button
            type="button"
            className="icon-button modal-card__close"
            aria-label={text.common.close}
            onClick={requestClose}
          >
            <CloseIcon />
          </button>
        )}
        {(icon || title || description) && (
          <div className="modal-card__header">
            {icon && (
              <div className={`modal-card__icon modal-card__icon--${tone}`}>
                {icon}
              </div>
            )}
            {title && <h2 className="modal-card__title">{title}</h2>}
            {description && (
              <p className="modal-card__description">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
