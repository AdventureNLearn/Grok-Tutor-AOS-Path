import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { HiveNode } from "./tutor-hive-map";

/** Hard cap — each selection opens its own window; never swaps content. */
export const MAX_OPEN_DESKS = 10;

/** Desk content zoom — 30% fits dense pages; 150% for low vision. */
export const DESK_SCALE_MIN = 0.3;
export const DESK_SCALE_MAX = 1.5;
export const DESK_SCALE_STEP = 0.05;

export type DeskBookmark = {
  id: string;
  title: string;
  href: string;
  acr: string;
  color: string;
  savedAt: number;
};

export type FloatingDesk = {
  id: string;
  title: string;
  acr: string;
  color: string;
  /** Single stable surface — never replaced on later selections */
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  locked: boolean;
  minimized: boolean;
  contentScale: number;
};

type OpenResult =
  | { ok: true; id: string; reused?: boolean }
  | { ok: false; reason: "limit"; bookmarked: boolean };

type HiveDeskState = {
  desks: FloatingDesk[];
  bookmarks: DeskBookmark[];
  focusedId: string | null;
  cascade: number;
  lastMessage: string | null;
  openFromNode: (node: HiveNode) => OpenResult;
  openRoute: (
    href: string,
    title: string,
    color?: string,
    acr?: string,
  ) => OpenResult;
  focus: (id: string) => void;
  close: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleMinimize: (id: string) => void;
  setGeometry: (
    id: string,
    geo: Partial<Pick<FloatingDesk, "x" | "y" | "w" | "h">>,
  ) => void;
  setContentScale: (id: string, scale: number) => void;
  maximize: (id: string) => void;
  maximizeAll: () => void;
  /** Smart auto-format for open desks */
  layoutDesks: (mode?: DeskLayoutMode) => void;
  bringFront: (id: string) => void;
  closeAll: () => void;
  bookmarkRoute: (
    href: string,
    title: string,
    color?: string,
    acr?: string,
  ) => void;
  bookmarkFromNode: (node: HiveNode) => void;
  removeBookmark: (id: string) => void;
  openBookmark: (id: string) => OpenResult;
  clearBookmarks: () => void;
};

let zCounter = 40;

/**
 * Always return a same-origin **path** URL for desk iframes.
 * Absolute http://127.0.0.1:8080/... links break when the parent is on
 * localhost / LAN IP, or when the dev server restarts — browsers show
 * "refused to connect". Relative paths always hit the parent origin.
 */
function deskHref(href: string): string {
  if (!href || typeof href !== "string") return "/tutor?surface=desk";
  try {
    const u = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "http://local.invalid");
    // Drop host — iframe must stay on the current origin
    u.searchParams.set("surface", "desk");
    const path = u.pathname || "/";
    const q = u.searchParams.toString();
    return `${path}${q ? `?${q}` : ""}${u.hash || ""}`;
  } catch {
    const cleaned = href
      .replace(/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:\d+)?/i, "")
      .replace(/^https?:\/\/[^/]+/i, "");
    const base = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    if (base.includes("surface=desk")) return base;
    return base.includes("?")
      ? `${base}&surface=desk`
      : `${base}?surface=desk`;
  }
}

function pathKey(href: string): string {
  if (!href || typeof href !== "string") return "";
  try {
    const u = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "http://local.invalid");
    return (u.pathname.replace(/\/$/, "") || "/") as string;
  } catch {
    const part = href.split("?")[0];
    return part || href;
  }
}

export type DeskLayoutMode =
  | "smart"
  | "tile"
  | "split-h"
  | "split-v"
  | "cascade"
  | "focus"
  | "max";

const MIN_W_DESKTOP = 360;
const MIN_H_DESKTOP = 260;
const MIN_W_PHONE = 280;
const MIN_H_PHONE = 220;
const TOP_SAFE = 56;
const BOTTOM_SAFE = 72;
const BOTTOM_SAFE_PHONE = 96;
const SIDE_SAFE = 10;
const SIDE_SAFE_PHONE = 6;
const GAP = 10;

function isPhoneVp(vw: number, vh: number) {
  return vw <= 720 || (vh <= 480 && vw <= 960);
}

