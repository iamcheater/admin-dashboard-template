import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PAGE_SEARCH_PARAM,
  SORT_BY_SEARCH_PARAM,
  SORT_ORDER,
  SORT_ORDER_SEARCH_PARAM,
  type SortOrder,
} from "../lib/constants";

export function useSortParams<T extends string>(
  defaultSortBy: T,
  allowed?: readonly T[],
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get(SORT_BY_SEARCH_PARAM);
  const sortBy =
    requested !== null && (!allowed || allowed.includes(requested as T))
      ? (requested as T)
      : defaultSortBy;
  const sortOrder: SortOrder =
    searchParams.get(SORT_ORDER_SEARCH_PARAM) === SORT_ORDER.ASC
      ? SORT_ORDER.ASC
      : SORT_ORDER.DESC;

  const toggleSort = useCallback(
    (key: string) => {
      setSearchParams((params) => {
        const currentSortBy = params.get(SORT_BY_SEARCH_PARAM) ?? defaultSortBy;
        const isDescending =
          params.get(SORT_ORDER_SEARCH_PARAM) !== SORT_ORDER.ASC;

        params.set(SORT_BY_SEARCH_PARAM, key);
        params.set(
          SORT_ORDER_SEARCH_PARAM,
          currentSortBy === key && isDescending
            ? SORT_ORDER.ASC
            : SORT_ORDER.DESC,
        );
        params.delete(PAGE_SEARCH_PARAM);
        return params;
      });
    },
    [setSearchParams, defaultSortBy],
  );

  return { sortBy, sortOrder, toggleSort };
}
