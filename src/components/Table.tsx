import type { ReactNode } from "react";
import { useSortParams } from "../hooks/useSortParams";
import { text } from "../i18n";
import { SORT_ORDER } from "../lib/constants";
import { CustomSkeleton } from "./CustomSkeleton";
import { RowMenu, type RowMenuItem } from "./RowMenu";
import { KEYBOARD_KEY, TABLE_SKELETON_ROW_COUNT } from "./constants";
import { SortIcon } from "./icons";
import { Alert } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render: (row: T) => ReactNode;
}

export interface RowAction {
  icon?: ReactNode;
  text?: string;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "accent";
  disabled?: boolean;
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  actions,
  menu,
  onRowClick,
  getRowLabel,
  defaultSortBy,
  isLoading,
  error,
  emptyMessage,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  actions?: (row: T) => RowAction[];
  menu?: { label: string; items: (row: T) => RowMenuItem[] };
  onRowClick?: (row: T) => void;
  getRowLabel?: (row: T) => string;
  defaultSortBy?: string;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage: string;
}) {
  const { sortBy, sortOrder, toggleSort } = useSortParams(defaultSortBy ?? "");

  const isInitialLoading = Boolean(isLoading) && rows.length === 0;

  const hasActionsColumn = Boolean(actions) || Boolean(menu);
  const hasFixedWidths = columns.some((column) => column.width);
  const columnCount = columns.length + (hasActionsColumn ? 1 : 0);

  const sortIconClassName = (column: Column<T>) => {
    if (sortBy !== column.key) return "data-table__sort-icon";
    return sortOrder === SORT_ORDER.DESC
      ? "data-table__sort-icon is-active is-descending"
      : "data-table__sort-icon is-active";
  };

  const ariaSort = (column: Column<T>) => {
    if (!column.sortable) return undefined;
    if (sortBy !== column.key) return "none" as const;
    return sortOrder === SORT_ORDER.ASC
      ? ("ascending" as const)
      : ("descending" as const);
  };

  return (
    <div className={`data-table${isLoading ? " is-busy" : ""}`}>
      <div className="data-table__scroll">
        <table
          className={`data-table__table${hasFixedWidths ? " is-fixed" : ""}`}
          aria-busy={isLoading}
        >
          {hasFixedWidths && (
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} style={{ width: column.width }} />
              ))}
              {hasActionsColumn && <col />}
            </colgroup>
          )}

          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} aria-sort={ariaSort(column)} scope="col">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="data-table__sort"
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.header}
                      <SortIcon className={sortIconClassName(column)} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {hasActionsColumn && (
                <th scope="col" className="data-table__actions-cell">
                  {text.table.actions}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isInitialLoading ? (
              Array.from({ length: TABLE_SKELETON_ROW_COUNT }, (_, index) => (
                <tr key={index}>
                  <td colSpan={columnCount}>
                    <CustomSkeleton
                      variant="rounded"
                      className="data-table__skeleton-bar"
                    />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="data-table__state">
                  <Alert>{error}</Alert>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="data-table__state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className={onRowClick ? "is-clickable" : undefined}
                  role={onRowClick ? "button" : undefined}
                  aria-label={onRowClick ? getRowLabel?.(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (
                            event.key !== KEYBOARD_KEY.ENTER &&
                            event.key !== KEYBOARD_KEY.SPACE
                          )
                            return;
                          event.preventDefault();
                          onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                  {hasActionsColumn && (
                    <td className="data-table__actions-cell">
                      <div className="data-table__actions">
                        {menu && (
                          <RowMenu label={menu.label} items={menu.items(row)} />
                        )}
                        {actions?.(row).map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            className={`data-table__action data-table__action--${action.tone ?? "default"}${action.text ? " data-table__action--text" : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              action.onClick();
                            }}
                            disabled={action.disabled}
                            aria-label={action.text ? undefined : action.label}
                            title={action.label}
                          >
                            {action.icon}
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
