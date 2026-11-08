import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { PAGE_SEARCH_PARAM, SCROLL_TOP } from "../lib/constants";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const page = searchParams.get(PAGE_SEARCH_PARAM) ?? "";

  useEffect(() => {
    window.scrollTo({ top: SCROLL_TOP, left: SCROLL_TOP });
  }, [pathname, page]);

  return null;
}
