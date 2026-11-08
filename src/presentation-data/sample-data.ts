import { SORT_ORDER, type SortOrder } from "../lib/constants";
import { SAMPLE_OPTION_VALUES, type SampleSortBy } from "./constants";
import { presentationText } from "./text";

export interface SampleRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  note: string;
  createdAt: string;
}

export const SAMPLE_RECORDS: SampleRecord[] = presentationText.sampleRecords;

export const SAMPLE_OPTIONS = SAMPLE_OPTION_VALUES.map((value) => ({
  value,
  label:
    presentationText.sampleOptions[
      value as keyof typeof presentationText.sampleOptions
    ],
}));

export function querySampleRecords({
  search,
  sortBy,
  sortOrder,
  page,
  pageSize,
}: {
  search: string;
  sortBy: SampleSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}) {
  const needle = search.trim().toLowerCase();
  const direction = sortOrder === SORT_ORDER.ASC ? 1 : -1;

  const matching = SAMPLE_RECORDS.filter(
    (record) =>
      record.name.toLowerCase().includes(needle) ||
      record.email.toLowerCase().includes(needle),
  ).sort(
    (first, second) => first[sortBy].localeCompare(second[sortBy]) * direction,
  );

  const start = (page - 1) * pageSize;

  return {
    rows: matching.slice(start, start + pageSize),
    totalPages: Math.ceil(matching.length / pageSize),
  };
}
