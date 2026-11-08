import type { ReactNode } from "react";
import { text } from "../i18n";
import { MenuIcon } from "./icons";
import { useNav } from "./nav-context";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const nav = useNav();

  return (
    <header className="page-heading">
      {nav && (
        <button
          type="button"
          className="page-heading__nav"
          onClick={nav.openNav}
          aria-label={text.nav.open}
        >
          <MenuIcon />
        </button>
      )}

      <div className="page-heading__text">
        <h1 className="page-heading__title">{title}</h1>
        {subtitle && <p className="page-heading__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-heading__action">{actions}</div>}
    </header>
  );
}
