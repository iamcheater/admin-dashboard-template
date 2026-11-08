import { NavLink } from "react-router-dom";
import { text } from "../i18n";
import { PATHNAMES } from "../lib/constants";
import { formatAdminRole } from "../lib/format";
import { PRESENTATION_NAV_SECTIONS } from "../presentation-data/nav";
import { useAppSelector } from "../redux/store";
import { EditIconSmall } from "./icons";
import { Logo } from "./Logo";
import { canAccessNavItem, NAV_SECTIONS } from "./nav";

export function Sidebar({
  isOpen = false,
  onNavigate,
}: {
  isOpen?: boolean;
  onNavigate?: () => void;
}) {
  const user = useAppSelector((state) => state.authReducer.user);
  const claims = useAppSelector((state) => state.authReducer.claims);

  const sections = [
    ...NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessNavItem(claims, item)),
    })).filter((section) => section.items.length > 0),
    ...PRESENTATION_NAV_SECTIONS,
  ];

  return (
    <aside id="main-nav" className={`sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="sidebar__brand">
        <Logo className="sidebar__logo" />
      </div>

      <nav className="sidebar__nav" aria-label={text.nav.label}>
        {sections.map((section) => (
          <div className="sidebar__group" key={section.heading}>
            <div className="sidebar__section">{section.heading}</div>
            <div className="sidebar__items">
              {section.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    isActive ? "sidebar__link is-active" : "sidebar__link"
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <p className="sidebar__section">{text.nav.empty}</p>
        )}
      </nav>

      {claims && (
        <div className="sidebar__footer">
          <NavLink
            to={PATHNAMES.ACCOUNT}
            className="sidebar__identity"
            onClick={onNavigate}
            aria-label={text.nav.accountLink}
            title={text.nav.accountLink}
          >
            <span className="sidebar__user">
              {user?.email ?? text.common.signedIn}
            </span>
            <span className="sidebar__role">
              {formatAdminRole(user, Boolean(claims?.isSuperAdmin))}
            </span>
          </NavLink>
          <NavLink
            to={PATHNAMES.ACCOUNT}
            className="icon-button"
            onClick={onNavigate}
            tabIndex={-1}
            aria-hidden
          >
            <EditIconSmall />
          </NavLink>
        </div>
      )}
    </aside>
  );
}
