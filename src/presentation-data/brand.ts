import {
  BLACK_RGB,
  BRAND_KEYS,
  BRAND_MIX,
  BRAND_STORAGE_KEY,
  BRAND_STYLE_ELEMENT_ID,
  HEX_CHANNEL_LENGTH,
  HEX_RADIX,
  LIGHT_THEME_PROBE_CLASS,
  LUMINANCE_WEIGHTS,
  RGB_MAX,
  WHITE_RGB,
  type BrandKey,
} from "./constants";

export type Brand = Record<BrandKey, string>;
type Rgb = readonly [number, number, number];
type TokenValues = Record<string, string>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const toRgb = (hex: string): Rgb => {
  const channel = (index: number) =>
    parseInt(
      hex.slice(
        1 + index * HEX_CHANNEL_LENGTH,
        1 + (index + 1) * HEX_CHANNEL_LENGTH,
      ),
      HEX_RADIX,
    );
  return [channel(0), channel(1), channel(2)];
};

const toHex = (rgb: Rgb): string =>
  `#${rgb
    .map((value) =>
      Math.round(value).toString(HEX_RADIX).padStart(HEX_CHANNEL_LENGTH, "0"),
    )
    .join("")}`;

const mix = (rgb: Rgb, toward: Rgb, amount: number): Rgb => [
  rgb[0] + (toward[0] - rgb[0]) * amount,
  rgb[1] + (toward[1] - rgb[1]) * amount,
  rgb[2] + (toward[2] - rgb[2]) * amount,
];

const withAlpha = (rgb: Rgb, alpha: number): string =>
  `rgba(${rgb.map(Math.round).join(", ")}, ${alpha})`;

const luminance = (rgb: Rgb): number =>
  rgb.reduce(
    (sum, value, index) => sum + (value / RGB_MAX) * LUMINANCE_WEIGHTS[index],
    0,
  );

const readableOn = (rgb: Rgb): string =>
  luminance(rgb) > BRAND_MIX.READABLE_LUMINANCE
    ? toHex(BLACK_RGB)
    : toHex(WHITE_RGB);

const tokensFor = (key: BrandKey, base: Rgb, isDark: boolean): TokenValues => {
  const color = isDark
    ? mix(base, WHITE_RGB, BRAND_MIX.DARK_BASE_TOWARD_WHITE)
    : base;
  const hover = isDark
    ? mix(base, WHITE_RGB, BRAND_MIX.DARK_HOVER_TOWARD_WHITE)
    : mix(base, BLACK_RGB, BRAND_MIX.LIGHT_HOVER_TOWARD_BLACK);
  const soft = withAlpha(
    color,
    isDark ? BRAND_MIX.DARK_SOFT_ALPHA : BRAND_MIX.LIGHT_SOFT_ALPHA,
  );
  const softHover = withAlpha(
    color,
    isDark ? BRAND_MIX.DARK_SOFT_HOVER_ALPHA : BRAND_MIX.LIGHT_SOFT_HOVER_ALPHA,
  );

  switch (key) {
    case "accent":
      return {
        accent: toHex(color),
        "accent-hover": toHex(hover),
        "accent-fg": readableOn(color),
        "accent-soft": soft,
        "sidebar-active-bg": soft,
      };
    case "success":
      return { success: toHex(color), "success-soft": soft };
    case "warning":
      return {
        warning: toHex(color),
        "warning-hover": toHex(hover),
        "warning-soft": soft,
      };
    case "danger":
      return {
        danger: toHex(color),
        "danger-hover": toHex(hover),
        "danger-soft": soft,
        "danger-soft-hover": softHover,
      };
  }
};

export const brandTokens = (brand: Brand, isDark: boolean): TokenValues =>
  Object.assign(
    {},
    ...BRAND_KEYS.map((key) => tokensFor(key, toRgb(brand[key]), isDark)),
  );

export function defaultBrand(): Brand {
  const probe = document.createElement("div");
  probe.className = LIGHT_THEME_PROBE_CLASS;
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const brand = Object.fromEntries(
    BRAND_KEYS.map((key) => [key, style.getPropertyValue(`--${key}`).trim()]),
  ) as Brand;
  probe.remove();
  return brand;
}

const declarations = (tokens: TokenValues) =>
  Object.entries(tokens)
    .map(([name, value]) => `--${name}: ${value};`)
    .join(" ");

export function applyBrand(brand: Brand | null): void {
  document.getElementById(BRAND_STYLE_ELEMENT_ID)?.remove();
  if (!brand) return;

  const style = document.createElement("style");
  style.id = BRAND_STYLE_ELEMENT_ID;
  style.textContent = [
    `:root:root:not([data-theme="dark"]) { ${declarations(brandTokens(brand, false))} }`,
    `:root:root[data-theme="dark"] { ${declarations(brandTokens(brand, true))} }`,
  ].join("\n");
  document.head.append(style);
}

const isBrand = (value: unknown): value is Brand =>
  typeof value === "object" &&
  value !== null &&
  BRAND_KEYS.every((key) =>
    HEX_COLOR.test(String((value as Record<string, unknown>)[key])),
  );

export function loadBrand(): Brand | null {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(BRAND_STORAGE_KEY) ?? "null",
    );
    return isBrand(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveBrand(brand: Brand | null): void {
  try {
    if (brand) localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
    else localStorage.removeItem(BRAND_STORAGE_KEY);
  } catch {
    return;
  }
}

export const scssLines = (brand: Brand, isDark: boolean): string =>
  Object.entries(brandTokens(brand, isDark))
    .map(([name, value]) => `  "${name}": ${value},`)
    .join("\n");
