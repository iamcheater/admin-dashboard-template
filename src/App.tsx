import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { AppLayout } from "./components/AppLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import {
  LandingRedirect,
  RequireAuth,
  RequireSuperAdmin,
} from "./components/guards";
import { Loading } from "./components/ui";
import { AccountPage } from "./pages/AccountPage";
import { AdminsPage } from "./pages/AdminsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PATHNAMES, TOAST_AUTO_CLOSE_MS } from "./lib/constants";
import { SHOWCASE_ROUTE } from "./presentation-data/constants";
import { PresentationLanding } from "./presentation-data/PresentationLanding";

const ShowcaseRoutes = import.meta.env.DEV
  ? lazy(() => import("./presentation-data/ShowcaseRoutes"))
  : null;

export default function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path={PATHNAMES.LOGIN} element={<LoginPage />} />
          <Route
            path={PATHNAMES.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={PATHNAMES.RESET_PASSWORD}
            element={<ResetPasswordPage />}
          />

          {ShowcaseRoutes && (
            <Route element={<AppLayout />}>
              <Route index element={<PresentationLanding />} />
              <Route
                path={SHOWCASE_ROUTE}
                element={
                  <Suspense fallback={<Loading />}>
                    <ShowcaseRoutes />
                  </Suspense>
                }
              />
            </Route>
          )}

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<LandingRedirect />} />

              <Route path={PATHNAMES.DASHBOARD} element={<DashboardPage />} />

              <Route
                path={PATHNAMES.ADMINS}
                element={
                  <RequireSuperAdmin>
                    <AdminsPage />
                  </RequireSuperAdmin>
                }
              />

              <Route path={PATHNAMES.ACCOUNT} element={<AccountPage />} />

              <Route
                path={PATHNAMES.CATCH_ALL}
                element={<Navigate to={PATHNAMES.ROOT} replace />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={TOAST_AUTO_CLOSE_MS.info}
        transition={Slide}
        theme="light"
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable={false}
      />
    </>
  );
}
