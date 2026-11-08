import { text } from "../i18n";
import { DARK_THEME_QUERY, LOGO_SRC_DARK, LOGO_SRC_LIGHT } from "./constants";

export function Logo({ className }: { className: string }) {
  return (
    <picture className="logo">
      <source media={DARK_THEME_QUERY} srcSet={LOGO_SRC_DARK} />
      <img
        className={className}
        src={LOGO_SRC_LIGHT}
        alt={text.common.logoAlt}
      />
    </picture>
  );
}
