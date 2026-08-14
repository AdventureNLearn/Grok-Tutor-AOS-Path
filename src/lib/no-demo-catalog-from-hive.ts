/**
 * Learner hive must not open a catalog that lists stay-OFF fields.
 * Samples / Industries / Help / first-run stay on the hive.
 * Civic / nursing / CM / LE / PIL / media-literacy stay off the listing.
 * Ask / named-pack sit is unchanged — this module does not sit a field.
 */
import { INDUSTRIES, type Industry } from "./industries";
import {
  FAIL_CLOSED_INDUSTRY_IDS,
  isFailClosedIndustry,
} from "./sit-from-named-pack";

export const CATALOG_ROUTES = ["/demo", "/explore"] as const;

export const LEARNER_HIVE_HOME = "/" as const;

/** Same stay-OFF set as sit-from-named-pack. Do not invent fields. */
export const STAY_OFF_INDUSTRY_IDS = FAIL_CLOSED_INDUSTRY_IDS;

export const STAY_OFF_LISTING_COPY =
  /\b(civic-intelligence|nursing|law-enforcement|media-literacy|public information literacy|civic intelligence|construction management|law enforcement|media literacy & narrative analysis|media literacy)\b/i;

export type LearnerNavItem = {
  href: string;
  label: string;
  title: string;
  color: string;
  acr: string;
};

/**
 * Learner topbar. No Samples → /demo. No Industries → /explore.
 * First-slice samples live as hive combs. Covered packs sit via ask.
 */
export const LEARNER_NAV: readonly LearnerNavItem[] = [
  { href: "/tutor", label: "Learn", title: "Live session", color: "#2dd4bf", acr: "LRN" },
  { href: "/skills", label: "Tools", title: "Thinking tools", color: "#fbbf24", acr: "THK" },
  { href: "/progress", label: "Progress", title: "Progress", color: "#4ade80", acr: "PRG" },
  { href: "/path", label: "Path", title: "Your path", color: "#f472b6", acr: "PTH" },
  { href: "/help", label: "Help", title: "How to use", color: "#94a3b8", acr: "HLP" },
  {
    href: "/labs/cad",
    label: "Plan Lab",
    title: "Plan Lab · MAC + PartMode",
    color: "#38bdf8",
    acr: "CAD",
  },
];

export function isCatalogRoute(href: string | null | undefined): boolean {
  if (!href) return false;
  const path = href.split(/[?#]/)[0] ?? href;
  return path === "/demo" || path.startsWith("/demo/") || path === "/explore";
}

export function learnerChromeOpensCatalog(href: string | null | undefined): boolean {
  return isCatalogRoute(href);
}

export function isStayOffIndustryId(id: string | null | undefined): boolean {
  return isFailClosedIndustry(id);
}

export function stayOffListedIn(text: string | null | undefined): boolean {
  return Boolean(text && STAY_OFF_LISTING_COPY.test(text));
}

export function learnerVisibleIndustries(): Industry[] {
  return INDUSTRIES.filter((ind) => !isStayOffIndustryId(ind.id));
}

export function filterStayOffFromCatalog<T extends { id?: string; industry?: { id: string } }>(
  rows: T[],
): T[] {
  return rows.filter((row) => {
    const id = row.industry?.id ?? row.id;
    return !isStayOffIndustryId(id);
  });
}

export function catalogMayListIndustry(industryId: string): boolean {
  return !isStayOffIndustryId(industryId);
}
