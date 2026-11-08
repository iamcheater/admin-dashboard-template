import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { useAnchoredPanel } from "../hooks/useAnchoredPanel";
import { KEYBOARD_KEY, ROW_MENU_GAP } from "./constants";
import { KebabIcon, type IconProps } from "./icons";

export interface RowMenuItem {
  icon?: ReactElement<IconProps>;
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export function RowMenu({
  label,
  items,
}: {
  label: string;
  items: RowMenuItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const close = () => setIsOpen(false);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEY.ESCAPE) close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useAnchoredPanel(triggerRef, menuRef, isOpen, "end", ROW_MENU_GAP);

  return (
    <>
      <button
        type="button"
        className="row-menu__trigger"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <KebabIcon />
      </button>

      {isOpen &&
        createPortal(
          <div className="row-menu__menu" ref={menuRef} role="menu">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`row-menu__item row-menu__item--${
                  item.tone ?? "default"
                }`}
                disabled={item.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsOpen(false);
                  item.onSelect();
                }}
              >
                {item.icon && cloneElement(item.icon, { isCropped: true })}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
