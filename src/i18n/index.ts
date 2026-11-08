import type { AdminLanguage } from "../lib/constants";
import { ACTIVE_LANGUAGE } from "../lib/language";
import en from "./en.json";
import hy from "./hy.json";

type Dictionary = typeof en & typeof hy;

const DICTIONARIES = { en, hy } satisfies Record<AdminLanguage, Dictionary>;

export const text: typeof en = DICTIONARIES[ACTIVE_LANGUAGE];

const PLACEHOLDER = /\{(\w+)\}/g;

export const format = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(PLACEHOLDER, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
