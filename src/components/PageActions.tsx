import { useEffect, useState } from "react";
import { FIELD_LIMITS } from "../api/constants";
import { usePageActionParams } from "../hooks/usePageActionParams";
import { format, text } from "../i18n";
import { SEARCH_DEBOUNCE_MS } from "../lib/constants";
import { DatePicker } from "./DatePicker";
import { Dropdown } from "./Dropdown";
import { MultiDropdown } from "./MultiDropdown";
import { InfoIcon, SearchIcon } from "./icons";
import { Tooltip } from "./ui";

export interface FilterOption {
  value: string;
  label: string;
  pinned?: boolean;
}

export interface PageFilter {
  param: string;
  label: string;
  defaultValue?: string;
  options: FilterOption[];
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export interface PageMultiFilter {
  param: string;
  label: string;
  options: FilterOption[];
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export interface PageToggle {
  param: string;
  label: string;
}

export interface PageDateFilter {
  label: string;
  fromParam: string;
  toParam: string;
  disableFuture?: boolean;
}

export function PageActions({
  search,
  filters,
  multiFilters,
  toggles,
  dateFilter,
}: {
  search?: { criteria: string };
  filters?: PageFilter[];
  multiFilters?: PageMultiFilter[];
  toggles?: PageToggle[];
  dateFilter?: PageDateFilter;
}) {
  const {
    searchTerm,
    setSearchTerm,
    getFilter,
    setFilter,
    getFilterValues,
    setFilterValues,
    getToggle,
    setToggle,
  } = usePageActionParams();

  const [typed, setTyped] = useState(searchTerm);
  const [committed, setCommitted] = useState(searchTerm);

  useEffect(() => {
    if (typed === searchTerm) return;

    const timer = setTimeout(() => setSearchTerm(typed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed, searchTerm, setSearchTerm]);

  if (searchTerm !== committed) {
    setCommitted(searchTerm);
    setTyped(searchTerm);
  }

  const visibleFilters = filters ?? [];
  const visibleToggles = toggles ?? [];
  const visibleMultiFilters = multiFilters ?? [];

  const hasControls =
    visibleFilters.length > 0 ||
    visibleToggles.length > 0 ||
    visibleMultiFilters.length > 0 ||
    Boolean(dateFilter);

  if (!search && !hasControls) return null;

  const searchLabel = search
    ? format(text.pageActions.searchCriteriaLabel, { criteria: search.criteria })
    : "";

  return (
    <div className="page-actions">
      {search && (
        <div className="page-actions__search">
          <label className="page-actions__search-field">
            <SearchIcon />
            <input
              type="search"
              className="page-actions__search-input"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={text.pageActions.searchPlaceholder}
              aria-label={searchLabel}
              maxLength={FIELD_LIMITS.searchMax}
            />
          </label>
          <Tooltip
            label={searchLabel}
            content={search.criteria}
            className="page-actions__search-info"
          >
            <InfoIcon />
          </Tooltip>
        </div>
      )}

      {visibleToggles.map((toggle) => (
        <label key={toggle.param} className="page-actions__toggle">
          <input
            type="checkbox"
            className="page-actions__checkbox"
            checked={getToggle(toggle.param)}
            onChange={(event) => setToggle(toggle.param, event.target.checked)}
          />
          {toggle.label}
        </label>
      ))}

      {visibleFilters.map((filter) => (
        <Dropdown
          key={filter.param}
          label={filter.label}
          options={filter.options}
          value={getFilter(filter.param) || (filter.defaultValue ?? "")}
          onChange={(next) => setFilter(filter.param, next)}
          onSearch={filter.onSearch}
          isLoading={filter.isLoading}
        />
      ))}

      {dateFilter && (
        <DatePicker
          label={dateFilter.label}
          fromParam={dateFilter.fromParam}
          toParam={dateFilter.toParam}
          disableFuture={dateFilter.disableFuture}
        />
      )}

      {visibleMultiFilters.map((filter) => (
        <MultiDropdown
          key={filter.param}
          label={filter.label}
          countTemplate={text.pageActions.selectedCount}
          options={filter.options}
          values={getFilterValues(filter.param)}
          onChange={(next) => setFilterValues(filter.param, next)}
          onSearch={filter.onSearch}
          isLoading={filter.isLoading}
        />
      ))}
    </div>
  );
}
