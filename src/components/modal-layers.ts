import { KEYBOARD_KEY, MODAL_FOCUSABLE_SELECTOR } from "./constants";

const openLayers: object[] = [];

export function openLayer(): object {
  const layer = {};
  openLayers.push(layer);
  return layer;
}

export function closeLayer(layer: object) {
  const index = openLayers.indexOf(layer);
  if (index >= 0) openLayers.splice(index, 1);
}

export function isTopLayer(layer: object): boolean {
  return openLayers[openLayers.length - 1] === layer;
}

export function trapTabFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== KEYBOARD_KEY.TAB) return;

  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR),
  );
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const active = document.activeElement;

  if (active === container || !container.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
