import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { anchorRectOf, placeTooltip } from "../lib/anchor";
import {
  KEYBOARD_KEY,
  POPUP_VIEWPORT_MARGIN,
  TRUNCATED_TOOLTIP_GAP,
  TRUNCATED_TOOLTIP_TAIL_INSET,
} from "./constants";
import { InfoIcon } from "./icons";

export function TruncatedText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const showTooltip = isTruncated && isOpen;

  useLayoutEffect(() => {
    const element = valueRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() =>
      setIsTruncated(element.scrollWidth > element.clientWidth),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    const tail = tailRef.current;
    if (!showTooltip || !trigger || !bubble || !tail) return;

    const { top, left, side, tailLeft } = placeTooltip(
      anchorRectOf(trigger),
      { width: bubble.offsetWidth, height: bubble.offsetHeight },
      TRUNCATED_TOOLTIP_GAP,
      POPUP_VIEWPORT_MARGIN,
      TRUNCATED_TOOLTIP_TAIL_INSET,
    );
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
    bubble.dataset.side = side;
    tail.style.left = `${tailLeft}px`;
  }, [showTooltip]);

  useEffect(() => {
    if (!isOpen) return;

    const close = () => setIsOpen(false);

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      close();
    };

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className={`truncated-text${className ? ` ${className}` : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span ref={valueRef} className="truncated-text__value">
        {value}
      </span>

      {isTruncated && (
        <button
          ref={triggerRef}
          type="button"
          className="truncated-text__info"
          aria-label={value}
          aria-expanded={showTooltip}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== KEYBOARD_KEY.ESCAPE || !showTooltip) return;
            event.stopPropagation();
            setIsOpen(false);
          }}
        >
          <InfoIcon />
        </button>
      )}

      {showTooltip &&
        createPortal(
          <span className="truncated-tooltip" role="tooltip" ref={bubbleRef}>
            {value}
            <span
              className="truncated-tooltip__tail"
              ref={tailRef}
              aria-hidden
            />
          </span>,
          document.body,
        )}
    </span>
  );
}
