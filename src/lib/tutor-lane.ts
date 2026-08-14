/**
 * Surface separation law for Grok Tutor.
 *
 * REAL (default product):
 *   - Shell: Tutor Hive 3D honeycomb (`HiveWorkspace` + `tutor-hive3d`)
 *   - Routes: / /tutor /demo /explore /skills /progress /path /get-yours
 *   - No Pepe/Apu chrome, no village RPG, no ITSHABBENING in primary nav
 *
 * MEME (isolated, optional):
 *   - /itshabbening — console + meme voice for Learn
 *   - /meme-village — Pepe & Apu iso RPG (`MemeVillageWorkspace`)
 *   - Never mount meme workspaces into the default hive shell
 *
 * Same educational safety / OPSEC limits. Different clothes.
 */
export type TutorLane = "real" | "meme";

/** Paths that are meme-lane only (not professional product chrome). */
export const MEME_LANE_PATHS = ["/itshabbening", "/meme-village"] as const;

export function parseTutorLane(raw: unknown): TutorLane {
  if (
    raw === "meme" ||
    raw === "itshabbening" ||
    raw === "ITS" ||
    raw === "village" ||
    raw === "meme-village"
  ) {
    return "meme";
  }
  return "real";
}

export function laneFromSearchParams(sp: URLSearchParams): TutorLane {
  return parseTutorLane(sp.get("lane") || sp.get("voice"));
}

export function laneFromPathname(pathname: string): TutorLane {
  const p = (pathname || "/").replace(/\/$/, "") || "/";
  if ((MEME_LANE_PATHS as readonly string[]).some((m) => p === m || p.startsWith(m + "/"))) {
    return "meme";
  }
  return "real";
}

export function isMemeLane(lane?: TutorLane | string | null): boolean {
  return lane === "meme" || lane === "itshabbening";
}

export function isMemePath(pathname: string): boolean {
  return laneFromPathname(pathname) === "meme";
}
