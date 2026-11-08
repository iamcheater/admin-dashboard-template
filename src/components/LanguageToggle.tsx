import { text } from "../i18n";
import { ADMIN_LANGUAGE } from "../lib/constants";
import { ACTIVE_LANGUAGE, setLanguage } from "../lib/language";

const LANGUAGE_OPTIONS = [
  { value: ADMIN_LANGUAGE.EN, label: text.language.options.en },
  { value: ADMIN_LANGUAGE.HY, label: text.language.options.hy },
];

export function LanguageToggle() {
  return (
    <div
      className="sidebar-toggle"
      role="group"
      aria-label={text.language.label}
    >
      {LANGUAGE_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          lang={value}
          className={`sidebar-toggle__option${value === ACTIVE_LANGUAGE ? " is-active" : ""}`}
          aria-pressed={value === ACTIVE_LANGUAGE}
          onClick={() => setLanguage(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
