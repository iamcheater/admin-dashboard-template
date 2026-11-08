import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PAGE_SEARCH_PARAM,
  SEARCH_SEARCH_PARAM,
  TOGGLE_ON,
} from "../lib/constants";

export function usePageActionParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get(SEARCH_SEARCH_PARAM) ?? "";

  const write = useCallback(
    (key: string, value: string, replace: boolean) => {
      setSearchParams(
        (params) => {
          if (value) params.set(key, value);
          else params.delete(key);
          params.delete(PAGE_SEARCH_PARAM);
          return params;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const setSearchTerm = useCallback(
    (value: string) => write(SEARCH_SEARCH_PARAM, value, true),
    [write],
  );

  const getFilter = useCallback(
    (param: string) => searchParams.get(param) ?? "",
    [searchParams],
  );

  const setFilter = useCallback(
    (param: string, value: string) => write(param, value, false),
    [write],
  );

  const setFilters = useCallback(
    (entries: Record<string, string>) => {
      setSearchParams((params) => {
        for (const [key, value] of Object.entries(entries)) {
          if (value) params.set(key, value);
          else params.delete(key);
        }
        params.delete(PAGE_SEARCH_PARAM);
        return params;
      });
    },
    [setSearchParams],
  );

  const getFilterValues = useCallback(
    (param: string) => searchParams.getAll(param),
    [searchParams],
  );

  const setFilterValues = useCallback(
    (param: string, values: string[]) => {
      setSearchParams((params) => {
        params.delete(param);
        for (const value of values) params.append(param, value);
        params.delete(PAGE_SEARCH_PARAM);
        return params;
      });
    },
    [setSearchParams],
  );

  const getToggle = useCallback(
    (param: string) => searchParams.get(param) === TOGGLE_ON,
    [searchParams],
  );

  const setToggle = useCallback(
    (param: string, isOn: boolean) => write(param, isOn ? TOGGLE_ON : "", false),
    [write],
  );

  return {
    searchTerm,
    setSearchTerm,
    getFilter,
    setFilter,
    setFilters,
    getFilterValues,
    setFilterValues,
    getToggle,
    setToggle,
  };
}
