export interface LabelledOption {
  value: string;
  label: string;
}

export function filterOptions<T extends LabelledOption>(
  options: T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;

  return options.filter((option) =>
    option.label.toLowerCase().includes(needle),
  );
}

export function listedOptions<T extends LabelledOption & { pinned?: boolean }>(
  options: T[],
  query: string,
  isSearchable: boolean,
  isAwaitingResults: boolean,
): T[] {
  if (!isSearchable) return filterOptions(options, query);
  if (!query.trim()) return options;
  if (isAwaitingResults) return [];

  return options.filter((option) => !option.pinned);
}

export function sameIds(left: string[], right: string[]): boolean {
  const held = new Set(right);
  const wanted = new Set(left);

  return (
    wanted.size === held.size && [...wanted].every((id) => held.has(id))
  );
}
