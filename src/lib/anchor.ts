export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type PanelAlign = "match" | "end";

export interface PanelPlacement {
  top: number;
  left: number;
}

export type TooltipSide = "top" | "bottom";

export interface TooltipPlacement extends PanelPlacement {
  side: TooltipSide;
  tailLeft: number;
}

export function anchorRectOf(element: HTMLElement): AnchorRect {
  const { top, left, width, height } = element.getBoundingClientRect();
  return { top, left, width, height };
}

export function revealInList(list: HTMLElement, item: HTMLElement): void {
  const itemTop = item.offsetTop;
  const itemBottom = itemTop + item.offsetHeight;

  if (itemTop < list.scrollTop) {
    list.scrollTop = itemTop;
  } else if (itemBottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = itemBottom - list.clientHeight;
  }
}

export function placePanel(
  anchor: AnchorRect,
  panel: { width: number; height: number },
  align: PanelAlign,
  gap: number,
  margin: number,
): PanelPlacement {
  const below = anchor.top + anchor.height + gap;
  const above = anchor.top - gap - panel.height;
  const roomBelow = window.innerHeight - margin - below;
  const roomAbove = anchor.top - gap - margin;
  const opensBelow = panel.height <= roomBelow || roomBelow >= roomAbove;
  const top = opensBelow ? below : above;

  if (align === "match") return { top, left: anchor.left };

  const left = Math.max(
    margin,
    Math.min(
      anchor.left + anchor.width - panel.width,
      window.innerWidth - panel.width - margin,
    ),
  );
  return { top, left };
}

export function placeTooltip(
  anchor: AnchorRect,
  bubble: { width: number; height: number },
  gap: number,
  margin: number,
  tailInset: number,
): TooltipPlacement {
  const anchorCenter = anchor.left + anchor.width / 2;
  const left = Math.max(
    margin,
    Math.min(
      anchorCenter - bubble.width / 2,
      window.innerWidth - bubble.width - margin,
    ),
  );
  const above = anchor.top - gap - bubble.height;
  const side: TooltipSide = above >= margin ? "top" : "bottom";
  const top = side === "top" ? above : anchor.top + anchor.height + gap;
  const tailLeft = Math.max(
    tailInset,
    Math.min(anchorCenter - left, bubble.width - tailInset),
  );

  return { top, left, side, tailLeft };
}
