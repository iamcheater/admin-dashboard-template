import {
  CheckCircleIcon,
  CopyIcon,
  DashboardIcon,
  EditIcon,
  LockIcon,
  RefreshIcon,
  SettingsIcon,
  UserIcon,
} from "../components/icons";
import type { NavSection } from "../components/nav";
import { PRESENTATION_PATHNAMES } from "./constants";
import { presentationText } from "./text";

const copy = presentationText.nav;

export const PRESENTATION_NAV_SECTIONS: NavSection[] = [
  {
    heading: copy.sections.authScreens,
    items: [
      {
        to: PRESENTATION_PATHNAMES.LOGIN,
        label: copy.items.login,
        Icon: UserIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.FORGOT_PASSWORD,
        label: copy.items.forgotPassword,
        Icon: LockIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.RESET_PASSWORD,
        label: copy.items.resetPassword,
        Icon: RefreshIcon,
      },
    ],
  },
  {
    heading: copy.sections.components,
    items: [
      {
        to: PRESENTATION_PATHNAMES.BUTTONS,
        label: copy.items.buttons,
        Icon: SettingsIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.INPUTS,
        label: copy.items.inputs,
        Icon: EditIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.TABLES,
        label: copy.items.tables,
        Icon: DashboardIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.MODALS,
        label: copy.items.modals,
        Icon: CopyIcon,
      },
      {
        to: PRESENTATION_PATHNAMES.ICONS,
        label: copy.items.icons,
        Icon: CheckCircleIcon,
      },
    ],
  },
];
