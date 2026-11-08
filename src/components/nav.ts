import type { Permission } from "../api/types";
import type { TokenClaims } from "../auth/session";
import { grants } from "../auth/session";
import { text } from "../i18n";
import { PATHNAMES } from "../lib/constants";
import { AdminsIcon, DashboardIcon } from "./icons";

export interface NavItem {
  to: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  permission?: Permission;
  superAdminOnly?: boolean;
}

export const canAccessNavItem = (
  claims: TokenClaims | null,
  item: NavItem,
): boolean => {
  if (!claims) return false;
  if (item.superAdminOnly) return claims.isSuperAdmin;
  return item.permission === undefined || grants(claims, item.permission);
};

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: text.nav.sections.overview,
    items: [
      {
        to: PATHNAMES.DASHBOARD,
        label: text.nav.items.dashboard,
        Icon: DashboardIcon,
      },
    ],
  },
  {
    heading: text.nav.sections.administration,
    items: [
      {
        to: PATHNAMES.ADMINS,
        label: text.nav.items.admins,
        Icon: AdminsIcon,
        superAdminOnly: true,
      },
    ],
  },
];
