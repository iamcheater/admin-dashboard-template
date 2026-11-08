import { Navigate, Route, Routes } from "react-router-dom";
import { applyBrand, loadBrand } from "./brand";
import { BrandPage } from "./BrandPage";
import { ButtonsPage } from "./ButtonsPage";
import { PRESENTATION_PATHNAMES, SHOWCASE_ROOT } from "./constants";
import { FeedbackPage } from "./FeedbackPage";
import { FilterBarPage } from "./FilterBarPage";
import { ForgotPasswordPreviewPage } from "./ForgotPasswordPreviewPage";
import { IconsPage } from "./IconsPage";
import { InputsPage } from "./InputsPage";
import { LoginPreviewPage } from "./LoginPreviewPage";
import { MediaPage } from "./MediaPage";
import { ModalsPage } from "./ModalsPage";
import { WelcomePage } from "./WelcomePage";
import { ResetPasswordPreviewPage } from "./ResetPasswordPreviewPage";
import { TablesPage } from "./TablesPage";
import { TokensPage } from "./TokensPage";
import "./_presentation.scss";

applyBrand(loadBrand());

const SHOWCASE_PAGES = [
  { path: PRESENTATION_PATHNAMES.WELCOME, Page: WelcomePage },
  { path: PRESENTATION_PATHNAMES.LOGIN, Page: LoginPreviewPage },
  {
    path: PRESENTATION_PATHNAMES.FORGOT_PASSWORD,
    Page: ForgotPasswordPreviewPage,
  },
  {
    path: PRESENTATION_PATHNAMES.RESET_PASSWORD,
    Page: ResetPasswordPreviewPage,
  },
  { path: PRESENTATION_PATHNAMES.BUTTONS, Page: ButtonsPage },
  { path: PRESENTATION_PATHNAMES.INPUTS, Page: InputsPage },
  { path: PRESENTATION_PATHNAMES.MEDIA, Page: MediaPage },
  { path: PRESENTATION_PATHNAMES.TABLES, Page: TablesPage },
  { path: PRESENTATION_PATHNAMES.FILTERS, Page: FilterBarPage },
  { path: PRESENTATION_PATHNAMES.MODALS, Page: ModalsPage },
  { path: PRESENTATION_PATHNAMES.FEEDBACK, Page: FeedbackPage },
  { path: PRESENTATION_PATHNAMES.BRAND, Page: BrandPage },
  { path: PRESENTATION_PATHNAMES.TOKENS, Page: TokensPage },
  { path: PRESENTATION_PATHNAMES.ICONS, Page: IconsPage },
];

export default function ShowcaseRoutes() {
  return (
    <Routes>
      {SHOWCASE_PAGES.map(({ path, Page }) => (
        <Route
          key={path}
          path={path.slice(SHOWCASE_ROOT.length + 1)}
          element={<Page />}
        />
      ))}
      <Route
        path="*"
        element={<Navigate to={PRESENTATION_PATHNAMES.WELCOME} replace />}
      />
    </Routes>
  );
}
