import {
  CheckCircleIcon,
  CopyIcon,
  DashboardIcon,
  EditIcon,
  ImageIcon,
  InfoIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
  WarningIcon,
} from "../components/icons";
import type { NavSection } from "../components/nav";
import { PRESENTATION_PATHNAMES } from "./constants";
import { presentationText } from "./text";

export const presentationNavSections = (): NavSection[] => {
  const copy = presentationText.nav;

  return [
    {
      heading: copy.sections.startHere,
      items: [
        {
          to: PRESENTATION_PATHNAMES.WELCOME,
          label: copy.items.welcome,
          Icon: InfoIcon,
        },
      ],
    },
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
          to: PRESENTATION_PATHNAMES.MEDIA,
          label: copy.items.media,
          Icon: ImageIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.TABLES,
          label: copy.items.tables,
          Icon: DashboardIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.FILTERS,
          label: copy.items.filters,
          Icon: SearchIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.MODALS,
          label: copy.items.modals,
          Icon: CopyIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.FEEDBACK,
          label: copy.items.feedback,
          Icon: WarningIcon,
        },
      ],
    },
    {
      heading: copy.sections.foundations,
      items: [
        {
          to: PRESENTATION_PATHNAMES.BRAND,
          label: copy.items.brand,
          Icon: PlusIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.TOKENS,
          label: copy.items.tokens,
          Icon: SunIcon,
        },
        {
          to: PRESENTATION_PATHNAMES.ICONS,
          label: copy.items.icons,
          Icon: CheckCircleIcon,
        },
      ],
    },
  ];
};
