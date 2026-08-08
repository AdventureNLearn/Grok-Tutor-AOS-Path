import {
  Bookmark,
  Columns2,
  LayoutGrid,
  Maximize2,
  Rows2,
  Sparkles,
  Layers,
  X,
} from "lucide-react";
import {
  MAX_OPEN_DESKS,
  useHiveDeskStore,
  type DeskLayoutMode,
} from "@/lib/hive-desk-store";
import { FloatingDeskWindow } from "./floating-desk";

const LAYOUTS: {
  mode: DeskLayoutMode;
  label: string;
  title: string;
  icon: typeof LayoutGrid;
}[] = [
  {
    mode: "smart",
    label: "Smart",
    title: "Auto-format by desk count (1=max, 2=split, 3–6=tile, more=cascade)",
    icon: Sparkles,
  },
  {
    mode: "tile",
    label: "Tile",
    title: "Grid of equal desks",
    icon: LayoutGrid,
  },
  {
    mode: "split-h",
    label: "Split H",
    title: "Side-by-side columns",
    icon: Columns2,
  },
  {
    mode: "split-v",
    label: "Split V",
    title: "Stacked rows",
    icon: Rows2,
  },
  {
    mode: "focus",
    label: "Focus",
    title: "Active desk large · others in a strip",
    icon: Layers,
  },
  {
    mode: "cascade",
    label: "Cascade",
    title: "Offset stack",
    icon: Layers,
  },
];

export function DeskStage() {
  const desks = useHiveDeskStore((s) => s.desks);
  const bookmarks = useHiveDeskStore((s) => s.bookmarks);
  const focusedId = useHiveDeskStore((s) => s.focusedId);
  const toggleMinimize = useHiveDeskStore((s) => s.toggleMinimize);
  const focus = useHiveDeskStore((s) => s.focus);
  const closeAll = useHiveDeskStore((s) => s.closeAll);
  const maximizeAll = useHiveDeskStore((s) => s.maximizeAll);
  const layoutDesks = useHiveDeskStore((s) => s.layoutDesks);
  const openBookmark = useHiveDeskStore((s) => s.openBookmark);
  const removeBookmark = useHiveDeskStore((s) => s.removeBookmark);
  const clearBookmarks = useHiveDeskStore((s) => s.clearBookmarks);

  const open = desks.length > 0;
  const showDock = desks.length > 0 || bookmarks.length > 0;

  return (
    <>
      <div
        className={`tutor-desk-stage ${open ? "is-active" : ""}`}
        aria-hidden={!open}
      >
        <div className="tutor-desk-layer">
          {desks
            .filter((d) => d && d.id && d.href)
            .map((d) => (
              <FloatingDeskWindow
                key={d.id}
                desk={d}
                focused={d.id === focusedId}
              />
            ))}
        </div>
      </div>

      {showDock ? (
        <div className="tutor-desk-dock" aria-label="Open desks and bookmarks">
          <span className="tutor-desk-dock-count">
            {desks.length}/{MAX_OPEN_DESKS}
          </span>

          {desks.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`tutor-desk-dock-chip ${d.id === focusedId ? "is-active" : ""} ${d.minimized ? "is-min" : ""}`}
              style={{ ["--chip" as string]: d.color }}
              onClick={() => {
                if (d.minimized) toggleMinimize(d.id);
                focus(d.id);
              }}
              title={d.title}
            >
              <span className="chip-acr">{d.acr}</span>
              <span className="chip-title">{d.title}</span>
              {d.locked ? <span className="chip-lock">locked</span> : null}
            </button>
          ))}

          {bookmarks.length > 0 ? (
            <span className="tutor-desk-dock-sep" title="Bookmarks">
              <Bookmark className="h-3 w-3" />
            </span>
          ) : null}

          {bookmarks.map((b) => (
            <button
              key={b.id}
              type="button"
              className="tutor-desk-dock-chip is-bookmark"
              style={{ ["--chip" as string]: b.color }}
              onClick={() => openBookmark(b.id)}
              title={`Open bookmark: ${b.title}`}
            >
              <span className="chip-acr">{b.acr}</span>
              <span className="chip-title">{b.title}</span>
              <span
                className="chip-remove"
                role="button"
                tabIndex={0}
                title="Remove bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(b.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    removeBookmark(b.id);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            </button>
          ))}

          {desks.length > 0 ? (
            <span className="tutor-desk-dock-sep" title="Auto format">
              format
            </span>
          ) : null}

          {desks.length > 0
            ? LAYOUTS.map(({ mode, label, title, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  className="tutor-desk-dock-chip is-format"
                  onClick={() => layoutDesks(mode)}
                  title={title}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))
            : null}

          {desks.length > 0 ? (
            <button
              type="button"
              className="tutor-desk-dock-chip"
              onClick={maximizeAll}
              title="Maximize all unlocked desks"
            >
              <Maximize2 className="h-3 w-3" />
              Max all
            </button>
          ) : null}
          {desks.length > 0 ? (
            <button
              type="button"
              className="tutor-desk-dock-chip danger"
              onClick={closeAll}
            >
              Close all
            </button>
          ) : null}
          {bookmarks.length > 2 ? (
            <button
              type="button"
              className="tutor-desk-dock-chip danger"
              onClick={clearBookmarks}
            >
              Clear bookmarks
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
