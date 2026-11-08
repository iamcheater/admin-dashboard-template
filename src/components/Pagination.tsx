import { useEffect } from "react";
import { usePageParam } from "../hooks/usePageParam";
import { format, text } from "../i18n";
import { FIRST_PAGE, PAGINATION_GAP } from "../lib/constants";
import { buildPageItems } from "../lib/pagination";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

export function Pagination({ totalPages }: { totalPages: number }) {
  const { page, setPage } = usePageParam();

  const isOutOfRange = totalPages >= FIRST_PAGE && page > totalPages;

  useEffect(() => {
    if (!isOutOfRange) return;
    setPage(totalPages);
  }, [isOutOfRange, totalPages, setPage]);

  if (totalPages <= FIRST_PAGE) return null;

  const currentPage = Math.min(page, totalPages);
  const isFirst = currentPage === FIRST_PAGE;
  const isLast = currentPage === totalPages;

  return (
    <nav className="pagination" aria-label={text.pagination.label}>
      <button
        type="button"
        className="pagination__step"
        onClick={() => setPage(currentPage - 1)}
        disabled={isFirst}
      >
        <ArrowLeftIcon />
        {text.pagination.previous}
      </button>

      <ul className="pagination__list">
        {buildPageItems(currentPage, totalPages).map((item, index) =>
          item === PAGINATION_GAP ? (
            <li
              key={`${PAGINATION_GAP}-${index}`}
              className="pagination__gap"
              aria-hidden
            >
              {text.pagination.gap}
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`pagination__page${item === currentPage ? " is-current" : ""}`}
                onClick={() => setPage(item)}
                aria-label={format(text.pagination.goToPage, { page: item })}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pagination__step"
        onClick={() => setPage(currentPage + 1)}
        disabled={isLast}
      >
        {text.pagination.next}
        <ArrowRightIcon />
      </button>
    </nav>
  );
}