function minDesk(vw: number, vh: number) {
  if (isPhoneVp(vw, vh)) return { w: MIN_W_PHONE, h: MIN_H_PHONE };
  return { w: MIN_W_DESKTOP, h: MIN_H_DESKTOP };
}

function viewport() {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const phone = isPhoneVp(vw, vh);
  const side = phone ? SIDE_SAFE_PHONE : SIDE_SAFE;
  const top = phone ? 52 : TOP_SAFE;
  const bottom = phone ? BOTTOM_SAFE_PHONE : BOTTOM_SAFE;
  const mins = minDesk(vw, vh);
  return {
    vw,
    vh,
    phone,
    left: side,
    top,
    right: vw - side,
    bottom: vh - bottom,
    width: Math.max(mins.w, vw - side * 2),
    height: Math.max(mins.h, vh - top - bottom),
    minW: mins.w,
    minH: mins.h,
  };
}

/** Near-fullscreen geometry — fills the viewport under the topbar, above the dock. */
function maximizedPos(stackIndex = 0) {
  const v = viewport();
  // Phones: true sheet (no cascade inset waste)
  const inset = v.phone ? 0 : Math.min(18, stackIndex * 10);
  return {
    x: v.left + inset,
    y: v.top + inset,
    w: Math.max(v.minW, v.width - inset * 2),
    h: Math.max(v.minH, v.height - inset * 2),
  };
}

function cascadePos(n: number) {
  const v = viewport();
  if (v.phone) return maximizedPos(0);
  const i = n % 8;
  const w = Math.min(720, Math.max(v.minW, v.width * 0.55));
  const h = Math.min(560, Math.max(v.minH, v.height * 0.62));
  return {
    x: Math.min(v.right - w, v.left + i * 28),
    y: Math.min(v.bottom - h, v.top + i * 24),
    w,
    h,
  };
}

function tileLayouts(
  count: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  const v = viewport();
  if (count <= 0) return [];
  // Phone: stack full-width sheets (same utility, no tiny tiles)
  if (v.phone) {
    return Array.from({ length: count }, (_, i) => maximizedPos(i));
  }
  const cols = count <= 1 ? 1 : count === 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : 3;
  const rows = Math.ceil(count / cols);
  const cellW = (v.width - GAP * (cols - 1)) / cols;
  const cellH = (v.height - GAP * (rows - 1)) / rows;
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    out.push({
      x: v.left + c * (cellW + GAP),
      y: v.top + r * (cellH + GAP),
      w: Math.max(v.minW, cellW),
      h: Math.max(v.minH, cellH),
    });
  }
  return out;
}

function splitH(
  count: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  const v = viewport();
  if (count <= 0) return [];
  if (v.phone) return Array.from({ length: count }, (_, i) => maximizedPos(i));
  const n = Math.min(count, 4);
  const cellW = (v.width - GAP * (n - 1)) / n;
  return Array.from({ length: count }, (_, i) => {
    const idx = i % n;
    return {
      x: v.left + idx * (cellW + GAP),
      y: v.top,
      w: Math.max(v.minW, cellW),
      h: v.height,
    };
  });
}

function splitV(
  count: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  const v = viewport();
  if (count <= 0) return [];
  if (v.phone) return Array.from({ length: count }, (_, i) => maximizedPos(i));
  const n = Math.min(count, 4);
  const cellH = (v.height - GAP * (n - 1)) / n;
  return Array.from({ length: count }, (_, i) => {
    const idx = i % n;
    return {
      x: v.left,
      y: v.top + idx * (cellH + GAP),
      w: v.width,
      h: Math.max(v.minH, cellH),
    };
  });
}

function focusLayout(
  count: number,
  focusIndex: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  const v = viewport();
  if (count <= 1) return [maximizedPos(0)];
  const stripH = Math.max(140, Math.min(200, v.height * 0.22));
  const mainH = v.height - stripH - GAP;
  const others = Math.max(1, count - 1);
  const cellW = (v.width - GAP * (others - 1)) / others;
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];
  let stripI = 0;
  for (let i = 0; i < count; i++) {
    if (i === focusIndex) {
      out.push({ x: v.left, y: v.top, w: v.width, h: mainH });
    } else {
      out.push({
        x: v.left + stripI * (cellW + GAP),
        y: v.top + mainH + GAP,
        w: Math.max(200, cellW),
        h: stripH,
      });
      stripI++;
    }
  }
  return out;
}

