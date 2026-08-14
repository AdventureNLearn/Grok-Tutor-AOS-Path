import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Lock,
  LockOpen,
  Minus,
  Plus,
  RefreshCw,
  X,
  GripHorizontal,
  Maximize2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DESK_SCALE_MAX,
  DESK_SCALE_MIN,
  DESK_SCALE_STEP,
  useHiveDeskStore,
  type FloatingDesk,
} from "@/lib/hive-desk-store";

type Props = {
  desk: FloatingDesk;
  focused: boolean;
};

/** Probe same-origin so desk iframes don't sit on a dead 127.0.0.1. */
async function probeOriginAlive(timeoutMs = 2500): Promise<boolean> {
  if (typeof window === "undefined") return true;
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Cache-bust so we don't get a stale SW/browser cache hit while server is down
    const res = await fetch(`${window.location.origin}/?_desk_health=${Date.now()}`, {
      method: "GET",
      signal: ctrl.signal,
      cache: "no-store",
      credentials: "same-origin",
    });
    return res.ok || res.status === 404;
  } catch {
    return false;
  } finally {
    window.clearTimeout(t);
  }
}

export function FloatingDeskWindow({ desk, focused }: Props) {
  const {
    focus,
    close,
    toggleLock,
    toggleMinimize,
    setGeometry,
    setContentScale,
    maximize,
    bringFront,
    bookmarkRoute,
  } = useHiveDeskStore();

  const dragRef = useRef<{
    ox: number;
    oy: number;
    sx: number;
    sy: number;
  } | null>(null);
  type Corner = "nw" | "ne" | "sw" | "se";
  const resizeRef = useRef<{
    ox: number;
    oy: number;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    corner: Corner;
  } | null>(null);

  const phone =
    typeof window !== "undefined" &&
    (window.innerWidth <= 720 || window.innerHeight <= 480);
  const MIN_W = phone ? 280 : 360;
  const MIN_H = phone ? 220 : 260;

  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [originAlive, setOriginAlive] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  /** Lazy-mount: first focus pays for iframe; keeps quality when focused */
  const [surfaceArmed, setSurfaceArmed] = useState(false);

  const src = desk.href || "/tutor?surface=desk";

  useEffect(() => {
    if (focused) setSurfaceArmed(true);
  }, [focused]);

  // Remount iframe when desk href changes (only if surface armed)
  useEffect(() => {
    if (!surfaceArmed) return;
    setLoading(true);
    setLoadTimedOut(false);
    setFrameKey((k) => k + 1);
  }, [src, surfaceArmed]);

  // If iframe never loads (dead server), surface a clear error after a few seconds
  useEffect(() => {
    if (!surfaceArmed || !loading) return;
    const t = window.setTimeout(() => {
      void probeOriginAlive().then((alive) => {
        setOriginAlive(alive);
        if (!alive) setLoadTimedOut(true);
      });
    }, 4000);
    return () => window.clearTimeout(t);
  }, [loading, frameKey, surfaceArmed]);

  // Periodic health while desk surface is armed
  useEffect(() => {
    if (!surfaceArmed) return;
    let cancelled = false;
    const tick = async () => {
      const alive = await probeOriginAlive();
      if (!cancelled) setOriginAlive(alive);
    };
    void tick();
    const id = window.setInterval(tick, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [surfaceArmed]);

  const reload = useCallback(() => {
    setLoading(true);
    setLoadTimedOut(false);
    setFrameKey((k) => k + 1);
    void probeOriginAlive().then(setOriginAlive);
  }, []);

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (desk.locked) return;
      if ((e.target as HTMLElement).closest("button,a,input")) return;
      e.preventDefault();
      bringFront(desk.id);
      dragRef.current = {
        ox: e.clientX,
        oy: e.clientY,
        sx: desk.x,
        sy: desk.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [desk.locked, desk.id, desk.x, desk.y, bringFront],
  );

  const onDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || desk.locked) return;
      const dx = e.clientX - dragRef.current.ox;
      const dy = e.clientY - dragRef.current.oy;
      setGeometry(desk.id, {
        x: Math.max(0, dragRef.current.sx + dx),
        y: Math.max(40, dragRef.current.sy + dy),
      });
    },
    [desk.id, desk.locked, setGeometry],
  );

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onResizeStart = useCallback(
    (corner: Corner) => (e: React.PointerEvent) => {
      if (desk.locked) return;
      e.preventDefault();
      e.stopPropagation();
      bringFront(desk.id);
      resizeRef.current = {
        ox: e.clientX,
        oy: e.clientY,
        sx: desk.x,
        sy: desk.y,
        sw: desk.w,
        sh: desk.h,
        corner,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [desk.locked, desk.id, desk.x, desk.y, desk.w, desk.h, bringFront],
  );

  const onResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current || desk.locked) return;
      const r = resizeRef.current;
      const dx = e.clientX - r.ox;
      const dy = e.clientY - r.oy;
      let { x, y, w, h } = {
        x: r.sx,
        y: r.sy,
        w: r.sw,
        h: r.sh,
      };

      // SE — grow right/down
      if (r.corner === "se") {
        w = Math.max(MIN_W, r.sw + dx);
        h = Math.max(MIN_H, r.sh + dy);
      }
      // SW — grow left/down (x moves)
      if (r.corner === "sw") {
        w = Math.max(MIN_W, r.sw - dx);
        h = Math.max(MIN_H, r.sh + dy);
        x = r.sx + (r.sw - w);
      }
      // NE — grow right/up (y moves)
      if (r.corner === "ne") {
        w = Math.max(MIN_W, r.sw + dx);
        h = Math.max(MIN_H, r.sh - dy);
        y = r.sy + (r.sh - h);
      }
      // NW — grow left/up
      if (r.corner === "nw") {
        w = Math.max(MIN_W, r.sw - dx);
        h = Math.max(MIN_H, r.sh - dy);
        x = r.sx + (r.sw - w);
        y = r.sy + (r.sh - h);
      }

      // Keep on-screen-ish
      const maxX = (typeof window !== "undefined" ? window.innerWidth : 1280) - 80;
      const maxY = (typeof window !== "undefined" ? window.innerHeight : 800) - 80;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(40, Math.min(y, maxY));

      setGeometry(desk.id, { x, y, w, h });
    },
    [desk.id, desk.locked, setGeometry],
  );

  const onResizeEnd = useCallback(() => {
    resizeRef.current = null;
  }, []);

  if (!desk || desk.minimized) return null;

  const showOffline = surfaceArmed && (!originAlive || loadTimedOut);
  const showWarming = !surfaceArmed;

  return (
    <div
      className={cn(
        "tutor-desk-window",
        focused && "is-focused",
        desk.locked && "is-locked",
      )}
      style={{
        left: desk.x ?? 48,
        top: desk.y ?? 72,
        width: desk.w ?? 520,
        height: desk.h ?? 420,
        zIndex: desk.z ?? 40,
        ["--desk-accent" as string]: desk.color || "#2dd4bf",
        ["--desk-glow" as string]: `${desk.color || "#2dd4bf"}66`,
      }}
      onPointerDown={() => focus(desk.id)}
    >
      <header
        className="tutor-desk-titlebar"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <GripHorizontal className="tutor-desk-grip" aria-hidden />
        <span className="tutor-desk-acr" style={{ color: desk.color }}>
          {desk.acr}
        </span>
        <span className="tutor-desk-title" title={src}>
          {desk.title}
        </span>
        <div className="tutor-desk-actions">
          <button
            type="button"
            title="Reload desk"
            onClick={reload}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
          <button
            type="button"
            title="Maximize to fill workspace"
            onClick={() => maximize(desk.id)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Bookmark this surface"
            onClick={() =>
              bookmarkRoute(desk.href, desk.title, desk.color, desk.acr)
            }
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title={`Scale down (min ${Math.round(DESK_SCALE_MIN * 100)}%)`}
            onClick={() =>
              setContentScale(desk.id, desk.contentScale - DESK_SCALE_STEP)
            }
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="tutor-desk-scale" title="Content zoom 30%–150%">
            {Math.round(desk.contentScale * 100)}%
          </span>
          <button
            type="button"
            title={`Scale up (max ${Math.round(DESK_SCALE_MAX * 100)}%)`}
            onClick={() =>
              setContentScale(desk.id, desk.contentScale + DESK_SCALE_STEP)
            }
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title={desk.locked ? "Unlock position" : "Lock in place"}
            onClick={() => toggleLock(desk.id)}
          >
            {desk.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <LockOpen className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            title="Minimize"
            onClick={() => toggleMinimize(desk.id)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Close" onClick={() => close(desk.id)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="tutor-desk-body">
        {showWarming ? (
          <div className="tutor-desk-warming">
            <strong>{desk.title}</strong>
            <p>Click the desk title bar to focus and load this surface.</p>
            <button
              type="button"
              className="tutor-desk-offline-btn"
              onClick={() => {
                focus(desk.id);
                setSurfaceArmed(true);
              }}
            >
              Load surface
            </button>
          </div>
        ) : showOffline ? (
          <div className="tutor-desk-offline" role="alert">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <strong>This desk can’t reach the app host</strong>
            <p>
              Floating desks load from the same site as the hive. If the app
              host stopped, reopen the launcher and retry — nothing is wrong
              with the lesson itself.
            </p>
            <ol>
              <li>
                Local: run <code>Open-Grok-Tutor.cmd</code> and leave DEV open
              </li>
              <li>Hosted: refresh the page after the site is back</li>
              <li>Then click Retry on this desk</li>
            </ol>
            <p className="tutor-desk-offline-path">
              Target: <code>{src}</code>
            </p>
            <button type="button" className="tutor-desk-offline-btn" onClick={reload}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <div className="tutor-desk-frame-fill">
            <div
              className="tutor-desk-scale-wrap"
              style={{
                transform: `scale(${desk.contentScale})`,
                width: `${100 / desk.contentScale}%`,
                height: `${100 / desk.contentScale}%`,
              }}
            >
              <iframe
                key={`${desk.id}-${frameKey}`}
                title={desk.title || "Desk"}
                src={src}
                className="tutor-desk-frame"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => {
                  setLoading(false);
                  setLoadTimedOut(false);
                  setOriginAlive(true);
                }}
              />
            </div>
          </div>
        )}
        {surfaceArmed && loading && !showOffline ? (
          <div className="tutor-desk-loading" aria-hidden>
            Loading desk…
          </div>
        ) : null}
      </div>

      {!desk.locked ? (
        <>
          {(
            [
              ["nw", "Resize from top-left"],
              ["ne", "Resize from top-right"],
              ["sw", "Resize from bottom-left"],
              ["se", "Resize from bottom-right"],
            ] as const
          ).map(([corner, title]) => (
            <div
              key={corner}
              className={cn("tutor-desk-resize", `is-${corner}`)}
              title={title}
              onPointerDown={onResizeStart(corner)}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              onPointerCancel={onResizeEnd}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
