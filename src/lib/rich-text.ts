import { DEFAULT_LINK_SCHEME, REGEX_PATTERN } from "./constants";

export const normalizeLinkHref = (raw: string): string | null => {
  const href = raw.trim();
  if (!href) return null;

  if (
    REGEX_PATTERN.LINK_WITH_SCHEME.test(href) ||
    REGEX_PATTERN.SITE_RELATIVE_LINK.test(href)
  ) {
    return href;
  }

  return REGEX_PATTERN.BARE_DOMAIN_LINK.test(href)
    ? `${DEFAULT_LINK_SCHEME}${href}`
    : null;
};
