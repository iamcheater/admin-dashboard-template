import { useTheme } from "../hooks/useTheme";
import { text } from "../i18n";
import { THEME } from "../lib/constants";
import { MoonIcon, SunIcon } from "./icons";

const THEME_OPTIONS = [
  { value: THEME.LIGHT, label: text.theme.light, Icon: SunIcon },
  { value: THEME.DARK, label: text.theme.dark, Icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label={text.theme.label}>
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={`theme-toggle__option${value === theme ? " is-active" : ""}`}
          aria-pressed={value === theme}
          onClick={() => setTheme(value)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}
