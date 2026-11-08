import { useTheme } from "../hooks/useTheme";
import { text } from "../i18n";
import { THEME } from "../lib/constants";
import { LOGO_SRC_DARK, LOGO_SRC_LIGHT } from "./constants";

export function Logo({ className }: { className: string }) {
  const { theme } = useTheme();

  return (
    <img
      className={className}
      src={theme === THEME.DARK ? LOGO_SRC_DARK : LOGO_SRC_LIGHT}
      alt={text.common.logoAlt}
    />
  );
}
