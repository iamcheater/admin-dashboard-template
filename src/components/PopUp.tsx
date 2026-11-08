import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDismissLayer } from "../hooks/useDismissLayer";
import type { AnchorRect } from "../lib/anchor";
import { POPUP_GAP, POPUP_VIEWPORT_MARGIN, POPUP_WIDTH } from "./constants";

export function PopUp({
  anchor,
  label,
  onClose,
  children,
}: {
  anchor: AnchorRect;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useDismissLayer(cardRef, onClose);

  const centred = anchor.left + anchor.width / 2 - POPUP_WIDTH / 2;
  const furthestLeft = window.innerWidth - POPUP_WIDTH - POPUP_VIEWPORT_MARGIN;

  return createPortal(
    <div
      className="popup"
      ref={cardRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      style={{
        left: Math.max(POPUP_VIEWPORT_MARGIN, Math.min(centred, furthestLeft)),
        bottom: window.innerHeight - anchor.top + POPUP_GAP,
        width: POPUP_WIDTH,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
