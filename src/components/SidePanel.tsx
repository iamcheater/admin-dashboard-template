import { useEffect, useRef, useState, type ReactNode } from "react";
import { text } from "../i18n";
import { prefersReducedMotion } from "../lib/motion";
import { KEYBOARD_KEY } from "./constants";
import { CloseIcon } from "./icons";
import {
  closeLayer,
  isTopLayer,
  openLayer,
  trapTabFocus,
} from "./modal-layers";

export function SidePanel({
  title,
  subtitle,
  layer,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  layer?: "drawer" | "popup";
  onClose: () => void;
  children: ReactNode;
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [previouslyFocused] = useState<HTMLElement | null>(
    () => document.activeElement as HTMLElement | null,
  );
  const panelRef = useRef<HTMLElement>(null);

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
    const panel = panelRef.current;
    panel?.focus();

    return () => {
      requestAnimationFrame(() => {
        if (panel?.isConnected) return;
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      });
    };
  }, [previouslyFocused]);

  useEffect(() => {
    const modalLayer = openLayer();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopLayer(modalLayer)) return;

      if (event.key === KEYBOARD_KEY.ESCAPE) {
        requestCloseRef.current();
        return;
      }

      if (panelRef.current) trapTabFocus(event, panelRef.current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      closeLayer(modalLayer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className={`side-panel-overlay${layer === "popup" ? " side-panel-overlay--popup" : ""}${isClosing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <aside
        className="side-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label={title}
        onAnimationEnd={(event) => {
          if (!isClosing) return;
          if (event.target !== event.currentTarget) return;
          onClose();
        }}
      >
        <header className="side-panel__header">
          <h2 className="side-panel__title">{title}</h2>
          {subtitle && <p className="side-panel__subtitle">{subtitle}</p>}
          <button
            type="button"
            className="icon-button side-panel__close"
            onClick={requestClose}
            aria-label={text.common.close}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="side-panel__body">{children}</div>
      </aside>
    </div>
  );
}
