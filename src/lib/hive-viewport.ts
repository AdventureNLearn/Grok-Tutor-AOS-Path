/**
 * Hive viewport helpers — large-screen fill + phone-first utility.
 * Shared by 3D fit, 2D map, desks, and shell layout.
 */

export type HiveLayoutTier = "phone" | "tablet" | "desktop" | "wide";

export function viewportSize() {
  if (typeof window === "undefined") {
    return { w: 1280, h: 800, dpr: 1 };
  }
  return {
    w: window.innerWidth || 1280,
    h: window.innerHeight || 800,
    dpr: window.devicePixelRatio || 1,
  };
}

/** Phone-class: narrow width or coarse pointer + short side */
export function isPhoneLayout(w?: number, h?: number): boolean {
  const { w: vw, h: vh } = w != null && h != null ? { w, h } : viewportSize();
  if (vw <= 720) return true;
  if (typeof window !== "undefined") {
    try {
      if (window.matchMedia("(max-width: 720px)").matches) return true;
      // Tall phones in landscape still get phone chrome if height is short
      if (vh <= 480 && vw <= 960) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

export function isTabletLayout(w?: number): boolean {
  const vw = w ?? viewportSize().w;
  return vw > 720 && vw <= 1100;
}

export function isWideLayout(w?: number, h?: number): boolean {
  const { w: vw, h: vh } = w != null && h != null ? { w, h } : viewportSize();
  return vw / Math.max(1, vh) >= 1.55 && vw >= 1400;
}

export function layoutTier(w?: number, h?: number): HiveLayoutTier {
  if (isPhoneLayout(w, h)) return "phone";
  if (isTabletLayout(w)) return "tablet";
  if (isWideLayout(w, h)) return "wide";
  return "desktop";
}

/**
 * Card scale boost when zoomed out — modest so bodies stay distinguishable.
 * Layout also expands via separationScale (hive-pack) when fill rises.
 * zoomFactor: 1 = fit, <1 = zoomed out, >1 = zoomed in
 */
export function cardScaleForZoom(zoomFactor: number): number {
  const z = Math.min(2.4, Math.max(0.28, zoomFactor || 1));
  // Zoomed out → modest larger cards; pair with radial separation in 3D
  if (z >= 1) {
    return Math.max(0.9, 1 / Math.pow(z, 0.18));
  }
  return Math.min(1.28, 1 / Math.pow(z, 0.42));
}

/**
 * Extra fill bias for camera distance on wide screens (closer = less side gutter).
 * 1 = neutral contain; lower = pull camera in (fill).
 */
export function fillBiasForAspect(aspect: number): number {
  const a = Math.max(0.5, aspect || 1);
  if (a >= 2.1) return 0.78;
  if (a >= 1.7) return 0.84;
  if (a >= 1.45) return 0.9;
  if (a <= 0.75) return 0.92; // tall phone: slight fill
  return 1;
}

/**
 * Aspect-aware fit distance from content size (world units) + camera FOV.
 * Uses both horizontal and vertical FOV; applies fill bias on wide screens.
 */
export function fitDistanceForBox(
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  fovDeg: number,
  aspect: number,
  opts?: { margin?: number; min?: number; max?: number },
): number {
  const margin = opts?.margin ?? 1.06;
  const minD = opts?.min ?? 8;
  const maxD = opts?.max ?? 42;
  const vFov = (fovDeg * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(0.4, aspect));
  const maxXZ = Math.max(sizeX, sizeZ, 4);
  const distV = (maxXZ * 0.58) / Math.tan(vFov / 2) + sizeY * 0.75;
  const distH = (maxXZ * 0.58) / Math.tan(hFov / 2) + sizeY * 0.55;
  // Contain would take max; fill-leaning takes a blend toward min on wide aspect
  const contain = Math.max(distV, distH);
  const fill = Math.min(distV, distH);
  const bias = fillBiasForAspect(aspect);
  // bias < 1 pulls toward fill (closer)
  const blended = contain * bias + fill * (1 - bias) * 0.35;
  return Math.max(minD, Math.min(maxD, blended * margin));
}

/** 2D board target size — fill available area with small chrome padding */
export function mapBoardSize(
  containerW: number,
  containerH: number,
  tier: HiveLayoutTier,
): { width: number; height: number; combScale: number } {
  const padX = tier === "phone" ? 8 : tier === "tablet" ? 16 : 24;
  const padY = tier === "phone" ? 12 : 20;
  const width = Math.max(240, containerW - padX * 2);
  const height = Math.max(220, containerH - padY * 2);
  // Reference design width ~900px → scale combs with board
  const combScale = Math.min(1.45, Math.max(0.72, width / 900));
  return { width, height, combScale };
}

/** Preferred default view for device (user override still wins via localStorage) */
export function defaultViewForDevice(): "3d" | "2d" {
  if (typeof window === "undefined") return "2d";
  // Prefer Map by default so the Hive UI is usable even if WebGL is slow/fails
  // (user can switch to 3D anytime). Phones always start on Map.
  return "2d";
}
