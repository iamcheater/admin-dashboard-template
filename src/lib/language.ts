import {
  ADMIN_LANGUAGE,
  ADMIN_LANGUAGE_STORAGE_KEY,
  LANGUAGE_CONVENTIONS,
  type AdminLanguage,
} from "./constants";

const isAdminLanguage = (
  value: string | null | undefined,
): value is AdminLanguage =>
  Object.values(ADMIN_LANGUAGE).some((language) => language === value);

const readSavedLanguage = (): string | null => {
  try {
    return localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const savedLanguage = readSavedLanguage();
const configuredLanguage = import.meta.env.VITE_DEFAULT_ADMIN_LANGUAGE;

export const ACTIVE_LANGUAGE: AdminLanguage = isAdminLanguage(savedLanguage)
  ? savedLanguage
  : isAdminLanguage(configuredLanguage)
    ? configuredLanguage
    : ADMIN_LANGUAGE.EN;

export const ACTIVE_CONVENTIONS = LANGUAGE_CONVENTIONS[ACTIVE_LANGUAGE];

export function setLanguage(language: AdminLanguage): void {
  if (language === ACTIVE_LANGUAGE) return;

  try {
    localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, language);
  } catch {
    return;
  }

  window.location.reload();
}

export function startLanguage(): void {
  document.documentElement.lang = ACTIVE_LANGUAGE;
}
