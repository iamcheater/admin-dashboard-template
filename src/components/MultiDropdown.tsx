import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format, text } from "../i18n";
import { useAnchoredPanel } from "../hooks/useAnchoredPanel";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { revealInList } from "../lib/anchor";
import { SEARCH_DEBOUNCE_MS } from "../lib/constants";
import { listedOptions } from "../lib/options";
import { CustomSkeleton } from "./CustomSkeleton";
import {
  DROPDOWN_MENU_GAP,
  KEYBOARD_KEY,
  OPTION_LIST_SKELETON_ROW_COUNT,
} from "./constants";
import { ChevronDownIcon } from "./icons";
import type { DropdownOption } from "./Dropdown";

export function MultiDropdown({
  label,
  countTemplate,
  options,
  values,
  onChange,
  onSearch,
  isLoading,
}: {
  label: string;
  countTemplate: string;
  options: DropdownOption[];
  values: string[];
  onChange: (next: string[]) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);
  const shouldRevealActiveRef = useRef(false);
  const listId = useId();

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const isSearchable = Boolean(onSearch);
  const isAwaitingResults =
    isSearchable &&
    Boolean(query.trim()) &&
    (query !== debouncedQuery || Boolean(isLoading));
  const visible = listedOptions(
    options,
    query,
    isSearchable,
    isAwaitingResults,
  );
  const showsSkeleton = Boolean(isLoading) || isAwaitingResults;

  const summary =
    values.length === 0
      ? label
      : format(countTemplate, { label, count: values.length });

  const activeIndex = Math.min(highlighted, Math.max(0, visible.length - 1));

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (!isSearchable || !isOpen || query !== debouncedQuery) return;
    onSearchRef.current?.(debouncedQuery);
  }, [isSearchable, isOpen, query, debouncedQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
      setQuery("");
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  useAnchoredPanel(triggerRef, menuRef, isOpen, "match", DROPDOWN_MENU_GAP);

  useEffect(() => {
    if (!isOpen || !shouldRevealActiveRef.current) return;
    shouldRevealActiveRef.current = false;
    if (menuRef.current && activeRef.current) {
      revealInList(menuRef.current, activeRef.current);
    }
  }, [isOpen, activeIndex]);

  const highlightFromKeyboard = (index: number) => {
    shouldRevealActiveRef.current = true;
    setActiveIndex(index);
  };

  const open = () => {
    setQuery("");
    highlightFromKeyboard(0);
    setIsOpen(true);
  };

  const toggle = (index: number) => {
    const option = visible[index];
    if (!option) return;

    onChange(
      values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value],
    );
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (
        event.key !== KEYBOARD_KEY.ARROW_DOWN &&
        event.key !== KEYBOARD_KEY.ARROW_UP
      )
        return;
      event.preventDefault();
      open();
      return;
    }

    if (event.key === KEYBOARD_KEY.ESCAPE) {
      event.stopPropagation();
      close();
      return;
    }

    if (event.key === KEYBOARD_KEY.TAB) {
      close();
      return;
    }

    if (event.key === KEYBOARD_KEY.ARROW_DOWN) {
      event.preventDefault();
      highlightFromKeyboard(Math.min(activeIndex + 1, visible.length - 1));
    } else if (event.key === KEYBOARD_KEY.ARROW_UP) {
      event.preventDefault();
      highlightFromKeyboard(Math.max(activeIndex - 1, 0));
    } else if (event.key === KEYBOARD_KEY.HOME) {
      event.preventDefault();
      highlightFromKeyboard(0);
    } else if (event.key === KEYBOARD_KEY.END) {
      event.preventDefault();
      highlightFromKeyboard(visible.length - 1);
    } else if (event.key === KEYBOARD_KEY.ENTER) {
      event.preventDefault();
      toggle(activeIndex);
    }
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <div
        className={`dropdown__trigger${isOpen ? " is-open" : ""}`}
        ref={triggerRef}
      >
        <input
          type="text"
          className="dropdown__input"
          ref={inputRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={
            isOpen && visible.length > 0 ? `${listId}-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-label={label}
          placeholder={summary}
          value={isOpen ? query : summary}
          readOnly={!isOpen}
          onChange={(event) => {
            setQuery(event.target.value);
            highlightFromKeyboard(0);
            setIsOpen(true);
          }}
          onFocus={open}
          onClick={() => {
            if (!isOpen) open();
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="dropdown__caret"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            if (isOpen) {
              close();
              return;
            }
            inputRef.current?.focus();
            open();
          }}
        >
          <ChevronDownIcon />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <ul
            className="dropdown__menu"
            id={listId}
            role="listbox"
            onMouseDown={(event) => event.preventDefault()}
            aria-multiselectable
            ref={menuRef}
          >
            {visible.length === 0 && !showsSkeleton ? (
              <li className="dropdown__empty">{text.pageActions.noMatches}</li>
            ) : (
              <>
                {visible.map((option, index) => {
                  const isSelected = values.includes(option.value);

                  return (
                    <li
                      key={option.value}
                      id={`${listId}-${index}`}
                      ref={index === activeIndex ? activeRef : undefined}
                      role="option"
                      aria-selected={isSelected}
                      className={`dropdown__option${index === activeIndex ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => toggle(index)}
                    >
                      <span className="dropdown__checkbox" aria-hidden />
                      {option.label}
                    </li>
                  );
                })}
                {showsSkeleton &&
                  Array.from(
                    { length: OPTION_LIST_SKELETON_ROW_COUNT },
                    (_, index) => (
                      <li key={`skeleton-${index}`} className="dropdown__option-skeleton">
                        <CustomSkeleton variant="rounded" />
                      </li>
                    ),
                  )}
              </>
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
