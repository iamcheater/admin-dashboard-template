import {
  FIRST_PAGE,
  PAGINATION_ALL_PAGES_THRESHOLD,
  PAGINATION_BOUNDARY_PAGE_COUNT,
  PAGINATION_EDGE_PAGE_COUNT,
  PAGINATION_GAP,
} from "./constants";

export type PageItem = number | typeof PAGINATION_GAP;

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

export const buildPageItems = (
  currentPage: number,
  totalPages: number,
): PageItem[] => {
  if (totalPages <= PAGINATION_ALL_PAGES_THRESHOLD) {
    return range(FIRST_PAGE, totalPages);
  }

  const firstEdge = range(FIRST_PAGE, PAGINATION_EDGE_PAGE_COUNT);
  const lastEdge = range(totalPages - PAGINATION_EDGE_PAGE_COUNT + 1, totalPages);
  const firstBoundary = range(FIRST_PAGE, PAGINATION_BOUNDARY_PAGE_COUNT);
  const lastBoundary = range(
    totalPages - PAGINATION_BOUNDARY_PAGE_COUNT + 1,
    totalPages,
  );

  if (currentPage <= PAGINATION_EDGE_PAGE_COUNT) {
    return [...firstEdge, PAGINATION_GAP, ...lastBoundary];
  }

  if (currentPage > totalPages - PAGINATION_EDGE_PAGE_COUNT) {
    return [...firstBoundary, PAGINATION_GAP, ...lastEdge];
  }

  return [
    FIRST_PAGE,
    PAGINATION_GAP,
    ...range(currentPage - 1, currentPage + 1),
    PAGINATION_GAP,
    totalPages,
  ];
};
