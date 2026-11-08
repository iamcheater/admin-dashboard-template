import en from "./en.json";

export const text = en;

const PLACEHOLDER = /\{(\w+)\}/g;

export const format = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(PLACEHOLDER, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
