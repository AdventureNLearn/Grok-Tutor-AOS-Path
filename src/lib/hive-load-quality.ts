/**
 * Load quality tiers — same visual language, cost scaled by device.
 *
 * Design rule (basic-hardware first):
 * - Map view is the full product (shapes, desks, orchestration).
 * - 3D is progressive enhancement; never assume discrete GPU.
 * - iGPU / low-end always cap at steady or accessible (never cinematic).
 */

export type HiveQualityTier =
  | "cinematic"
  | "balanced"
  | "steady"
  | "accessible";

export type HiveQualityProfile = {
  tier: HiveQualityTier;
  /** Why this tier was chosen (HUD / debug / honest ops) */
  reasons: string[];
  pixelRatioCap: number;
  starFar: number;
  starMid: number;
  starNear: number;
  antialias: boolean;
  transmission: boolean;
  /** Soft nebula planes in 3D (expensive overdraw) */
  nebula: boolean;
  /** Quantum grid helper */
  grid: boolean;
  maxSkills: number;
  maxIndustries: number;
  powerPreference: WebGLPowerPreference;
  /** Prefer Map as default product surface */
  preferMap: boolean;
  /** Soft 3D start budget (ms) before fail → Map */
  igniteBudgetMs: number;
  /** Refuse a slow/iGPU WebGL context instead of crashing the tab */
  failIfMajorPerformanceCaveat: boolean;
  gpuLabel: string;
  isIgpu: boolean;
  webgl: boolean;
};

type GpuProbe = {
  renderer: string;
  isIgpu: boolean;
  webgl: boolean;
};

function probeGpu(): GpuProbe {
  if (typeof document === "undefined") {
    return { renderer: "ssr", isIgpu: true, webgl: false };
  }
  try {
    const c = document.createElement("canvas");
    const gl =
      (c.getContext("webgl", { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null) ||
      (c.getContext("experimental-webgl", {
        failIfMajorPerformanceCaveat: false,
      }) as WebGLRenderingContext | null);
    if (!gl) {
      return { renderer: "none", isIgpu: true, webgl: false };
    }
    const dbg = gl.getExtension("WEBGL_debug_renderer_info") as {
      UNMASKED_RENDERER_WEBGL: number;
    } | null;
    const renderer = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "")
      : String(gl.getParameter(gl.RENDERER) || "");
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    const r = renderer.toLowerCase();
    // Integrated / software / mobile GPUs — treat as basic for 3D cost
    const isIgpu =
      /intel|iris|uhd|hd graphics|radeon graphics(?!.*\b(rx|pro)\b)|vega [0-9]|apple m[0-9]|mali|adreno|swiftshader|llvmpipe|microsoft basic|virtualbox|vmware|parallels|qualcomm|powervr/.test(
        r,
      ) || /angle \(intel/.test(r);
    return { renderer: renderer.slice(0, 120), isIgpu, webgl: true };
  } catch {
    return { renderer: "error", isIgpu: true, webgl: false };
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function detectHiveQuality(): HiveQualityProfile {
  if (typeof window === "undefined") {
    return profileFor("steady", {
      reasons: ["ssr-default"],
      gpuLabel: "ssr",
      isIgpu: true,
      webgl: false,
    });
  }

  const gpu = probeGpu();
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  const reduced = prefersReducedMotion();
  const reasons: string[] = [];

  if (!gpu.webgl) reasons.push("no-webgl");
  if (gpu.isIgpu) reasons.push("igpu");
  if (saveData) reasons.push("save-data");
  if (reduced) reasons.push("reduced-motion");
  if (mem !== undefined && mem <= 4) reasons.push(`mem-${mem}gb`);
  if (cores <= 4) reasons.push(`cores-${cores}`);
  if (dpr >= 2.5) reasons.push(`dpr-${dpr.toFixed(1)}`);

  // Accessible: map-first product, lightest 3D if user insists
  if (
    !gpu.webgl ||
    saveData ||
    reduced ||
    (mem !== undefined && mem <= 2) ||
    cores <= 2 ||
    dpr >= 3
  ) {
    reasons.push("tier-accessible");
    return profileFor("accessible", {
      reasons,
      gpuLabel: gpu.renderer || "unknown",
      isIgpu: gpu.isIgpu,
      webgl: gpu.webgl,
    });
  }

  // iGPU (Iris Xe, UHD, etc.) never gets cinematic — glass + stars melt dual-monitor sessions
  if (gpu.isIgpu || (mem !== undefined && mem <= 4) || cores <= 4) {
    reasons.push("tier-steady");
    return profileFor("steady", {
      reasons,
      gpuLabel: gpu.renderer || "unknown",
      isIgpu: gpu.isIgpu,
      webgl: true,
    });
  }

  // Discrete / strong laptop GPU only
  if (cores >= 8 && dpr <= 2 && (mem === undefined || mem >= 8) && !gpu.isIgpu) {
    reasons.push("tier-cinematic");
    return profileFor("cinematic", {
      reasons,
      gpuLabel: gpu.renderer || "unknown",
      isIgpu: false,
      webgl: true,
    });
  }

  reasons.push("tier-balanced");
  return profileFor("balanced", {
    reasons,
    gpuLabel: gpu.renderer || "unknown",
    isIgpu: gpu.isIgpu,
    webgl: true,
  });
}

export function profileFor(
  tier: HiveQualityTier,
  meta?: {
    reasons?: string[];
    gpuLabel?: string;
    isIgpu?: boolean;
    webgl?: boolean;
  },
): HiveQualityProfile {
  const base = {
    reasons: meta?.reasons ?? [tier],
    gpuLabel: meta?.gpuLabel ?? "",
    isIgpu: meta?.isIgpu ?? true,
    webgl: meta?.webgl ?? true,
  };

  switch (tier) {
    case "cinematic":
      return {
        ...base,
        tier,
        pixelRatioCap: 2,
        starFar: 900,
        starMid: 360,
        starNear: 140,
        antialias: true,
        transmission: true,
        nebula: true,
        grid: true,
        maxSkills: 48,
        maxIndustries: 24,
        powerPreference: "high-performance",
        preferMap: false,
        igniteBudgetMs: 10000,
        failIfMajorPerformanceCaveat: false,
      };
    case "accessible":
      return {
        ...base,
        tier,
        pixelRatioCap: 1,
        starFar: 0,
        starMid: 0,
        starNear: 0,
        antialias: false,
        transmission: false,
        nebula: false,
        grid: false,
        maxSkills: 20,
        maxIndustries: 12,
        powerPreference: "low-power",
        preferMap: true,
        igniteBudgetMs: 6000,
        failIfMajorPerformanceCaveat: true,
      };
    case "steady":
      return {
        ...base,
        tier,
        pixelRatioCap: 1.15,
        starFar: 120,
        starMid: 48,
        starNear: 18,
        antialias: false,
        transmission: false,
        nebula: false,
        grid: true,
        maxSkills: 28,
        maxIndustries: 16,
        powerPreference: "low-power",
        preferMap: true,
        igniteBudgetMs: 8000,
        failIfMajorPerformanceCaveat: true,
      };
    default:
      return {
        ...base,
        tier: "balanced",
        pixelRatioCap: 1.5,
        starFar: 480,
        starMid: 180,
        starNear: 70,
        antialias: true,
        transmission: false, // physical transmission is the #1 iGPU killer
        nebula: true,
        grid: true,
        maxSkills: 36,
        maxIndustries: 18,
        powerPreference: "default",
        preferMap: true,
        igniteBudgetMs: 9000,
        failIfMajorPerformanceCaveat: true,
      };
  }
}