/** Pick layout by open count — honest auto-format */
export function pickSmartLayoutMode(count: number): DeskLayoutMode {
  const v = viewport();
  // Phone: always sheet/max — same utility, no multi-window crush
  if (v.phone) return "max";
  if (count <= 1) return "max";
  if (count === 2) return "split-h";
  if (count <= 4) return "tile";
  if (count <= 6) return "tile";
  return "cascade";
}

function computeLayoutPositions(
  mode: DeskLayoutMode,
  count: number,
  focusIndex: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  const resolved = mode === "smart" ? pickSmartLayoutMode(count) : mode;
  switch (resolved) {
    case "max":
      return Array.from({ length: count }, (_, i) => maximizedPos(i));
    case "split-h":
      return splitH(count);
    case "split-v":
      return splitV(count);
    case "cascade":
      return Array.from({ length: count }, (_, i) => cascadePos(i));
    case "focus":
      return focusLayout(count, Math.max(0, Math.min(focusIndex, count - 1)));
    case "tile":
    default:
      return tileLayouts(count);
  }
}

/** Migrate v1 desks (tabs[]) → v2 (href) and drop invalid entries */
function normalizeDesk(raw: unknown): FloatingDesk | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  let href = typeof d.href === "string" ? d.href : "";
  // v1 shape: tabs: [{ href, title }]
  if (!href && Array.isArray(d.tabs) && d.tabs.length > 0) {
    const tab0 = d.tabs[0] as Record<string, unknown> | undefined;
    if (tab0 && typeof tab0.href === "string") href = tab0.href;
  }
  if (!href) return null;

  const id =
    typeof d.id === "string" && d.id
      ? d.id
      : `desk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const title =
    typeof d.title === "string" && d.title
      ? d.title
      : "Desk";
  const acr = typeof d.acr === "string" ? d.acr : "DSK";
  const color = typeof d.color === "string" ? d.color : "#2dd4bf";

  return {
    id,
    title,
    acr,
    color,
    href: deskHref(href),
    x: typeof d.x === "number" ? d.x : 48,
    y: typeof d.y === "number" ? d.y : 72,
    w: typeof d.w === "number" ? d.w : 520,
    h: typeof d.h === "number" ? d.h : 420,
    z: typeof d.z === "number" ? d.z : 40,
    locked: Boolean(d.locked),
    minimized: Boolean(d.minimized),
    contentScale:
      typeof d.contentScale === "number" && d.contentScale > 0
        ? Math.min(DESK_SCALE_MAX, Math.max(DESK_SCALE_MIN, d.contentScale))
        : 1,
  };
}

function normalizeBookmark(raw: unknown): DeskBookmark | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.href !== "string" || !b.href) return null;
  return {
    id:
      typeof b.id === "string" && b.id
        ? b.id
        : `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: typeof b.title === "string" ? b.title : "Bookmark",
    href: deskHref(b.href),
    acr: typeof b.acr === "string" ? b.acr : "BM",
    color: typeof b.color === "string" ? b.color : "#a78bfa",
    savedAt: typeof b.savedAt === "number" ? b.savedAt : Date.now(),
  };
}

