import { ButtonsPage } from "./ButtonsPage";
import { PRESENTATION_PATHNAMES } from "./constants";
import { ForgotPasswordPreviewPage } from "./ForgotPasswordPreviewPage";
import { IconsPage } from "./IconsPage";
import { InputsPage } from "./InputsPage";
import { LoginPreviewPage } from "./LoginPreviewPage";
import { ResetPasswordPreviewPage } from "./ResetPasswordPreviewPage";

export const PRESENTATION_ROUTES = [
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
  { path: PRESENTATION_PATHNAMES.ICONS, Page: IconsPage },
];
