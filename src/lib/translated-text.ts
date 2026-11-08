import type { TranslatedText, TranslatedTextPatch } from "../api/types";
import { format, text } from "../i18n";
import {
  CONTENT_LANGUAGES,
  defaultContentLanguageOf,
} from "./content-languages";

export interface TranslatedTextRules {
  required?: boolean;
  maxLength?: number;
  languages?: readonly string[];
}

export type TranslatedTextProblems = Partial<Record<string, string>>;

const translationOf = (
  value: TranslatedText | null | undefined,
  language: string,
) => value?.[language] ?? "";

export const toTranslatedTextFormValue = (
  value?: TranslatedText | null,
  languages: readonly string[] = CONTENT_LANGUAGES,
): TranslatedText =>
  Object.fromEntries(
    languages.map((language) => [language, translationOf(value, language)]),
  );

export const isTranslationFilled = (
  value: TranslatedText | null | undefined,
  language: string,
): boolean => translationOf(value, language).trim().length > 0;

export const describeTranslatedTextProblems = (
  value: TranslatedText | null | undefined,
  {
    required = false,
    maxLength,
    languages = CONTENT_LANGUAGES,
  }: TranslatedTextRules,
): TranslatedTextProblems => {
  const requiredLanguage = defaultContentLanguageOf(languages);
  const problems: TranslatedTextProblems = {};

  for (const language of languages) {
    const translation = translationOf(value, language);

    if (required && language === requiredLanguage && !translation.trim()) {
      problems[language] = text.validation.required;
    } else if (maxLength !== undefined && translation.length > maxLength) {
      problems[language] = format(text.validation.tooLong, {
        count: maxLength,
      });
    }
  }

  return problems;
};

export const validateTranslatedText =
  (rules: TranslatedTextRules) =>
  (value: TranslatedText | null | undefined): true | string =>
    Object.values(describeTranslatedTextProblems(value, rules))[0] ?? true;

export const buildTranslatedTextPatch = (
  saved: TranslatedText | null | undefined,
  edited: TranslatedText | null | undefined,
  languages: readonly string[] = CONTENT_LANGUAGES,
): TranslatedTextPatch | undefined => {
  const changed = languages.flatMap((language) => {
    const next = translationOf(edited, language).trim();
    return next === translationOf(saved, language).trim()
      ? []
      : [[language, next] as const];
  });

  return changed.length > 0 ? Object.fromEntries(changed) : undefined;
};
