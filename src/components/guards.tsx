import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Permission } from "../api/types";
import { grants } from "../auth/session";
import { text } from "../i18n";
import { PATHNAMES } from "../lib/constants";
import { useAppSelector } from "../redux/store";
import { canAccessNavItem, NAV_SECTIONS } from "./nav";
import { PageHeader } from "./PageHeader";
import { Alert, Loading } from "./ui";

export function RequireAuth() {
  const claims = useAppSelector((state) => state.authReducer.claims);
  const isRestoring = useAppSelector((state) => state.authReducer.isRestoring);
  const location = useLocation();

  if (isRestoring) return <Loading label={text.common.restoringSession} />;

  if (!claims) {
    return (
      <Navigate
        to={PATHNAMES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const claims = useAppSelector((state) => state.authReducer.claims);

  if (!grants(claims, permission)) {
    return (
      <>
        <PageHeader title={text.guards.notAvailableTitle} />
        <Alert tone="warning">
          {text.guards.missingPermissionLead} <code>{permission}</code>
          {text.guards.missingPermissionTail}
        </Alert>
      </>
    );
  }

  return children;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const claims = useAppSelector((state) => state.authReducer.claims);

  if (!claims?.isSuperAdmin) {
    return (
      <>
        <PageHeader title={text.guards.notAvailableTitle} />
        <Alert tone="warning">{text.guards.superAdminOnly}</Alert>
      </>
    );
  }

  return children;
}

export function LandingRedirect() {
  const claims = useAppSelector((state) => state.authReducer.claims);

  const first = NAV_SECTIONS.flatMap((section) => section.items).find((item) =>
    canAccessNavItem(claims, item),
  );

  if (!first) {
    return (
      <>
        <PageHeader title={text.guards.welcomeTitle} />
        <Alert tone="warning">{text.guards.noPermissions}</Alert>
      </>
    );
  }

  return <Navigate to={first.to} replace />;
}
