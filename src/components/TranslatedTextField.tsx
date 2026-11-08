import { lazy, Suspense, useRef, useState, type KeyboardEvent } from "react";
import type { TranslatedText } from "../api/types";
import { format, text } from "../i18n";
import {
  CONTENT_LANGUAGES,
  contentLanguageName,
  defaultContentLanguageOf,
} from "../lib/content-languages";
import {
  describeTranslatedTextProblems,
  isTranslationFilled,
} from "../lib/translated-text";
import { KEYBOARD_KEY } from "./constants";
import { Field, Loading } from "./ui";

const RichTextEditor = lazy(() => import("./RichTextEditor"));

const richTextFallback = (
  <div className="rich-text rich-text--loading">
    <Loading label={text.richText.loading} />
  </div>
);

const descriptionIdOf = (controlId: string) => `${controlId}-description`;

const stepKeys: Partial<Record<string, number>> = {
  [KEYBOARD_KEY.ARROW_RIGHT]: 1,
  [KEYBOARD_KEY.ARROW_LEFT]: -1,
};

export function TranslatedTextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  required = false,
  maxLength,
  multiline = false,
  rich = false,
  disabled = false,
  showErrors = false,
  hint,
  placeholder,
  languages = CONTENT_LANGUAGES,
}: {
  id: string;
  label: string;
  value: TranslatedText | null | undefined;
  onChange: (next: TranslatedText) => void;
  onBlur?: () => void;
  required?: boolean;
  maxLength?: number;
  multiline?: boolean;
  rich?: boolean;
  disabled?: boolean;
  showErrors?: boolean;
  hint?: string;
  placeholder?: string;
  languages?: readonly string[];
}) {
  const defaultLanguage = defaultContentLanguageOf(languages);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const activeLanguage = languages.includes(selectedLanguage)
    ? selectedLanguage
    : defaultLanguage;
  const hasTabs = languages.length > 1;

  const problems = showErrors
    ? describeTranslatedTextProblems(value, { required, maxLength, languages })
    : {};
  const hasOtherProblems = languages.some(
    (language) => language !== activeLanguage && problems[language],
  );

  const controlIdOf = (language: string) =>
    hasTabs ? `${id}-${language}` : id;
  const tabIdOf = (language: string) => `${id}-${language}-tab`;
  const panelIdOf = (language: string) => `${id}-${language}-panel`;

  const activeError =
    problems[activeLanguage] ??
    (hasOtherProblems ? text.translatedText.otherLanguagesInvalid : undefined);

  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    tabRefs.current.get(language)?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = languages.indexOf(activeLanguage);
    const step = stepKeys[event.key];
    let next: string | undefined;

    if (step !== undefined) {
      next = languages[(index + step + languages.length) % languages.length];
    } else if (event.key === KEYBOARD_KEY.HOME) {
      next = languages[0];
    } else if (event.key === KEYBOARD_KEY.END) {
      next = languages[languages.length - 1];
    }

    if (next === undefined) return;
    event.preventDefault();
    selectLanguage(next);
  };

  const renderControl = (language: string) => {
    const controlId = controlIdOf(language);
    const problem = problems[language];
    const isActive = language === activeLanguage;
    const shared = {
      id: controlId,
      lang: language,
      value: value?.[language] ?? "",
      maxLength,
      disabled,
      placeholder,
      onBlur,
      "aria-label": hasTabs
        ? format(text.translatedText.controlLabel, {
            field: label,
            language: contentLanguageName(language),
          })
        : undefined,
      "aria-required": (required && language === defaultLanguage) || undefined,
      "aria-invalid": Boolean(problem),
      "aria-describedby":
        isActive && (hint || activeError)
          ? descriptionIdOf(controlId)
          : undefined,
    };
    const onValueChange = (next: string) =>
      onChange({ ...value, [language]: next });

    if (rich) {
      return (
        <Suspense fallback={richTextFallback}>
          <RichTextEditor
            id={controlId}
            lang={language}
            value={shared.value}
            onChange={onValueChange}
            onBlur={onBlur}
            ariaLabel={shared["aria-label"] ?? label}
            describedBy={shared["aria-describedby"]}
            required={Boolean(shared["aria-required"])}
            invalid={shared["aria-invalid"]}
            disabled={disabled}
          />
        </Suspense>
      );
    }

    return multiline ? (
      <textarea
        {...shared}
        className="textarea"
        onChange={(event) => onValueChange(event.target.value)}
      />
    ) : (
      <input
        {...shared}
        type="text"
        className="input"
        onChange={(event) => onValueChange(event.target.value)}
      />
    );
  };

  const tabs = hasTabs ? (
    <div
      className="translated-field__tabs"
      role="tablist"
      aria-label={format(text.translatedText.tabsLabel, { field: label })}
    >
      {languages.map((language) => {
        const isActive = language === activeLanguage;
        const isInvalid = Boolean(problems[language]);
        const isFilled = isTranslationFilled(value, language);
        const status = isInvalid
          ? text.translatedText.invalid
          : isFilled
            ? text.translatedText.filled
            : text.translatedText.empty;

        return (
          <button
            key={language}
            ref={(node) => {
              if (node) tabRefs.current.set(language, node);
              else tabRefs.current.delete(language);
            }}
            type="button"
            role="tab"
            id={tabIdOf(language)}
            aria-selected={isActive}
            aria-controls={panelIdOf(language)}
            tabIndex={isActive ? 0 : -1}
            className={`translated-field__tab${isActive ? " is-active" : ""}${isInvalid ? " is-invalid" : isFilled ? " is-filled" : ""}`}
            onClick={() => setSelectedLanguage(language)}
            onKeyDown={onTabKeyDown}
          >
            <span aria-hidden>{language.toUpperCase()}</span>
            <span className="translated-field__marker" aria-hidden />
            <span className="sr-only">
              {format(text.translatedText.tabName, {
                language: contentLanguageName(language),
                status,
              })}
            </span>
          </button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <Field
      label={label}
      required={required}
      htmlFor={controlIdOf(activeLanguage)}
      hint={hint}
      error={activeError}
      aside={tabs}
    >
      {hasTabs
        ? languages.map((language) => (
            <div
              key={language}
              role="tabpanel"
              id={panelIdOf(language)}
              aria-labelledby={tabIdOf(language)}
              hidden={language !== activeLanguage}
            >
              {renderControl(language)}
            </div>
          ))
        : renderControl(activeLanguage)}
    </Field>
  );
}
