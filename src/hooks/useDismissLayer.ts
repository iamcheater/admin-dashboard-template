import { useEffect, useRef, type RefObject } from "react";
import { KEYBOARD_KEY } from "../components/constants";

export function useDismissLayer(
  layer: RefObject<HTMLElement | null>,
  onDismiss: () => void,
): void {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    layer.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (layer.current?.contains(event.target as Node)) return;
      onDismissRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYBOARD_KEY.ESCAPE) return;
      event.stopPropagation();
      onDismissRef.current();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [layer]);
}