export const useHiveDeskStore = create<HiveDeskState>()(
  persist(
    (set, get) => ({
      desks: [],
      bookmarks: [],
      focusedId: null,
      cascade: 0,
      lastMessage: null,

      openFromNode(node) {
        if (!node) {
          return { ok: false, reason: "limit", bookmarked: false };
        }
        if (node.enabled === false && node.kind === "skill") {
          get().bookmarkFromNode(node);
          toast.message("Saved to bookmarks", {
            description: `${node.title} is map-only — open from bookmarks when ready.`,
          });
          return { ok: false, reason: "limit", bookmarked: true };
        }
        return get().openRoute(
          node.href || "/skills",
          node.title || "Desk",
          node.color,
          node.acr,
        );
      },

      openRoute(href, title, color = "#2dd4bf", acr = "DSK") {
        if (!href) {
          return { ok: false, reason: "limit", bookmarked: false };
        }
        const full = deskHref(href);
        const key = pathKey(full);

        // Already open → focus only (do not replace content)
        const existing = get().desks.find((d) => {
          if (!d?.href) return false;
          return pathKey(d.href) === key;
        });
        if (existing) {
          get().focus(existing.id);
          set({ lastMessage: `Focused existing window: ${title}` });
          return { ok: true, id: existing.id, reused: true };
        }

        // Hard cap: bookmark overflow instead of silent drop
        if (get().desks.length >= MAX_OPEN_DESKS) {
          get().bookmarkRoute(href, title, color, acr);
          const msg = `Window limit (${MAX_OPEN_DESKS}). “${title}” bookmarked — close a desk or open from bookmarks.`;
          set({ lastMessage: msg });
          toast.warning(`Max ${MAX_OPEN_DESKS} windows`, {
            description: `"${title}" saved to bookmarks. Close a desk to open another.`,
          });
          return { ok: false, reason: "limit", bookmarked: true };
        }

        // Always a NEW maximized window — never inject into an existing desk
        const n = get().cascade;
        const pos = maximizedPos(n);
        zCounter += 1;
        const id = `desk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const desk: FloatingDesk = {
          id,
          title: title || "Desk",
          acr: acr || "DSK",
          color: color || "#2dd4bf",
          href: full,
          ...pos,
          z: zCounter,
          locked: false,
          minimized: false,
          contentScale: 1,
        };
        set((s) => ({
          desks: [...s.desks.filter(Boolean), desk].slice(0, MAX_OPEN_DESKS),
          focusedId: id,
          cascade: n + 1,
          lastMessage: `Opened window ${Math.min(s.desks.length + 1, MAX_OPEN_DESKS)}/${MAX_OPEN_DESKS}: ${title}`,
        }));
        return { ok: true, id };
      },

      focus(id) {
        if (!id) return;
        get().bringFront(id);
        set({ focusedId: id });
      },

      close(id) {
        set((s) => {
          const next = s.desks.filter((d) => d && d.id !== id);
          return {
            desks: next,
            focusedId:
              s.focusedId === id
                ? (next[next.length - 1]?.id ?? null)
                : s.focusedId,
          };
        });
      },

      toggleLock(id) {
        set((s) => ({
          desks: s.desks.map((d) =>
            d.id === id ? { ...d, locked: !d.locked } : d,
          ),
        }));
      },

      toggleMinimize(id) {
        set((s) => ({
          desks: s.desks.map((d) =>
            d.id === id ? { ...d, minimized: !d.minimized } : d,
          ),
        }));
      },

      setGeometry(id, geo) {
        set((s) => ({
          desks: s.desks.map((d) => {
            if (d.id !== id || d.locked) return d;
            return { ...d, ...geo };
          }),
        }));
      },

      setContentScale(id, scale) {
        const clamped = Math.min(DESK_SCALE_MAX, Math.max(DESK_SCALE_MIN, scale));
        set((s) => ({
          desks: s.desks.map((d) =>
            d.id === id ? { ...d, contentScale: clamped } : d,
          ),
        }));
      },

      maximize(id) {
        const idx = get().desks.findIndex((d) => d.id === id);
        if (idx < 0) return;
        const pos = maximizedPos(Math.max(0, idx));
        set((s) => ({
          desks: s.desks.map((d) =>
            d.id === id && !d.locked
              ? { ...d, ...pos, minimized: false }
              : d,
          ),
          focusedId: id,
        }));
        get().bringFront(id);
      },

      maximizeAll() {
        set((s) => ({
          desks: s.desks.map((d, i) =>
            d.locked ? d : { ...d, ...maximizedPos(i), minimized: false },
          ),
          lastMessage: "Maximized all unlocked desks",
        }));
      },

      layoutDesks(mode = "smart") {
        const s = get();
        const open = s.desks.filter((d) => d && !d.minimized);
        if (open.length === 0) {
          toast.message("No open desks to format");
          return;
        }
        const focusIdx = Math.max(
          0,
          open.findIndex((d) => d.id === s.focusedId),
        );
        const positions = computeLayoutPositions(
          mode,
          open.length,
          focusIdx < 0 ? 0 : focusIdx,
        );
        let pi = 0;
        const next = s.desks.map((d) => {
          if (!d || d.minimized || d.locked) return d;
          const geo = positions[pi++];
          return geo ? { ...d, ...geo, minimized: false } : d;
        });
        const label =
          mode === "smart"
            ? `Smart layout (${pickSmartLayoutMode(open.length)})`
            : `Layout: ${mode}`;
        set({
          desks: next,
          lastMessage: `${label} · ${open.length} desk${open.length === 1 ? "" : "s"}`,
        });
        toast.success(label);
      },

      bringFront(id) {
        zCounter += 1;
        const z = zCounter;
        set((s) => ({
          desks: s.desks.map((d) => (d.id === id ? { ...d, z } : d)),
          focusedId: id,
        }));
      },

      closeAll() {
        set({ desks: [], focusedId: null });
      },

      bookmarkRoute(href, title, color = "#a78bfa", acr = "BM") {
        if (!href) return;
        const full = deskHref(href);
        const key = pathKey(full);
        const exists = get().bookmarks.some((b) => pathKey(b.href) === key);
        if (exists) {
          set({ lastMessage: `Already bookmarked: ${title}` });
          return;
        }
        const bm: DeskBookmark = {
          id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: title || "Bookmark",
          href: full,
          acr: acr || "BM",
          color: color || "#a78bfa",
          savedAt: Date.now(),
        };
        set((s) => ({
          bookmarks: [bm, ...s.bookmarks].slice(0, 40),
          lastMessage: `Bookmarked: ${title}`,
        }));
      },

      bookmarkFromNode(node) {
        if (!node) return;
        get().bookmarkRoute(
          node.href || "/skills",
          node.title || "Bookmark",
          node.color,
          node.acr,
        );
      },

      removeBookmark(id) {
        set((s) => ({
          bookmarks: s.bookmarks.filter((b) => b.id !== id),
        }));
      },

      openBookmark(id) {
        const bm = get().bookmarks.find((b) => b.id === id);
        if (!bm?.href) {
          return { ok: false, reason: "limit", bookmarked: false };
        }
        let pathOnly = bm.href;
        try {
          const u = bm.href.startsWith("http")
            ? new URL(bm.href)
            : new URL(bm.href, "http://local.invalid");
          u.searchParams.delete("surface");
          pathOnly = `${u.pathname}${u.search}`;
        } catch {
          pathOnly = bm.href.replace(/[?&]surface=desk/, "");
        }
        return get().openRoute(
          pathOnly || "/tutor",
          bm.title,
          bm.color,
          bm.acr,
        );
      },

      clearBookmarks() {
        set({ bookmarks: [] });
      },
    }),
    {
      name: "grok-tutor-hive-desks-v2",
      // v5: never restore desks on load — idle must not auto-open a Load surface stub
      version: 5,
      migrate: (persisted: unknown) => {
        const p = (persisted || {}) as Record<string, unknown>;
        const bmRaw = Array.isArray(p.bookmarks) ? p.bookmarks : [];
        const bookmarks = bmRaw
          .map(normalizeBookmark)
          .filter(Boolean) as DeskBookmark[];
        return {
          desks: [],
          bookmarks,
          cascade: typeof p.cascade === "number" ? p.cascade : 0,
          focusedId: null,
          lastMessage: null,
        };
      },
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<HiveDeskState>;
        const bookmarks = (Array.isArray(p.bookmarks) ? p.bookmarks : [])
          .map(normalizeBookmark)
          .filter(Boolean) as DeskBookmark[];
        return {
          ...current,
          ...p,
          desks: current.desks,
          bookmarks,
          focusedId: current.focusedId,
        };
      },
      // Desks are session-only. Restoring them on idle painted a "Load surface"
      // stub (often the last lesson comb) before the learner clicked anything.
      partialize: (s) => ({
        bookmarks: s.bookmarks,
        cascade: s.cascade,
      }),
    },
  ),
);
