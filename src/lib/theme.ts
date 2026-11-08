import {
  DARK_THEME_QUERY,
  THEME,
  THEME_STORAGE_KEY,
  type Theme,
} from "./constants";

const isTheme = (value: string | null): value is Theme =>
  value === THEME.LIGHT || value === THEME.DARK;

const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
const systemDarkQuery = window.matchMedia(DARK_THEME_QUERY);
const listeners = new Set<() => void>();

const systemTheme = (): Theme =>
  systemDarkQuery.matches ? THEME.DARK : THEME.LIGHT;

let chosenTheme: Theme | null = isTheme(storedValue) ? storedValue : null;
let currentTheme: Theme = chosenTheme ?? systemTheme();

const applyTheme = (theme: Theme): void => {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
};

export const getTheme = (): Theme => currentTheme;

export function setTheme(theme: Theme): void {
  chosenTheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startTheme(): void {
  applyTheme(currentTheme);
  systemDarkQuery.addEventListener("change", () => {
    if (!chosenTheme) applyTheme(systemTheme());
  });
}
