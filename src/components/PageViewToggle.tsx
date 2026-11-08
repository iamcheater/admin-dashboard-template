import { useSelectionParam } from "../hooks/useSelectionParam";
import { VIEW_SEARCH_PARAM } from "../lib/constants";

export interface PageViewOption {
  value: string;
  label: string;
}

export function PageViewToggle({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: PageViewOption[];
  defaultValue?: string;
}) {
  const { selected, setSelected } = useSelectionParam(VIEW_SEARCH_PARAM);

  const fallback = defaultValue ?? options[0]?.value ?? "";
  const active = options.some((option) => option.value === selected)
    ? selected
    : fallback;

  return (
    <div className="page-view-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`page-view-toggle__option${option.value === active ? " is-active" : ""}`}
          aria-pressed={option.value === active}
          onClick={() =>
            setSelected(option.value === fallback ? "" : option.value)
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
