import { useLayoutEffect, type RefObject } from "react";
import { POPUP_VIEWPORT_MARGIN } from "../components/constants";
import { anchorRectOf, placePanel, type PanelAlign } from "../lib/anchor";

export function useAnchoredPanel(
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  align: PanelAlign,
  gap: number,
): void {
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!isOpen || !trigger || !panel) return;

    const reposition = () => {
      const anchor = anchorRectOf(trigger);
      if (align === "match") panel.style.width = `${anchor.width}px`;

      const { top, left } = placePanel(
        anchor,
        { width: panel.offsetWidth, height: panel.offsetHeight },
        align,
        gap,
        POPUP_VIEWPORT_MARGIN,
      );
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    };

    const onScroll = (event: Event) => {
      if (panel.contains(event.target as Node)) return;
      reposition();
    };

    reposition();

    const observer = new ResizeObserver(reposition);
    observer.observe(trigger);
    observer.observe(panel);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", reposition);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", reposition);
    };
  }, [triggerRef, panelRef, isOpen, align, gap]);
}
