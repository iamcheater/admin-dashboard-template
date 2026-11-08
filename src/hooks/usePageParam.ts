import { useSearchParams } from "react-router-dom";
import { FIRST_PAGE, PAGE_SEARCH_PARAM } from "../lib/constants";

export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = Number(searchParams.get(PAGE_SEARCH_PARAM));
  const page =
    Number.isInteger(requested) && requested >= FIRST_PAGE
      ? requested
      : FIRST_PAGE;

  const setPage = (next: number) => {
    setSearchParams((params) => {
      if (next <= FIRST_PAGE) params.delete(PAGE_SEARCH_PARAM);
      else params.set(PAGE_SEARCH_PARAM, String(next));
      return params;
    });
  };

  return { page, setPage };
}
