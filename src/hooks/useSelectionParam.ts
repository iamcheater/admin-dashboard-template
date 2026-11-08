import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useSelectionParam(param: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = searchParams.get(param) ?? "";

  const setSelected = useCallback(
    (next: string) => {
      setSearchParams((params) => {
        if (next) params.set(param, next);
        else params.delete(param);
        return params;
      });
    },
    [setSearchParams, param],
  );

  return { selected, setSelected };
}
