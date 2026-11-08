import { text } from "../i18n";
import {
  CONTENT_LANGUAGE_SEPARATOR,
  FALLBACK_CONTENT_LANGUAGES,
} from "./constants";

const normalize = (code: string) => code.trim().toLowerCase();

const configuredLanguages = (import.meta.env.VITE_CONTENT_LANGUAGES ?? "")
  .split(CONTENT_LANGUAGE_SEPARATOR)
  .map(normalize)
  .filter(Boolean);

export const CONTENT_LANGUAGES: readonly string[] =
  configuredLanguages.length > 0
    ? [...new Set(configuredLanguages)]
    : FALLBACK_CONTENT_LANGUAGES;

const configuredDefault = normalize(
  import.meta.env.VITE_DEFAULT_CONTENT_LANGUAGE ?? "",
);

export const defaultContentLanguageOf = (
  languages: readonly string[],
): string =>
  languages.includes(configuredDefault) ? configuredDefault : languages[0];

export const DEFAULT_CONTENT_LANGUAGE =
  defaultContentLanguageOf(CONTENT_LANGUAGES);

const LANGUAGE_NAMES: Partial<Record<string, string>> = text.contentLanguages;

export const contentLanguageName = (code: string): string =>
  LANGUAGE_NAMES[code] ?? code.toUpperCase();
